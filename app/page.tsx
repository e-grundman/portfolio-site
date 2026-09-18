import Image from "next/image";
import Link from "next/link";
import { EntryRow } from "@/components/entry-row";
import { Kicker } from "@/components/kicker";
import { getPortfolio } from "@/lib/content/loader";
import { site } from "@/lib/site";

export default function Home() {
  const entries = getPortfolio();
  const live = entries.filter((entry) => entry.status === "live");
  const queued = entries.filter((entry) => entry.status !== "live");

  return (
    <>
      <section className="border-t border-rule pt-16 pb-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <Image
            src={site.headshot}
            alt={`Portrait of ${site.name}`}
            width={160}
            height={160}
            priority
            className="h-32 w-32 shrink-0 rounded-full border border-rule object-cover sm:h-40 sm:w-40"
          />
          <div>
            <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              {site.name}
            </h1>
            <p className="mt-3 text-lg leading-snug text-muted">
              {site.headline}
            </p>
          </div>
        </div>
        <p className="mt-16 font-serif text-3xl leading-[1.15] tracking-tight sm:text-4xl">
          I turn operations into software,
          <br />
          and <em className="text-accent">better decisions</em>.
        </p>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          I work at the intersection of parcel transportation, ecommerce
          fulfillment, decision science, and applied AI. I find the hidden
          variable, then build the system that acts on it.
        </p>
        <p className="mt-8">
          <Link
            href="/about"
            className="font-mono text-xs uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
          >
            More about how I work →
          </Link>
        </p>
      </section>

      <section className="border-t border-rule py-16">
        <Kicker>Portfolio</Kicker>
        <p className="max-w-xl text-lg leading-relaxed text-muted">
          Interactive models of how parcel economics actually work, built on
          synthetic data so the mechanics can be published without publishing
          anyone&apos;s rates.
        </p>
        <div className="mt-8">
          {live.map((entry) => (
            <EntryRow
              key={entry.slug}
              href={entry.route}
              title={entry.title}
              summary={entry.summary}
              rail={
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {entry.status}
                </span>
              }
            />
          ))}
        </div>
        {queued.length > 0 && (
          <p className="pt-8">
            <Link
              href="/portfolio"
              className="font-mono text-xs uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
            >
              Everything, including what is queued →
            </Link>
          </p>
        )}
      </section>

      <section className="border-t border-rule py-16">
        <Kicker>Contact</Kicker>
        <h2 className="font-serif text-3xl tracking-tight">
          Working on something where operations meet software?
        </h2>
        <p className="mt-6 max-w-xl leading-relaxed text-muted">
          Direct email reaches me fastest, and a specific first message gets a
          specific answer.
        </p>
        <p className="mt-6">
          <a
            href={`mailto:${site.email}`}
            aria-label={`Email ${site.name}`}
            className="font-mono text-sm text-accent transition-opacity hover:opacity-70"
          >
            {site.email}
          </a>
        </p>
      </section>
    </>
  );
}
