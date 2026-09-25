/**
 * Render the LinkedIn banner from the same renderer as the share cards.
 *
 * The banner is not a site asset. It is uploaded to LinkedIn by hand, so the
 * output goes wherever the first argument says, not into public/.
 *
 * Usage: pnpm banner:generate [output path]
 */
import fs from "node:fs";
import path from "node:path";
import { renderBanner } from "../lib/og";

async function main() {
  const target = path.resolve(process.argv[2] ?? "linkedin-banner.jpg");
  const jpeg = Buffer.from(await (await renderBanner()).arrayBuffer());
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, jpeg);
  console.log(`Wrote ${target} (${jpeg.length} bytes).`);
}

main();
