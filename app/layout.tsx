import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import "./globals.css";

// Archivo carries a width axis, so one family covers the condensed label caps
// and the normal width body text.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.headline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  // Home only. Every other public page goes through pageMetadata in
  // lib/metadata.ts, which writes its own canonical and Open Graph set. A
  // page that skips it inherits this canonical and this openGraph block
  // wholesale, so it would share and index as the home page.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} · ${site.headline}`,
    description: site.description,
    url: site.url,
  },
  // The card image itself comes from the opengraph-image files. This only
  // asks platforms that read Twitter tags to show it large.
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} antialiased`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-highlight focus:px-3 focus:py-2 focus:field-label focus:text-xs text-xs focus:text-on-highlight"
        >
          Skip to content
        </a>
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 sm:px-6">
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
