import Link from "next/link";
import { EntryRow } from "@/components/entry-row";
import { Kicker } from "@/components/kicker";
import { MetricFigure } from "@/components/metric";
import { getLabs, getWork, getWriting } from "@/lib/content/loader";
import { formatMonthYear } from "@/lib/format";

export default function Home() {
  const work = getWork().filter((entry) => entry.featured).slice(0, 3);
  const writing = getWriting().slice(0, 4);
  const labs = getLabs().filter((lab) => lab.status === "live").slice(0, 2);

  return (
    <>
      <section className="border-t border-rule pt-16 pb-24">
        <Kicker>Senior Product Manager</Kicker>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          I turn operations into software,
          <br />
          and <em className="text-accent">better decisions</em>.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          I work at the intersection of parcel transportation, ecommerce
          fulfillment, decision science, and applied AI. I find the hidden
          variable, then build the system that acts on it.
        </p>
      </section>

      <section className="border-t border-rule py-16">
        <Kicker>Selected Work</Kicker>
        {work.map((entry) => (
          <EntryRow
            key={entry.slug}
            href={`/work/${entry.slug}`}
            title={entry.title}
            summary={entry.summary}
            rail={<MetricFigure metric={entry.metrics[0]} />}
          />
        ))}
        <p className="pt-8">
          <Link
            href="/work"
            className="font-mono text-xs uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
          >
            All work →
          </Link>
        </p>
      </section>

      {labs.length > 0 && (
        <section className="border-t border-rule py-16">
          <Kicker>Labs</Kicker>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            Interactive models of how parcel economics actually work, built on
            synthetic data so the mechanics can be published without publishing
            anyone&apos;s rates.
          </p>
          <div className="mt-6">
            {labs.map((lab) => (
              <EntryRow
                key={lab.slug}
                href={lab.route}
                title={lab.title}
                summary={lab.summary}
                rail={
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {lab.status}
                  </span>
                }
              />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-rule py-16">
        <Kicker>Writing</Kicker>
        <ul>
          {writing.map((post) => {
            const href = post.externalOnly
              ? (post.canonical ?? "#")
              : `/writing/${post.slug}`;
            return (
              <li key={post.slug} className="border-b border-rule">
                {post.externalOnly ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-baseline justify-between gap-6 py-4"
                  >
                    <span className="font-serif text-lg leading-snug tracking-tight transition-colors group-hover:text-accent">
                      {post.title}
                    </span>
                    <span className="shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                      {formatMonthYear(post.publishedAt)}
                    </span>
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="group flex items-baseline justify-between gap-6 py-4"
                  >
                    <span className="font-serif text-lg leading-snug tracking-tight transition-colors group-hover:text-accent">
                      {post.title}
                    </span>
                    <span className="shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                      {formatMonthYear(post.publishedAt)}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <p className="pt-8">
          <Link
            href="/writing"
            className="font-mono text-xs uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
          >
            All writing →
          </Link>
        </p>
      </section>

      <section className="border-t border-rule py-16">
        <Kicker>Contact</Kicker>
        <h2 className="font-serif text-3xl tracking-tight">
          Working on something where operations meet software?
        </h2>
        <p className="mt-6">
          <Link
            href="/contact"
            className="font-mono text-sm text-accent transition-opacity hover:opacity-70"
          >
            Start here →
          </Link>
        </p>
      </section>
    </>
  );
}
