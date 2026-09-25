/**
 * Live audit run. Streams the agent's events as NDJSON so the page can show
 * the tool calls as they happen and the connection stays open for a long run.
 *
 * This is the site's first server surface, so it is fenced: same-origin
 * requests only, a per-address limit, a global daily cap, and a kill switch
 * in the environment. Each run costs real money.
 */
import { runAudit } from "@/lib/labs/invoice-audit/agent";
import type { AuditEvent } from "@/lib/labs/invoice-audit/events";
import { DEFAULT_SEED } from "@/lib/labs/invoice-audit/invoice";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const PER_ADDRESS_PER_HOUR = 3;
const GLOBAL_PER_DAY = 40;

// In-memory and per instance. Good enough to keep a demo from being a bill.
const byAddress = new Map<string, number[]>();
let dayStamp = "";
let dayCount = 0;

function allow(address: string): { ok: true } | { ok: false; reason: string } {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== dayStamp) {
    dayStamp = today;
    dayCount = 0;
  }
  if (dayCount >= GLOBAL_PER_DAY) {
    return { ok: false, reason: "The live run has hit its daily cap. The recorded run above is the same agent." };
  }
  const recent = (byAddress.get(address) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= PER_ADDRESS_PER_HOUR) {
    return { ok: false, reason: `Limit of ${PER_ADDRESS_PER_HOUR} live runs an hour per address.` };
  }
  recent.push(now);
  byAddress.set(address, recent);
  dayCount += 1;
  return { ok: true };
}

function ndjson(event: AuditEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.INVOICE_AUDIT_LIVE === "off") {
    return Response.json({ error: "Live runs are switched off." }, { status: 503 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Live runs are not configured on this deployment." }, { status: 503 });
  }
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    return Response.json({ error: "Same-origin only." }, { status: 403 });
  }

  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const gate = allow(address);
  if (!gate.ok) {
    return Response.json({ error: gate.reason }, { status: 429 });
  }

  let seed = DEFAULT_SEED;
  try {
    const body = (await request.json()) as { seed?: unknown };
    if (typeof body.seed === "number" && Number.isInteger(body.seed) && body.seed > 0) {
      seed = body.seed;
    }
  } catch {
    // No body is fine; the default invoice runs.
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AuditEvent) => controller.enqueue(ndjson(event));
      try {
        await runAudit({ seed, onEvent: send, signal: request.signal });
      } catch (error) {
        const message = error instanceof Error ? error.message : "The run failed.";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
