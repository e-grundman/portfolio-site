import { site } from "@/lib/site";

/**
 * Profile links, everywhere they appear. Real anchors with visible text and an
 * explicit accessible name. No icon-only links: an icon with no text
 * alternative is unreadable to a screen reader and ambiguous to everyone else.
 */
export function ProfileLinks({
  className = "",
  withEmail = false,
}: {
  className?: string;
  withEmail?: boolean;
}) {
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-2 ${className}`}>
      {Object.entries(site.profiles).map(([key, profile]) => (
        <li key={key}>
          <a
            href={profile.href}
            aria-label={profile.accessibleLabel}
            target="_blank"
            rel="noopener noreferrer me"
            className="font-mono text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent"
          >
            {profile.label}
            <span aria-hidden="true"> ↗</span>
          </a>
        </li>
      ))}
      {withEmail && (
        <li>
          <a
            href={`mailto:${site.email}`}
            aria-label={`Email ${site.name}`}
            className="font-mono text-xs tracking-[0.05em] text-muted transition-colors hover:text-accent"
          >
            {site.email}
          </a>
        </li>
      )}
    </ul>
  );
}
