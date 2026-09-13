/**
 * Content gate. Runs before next build so a broken content file fails with a
 * readable message instead of a build trace.
 *
 * Checks every file in content/, in every environment including drafts:
 *   1. frontmatter parses against its Zod schema
 *   2. case studies carry the required body sections
 *   3. lab routes point at a route the app can serve
 */
import {
  getPortfolioEntry,
  getWorkEntry,
  getWritingEntry,
  listSlugs,
  readBody,
} from "../lib/content/loader";
import { requiredWorkHeadings } from "../lib/content/schema";

const problems: string[] = [];

function record(error: unknown): void {
  problems.push(error instanceof Error ? error.message : String(error));
}

for (const slug of listSlugs("work")) {
  try {
    getWorkEntry(slug);
    const body = readBody("work", slug);
    const missing = requiredWorkHeadings.filter(
      (heading) => !body.includes(heading),
    );
    if (missing.length > 0) {
      problems.push(
        `content/work/${slug}.mdx is missing required sections:\n${missing
          .map((heading) => `  ${heading}`)
          .join("\n")}`,
      );
    }
  } catch (error) {
    record(error);
  }
}

for (const slug of listSlugs("writing")) {
  try {
    getWritingEntry(slug);
  } catch (error) {
    record(error);
  }
}

for (const slug of listSlugs("portfolio")) {
  try {
    const entry = getPortfolioEntry(slug);
    const expected = `/portfolio/${slug}`;
    if (entry.route !== expected) {
      problems.push(
        `content/portfolio/${slug}.mdx: route is "${entry.route}" but the file name resolves to "${expected}"`,
      );
    }
  } catch (error) {
    record(error);
  }
}

if (problems.length > 0) {
  console.error(`\nContent check failed with ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`${problem}\n`);
  process.exit(1);
}

const counts = (["work", "writing", "portfolio"] as const)
  .map((type) => `${listSlugs(type).length} ${type}`)
  .join(", ");
console.log(`Content check passed: ${counts}.`);
