import type { MDXComponents } from "mdx/types";

/**
 * Global MDX element mapping. Required by @next/mdx in the App Router.
 *
 * Content files carry no classes of their own, so every typographic decision
 * lives here. Change the look of all writing and case studies in one place.
 */
const components: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      className="mt-14 mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-10 mb-3 font-serif text-2xl tracking-tight" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mt-5 leading-relaxed text-ink/85" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed text-ink/85" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-5 leading-relaxed text-ink/85" {...props}>
      {children}
    </ol>
  ),
  a: ({ children, href, ...props }) => {
    const external = typeof href === "string" && href.startsWith("http");
    return (
      <a
        href={href}
        className="text-accent underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-ink" {...props}>
      {children}
    </strong>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mt-6 border-l-2 border-accent pl-5 font-serif text-lg italic text-muted"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }) => (
    <code className="rounded bg-rule/60 px-1.5 py-0.5 font-mono text-[0.85em]" {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="mt-6 overflow-x-auto rounded border border-rule bg-rule/25 p-4 font-mono text-sm leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),
  hr: (props) => <hr className="my-12 border-rule" {...props} />,
  table: ({ children, ...props }) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-b border-rule py-2 pr-4 text-left font-mono text-xs uppercase tracking-[0.12em] text-muted"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-b border-rule py-2 pr-4 align-top leading-relaxed" {...props}>
      {children}
    </td>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
