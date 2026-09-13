import Link from "next/link";
import { Kicker } from "@/components/kicker";

export default function NotFound() {
  return (
    <section className="border-t border-rule py-16">
      <Kicker>404</Kicker>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        That page is not here.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        The link is wrong, or the page moved. The work, the writing, and the labs
        are all one click away.
      </p>
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.15em]">
        {[
          { href: "/work", label: "Work" },
          { href: "/writing", label: "Writing" },
          { href: "/labs", label: "Labs" },
          { href: "/contact", label: "Contact" },
        ].map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-accent transition-opacity hover:opacity-70"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
