export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">
      {children}
    </p>
  );
}
