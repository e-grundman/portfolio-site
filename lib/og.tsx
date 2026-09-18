/**
 * Share images for LinkedIn, Slack, and anything else that unfurls a link.
 *
 * Rendered at build time by next/og. Satori reads woff but not woff2, so the
 * fonts come from the @fontsource packages rather than from next/font. The
 * palette is the light mode palette in globals.css, because a share card is
 * shown on whatever surface the platform picks.
 */
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
// JPEG rather than the PNG ImageResponse produces. LinkedIn's inspector showed
// a blank frame for the PNG card; a flat JPEG with no alpha channel is the
// most widely accepted format, and it is about a third of the size.
export const ogContentType = "image/jpeg";

async function toJpeg(image: ImageResponse): Promise<Response> {
  const png = Buffer.from(await image.arrayBuffer());
  const jpeg = await sharp(png)
    .flatten({ background: "#fbfaf7" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": ogContentType },
  });
}

export const color = {
  bg: "#fbfaf7",
  ink: "#1b1a17",
  muted: "#6b6862",
  rule: "#e4e1d9",
  accent: "#b5451f",
};

const fontFile = (pkg: string, file: string) =>
  readFile(join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));

async function loadFonts() {
  const [serif, serifItalic, mono] = await Promise.all([
    fontFile("newsreader", "newsreader-latin-400-normal.woff"),
    fontFile("newsreader", "newsreader-latin-400-italic.woff"),
    fontFile("geist-mono", "geist-mono-latin-400-normal.woff"),
  ]);
  return [
    { name: "Newsreader", data: serif, style: "normal" as const, weight: 400 as const },
    { name: "Newsreader", data: serifItalic, style: "italic" as const, weight: 400 as const },
    { name: "Geist Mono", data: mono, style: "normal" as const, weight: 400 as const },
  ];
}

async function loadHeadshot(): Promise<string> {
  const bytes = await readFile(join(process.cwd(), "public", site.headshot));
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

// Sized for the thumbnail, not the full image: LinkedIn shows the card at
// under half scale, and 20 pixel mono text turned to noise at that size.
const kicker = {
  fontFamily: "Geist Mono",
  fontSize: 32,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: color.muted,
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: color.bg,
        color: color.ink,
        padding: "72px 80px",
        fontFamily: "Newsreader",
        borderTop: `12px solid ${color.accent}`,
      }}
    >
      {children}
    </div>
  );
}

/** The home page card: who, the claim, and the lead number. */
export async function renderHomeCard(headline: {
  figure: string;
  label: string;
}) {
  const [fonts, headshot] = await Promise.all([loadFonts(), loadHeadshot()]);

  return toJpeg(new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={headshot}
            width={120}
            height={120}
            alt=""
            style={{
              borderRadius: 60,
              border: `2px solid ${color.rule}`,
              objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 56, letterSpacing: "-0.01em" }}>{site.name}</div>
            <div style={kicker}>{site.role}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontSize: 68,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            maxWidth: 1000,
          }}
        >
          <span>I turn operations into software, and&nbsp;</span>
          <span style={{ fontStyle: "italic", color: color.accent }}>
            better decisions
          </span>
          <span>.</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 28,
            borderTop: `2px solid ${color.rule}`,
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 72, color: color.accent }}>{headline.figure}</div>
          <div style={{ ...kicker, color: color.ink }}>{headline.label}</div>
        </div>
      </Frame>
    ),
    { ...ogSize, fonts },
  ));
}

/** A portfolio piece: the title and summary, signed. */
export async function renderEntryCard(entry: { title: string; summary: string }) {
  const fonts = await loadFonts();

  return toJpeg(new ImageResponse(
    (
      <Frame>
        <div style={kicker}>Interactive model</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 88, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            {entry.title}
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.3,
              color: color.muted,
              maxWidth: 980,
            }}
          >
            {entry.summary}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: `2px solid ${color.rule}`,
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 36 }}>{site.name}</div>
          <div style={kicker}>{site.role}</div>
        </div>
      </Frame>
    ),
    { ...ogSize, fonts },
  ));
}

/**
 * The browser tab icon: an EG monogram in the display serif, paper on rust.
 * Drawn heavier than the site's headlines because at 32 pixels a regular
 * weight serif breaks up. PNG, since browsers expect it for icons.
 */
export async function renderIcon(px: number, rounded: boolean) {
  const bold = await fontFile("newsreader", "newsreader-latin-600-normal.woff");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: color.accent,
          color: color.bg,
          borderRadius: rounded ? px * 0.2 : 0,
          fontFamily: "Newsreader",
          fontSize: px * 0.62,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          paddingBottom: px * 0.06,
        }}
      >
        EG
      </div>
    ),
    {
      width: px,
      height: px,
      fonts: [{ name: "Newsreader", data: bold, style: "normal", weight: 600 }],
    },
  );
}
