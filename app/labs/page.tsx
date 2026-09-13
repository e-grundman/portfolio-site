import type { Metadata } from "next";
import Link from "next/link";
import { Kicker } from "@/components/kicker";
import { getLabs } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Interactive models of parcel economics, built on synthetic data: zone optimization, dimensional weight, and the mechanics behind shipping cost.",
};

const statusOrder = ["live", "prototype", "planned"] as const;
const statusCopy: Record<(typeof statusOrder)[number], string> = {
  live: "Working tools",
  prototype: "In progress",
  planned: "Queued",
};

export default function LabsIndex() {
  const labs = getLabs();

  return (
    <section className="border-t border-rule py-16">
      <Kicker>Labs</Kicker>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        The mechanics, made playable.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        Parcel economics are not complicated, they are just invisible. Each lab
        takes one cost mechanism, models it on synthetic data I control, and lets
        you move the inputs until the behavior is obvious. Every dataset states
        where it came from, because none of it may come from an employer.
      </p>

      {statusOrder.map((status) => {
        const group = labs.filter((lab) => lab.status === status);
        if (group.length === 0) return null;

        return (
          <div key={status} className="mt-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {statusCopy[status]}
            </h2>
            <div className="mt-4">
              {group.map((lab) => (
                <article
                  key={lab.slug}
                  className="group border-b border-rule py-6"
                >
                  <h3 className="font-serif text-2xl tracking-tight">
                    <Link
                      href={lab.route}
                      className="transition-colors group-hover:text-accent"
                    >
                      {lab.title}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-lg leading-relaxed text-muted">
                    {lab.summary}
                  </p>
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {lab.tags.join(" · ")}
                  </p>
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
