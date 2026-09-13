"use client";

import { candidateNodes } from "@/lib/labs/zone-optimizer/nodes";

const MAX_NODES = 3;

export function ConfigPicker({
  label,
  seriesClass,
  nodeIds,
  onChange,
}: {
  label: string;
  seriesClass: string;
  nodeIds: string[];
  onChange: (nodeIds: string[]) => void;
}) {
  const available = candidateNodes.filter((node) => !nodeIds.includes(node.id));

  return (
    <div className="border-t border-rule pt-4">
      <div className="flex items-baseline gap-2">
        <span
          aria-hidden="true"
          className={`inline-block h-2 w-2 shrink-0 rounded-full ${seriesClass}`}
        />
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
          {label}
        </h3>
      </div>

      <ul className="mt-3 space-y-1">
        {nodeIds.map((id) => {
          const node = candidateNodes.find((candidate) => candidate.id === id);
          if (!node) return null;
          return (
            <li key={id} className="flex items-baseline justify-between gap-3">
              <span className="text-sm">
                {node.city}, {node.state}
                <span className="ml-2 font-mono text-xs text-muted">
                  {node.zip3}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onChange(nodeIds.filter((kept) => kept !== id))}
                className="font-mono text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-accent"
                aria-label={`Remove ${node.city} from ${label}`}
              >
                Remove
              </button>
            </li>
          );
        })}
        {nodeIds.length === 0 && (
          <li className="text-sm text-muted">No nodes selected.</li>
        )}
      </ul>

      {nodeIds.length < MAX_NODES && (
        <label className="mt-3 block">
          <span className="sr-only">Add a node to {label}</span>
          <select
            value=""
            onChange={(event) => {
              if (event.target.value) onChange([...nodeIds, event.target.value]);
            }}
            className="w-full border border-rule bg-transparent px-2 py-1.5 font-mono text-xs text-ink"
          >
            <option value="">Add a node…</option>
            {available.map((node) => (
              <option key={node.id} value={node.id}>
                {node.city}, {node.state} ({node.zip3})
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
