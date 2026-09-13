const work: {
  title: string;
  body: string;
  lead: string;
  trail?: string;
  metricLabel: string;
  href: string | null;
}[] = [
  {
    title: "Routing, rebuilt",
    body: "A guaranteed delivery window was missing half the time. The fix was not more code. We traded average transit times for percentiles, then renegotiated one fixed constraint the model was never allowed to touch.",
    lead: "50%",
    trail: "90%",
    metricLabel: "on-time delivery",
    href: null,
  },
  {
    title: "Exceptions, automated",
    body: "A package exception used to mean a person opening a case, chasing dead tracking, and deciding what to do. I shipped a production pipeline that detects the stall, decides the recovery, and acts on it. Built with AI-assisted development, shipped by a product manager, not a platform team.",
    lead: "20,000+",
    metricLabel: "cases handled unattended",
    href: null,
  },
  {
    title: "The dashboard that changed nothing",
    body: "I built an analytics dashboard I was convinced was brilliant. It changed no decisions. v2 forces the team to review each inefficiency, decide the action, and document it inside the tool. The deliverable stopped being the summary and became the decision.",
    lead: "v1",
    trail: "v2",
    metricLabel: "information to action",
    href: "https://www.linkedin.com/posts/erich-grundman_i-built-a-dashboard-i-was-convinced-was-brilliant-share-7483844628367093760-DTiT/",
  },
];

const writing = [
  {
    title: "The dashboard that changed nothing",
    date: "Jul 2026",
    href: "https://www.linkedin.com/posts/erich-grundman_i-built-a-dashboard-i-was-convinced-was-brilliant-share-7483844628367093760-DTiT/",
  },
  {
    title: "Dimensional weight was never really about weight",
    date: "Jul 2026",
    href: "https://www.linkedin.com/posts/erich-grundman_dimensional-weight-was-never-really-about-share-7482493808614719488-I81t/",
  },
  {
    title: "Titles are lagging indicators",
    date: "Jul 2026",
    href: "https://www.linkedin.com/posts/erich-grundman_supply-chain-isnt-one-career-its-dozens-ugcPost-7481376333365858304-zDQ7/",
  },
  {
    title: "Smart brands switched to poly and bubble mailers",
    date: "Jul 2026",
    href: "https://www.linkedin.com/posts/erich-grundman_smart-brands-switched-to-poly-and-bubble-share-7479906189527572481-9Y1F/",
  },
];

const LINKEDIN = "https://www.linkedin.com/in/erich-grundman";
const EMAIL = "e.grundman@gmail.com";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6">
      <header className="flex items-center justify-between py-8 text-sm">
        <span className="font-serif text-lg tracking-tight">Erich Grundman</span>
        <nav className="flex gap-6 font-mono text-xs uppercase tracking-[0.15em] text-muted">
          <a className="transition-colors hover:text-accent" href="#work">
            Work
          </a>
          <a className="transition-colors hover:text-accent" href="#writing">
            Writing
          </a>
          <a className="transition-colors hover:text-accent" href="#contact">
            Contact
          </a>
        </nav>
      </header>

      <main>
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

        <section id="work" className="scroll-mt-8 border-t border-rule py-16">
          <Kicker>Selected Work</Kicker>
          <div>
            {work.map((item) => (
              <article
                key={item.title}
                className="group grid grid-cols-1 gap-3 border-b border-rule py-8 sm:grid-cols-[1fr_auto] sm:gap-10"
              >
                <div>
                  <h2 className="font-serif text-2xl tracking-tight">
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors group-hover:text-accent"
                      >
                        {item.title}
                        <span className="ml-2 inline-block font-mono text-sm text-muted transition-colors group-hover:text-accent">
                          ↗
                        </span>
                      </a>
                    ) : (
                      item.title
                    )}
                  </h2>
                  <p className="mt-3 max-w-lg leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className="font-mono text-lg tracking-tight">
                    {item.lead}
                    {item.trail && (
                      <>
                        <span className="mx-1.5 text-accent">→</span>
                        {item.trail}
                      </>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {item.metricLabel}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="scroll-mt-8 border-t border-rule py-16">
          <Kicker>About</Kicker>
          <div className="max-w-xl space-y-5 text-lg leading-relaxed">
            <p>
              Eight years at ShipMonk across six roles and five teams, and I
              started in customer support. The job never changed: find the
              problem nobody had untangled yet, and turn it into a decision the
              business could bet on.
            </p>
            <p className="text-muted">
              Cost models across twelve fulfillment sites. KPI frameworks for
              cost, margin, and on-time performance. Production software I
              shipped myself. I learned the network from the floor up, which is
              why I trust the operation over the spreadsheet when they disagree.
            </p>
            <p className="text-muted">
              Every operational decision is an economic decision. Software should
              remove decisions before it removes clicks. Most dashboards are
              vanity displays. I build the ones that aren&apos;t.
            </p>
          </div>
        </section>

        <section id="writing" className="scroll-mt-8 border-t border-rule py-16">
          <Kicker>Writing</Kicker>
          <ul>
            {writing.map((post) => (
              <li key={post.href} className="border-b border-rule">
                <a
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-baseline justify-between gap-6 py-4"
                >
                  <span className="font-serif text-lg leading-snug tracking-tight transition-colors group-hover:text-accent">
                    {post.title}
                  </span>
                  <span className="shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {post.date}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="contact"
          className="scroll-mt-8 border-t border-rule py-16"
        >
          <Kicker>Contact</Kicker>
          <h2 className="font-serif text-3xl tracking-tight">
            Working on something where operations meet software?
          </h2>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-opacity hover:opacity-70"
            >
              LinkedIn ↗
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="text-accent transition-opacity hover:opacity-70"
            >
              {EMAIL}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule py-8 font-mono text-xs uppercase tracking-[0.15em] text-muted">
        Erich Grundman · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
