"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections, site } from "@/lib/site";

/**
 * Navigation follows the section flags in lib/site.ts. A disabled section is
 * absent here and its routes generate nothing, so there is one switch rather
 * than two places to keep in agreement. Profile links follow the sections and
 * leave the site, so they carry the outbound arrow.
 */
const links = [
  { href: "/about", label: "About", section: "about" },
  { href: "/portfolio", label: "Portfolio", section: "portfolio" },
  { href: "/case-studies", label: "Case studies", section: "caseStudies" },
  { href: "/writing", label: "Writing", section: "writing" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const visible = links.filter((link) => sections[link.section]);

  return (
    <nav aria-label="Primary">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 field-label text-sm">
        {visible.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active ? "bg-line px-1 text-panel" : "px-1"
                }
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        {Object.entries(site.profiles).map(([key, profile]) => (
          <li key={key}>
            <a
              href={profile.href}
              aria-label={profile.accessibleLabel}
              target="_blank"
              rel="noopener noreferrer me"
              className="px-1 text-muted"
            >
              {profile.label}
              <span aria-hidden="true"> ↗</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
