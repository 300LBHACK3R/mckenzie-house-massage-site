import type {
  Metadata,
  Viewport,
} from "next";
import type { ReactNode } from "react";
import { AmbientSpaAudio } from "@/components/AmbientSpaAudio";
import { PersistentSiteNavigation } from "@/components/PersistentSiteNavigation";
import {
  seoKeywords,
  siteConfig,
} from "@/lib/site";
import "./globals.css";

const DEFAULT_SITE_ORIGIN =
  "https://www.mckenziehousemassage.ca";

const DEFAULT_LOCALE = "en-CA";
const DEFAULT_COUNTRY_CODE = "CA";
const DEFAULT_CURRENCY = "CAD";

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

type OpeningHoursEntry = {
  day: string;
  opens: string | null;
  closes: string | null;
  isByRequest?: boolean;
};

type ExtendedSiteConfig = typeof siteConfig & {
  locale?: string;
  currency?: string;
  countryCode?: string;
  phoneE164?: string;
  bookingProvider?: string;

  openingHours?: OpeningHoursEntry[];

  waitlist?: {
    enabled?: boolean;
    buttonLabel?: string;
    href?: string;
  };

  assets: typeof siteConfig.assets & {
    openGraphImageAlt?: string;
  };
};

const extendedSiteConfig =
  siteConfig as ExtendedSiteConfig;

function normalizeSiteOrigin(
  value: string,
): string {
  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return DEFAULT_SITE_ORIGIN;
    }

    return url.origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

function parseBooleanEnvironmentValue(
  value: string | undefined,
): boolean | null {
  if (!value) {
    return null;
  }

  const normalizedValue =
    value.trim().toLowerCase();

  if (
    normalizedValue === "true" ||
    normalizedValue === "1" ||
    normalizedValue === "yes" ||
    normalizedValue === "on"
  ) {
    return true;
  }

  if (
    normalizedValue === "false" ||
    normalizedValue === "0" ||
    normalizedValue === "no" ||
    normalizedValue === "off"
  ) {
    return false;
  }

  return null;
}

function shouldAllowSearchIndexing(): boolean {
  const explicitPreference =
    parseBooleanEnvironmentValue(
      process.env.ALLOW_SEARCH_INDEXING,
    );

  if (explicitPreference !== null) {
    return explicitPreference;
  }

  const vercelEnvironment =
    process.env.VERCEL_ENV
      ?.trim()
      .toLowerCase();

  if (vercelEnvironment) {
    return vercelEnvironment === "production";
  }

  return process.env.NODE_ENV === "production";
}

function toAbsoluteUrl(
  value: string,
  siteOrigin: string,
): string {
  try {
    return new URL(
      value,
      `${siteOrigin}/`,
    ).toString();
  } catch {
    return value;
  }
}

