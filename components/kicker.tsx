/**
 * Section label, printed the way a thermal label prints a field header:
 * reversed out of a solid bar.
 */
export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-8 inline-block bg-line px-2 py-1 field-label text-sm text-panel">
      {children}
    </p>
  );
}
