import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";

type BrandLogoVariant = "header" | "footer";

type BrandLogoProps = {
  href?: string;
  className?: string;
  variant?: BrandLogoVariant;
  ariaLabel?: string;
};

type LogoConfiguration = {
  width: number;
  height: number;
  sizes: string;
  priority: boolean;
  quality: number;
};

const logoConfig: Record<
  BrandLogoVariant,
  LogoConfiguration
> = {
  header: {
    width: 520,
    height: 150,
    sizes:
      "(max-width: 560px) 220px, " +
      "(max-width: 980px) 320px, " +
      "400px",
    priority: true,
    quality: 92,
  },

  footer: {
    width: 720,
    height: 210,
    sizes:
      "(max-width: 560px) 340px, " +
      "(max-width: 980px) 420px, " +
      "520px",
    priority: false,
    quality: 88,
  },
};

function joinClassNames(
  ...classNames: Array<string | undefined | false>
): string {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" &&
        className.trim().length > 0,
    )
    .join(" ");
}

function isNativeProtocol(href: string): boolean {
  const normalizedHref = href.trim().toLowerCase();

  return (
    normalizedHref.startsWith("mailto:") ||
    normalizedHref.startsWith("tel:") ||
    normalizedHref.startsWith("sms:")
  );
}

function isSafeExternalUrl(href: string): boolean {
  try {
    const url = new URL(href);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function isInternalHref(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

function normalizeHref(href: string | undefined): string {
  const candidate = href?.trim() || "/";

  if (
    isInternalHref(candidate) ||
    isNativeProtocol(candidate) ||
    isSafeExternalUrl(candidate)
  ) {
    return candidate;
  }

  return "/";
}

export function BrandLogo({
  href = "/",
  className,
  variant = "header",
  ariaLabel,
}: BrandLogoProps) {
  const logo = logoConfig[variant];
  const normalizedHref = normalizeHref(href);

  const linkClassName = joinClassNames(
    "brand-logo-link",
    `brand-logo-link--${variant}`,
    className,
  );

  const accessibleLabel =
    ariaLabel ||
    `Go to the ${siteConfig.businessName} homepage`;

  const logoImage = (
    <Image
      className="brand-logo-image"
      src={siteConfig.assets.logo}
      /*
       * The link already has a descriptive accessible name. Leaving
       * the image alternative empty prevents screen readers from
       * announcing the business name twice.
       */
      alt=""
      width={logo.width}
      height={logo.height}
      sizes={logo.sizes}
      quality={logo.quality}
      priority={logo.priority}
      fetchPriority={
        logo.priority ? "high" : "auto"
      }
      decoding="async"
      draggable={false}
    />
  );

  if (isInternalHref(normalizedHref)) {
    return (
      <Link
        href={normalizedHref}
        className={linkClassName}
        aria-label={accessibleLabel}
        data-logo-variant={variant}
        prefetch
      >
        {logoImage}
      </Link>
    );
  }

  return (
    <a
      href={normalizedHref}
      className={linkClassName}
      aria-label={accessibleLabel}
      data-logo-variant={variant}
      {...(isSafeExternalUrl(normalizedHref)
        ? {
            rel: "noopener noreferrer",
            referrerPolicy:
              "strict-origin-when-cross-origin" as const,
          }
        : {})}
    >
      {logoImage}
    </a>
  );
}