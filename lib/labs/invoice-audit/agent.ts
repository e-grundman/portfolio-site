/**
 * The audit agent. Server only: this module holds the API client, so only the
 * route handler and the precompute script may import it, never a component.
 *
 * The model gets the invoice as a table, a small set of tools that answer
 * factual questions (what does the rule say, what is the published amount for
 * this zone, what is the billable weight of this carton), and one tool to
 * submit findings. It decides which packages to inspect, which rules govern
 * each line, and what it cannot verify. Nothing in the tools tells it where
 * the errors are.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { getBaseRate } from "@/lib/rates";
import { type Finding, packageDetail, packageSummaryTable, score } from "./checks";
import type { AuditEvent } from "./events";
import { buildFixture, dimWeightLb, DEFAULT_SEED } from "./invoice";
import {
  amounts,
  rules,
  thresholds,
  tierLabel,
  zoneTier,
  type RuleId,
  type Zone,
  AHS_DIMENSION_MIN_BILLABLE_LB,
  OVERSIZE_MIN_BILLABLE_LB,
  DIM_DIVISOR,
} from "./rules";

export const MODEL = "claude-opus-5";
const MAX_ITERATIONS = 28;
const RESULT_LOG_CHARS = 900;

const ruleIds = Object.keys(rules) as [RuleId, ...RuleId[]];
const zoneSchema = z.union([
  z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7), z.literal(8),
]);
const dimsSchema = z.object({
  length_in: z.number().positive(),
  width_in: z.number().positive(),
  height_in: z.number().positive(),
});

const findingSchema = z.object({
  tracking: z.string().describe("Tracking number exactly as it appears on the invoice"),
  charge_code: z.enum([
    "TRANSPORTATION", "FUEL", "RESIDENTIAL", "DAS", "DAS_EXTENDED", "DAS_REMOTE",
    "AHS_DIMENSION", "AHS_WEIGHT", "AHS_PACKAGING", "OVERSIZE",
    "SIGNATURE_DIRECT", "SIGNATURE_ADULT", "ADDRESS_CORRECTION",
  ]),
  issue: z.enum([
    "NOT_APPLICABLE", "WRONG_AMOUNT", "DUPLICATE", "WEIGHT_OVERSTATED", "FUEL_MISCALCULATED", "CANNOT_VERIFY",
  ]),
  billed: z.number().describe("Total billed on this charge code for this package"),
  expected: z.number().describe("What the rules support, 0 if the charge should not exist"),
  recoverable: z.number().describe("Dollars to claim back, including fuel billed on the disputed amount where fuel applies"),
  rule_id: z.enum(ruleIds),
  explanation: z.string().describe("Two or three sentences a carrier billing analyst can act on, citing the rule"),
  confidence: z.enum(["high", "medium", "low"]),
});

export const SYSTEM_PROMPT = `You are a parcel invoice auditor working for a shipper. You are checking one FedEx Ground invoice against the shipper's own shipment records and the published 2026 FedEx rules.

What you have:
- The invoice, one row per package, with the shipper's facts (service, destination, address type from the order record, carton dimensions, actual weight) and the carrier's lines (billed weight, each charge).
- Tools that return the rule text, the published surcharge amount for a zone, the billable weight of a carton, which non-standard triggers a carton meets, and the shipper's contracted transportation rate.

How to work:
- Scan the whole invoice first. Look for lines that do not fit the facts: surcharges with no trigger, amounts that belong to a different service or zone tier, a charge appearing twice, a billed weight above both actual and dimensional weight, fuel that does not match the stated percentage.
- Inspect a package before you dispute it. Confirm the trigger with the tools, not by eye. A surcharge that looks wrong and turns out to be correct is worse than a miss: a claim that fails costs the shipper credibility with the carrier.
- Some things cannot be verified from an invoice: whether a ZIP is on the DAS list, whether packaging was non-standard. If a charge depends on one of those and the amount is right, either leave it alone or file it as CANNOT_VERIFY with what document would settle it. Do not dispute it.
- Recoverable dollars include fuel where fuel applies to the disputed surcharge. Use the fuel percentage in the invoice header.
- When you are done, call submit_findings exactly once with every finding, then reply with a short summary in plain sentences: how many lines you disputed, the total recoverable, and what you could not verify. No headers, no bullet lists, no markdown, no em dashes.

Be economical. You do not need to inspect every package; you need to inspect every package that a careful auditor would.`;

export type RunOptions = {
  seed?: number;
  onEvent: (event: AuditEvent) => void;
  signal?: AbortSignal;
};

export async function runAudit({ seed = DEFAULT_SEED, onEvent, signal }: RunOptions): Promise<void> {
  const client = new Anthropic();
  const fixture = buildFixture(seed);
  const { invoice } = fixture;
  const byTracking = new Map(invoice.packages.map((p) => [p.tracking, p]));
  const startedAt = Date.now();
  let submitted: { findings: Finding[]; summary: string } | undefined;

  const emitTool = (id: string, name: string, input: Record<string, unknown>, result: string) => {
    const truncated = result.length > RESULT_LOG_CHARS;
    onEvent({
      type: "tool_call",
      id,
      name,
      input,
      result: truncated ? `${result.slice(0, RESULT_LOG_CHARS)}…` : result,
      truncated,
    });
  };

  // Each tool logs itself so the client can show the agent working.
  const tools = [
    betaZodTool({
      name: "list_packages",
      description:
        "The whole invoice, one row per package: shipper facts and every carrier charge. Start here.",
      inputSchema: z.object({}),
      run: (_input, ctx) => {
        const out = `Invoice ${invoice.number}, ${invoice.carrier}, period ${invoice.periodStart} to ${invoice.periodEnd}, origin ${invoice.originLabel}, fuel surcharge for the period ${(invoice.fuelPct * 100).toFixed(1)}%, ${invoice.packages.length} packages, invoice total $${invoice.total.toFixed(2)}.\n\n${packageSummaryTable(invoice)}`;
        emitTool(ctx?.toolUse.id ?? "", "list_packages", {}, out);
        return out;
      },
    }),
    betaZodTool({
      name: "get_package",
      description: "Full detail for one package, including every charge line with its description.",
      inputSchema: z.object({ tracking: z.string() }),
      run: (input, ctx) => {
        const p = byTracking.get(input.tracking);
        const out = p ? packageDetail(p) : `No package ${input.tracking} on this invoice.`;
        emitTool(ctx?.toolUse.id ?? "", "get_package", input, out);
        return out;
      },
    }),
    betaZodTool({
      name: "get_rule",
      description:
        "The published FedEx 2026 rule for a charge: the trigger, the amounts, and the document it was read from.",
      inputSchema: z.object({ rule_id: z.enum(ruleIds) }),
      run: (input, ctx) => {
        const r = rules[input.rule_id];
        const out = `${r.title}\n${r.text}\nSource: ${r.source} (${r.tier}).`;
        emitTool(ctx?.toolUse.id ?? "", "get_rule", input, out);
        return out;
      },
    }),
    betaZodTool({
      name: "billable_weight",
      description:
        "Billable weight for a carton: each side rounded up to the next inch, volume divided by 139 and rounded up, compared with the actual weight rounded up. Applies the 40 lb Additional Handling and 90 lb Oversize minimums when told the package qualifies.",
      inputSchema: dimsSchema.extend({
        actual_lb: z.number().positive(),
        qualifies_for: z.enum(["none", "ahs_dimension", "oversize"]).optional(),
      }),
      run: (input, ctx) => {
        const d = { l: input.length_in, w: input.width_in, h: input.height_in };
        const rounded = { l: Math.ceil(d.l), w: Math.ceil(d.w), h: Math.ceil(d.h) };
        const cubic = rounded.l * rounded.w * rounded.h;
        const dim = dimWeightLb(d);
        const actual = Math.ceil(input.actual_lb);
        let billable = Math.max(actual, dim);
        let floor = "";
        if (input.qualifies_for === "oversize" && billable < OVERSIZE_MIN_BILLABLE_LB) {
          billable = OVERSIZE_MIN_BILLABLE_LB;
          floor = ` Raised to the ${OVERSIZE_MIN_BILLABLE_LB} lb Oversize minimum.`;
        } else if (input.qualifies_for === "ahs_dimension" && billable < AHS_DIMENSION_MIN_BILLABLE_LB) {
          billable = AHS_DIMENSION_MIN_BILLABLE_LB;
          floor = ` Raised to the ${AHS_DIMENSION_MIN_BILLABLE_LB} lb Additional Handling minimum.`;
        }
        const out = `Rounded dims ${rounded.l}x${rounded.w}x${rounded.h} in = ${cubic} cubic in. Dimensional weight ${cubic} / ${DIM_DIVISOR} = ${(cubic / DIM_DIVISOR).toFixed(2)}, rounds up to ${dim} lb. Actual ${input.actual_lb} lb rounds up to ${actual} lb. Billable weight ${billable} lb.${floor}`;
        emitTool(ctx?.toolUse.id ?? "", "billable_weight", input, out);
        return out;
      },
    }),
    betaZodTool({
      name: "check_triggers",
      description:
        "Which non-standard package triggers a carton meets: Additional Handling (dimension, weight), Oversize, Ground Unauthorized. Returns each threshold with the carton's figure beside it.",
      inputSchema: dimsSchema.extend({ actual_lb: z.number().positive() }),
      run: (input, ctx) => {
        const sides = [input.length_in, input.width_in, input.height_in].sort((a, b) => b - a);
        const longest = sides[0];
        const second = sides[1];
        const girth = sides[0] + 2 * sides[1] + 2 * sides[2];
        const cubic = Math.ceil(input.length_in) * Math.ceil(input.width_in) * Math.ceil(input.height_in);
        const t = thresholds;
        const lines = [
          `Longest side ${longest} in. Second-longest ${second} in. Length plus girth ${girth} in. Cubic volume (rounded sides) ${cubic} cubic in. Actual weight ${input.actual_lb} lb.`,
          `Additional Handling, Dimension: longest > ${t.ahsDimension.longestSideIn} (${longest > t.ahsDimension.longestSideIn}), second-longest > ${t.ahsDimension.secondLongestSideIn} (${second > t.ahsDimension.secondLongestSideIn}), length plus girth > ${t.ahsDimension.lengthPlusGirthIn} (${girth > t.ahsDimension.lengthPlusGirthIn}), cubic > ${t.ahsDimension.cubicIn} (${cubic > t.ahsDimension.cubicIn}).`,
          `Additional Handling, Weight: actual > ${t.ahsWeightLb} lb (${input.actual_lb > t.ahsWeightLb}).`,
          `Oversize: longest > ${t.oversize.longestSideIn} (${longest > t.oversize.longestSideIn}), length plus girth > ${t.oversize.lengthPlusGirthIn} (${girth > t.oversize.lengthPlusGirthIn}), cubic > ${t.oversize.cubicIn} (${cubic > t.oversize.cubicIn}), actual > ${t.oversize.actualLb} lb (${input.actual_lb > t.oversize.actualLb}).`,
          `Ground Unauthorized: longest > ${t.unauthorized.longestSideIn} (${longest > t.unauthorized.longestSideIn}), length plus girth > ${t.unauthorized.lengthPlusGirthIn} (${girth > t.unauthorized.lengthPlusGirthIn}), actual > ${t.unauthorized.actualLb} lb (${input.actual_lb > t.unauthorized.actualLb}).`,
          "When Oversize applies, Additional Handling does not also apply.",
        ];
        const out = lines.join("\n");
        emitTool(ctx?.toolUse.id ?? "", "check_triggers", input, out);
        return out;
      },
    }),
    betaZodTool({
      name: "surcharge_amount",
      description: "The published 2026 amount for a zone-tiered surcharge at a given zone.",
      inputSchema: z.object({
        surcharge: z.enum(["AHS_DIMENSION", "AHS_WEIGHT", "AHS_PACKAGING", "OVERSIZE"]),
        zone: zoneSchema,
      }),
      run: (input, ctx) => {
        const table = {
          AHS_DIMENSION: amounts.ahsDimension,
          AHS_WEIGHT: amounts.ahsWeight,
          AHS_PACKAGING: amounts.ahsPackaging,
          OVERSIZE: amounts.oversize,
        }[input.surcharge];
        const tier = zoneTier(input.zone as Zone);
        const out = `${input.surcharge} at zone ${input.zone} (${tierLabel(tier)}): $${table[tier].toFixed(2)} per package. Full table: Zone 2 $${table.z2}, Zones 3-4 $${table.z3_4}, Zones 5-6 $${table.z5_6}, Zones 7+ $${table.z7plus}.`;
        emitTool(ctx?.toolUse.id ?? "", "surcharge_amount", input, out);
        return out;
      },
    }),
    betaZodTool({
      name: "transportation_rate",
      description:
        "The shipper's contracted FedEx Ground transportation charge for a zone and billable weight, before fuel and surcharges.",
      inputSchema: z.object({ zone: zoneSchema, billable_lb: z.number().int().positive() }),
      run: (input, ctx) => {
        const rate = getBaseRate(input.zone as Zone, input.billable_lb);
        const out = `Zone ${input.zone}, ${input.billable_lb} lb: $${rate.toFixed(2)}.`;
        emitTool(ctx?.toolUse.id ?? "", "transportation_rate", input, out);
        return out;
      },
    }),
    betaZodTool({
      name: "submit_findings",
      description:
        "Submit the audit. Call once, at the end, with every finding. A finding is one charge code on one package.",
      inputSchema: z.object({
        findings: z.array(findingSchema),
        summary: z.string().describe("Two or three plain sentences for the shipper."),
      }),
      run: (input, ctx) => {
        submitted = { findings: input.findings as Finding[], summary: input.summary };
        const out = `Recorded ${input.findings.length} findings.`;
        emitTool(ctx?.toolUse.id ?? "", "submit_findings", { count: input.findings.length }, out);
        return out;
      },
    }),
  ];

  onEvent({ type: "started", model: MODEL, seed, invoice, at: new Date().toISOString() });

  const runner = client.beta.messages.toolRunner(
    {
      model: MODEL,
      max_tokens: 12000,
      max_iterations: MAX_ITERATIONS,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools,
      messages: [
        {
          role: "user",
          content: `Audit invoice ${invoice.number}. Call list_packages first.`,
        },
      ],
    },
    { signal },
  );

  let iterations = 0;
  const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

  for await (const message of runner) {
    iterations += 1;
    usage.input += message.usage.input_tokens;
    usage.output += message.usage.output_tokens;
    usage.cacheRead += message.usage.cache_read_input_tokens ?? 0;
    usage.cacheWrite += message.usage.cache_creation_input_tokens ?? 0;
    for (const block of message.content) {
      if (block.type === "text" && block.text.trim()) {
        onEvent({ type: "assistant", text: block.text.trim() });
      }
    }
    if (message.stop_reason === "refusal") {
      onEvent({ type: "error", message: "The model declined to continue." });
      return;
    }
  }

  if (!submitted) {
    onEvent({
      type: "error",
      message: `The run ended after ${iterations} turns without submitting findings.`,
    });
    return;
  }

  onEvent({ type: "findings", findings: submitted.findings, summary: submitted.summary });
  onEvent({
    type: "done",
    iterations,
    elapsedMs: Date.now() - startedAt,
    usage,
    score: score(fixture, submitted.findings),
  });
}
