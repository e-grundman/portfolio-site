/**
 * Events an audit run emits, in order. Shared by the server (which produces
 * them), the precomputed run stored in the repo, and the client (which renders
 * them). Kept free of server imports so the client bundle stays small.
 */
import type { Finding, Score } from "./checks";
import type { Invoice } from "./invoice";

export type AuditEvent =
  | { type: "started"; model: string; seed: number; invoice: Invoice; at: string }
  | { type: "assistant"; text: string }
  | {
      type: "tool_call";
      id: string;
      name: string;
      input: Record<string, unknown>;
      /** Result text, cut to a readable length for the log. */
      result: string;
      truncated: boolean;
    }
  | { type: "findings"; findings: Finding[]; summary: string }
  | {
      type: "done";
      iterations: number;
      elapsedMs: number;
      usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
      score: Score;
    }
  | { type: "error"; message: string };

export type RecordedRun = {
  recordedAt: string;
  events: AuditEvent[];
};
