"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/**
 * The name in the top bar. Left out on the home page, where the ship-to label
 * directly below already prints it at full size, so it would read twice.
 */
export function HeaderName() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <Link href="/" className="headline text-2xl">
      {site.name}
    </Link>
  );
}
