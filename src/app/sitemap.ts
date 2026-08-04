import type { MetadataRoute } from "next";
import {
  clientReflections,
  services,
  siteConfig,
} from "@/lib/site";

const DEFAULT_SITE_ORIGIN =
  "https://www.mckenziehousemassage.ca";

/**
 * Optional production environment variable.
 *
 * Set this only when the site receives a meaningful content update:
 *
 * SITE_CONTENT_UPDATED_AT=2026-07-29T20:00:00.000Z
 *
 * When it is absent or invalid, lastModified is omitted rather than
 * publishing an inaccurate date.
 */
const siteContentUpdatedAt = parseDate(
  process.env.SITE_CONTENT_UPDATED_AT,
);

type SitemapEntry =
  MetadataRoute.Sitemap[number];

type SitemapRouteDefinition = {
  path: string;
  images?: readonly string[];
  lastModified?: Date;
};

function getSiteOrigin(value: string): string {
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

const siteOrigin = getSiteOrigin(
  siteConfig.domain,
);

function parseDate(
  value: string | undefined,
): Date | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return undefined;
  }

  return new Date(timestamp);
}

function readUpdatedAt(
  value: unknown,
): Date | undefined {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return undefined;
  }

  const record =
    value as Record<string, unknown>;

  const updatedAt = record.updatedAt;

  if (updatedAt instanceof Date) {
    return Number.isFinite(
      updatedAt.getTime(),
    )
      ? updatedAt
      : undefined;
  }

  if (typeof updatedAt === "string") {
    return parseDate(updatedAt);
  }

  return undefined;
}

function toAbsolutePageUrl(
  path: string,
): string {
  try {
    return new URL(
      path,
      `${siteOrigin}/`,
    ).toString();
  } catch {
    return `${siteOrigin}/`;
  }
}

function toAbsoluteAssetUrl(
  value: string,
): string | null {
  const candidate = value.trim();

  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(
      candidate,
      `${siteOrigin}/`,
    );

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function createImageList(
  values: readonly string[],
): string[] {
  const uniqueImages = new Set<string>();

  values.forEach((value) => {
    const absoluteUrl =
      toAbsoluteAssetUrl(value);

    if (absoluteUrl) {
      uniqueImages.add(absoluteUrl);
    }
  });

  return Array.from(uniqueImages);
}

function createSitemapEntry(
  route: SitemapRouteDefinition,
): SitemapEntry {
  const images = createImageList(
    route.images ?? [],
  );

  return {
    url: toAbsolutePageUrl(route.path),

    ...(route.lastModified
      ? {
          lastModified:
            route.lastModified,
        }
      : {}),

    ...(images.length > 0
      ? {
          images,
        }
      : {}),
  };
}

function isActiveService(
  service: (typeof services)[number],
): boolean {
  if (!("status" in service)) {
    return true;
  }

  return service.status === "active";
}

function isApprovedReflection(
  reflection:
    (typeof clientReflections)[number],
): boolean {
  return (
    "isApproved" in reflection &&
    reflection.isApproved === true
  );
}

function deduplicateEntries(
  entries: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  const entriesByUrl =
    new Map<string, SitemapEntry>();

  entries.forEach((entry) => {
    entriesByUrl.set(entry.url, entry);
  });

  return Array.from(
    entriesByUrl.values(),
  );
}

const hasApprovedReviews =
  clientReflections.some(
    isApprovedReflection,
  );

const staticRoutes:
  SitemapRouteDefinition[] = [
    {
      path: "/",

      images: [
        siteConfig.assets.heroImage,
        siteConfig.assets.detailImage,
        siteConfig.assets.openGraphImage,
      ],

      lastModified:
        siteContentUpdatedAt,
    },

    {
      path: "/contact",

      images: [
        siteConfig.assets.openGraphImage,
        siteConfig.assets.detailImage,
      ],

      lastModified:
        siteContentUpdatedAt,
    },

    /*
     * The Reviews page is intentionally excluded while it contains
     * only launch placeholders. It is added automatically once at
     * least one approved client reflection exists in site.ts.
     */
    ...(hasApprovedReviews
      ? [
          {
            path: "/reviews",

            images: [
              siteConfig.assets.openGraphImage,
            ],

            lastModified:
              siteContentUpdatedAt,
          },
        ]
      : []),
  ];

const serviceRoutes:
  SitemapRouteDefinition[] = services
    .filter(isActiveService)
    .map((service) => ({
      path: `/services/${service.slug}`,

      images: [
        service.image,
        siteConfig.assets.openGraphImage,
      ],

      lastModified:
        readUpdatedAt(service) ??
        siteContentUpdatedAt,
    }));

export default function sitemap():
  MetadataRoute.Sitemap {
  const entries = [
    ...staticRoutes,
    ...serviceRoutes,
  ].map(createSitemapEntry);

  return deduplicateEntries(entries);
}