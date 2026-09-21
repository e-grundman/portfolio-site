import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  portfolioSchema,
  caseStudySchema,
  writingSchema,
  type PortfolioFrontmatter,
  type CaseStudyFrontmatter,
  type WritingFrontmatter,
} from "./schema";

export type ContentType = "case-studies" | "writing" | "portfolio";

export type Entry<T> = T & { slug: string };

/** Slugs become URL segments and dynamic import paths, so keep them plain. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const schemas = {
  "case-studies": caseStudySchema,
  writing: writingSchema,
  portfolio: portfolioSchema,
} satisfies Record<ContentType, z.ZodTypeAny>;

function contentDir(type: ContentType): string {
  return path.join(process.cwd(), "content", type);
}

export function listSlugs(type: ContentType): string[] {
  const dir = contentDir(type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .map((slug) => {
      if (!SLUG_PATTERN.test(slug)) {
        throw new Error(
          `content/${type}/${slug}.mdx: filename must be lowercase words joined by hyphens, because it becomes a URL and an import path`,
        );
      }
      return slug;
    })
    .sort();
}

/** Raw markdown body, used by the heading check and by nothing at runtime. */
export function readBody(type: ContentType, slug: string): string {
  const file = path.join(contentDir(type), `${slug}.mdx`);
  return matter(fs.readFileSync(file, "utf8")).content;
}

function readFrontmatter<T extends object>(
  type: ContentType,
  slug: string,
  schema: z.ZodType<T, unknown>,
): Entry<T> {
  const file = path.join(contentDir(type), `${slug}.mdx`);
  const parsed = schema.safeParse(matter(fs.readFileSync(file, "utf8")).data);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`content/${type}/${slug}.mdx frontmatter is invalid:\n${problems}`);
  }
  return { ...parsed.data, slug };
}

/** Drafts are visible while developing and never ship to production. */
function visible<T extends { draft: boolean }>(entries: Entry<T>[]): Entry<T>[] {
  return process.env.NODE_ENV === "production"
    ? entries.filter((entry) => !entry.draft)
    : entries;
}

function byNewest<T extends { publishedAt: string }>(a: T, b: T): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

export function getCaseStudies(): Entry<CaseStudyFrontmatter>[] {
  return visible(
    listSlugs("case-studies").map((slug) => readFrontmatter("case-studies", slug, schemas["case-studies"])),
  ).sort(byNewest);
}

export function getCaseStudyEntry(slug: string): Entry<CaseStudyFrontmatter> {
  return readFrontmatter("case-studies", slug, schemas["case-studies"]);
}

export function getWriting(): Entry<WritingFrontmatter>[] {
  return visible(
    listSlugs("writing").map((slug) =>
      readFrontmatter("writing", slug, schemas.writing),
    ),
  ).sort(byNewest);
}

export function getWritingEntry(slug: string): Entry<WritingFrontmatter> {
  return readFrontmatter("writing", slug, schemas.writing);
}

/** Posts that live on this site. External entries index but do not route. */
export function getLocalWriting(): Entry<WritingFrontmatter>[] {
  return getWriting().filter((post) => !post.externalOnly);
}

export function getPortfolio(): Entry<PortfolioFrontmatter>[] {
  return visible(
    listSlugs("portfolio").map((slug) =>
      readFrontmatter("portfolio", slug, schemas.portfolio),
    ),
  ).sort(byNewest);
}

export function getPortfolioEntry(slug: string): Entry<PortfolioFrontmatter> {
  return readFrontmatter("portfolio", slug, schemas.portfolio);
}
