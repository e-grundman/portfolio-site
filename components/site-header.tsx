import Link from "next/link";
import { site } from "@/lib/site";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/"
        className="font-serif text-lg tracking-tight transition-colors hover:text-accent"
      >
        {site.name}
      </Link>
      <SiteNav />
    </header>
  );
}
