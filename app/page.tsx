import Image from "next/image";
import Link from "next/link";
import { Barcode } from "@/components/barcode";
import { Kicker } from "@/components/kicker";
import { PackageCard } from "@/components/package-card";
import { getPortfolio } from "@/lib/content/loader";
import { highlights } from "@/lib/highlights";
import { site } from "@/lib/site";

export default function Home() {
  const entries = getPortfolio();
  const live = entries.filter((entry) => entry.status === "live");
  const queued = entries.filter((entry) => entry.status !== "live");

  return (
    <>
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
                className="h-28 w-28 shrink-0 border-2 border-line object-cover grayscale contrast-125 sm:h-36 sm:w-36"
              />
              <div>
                <p className="field-label text-xs text-muted">Ship to</p>
                <h1 className="headline mt-1 text-5xl sm:text-7xl">{site.name}</h1>
                <p className="mt-3 max-w-md text-base leading-snug sm:text-lg">
                  {site.headline}
                </p>
              </div>
            </div>
            <div className="flex w-20 flex-col items-center justify-center border-l-2 border-line bg-highlight text-on-highlight sm:w-32">
              <span className="headline text-4xl sm:text-6xl">SR</span>
              <span className="headline text-4xl sm:text-6xl">PM</span>
            </div>
          </div>

          <div className="border-b-2 border-line px-4 py-4 sm:px-6">
            <Barcode value={site.name} caption="ERICHGRUNDMAN.COM" height={64} />
          </div>

          <div className="p-4 sm:p-6">
            <p className="field-label text-xs text-muted">Contents</p>
            {/* Erich writes this line and the paragraph under it. */}
            <p className="mt-2 max-w-2xl text-3xl leading-[1.15] font-semibold tracking-tight sm:text-4xl">
              I turn operations into software, and better decisions.
            </p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              I work at the intersection of parcel transportation, ecommerce
              fulfillment, decision science, and applied AI. I find the hidden
              variable, then build the system that acts on it.
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
        <dl className="label-panel grid sm:grid-cols-2">
          {highlights.map((highlight, index) => {
            // Two columns of label fields. With an odd count the last field
            // spans the row; with an even count the last two sit on the
            // bottom edge on wide screens and need no rule under them.
            const count = highlights.length;
            const last = index === count - 1;
            const spansRow = last && count % 2 === 1;
            const bottomPair = count % 2 === 0 && index === count - 2;
            return (
              <div
                key={highlight.label}
                className={[
                  "border-line p-4 sm:p-6",
                  last ? "" : "border-b-2",
                  bottomPair ? "sm:border-b-0" : "",
                  spansRow ? "sm:col-span-2" : index % 2 === 0 ? "sm:border-r-2" : "",
                ].join(" ")}
              >
                <dt className="field-label text-xs">{highlight.label}</dt>
                <dd>
                  <p className="headline mt-3 text-5xl sm:text-6xl">
                    {highlight.figure}
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                    {highlight.detail}
                  </p>
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="pb-20">
        <Kicker>Portfolio</Kicker>
        {/* Erich writes this intro. */}
        <p className="max-w-xl text-lg leading-relaxed text-muted">
          Interactive models of how parcel economics actually work, built on
          synthetic data so the mechanics can be published without publishing
          anyone&apos;s rates.
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
              kind="Interactive model"
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
              Hiring for product where operations meet software?
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              Direct email reaches me fastest, and a specific first message gets
              a specific answer.
            </p>
            <p className="mt-6">
              <a
                href={`mailto:${site.email}`}
                aria-label={`Email ${site.name}`}
                className="font-mono text-lg"
              >
                {site.email}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
