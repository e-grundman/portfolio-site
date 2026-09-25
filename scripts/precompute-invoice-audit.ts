/**
 * Record one audit run and store it in the repo so the page works with no
 * server call. Run with `pnpm audit:precompute`. Needs ANTHROPIC_API_KEY in
 * the environment or in .env.local.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local by hand: this script runs outside Next.
try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
} catch {
  // No .env.local; rely on the shell environment.
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. Put it in .env.local or export it, then rerun.");
  process.exit(1);
}

type AuditEvent = import("../lib/labs/invoice-audit/events").AuditEvent;
type RecordedRun = import("../lib/labs/invoice-audit/events").RecordedRun;

async function main(): Promise<void> {
  // Imported after the env is loaded so the client picks the key up.
  const { runAudit } = await import("../lib/labs/invoice-audit/agent");
  const { DEFAULT_SEED } = await import("../lib/labs/invoice-audit/invoice");

  const events: AuditEvent[] = [];
  console.log("Running the audit on the default invoice. This takes a minute or two.");
  await runAudit({
    seed: DEFAULT_SEED,
    onEvent: (event) => {
      events.push(event);
      if (event.type === "tool_call") console.log(`  ${event.name}(${JSON.stringify(event.input)})`);
      if (event.type === "assistant") console.log(`  > ${event.text.slice(0, 120)}`);
      if (event.type === "error") console.error(`  error: ${event.message}`);
      if (event.type === "done") {
        const s = event.score;
        console.log(
          `Done in ${Math.round(event.elapsedMs / 1000)}s, ${event.iterations} turns. Caught ${s.caught.length} of ${s.planted}, ${s.falsePositives.length} false positives, claimed $${s.claimedRecoverable.toFixed(2)} of $${s.plantedRecoverable.toFixed(2)}.`,
        );
      }
    },
  });

  const done = events.some((e) => e.type === "done");
  if (!done) {
    console.error("The run did not finish. Nothing written.");
    process.exit(1);
  }

  const out: RecordedRun = { recordedAt: new Date().toISOString(), events };
  const target = resolve(process.cwd(), "lib/labs/invoice-audit/recorded-run.json");
  writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Wrote ${target}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
