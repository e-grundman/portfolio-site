"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/work", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/labs", label: "Labs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary">
      <ul className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs uppercase tracking-[0.15em] text-muted">
        {links.map((link) => {
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
