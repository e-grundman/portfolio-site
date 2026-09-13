"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "@/lib/site";

/**
 * Navigation follows the section flags in lib/site.ts. A disabled section is
 * absent here and its routes generate nothing, so there is one switch rather
 * than two places to keep in agreement.
 */
const links = [
  { href: "/about", label: "About", section: "about" },
  { href: "/portfolio", label: "Portfolio", section: "portfolio" },
  { href: "/work", label: "Work", section: "work" },
  { href: "/writing", label: "Writing", section: "writing" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const visible = links.filter((link) => sections[link.section]);

  return (
    <nav aria-label="Primary">
      <ul className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs uppercase tracking-[0.15em] text-muted">
        {visible.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-ink underline decoration-accent decoration-2 underline-offset-[6px]"
                    : "transition-colors hover:text-accent"
                }
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
