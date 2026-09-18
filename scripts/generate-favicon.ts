/**
 * Build app/favicon.ico from the same renderer as the icon routes.
 *
 * Browsers and search crawlers still request /favicon.ico directly, so the
 * file has to exist and has to match. An ICO can hold PNG images, so this
 * wraps 16, 32, and 48 pixel PNGs in the ICO container.
 *
 * Usage: pnpm icons:generate
 */
import fs from "node:fs";
import path from "node:path";
import { renderIcon } from "../lib/og";

const SIZES = [16, 32, 48];

async function main() {
  const pngs = await Promise.all(
    SIZES.map(async (px) =>
      Buffer.from(await (await renderIcon(px, true)).arrayBuffer()),
    ),
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map((png, i) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(SIZES[i], 0); // width
    entry.writeUInt8(SIZES[i], 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  const target = path.join(process.cwd(), "app", "favicon.ico");
  fs.writeFileSync(target, Buffer.concat([header, ...entries, ...pngs]));
  console.log(`Wrote ${target} with ${SIZES.join(", ")} pixel images.`);
}

main();
