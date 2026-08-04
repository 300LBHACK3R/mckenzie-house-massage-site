import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

const DEFAULT_SITE_ORIGIN =
  "https://www.mckenziehousemassage.ca";

const INDEXING_ENVIRONMENT_VARIABLE =
  "ALLOW_SEARCH_INDEXING";

type BooleanEnvironmentValue =
  | true
  | false
  | null;

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
): BooleanEnvironmentValue {
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
  /*
   * This server-only override takes priority.
   *
   * Set:
   *
   * ALLOW_SEARCH_INDEXING=true
   *
   * only on the final production deployment.
   *
   * Set:
   *
   * ALLOW_SEARCH_INDEXING=false
   *
   * on staging, demos, temporary deployments, or maintenance builds.
   */
  const explicitIndexingPreference =
    parseBooleanEnvironmentValue(
      process.env[
        INDEXING_ENVIRONMENT_VARIABLE
      ],
    );

  if (
    explicitIndexingPreference !== null
  ) {
    return explicitIndexingPreference;
  }

  /*
   * Vercel supplies VERCEL_ENV as:
   *
   * production
   * preview
   * development
   *
   * Preview and development deployments should not compete with the
   * final domain or expose unfinished content to search engines.
   */
  const vercelEnvironment =
    process.env.VERCEL_ENV
      ?.trim()
      .toLowerCase();

  if (vercelEnvironment) {
    return (
      vercelEnvironment === "production"
    );
  }

  /*
   * Fallback for a production deployment hosted somewhere other
   * than Vercel.
   */
  return (
    process.env.NODE_ENV === "production"
  );
}

function createProductionRobots(
  siteOrigin: string,
): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",

      /*
       * Public pages, service pages, images, JavaScript, CSS, and
       * other rendering resources remain crawlable.
       */
      allow: "/",

      /*
       * The contact API is a submission endpoint, not searchable
       * page content.
       */
      disallow: ["/api/"],
    },

    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}

function createNonProductionRobots():
  MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },

    /*
     * A preview deployment deliberately omits both sitemap and host
     * declarations so crawlers are not directed toward preview
     * content.
     */
  };
}

export default function robots():
  MetadataRoute.Robots {
  const siteOrigin =
    normalizeSiteOrigin(siteConfig.domain);

  if (!shouldAllowSearchIndexing()) {
    return createNonProductionRobots();
  }

  return createProductionRobots(
    siteOrigin,
  );
}