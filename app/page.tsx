import Image from "next/image";
import Link from "next/link";
import { Barcode } from "@/components/barcode";
import { Kicker } from "@/components/kicker";
import { PackageCard } from "@/components/package-card";
import { TrackedAnchor, TrackedLink } from "@/components/tracked-link";
import { getPortfolio } from "@/lib/content/loader";
import { highlights } from "@/lib/highlights";
import { site } from "@/lib/site";

/**
 * Structured data for a name search. Ties the name to the title, the photo,
 * and the LinkedIn and GitHub profiles so a search engine treats the three
 * as one person. Only what the page already shows; no email, no address.
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  description: site.description,
  url: site.url,
  image: `${site.url}${site.headshot}`,
  sameAs: Object.values(site.profiles).map((profile) => profile.href),
  worksFor: { "@type": "Organization", name: "ShipMonk" },
};

export default function Home() {
  const entries = getPortfolio();
  const live = entries.filter((entry) => entry.status === "live");
  const queued = entries.filter((entry) => entry.status !== "live");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <section className="pt-4 pb-20">
        <div className="label-panel">
          <div className="grid grid-cols-[1fr_auto] border-b-2 border-line">
            <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
              <Image
                src={site.headshot}
                alt={`Portrait of ${site.name}`}
                width={144}
                height={144}
                priority
                className="h-28 w-28 shrink-0 border-2 border-line object-cover sm:h-36 sm:w-36"
              />
              <div>
                <p className="field-label text-xs text-muted">Ship to</p>
                <h1 className="headline mt-1 text-5xl sm:text-7xl">{site.name}</h1>
                <p className="mt-3 text-pretty text-base leading-snug sm:text-lg">
                  {site.headline}
                </p>
              </div>
            </div>
            {/* Spelled out rather than SR PM, which a stranger has to decode. */}
            <div className="flex w-20 flex-col items-center justify-center border-l-2 border-line bg-highlight px-2 text-on-highlight sm:w-32">
              <span className="headline text-2xl sm:text-4xl">SENIOR</span>
              <span className="headline text-4xl sm:text-6xl">PM</span>
            </div>
          </div>

          <div className="border-b-2 border-line px-4 py-4 sm:px-6">
            {/* Real Code 128 of the domain, so a phone scanner lands on the site. */}
            <Barcode
              value={new URL(site.url).host}
              caption={new URL(site.url).host.toUpperCase()}
              symbology="code128"
              height={64}
            />
          </div>

          <div className="p-4 sm:p-6">
            <p className="field-label text-xs text-muted">Contents</p>
            <p className="mt-2 text-pretty text-3xl leading-[1.15] font-semibold tracking-tight sm:text-4xl">
              I work on parcel transportation and ecommerce fulfillment: what
              shipping costs, why it costs that, and which decisions change it.
            </p>
            <p className="mt-6">
              <Link href="/about" className="field-label text-sm">
                More about how I work →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <Kicker>Career highlights</Kicker>
        <p className="mb-8 text-pretty text-lg leading-relaxed text-muted">
          Results from the shipping and transportation product surface at
          ShipMonk, a third-party logistics provider whose network ships tens of
          millions of packages a year. More than 90 percent of that volume moves
          through the rating and routing I own.
        </p>
        <dl className="label-panel grid sm:grid-cols-2">
          {highlights.map((highlight, index) => {
            // The first field is the hero: it spans both columns and carries
            // the biggest number. Everything after it falls into two columns
            // beneath, so the parity checks run on the position under the
            // hero rather than on the raw index. With an odd remainder the
            // final field spans the row the way the hero does.
            const count = highlights.length;
            const last = index === count - 1;
            const hero = index === 0;
            const pos = index - 1;
            const remainder = count - 1;
            const oddTail = remainder % 2 === 1 && pos === remainder - 1;
            const finalRowStart =
              remainder % 2 === 1 ? remainder - 1 : remainder - 2;
            // Fields in the bottom row sit on the panel edge and need no rule
            // under them on wide screens.
            const inFinalRow = !hero && pos >= finalRowStart;
            const leftColumn = !hero && !oddTail && pos % 2 === 0;
            return (
              <div
                key={highlight.label}
                className={[
                  "border-line p-4 sm:p-6",
                  last ? "" : "border-b-2",
                  inFinalRow && !last ? "sm:border-b-0" : "",
                  hero || oddTail
                    ? "sm:col-span-2"
                    : leftColumn
                      ? "sm:border-r-2"
                      : "",
                ].join(" ")}
              >
                <dt className="field-label text-sm">{highlight.label}</dt>
                <dd>
                  <p
                    className={[
                      "headline mt-3",
                      hero ? "text-6xl sm:text-8xl" : "text-5xl sm:text-6xl",
                    ].join(" ")}
                  >
                    {highlight.figure}
                  </p>
                  {/* The hero runs the full panel width, so its detail needs a
                      measure or the line length outruns the eye. */}
                  <p
                    className={[
                      "mt-3 text-pretty text-[0.95rem] leading-relaxed text-ink/80",
                      hero ? "sm:max-w-2xl" : "",
                    ].join(" ")}
                  >
                    {highlight.detail}
                  </p>
                  {highlight.href && (
                    <p className="mt-3">
                      <TrackedLink
                        event="case_study_open"
                        data={{ slug: highlight.href.split("/").pop() ?? "", from: "highlight" }}
                        href={highlight.href}
                        className="field-label text-xs"
                      >
                        Read the case study →
                      </TrackedLink>
                    </p>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="pb-20">
        <Kicker>Portfolio</Kicker>
        {/* Erich's intro, 2026-09-18. Written to stay true as tools are added. */}
        <p className="text-pretty text-lg leading-relaxed text-muted">
          Tools for the decisions shippers have to make, like where to put the
          next warehouse or what a box choice costs. I build them with
          Claude Code on synthetic data, so the math can be public.
        </p>
        <div className="mt-8 grid gap-6">
          {live.map((entry, index) => (
            <PackageCard
              key={entry.slug}
              href={entry.route}
              title={entry.title}
              summary={entry.summary}
              tags={entry.tags}
              index={index + 1}
              total={live.length}
              kind="Decision tool"
              headingLevel="h2"
            />
          ))}
        </div>
        {queued.length > 0 && (
          <p className="pt-6">
            <Link href="/portfolio" className="field-label text-sm">
              See what is in progress →
            </Link>
          </p>
        )}
      </section>

      <section className="pb-8">
        <div className="label-panel">
          <p className="border-b-2 border-line px-4 py-2 field-label text-xs sm:px-6">
            Reply to
          </p>
          <div className="p-4 sm:p-6">
            <h2 className="headline text-3xl sm:text-5xl">
              Hiring a senior PM for an{" "}
              <span className="whitespace-nowrap">operations-heavy</span> business?
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted">
              Direct email reaches me fastest, and a specific first message gets
              a specific answer.
            </p>
            <p className="mt-6">
              {/* No aria-label: the address is the accessible name, and a
                  label that omits the visible text fails the name check. */}
              <TrackedAnchor
                event="outbound"
                data={{ to: "email" }}
                href={`mailto:${site.email}`}
                className="font-mono text-lg"
              >
                {site.email}
              </TrackedAnchor>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