function getExternalHttpOrigin(
  value: string,
  siteOrigin: string,
): string | null {
  try {
    const url = new URL(
      value,
      `${siteOrigin}/`,
    );

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    if (url.origin === siteOrigin) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

function isValidPublicProfile(
  value: string,
): boolean {
  const candidate = value.trim();

  if (!candidate) {
    return false;
  }

  /*
   * The temporary Google search URL is useful as a client-facing
   * fallback but should not be published as an official sameAs
   * profile in structured data.
   */
  if (
    candidate.includes(
      "google.com/search",
    )
  ) {
    return false;
  }

  try {
    const url = new URL(candidate);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

const siteOrigin = normalizeSiteOrigin(
  siteConfig.domain,
);

const homeUrl = `${siteOrigin}/`;

const locale =
  extendedSiteConfig.locale ||
  DEFAULT_LOCALE;

const openGraphLocale =
  locale.replace("-", "_");

const countryCode =
  extendedSiteConfig.countryCode ||
  DEFAULT_COUNTRY_CODE;

const currency =
  extendedSiteConfig.currency ||
  DEFAULT_CURRENCY;

const cleanPhone =
  extendedSiteConfig.phoneE164?.trim() ||
  siteConfig.phone.replace(
    /[^\d+]/g,
    "",
  );

const defaultTitle =
  `${siteConfig.businessName} | ` +
  "Personalized Massage Therapy in Prestwick, Calgary";

const defaultDescription =
  "Personalized massage therapy in Prestwick, Calgary with client-led pressure, professional care, clear pricing, direct-billing support, no tipping expected, and online booking through ClinicSense.";

const openGraphImageUrl =
  toAbsoluteUrl(
    siteConfig.assets.openGraphImage,
    siteOrigin,
  );

const logoUrl =
  toAbsoluteUrl(
    siteConfig.assets.logo,
    siteOrigin,
  );

const logoMarkUrl =
  toAbsoluteUrl(
    siteConfig.assets.logoMark,
    siteOrigin,
  );

const bookingUrl =
  toAbsoluteUrl(
    siteConfig.bookingUrl,
    siteOrigin,
  );

const bookingOrigin =
  getExternalHttpOrigin(
    siteConfig.bookingUrl,
    siteOrigin,
  );

const allowSearchIndexing =
  shouldAllowSearchIndexing();

const socialProfiles = Object.values(
  siteConfig.social,
).filter(isValidPublicProfile);

const fallbackOpeningHours:
  OpeningHoursEntry[] = [
    {
      day: "Tuesday",
      opens: "10:00",
      closes: "16:30",
      isByRequest: false,
    },
    {
      day: "Wednesday",
      opens: "10:00",
      closes: "16:30",
      isByRequest: false,
    },
    {
      day: "Thursday",
      opens: "10:00",
      closes: "16:30",
      isByRequest: false,
    },
    {
      day: "Friday",
      opens: "10:00",
      closes: "16:30",
      isByRequest: false,
    },
  ];

const openingHoursSpecification = (
  extendedSiteConfig.openingHours ??
  fallbackOpeningHours
).flatMap((entry) => {
  if (!entry.opens || !entry.closes) {
    return [];
  }

  return [
    {
      "@type":
        "OpeningHoursSpecification",

      dayOfWeek:
        `https://schema.org/${entry.day}`,

      opens: entry.opens,
      closes: entry.closes,
    },
  ];
});

const robotsMetadata: Metadata["robots"] =
  allowSearchIndexing
    ? {
        index: true,
        follow: true,

        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : {
        index: false,
        follow: false,

        googleBot: {
          index: false,
          follow: false,
        },
      };

export const metadata: Metadata = {
  metadataBase: new URL(homeUrl),

  applicationName:
    siteConfig.businessName,

  title: {
    default: defaultTitle,

    template:
      `%s | ${siteConfig.businessName}`,
  },

  description: defaultDescription,

  keywords: seoKeywords,

  authors: [
    {
      name: siteConfig.legalName,
    },
  ],

  creator: siteConfig.legalName,
  publisher: siteConfig.businessName,

  /*
   * Individual pages define their own canonical URLs. A global
   * canonical is deliberately omitted so /contact, /reviews, and
   * service pages cannot accidentally inherit "/" as canonical.
   */

  robots: robotsMetadata,

  referrer:
    "strict-origin-when-cross-origin",

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  icons: {
    icon: [
      {
        url: logoMarkUrl,
        type: "image/png",
      },
    ],

    shortcut: [
      {
        url: logoMarkUrl,
        type: "image/png",
      },
    ],

    apple: [
      {
        url: logoMarkUrl,
        type: "image/png",
      },
    ],
  },

  appleWebApp: {
    capable: true,
    title: siteConfig.businessName,
    statusBarStyle: "default",
  },

  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: homeUrl,
    siteName: siteConfig.businessName,
    type: "website",
    locale: openGraphLocale,

    images: [
      {
        url: openGraphImageUrl,

        alt:
          extendedSiteConfig.assets
            .openGraphImageAlt ||
          `${siteConfig.businessName} logo and brand preview`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [openGraphImageUrl],
  },

  category: "Health and wellness",

  other: {
    "geo.region": "CA-AB",
    "geo.placename":
      "Prestwick, Calgary, Alberta",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#fbf7ef",
  colorScheme: "light",
};

const businessId =
  `${siteOrigin}/#business`;

const websiteId =
  `${siteOrigin}/#website`;

const practitionerId =
  `${siteOrigin}/#heather-knorr`;

const businessPotentialActions:
  Record<string, unknown>[] = [
    {
      "@type": "ReserveAction",

      name:
        "Book a massage appointment",

      target: {
        "@type": "EntryPoint",

        urlTemplate: bookingUrl,

        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
    },
  ];

if (
  extendedSiteConfig.waitlist
    ?.enabled &&
  extendedSiteConfig.waitlist.href
) {
  businessPotentialActions.push({
    "@type": "CommunicateAction",

    name:
      extendedSiteConfig.waitlist
        .buttonLabel ||
      "Request an Earlier Opening",

    target:
      extendedSiteConfig.waitlist.href,
  });
}

const structuredData = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "WebSite",
      "@id": websiteId,

      url: homeUrl,
      name: siteConfig.businessName,
      description: defaultDescription,
      inLanguage: locale,

      publisher: {
        "@id": businessId,
      },
    },

    {
      "@type":
        "HealthAndBeautyBusiness",

      "@id": businessId,

      name: siteConfig.businessName,
      legalName: siteConfig.legalName,
      alternateName:
        siteConfig.currentName,

      url: homeUrl,
      description:
        siteConfig.description,

      slogan:
        "Listen. Restore. Rebalance.",

      image: openGraphImageUrl,
      logo: logoUrl,

      telephone:
        cleanPhone ||
        siteConfig.phone,

      email: siteConfig.email,

      currenciesAccepted: currency,

      address: {
        "@type": "PostalAddress",

        addressLocality:
          siteConfig.primaryCity,

        addressRegion:
          siteConfig.region,

        addressCountry: countryCode,
      },

      /*
       * Calgary is the confirmed current service location. Okotoks
       * is not added to local-business structured data until Heather
       * confirms an operating location or actual service availability.
       */
      areaServed: {
        "@type": "City",
        name: siteConfig.primaryCity,
        addressRegion:
          siteConfig.region,
        addressCountry: countryCode,
      },

      founder: {
        "@id": practitionerId,
      },

      contactPoint: {
        "@type": "ContactPoint",
        contactType:
          "customer service",

        telephone:
          cleanPhone ||
          siteConfig.phone,

        email: siteConfig.email,

        availableLanguage: [
          "English",
        ],

        areaServed: countryCode,
      },

      openingHoursSpecification,

      knowsAbout: [
        "Personalized massage therapy",
        "Therapeutic massage",
        "Relaxation massage",
        "Prenatal massage",
        "Postnatal massage",
        "Youth massage",
        "Scalp massage",
        "Heated silicone cupping",
        "Seasonal body-care treatments",
        "Client-led pressure",
      ],

      potentialAction:
        businessPotentialActions,

      ...(socialProfiles.length > 0
        ? {
            sameAs: socialProfiles,
          }
        : {}),
    },

    {
      "@type": "Person",
      "@id": practitionerId,

      name: siteConfig.legalName,

      worksFor: {
        "@id": businessId,
      },

      knowsAbout: [
        "Massage therapy",
        "Client-led treatment",
        "Pressure customization",
        "Prenatal and postnatal positioning",
        "Youth massage",
        "Cupping",
        "Calming sensory care",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang={locale}
      dir="ltr"
    >
      <head>
        {bookingOrigin ? (
          <>
            <link
              rel="dns-prefetch"
              href={bookingOrigin}
            />

            <link
              rel="preconnect"
              href={bookingOrigin}
            />
          </>
        ) : null}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              structuredData,
            ).replace(
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