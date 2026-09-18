import Link from "next/link";
import { Kicker } from "@/components/kicker";

export default function NotFound() {
  return (
    <section className="py-6">
      <Kicker>404</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        That page is not here.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        The link is wrong, or the page moved. The about page and the portfolio
        are both one click away.
      </p>
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 field-label text-xs">
        {[
          { href: "/about", label: "About" },
          { href: "/portfolio", label: "Portfolio" },
        ].map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="underline decoration-highlight decoration-[3px] underline-offset-2"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
