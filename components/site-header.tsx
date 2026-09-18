import Link from "next/link";
import { site } from "@/lib/site";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="mb-6 flex flex-col gap-3 border-b-2 border-line py-5 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="headline text-2xl">
        {site.name}
      </Link>
      <SiteNav />
    </header>
  );
}
