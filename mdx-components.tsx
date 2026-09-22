import type { MDXComponents } from "mdx/types";
import Image from "next/image";

/**
 * Global MDX element mapping. Required by @next/mdx in the App Router.
 *
 * Content files carry no classes of their own, so every typographic decision
 * lives here. Change the look of all writing and case studies in one place.
 */
const components: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      className="mt-14 mb-4 field-label text-sm"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-10 mb-3 headline text-2xl" {...props}>
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
        className="underline decoration-highlight decoration-[3px] underline-offset-2"
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
      className="mt-6 border-l-4 border-highlight pl-5 text-lg text-muted"
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
      className="border-b border-rule py-2 pr-4 text-left field-label text-xs text-muted"
      {...props}
    >
      {children}
    </th>
  ),
  /**
   * A screenshot with its caption. Used where a case study needs an exhibit,
   * and the caption is where the masking gets declared.
   */
  Figure: ({
    src,
    alt,
    caption,
    width = 1600,
    height = 1049,
  }: {
    src: string;
    alt: string;
    caption: string;
    width?: number;
    height?: number;
  }) => (
    <figure className="mt-8 xl:-mx-24">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full border-2 border-line"
      />
      <figcaption className="mt-3 text-sm leading-relaxed text-muted">
        {caption}
      </figcaption>
    </figure>
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
