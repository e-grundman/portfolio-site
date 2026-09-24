import { site } from "@/lib/site";
import { TrackedAnchor } from "./tracked-link";

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
          <TrackedAnchor
            event="outbound"
            data={{ to: key }}
            href={profile.href}
            aria-label={profile.accessibleLabel}
            target="_blank"
            rel="noopener noreferrer me"
            className="field-label text-sm"
          >
            {profile.label}
            <span aria-hidden="true"> ↗</span>
          </TrackedAnchor>
        </li>
      ))}
      {withEmail && (
        <li>
          {/* The visible address is the accessible name. An aria-label that
              does not contain it fails the label-in-name check. */}
          <TrackedAnchor
            event="outbound"
            data={{ to: "email" }}
            href={`mailto:${site.email}`}
            className="font-mono text-sm"
          >
            {site.email}
          </TrackedAnchor>
        </li>
      )}
    </ul>
  );
}
