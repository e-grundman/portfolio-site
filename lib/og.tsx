/**
 * Share images and the site icon, drawn as shipping labels.
 *
 * Rendered at build time by next/og. Satori reads woff but not woff2, and it
 * does not read variable fonts, so the condensed caps come from Archivo Narrow
 * (the static cousin of the Archivo width axis the site uses) through the
 * @fontsource packages. Cards are always the light label, because a share card
 * is shown on whatever surface the platform picks.
 */
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { barcodeModules } from "@/lib/barcode";
import { site } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
// JPEG rather than the PNG ImageResponse produces. LinkedIn's inspector showed
// a blank frame for the PNG card; a flat JPEG with no alpha channel is the
// most widely accepted format, and it is about a third of the size.
export const ogContentType = "image/jpeg";

export const color = {
  paper: "#ffffff",
  ink: "#111111",
  muted: "#5a5d5f",
  highlight: "#ffd100",
};

const LINE = 6;

async function toJpeg(image: ImageResponse): Promise<Response> {
  const png = Buffer.from(await image.arrayBuffer());
  const jpeg = await sharp(png)
    .flatten({ background: color.paper })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": ogContentType },
  });
}

const fontFile = (pkg: string, file: string) =>
  readFile(join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));

async function loadFonts() {
  const [caps, mono] = await Promise.all([
    fontFile("archivo-narrow", "archivo-narrow-latin-700-normal.woff"),
    fontFile("ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff"),
  ]);
  return [
    { name: "Caps", data: caps, style: "normal" as const, weight: 700 as const },
    { name: "Mono", data: mono, style: "normal" as const, weight: 500 as const },
  ];
}

/** The headshot, in color, cropped square for the ship-to field. */
async function loadHeadshot(): Promise<string> {
  const bytes = await readFile(join(process.cwd(), "public", site.headshot));
  const square = await sharp(bytes)
    .resize(320, 320, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer();
  return `data:image/jpeg;base64,${square.toString("base64")}`;
}

const fieldLabel = {
  fontFamily: "Caps",
  fontSize: 22,
  textTransform: "uppercase" as const,
  color: color.muted,
};

function Barcode({ value, height }: { value: string; height: number }) {
  const widths = barcodeModules(value);
  const total = widths.reduce((sum, w) => sum + w, 0);
  return (
    <div style={{ display: "flex", width: "100%", height }}>
      {widths.map((w, i) => (
        <div
          key={i}
          style={{
            width: `${(w / total) * 100}%`,
            height: "100%",
            background: i % 2 === 0 ? color.ink : "transparent",
          }}
        />
      ))}
    </div>
  );
}

/** Outer label: paper, with a heavy frame inset from the edge. */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: color.paper,
        padding: 28,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          border: `${LINE}px solid ${color.ink}`,
          color: color.ink,
          fontFamily: "Caps",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** The home page card: ship to, the priority box, the barcode, the lead number. */
export async function renderHomeCard(headline: { figure: string; label: string }) {
  const [fonts, headshot] = await Promise.all([loadFonts(), loadHeadshot()]);

  return toJpeg(
    new ImageResponse(
      (
        <Label>
          <div style={{ display: "flex", borderBottom: `${LINE}px solid ${color.ink}` }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 32, padding: 28 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headshot}
                width={170}
                height={170}
                alt=""
                style={{ border: `4px solid ${color.ink}`, objectFit: "cover" }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={fieldLabel}>Ship to</div>
                <div style={{ fontSize: 80, lineHeight: 0.95, textTransform: "uppercase" }}>
                  {site.name}
                </div>
                <div style={{ fontSize: 28, marginTop: 10, textTransform: "uppercase" }}>
                  {site.role}
                </div>
              </div>
            </div>
            <div
              style={{
                width: 190,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: color.highlight,
                borderLeft: `${LINE}px solid ${color.ink}`,
                fontSize: 84,
                lineHeight: 0.9,
              }}
            >
              <div>SR</div>
              <div>PM</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "22px 28px 16px",
              borderBottom: `${LINE}px solid ${color.ink}`,
            }}
          >
            <Barcode value={site.name} height={78} />
            <div style={{ fontFamily: "Mono", fontSize: 20, letterSpacing: "0.3em", marginTop: 8 }}>
              ERICHGRUNDMAN.COM
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 28, padding: "0 28px" }}>
            <div style={{ fontSize: 104, lineHeight: 1 }}>{headline.figure}</div>
            <div style={{ fontSize: 34, textTransform: "uppercase", lineHeight: 1.05, maxWidth: 420 }}>
              {headline.label}
            </div>
          </div>
        </Label>
      ),
      { ...ogSize, fonts },
    ),
  );
}

/** A portfolio piece, as a package label. */
export async function renderEntryCard(entry: { title: string; summary: string }) {
  const fonts = await loadFonts();

  return toJpeg(
    new ImageResponse(
      (
        <Label>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 28px",
              background: color.ink,
              color: color.paper,
              fontSize: 26,
              textTransform: "uppercase",
            }}
          >
            <div>Decision tool</div>
            <div>{site.name}</div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 28px",
              gap: 22,
            }}
          >
            <div style={{ fontSize: 110, lineHeight: 0.95, textTransform: "uppercase" }}>
              {entry.title}
            </div>
            <div
              style={{
                fontFamily: "Mono",
                fontSize: 28,
                lineHeight: 1.35,
                color: color.muted,
                maxWidth: 1000,
              }}
            >
              {entry.summary}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              padding: "18px 28px",
              borderTop: `${LINE}px solid ${color.ink}`,
            }}
          >
            <div style={{ display: "flex", width: 420 }}>
              <Barcode value={entry.title} height={52} />
            </div>
            <div style={{ fontFamily: "Mono", fontSize: 22, letterSpacing: "0.3em" }}>
              ERICHGRUNDMAN.COM
            </div>
          </div>
        </Label>
      ),
      { ...ogSize, fonts },
    ),
  );
}

/**
 * The browser tab icon: EG in condensed caps, ink on safety yellow, the same
 * yellow as the SR PM box on the home page.
 */
export async function renderIcon(px: number, framed: boolean) {
  const caps = await fontFile("archivo-narrow", "archivo-narrow-latin-700-normal.woff");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: color.highlight,
          color: color.ink,
          border: framed ? `${Math.max(1, Math.round(px / 16))}px solid ${color.ink}` : "none",
          fontFamily: "Caps",
          fontSize: px * 0.72,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          paddingTop: px * 0.04,
        }}
      >
        EG
      </div>
    ),
    {
      width: px,
      height: px,
      fonts: [{ name: "Caps", data: caps, style: "normal", weight: 700 }],
    },
  );
}
