import type { Metadata, Viewport } from "next";
import { AmbientSpaAudio } from "@/components/AmbientSpaAudio";
import { PersistentSiteNavigation } from "@/components/PersistentSiteNavigation";
import "./globals.css";
import { siteConfig } from "@/lib/site";

const siteUrl = siteConfig.domain;
const pageTitle = `${siteConfig.businessName} | Massage Therapy in Okotoks`;
const pageDescription =
  "Personalized massage therapy in Okotoks and Calgary with calm, professional care, clear communication, and convenient online booking through ClinicSense.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteConfig.businessName,
  title: {
    default: pageTitle,
    template: `%s | ${siteConfig.businessName}`,
  },
  description: pageDescription,
  keywords: [
    "McKenzie House Massage",
    "Okotoks massage",
    "massage therapy Okotoks",
    "therapeutic massage Okotoks",
    "relaxation massage Okotoks",
    "deep tissue massage Okotoks",
    "Calgary massage therapy",
    "Heather Knorr massage",
    "ClinicSense booking",
  ],
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  publisher: siteConfig.businessName,
  alternates: {
    canonical: "/",
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
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/",
    siteName: siteConfig.businessName,
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
  category: "Health and wellness",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fbf7ef",
  colorScheme: "light",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: siteConfig.businessName,
  alternateName: siteConfig.currentName,
  description: pageDescription,
  url: siteUrl,
  areaServed: [
    {
      "@type": "City",
      name: "Okotoks",
      addressRegion: "Alberta",
      addressCountry: "CA",
    },
    {
      "@type": "City",
      name: "Calgary",
      addressRegion: "Alberta",
      addressCountry: "CA",
    },
  ],
  founder: {
    "@type": "Person",
    name: siteConfig.legalName,
  },
  knowsAbout: [
    "Massage therapy",
    "Therapeutic massage",
    "Relaxation massage",
    "Deep tissue massage",
    "Scalp, neck and shoulder massage",
  ],
  potentialAction: {
    "@type": "ReserveAction",
    target: siteConfig.bookingUrl,
    name: "Book a massage therapy appointment",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      </head>

      <body>
        <PersistentSiteNavigation />
        {children}
        <AmbientSpaAudio />
      </body>
    </html>
  );
}