import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const siteUrl = "https://zarena.vercel.app";
const siteName = "Zarena";
const siteDescription =
  "Create a private room and play realtime browser party games with friends. Draw, guess, explore, and laugh together with no sign-up needed.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "Zarena - Realtime Party Games With Friends",
    template: "%s | Zarena",
  },
  description: siteDescription,
  keywords: [
    "Zarena",
    "party games",
    "browser games",
    "multiplayer games",
    "draw and guess",
    "GeoGuess",
    "online party games",
    "no sign up games",
  ],
  authors: [{ name: "Zarena" }],
  creator: "Zarena",
  publisher: "Zarena",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: "Zarena - Realtime Party Games With Friends",
    description: siteDescription,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1731,
        height: 909,
        alt: "Zarena - realtime party games with friends",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zarena - Realtime Party Games With Friends",
    description: siteDescription,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
        sizes: "any",
      },
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "1024x1024",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-dvh antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="h-dvh flex flex-col bg-background text-foreground overflow-hidden">
        {children}
        <Script
          id="zarena-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: siteName,
              url: siteUrl,
              description: siteDescription,
              applicationCategory: "GameApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        <Script
          src="https://gc.zgo.at/count.js"
          data-goatcounter="https://zarena.goatcounter.com/count"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
