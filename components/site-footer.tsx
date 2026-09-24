import { getCaseStudies, getPortfolio } from "@/lib/content/loader";
import { formatMonthYear } from "@/lib/format";
import { site } from "@/lib/site";
import { Barcode } from "./barcode";
import { ProfileLinks } from "./profile-links";

/** The newest publish date across the content that carries one. */
function lastUpdated(): string {
  const dates = [...getCaseStudies(), ...getPortfolio()].map((e) => e.publishedAt);
  return dates.sort().at(-1) ?? "";
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const updated = lastUpdated();
  return (
    <footer className="mt-20 flex flex-col gap-6 border-t-2 border-line py-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-56">
        <Barcode value={`${site.name} ${year}`} height={32} />
        {/* A reader checking whether the site is current gets the answer
            here, from the newest case study or tool rather than a hand-set
            date that would go stale. */}
        <p className="mt-2 field-label text-xs text-muted">
          {site.name} · {year}
          {updated && ` · Updated ${formatMonthYear(updated)}`}
        </p>
      </div>
      <ProfileLinks withEmail />
    </footer>
  );
}
