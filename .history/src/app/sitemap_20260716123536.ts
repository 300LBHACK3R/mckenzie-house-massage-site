import type { MetadataRoute } from "next";
import { services, siteConfig } from "@/lib/site";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

type SitemapRoute = {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
};

const siteUrl = siteConfig.domain.replace(/\/$/, "");

const staticRoutes: SitemapRoute[] = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
  },
];

const serviceRoutes: SitemapRoute[] = services.map((service) => ({
  path: `/services/${service.slug}`,
  changeFrequency: "monthly",
  priority: 0.82,
}));

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [...staticRoutes, ...serviceRoutes].map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}