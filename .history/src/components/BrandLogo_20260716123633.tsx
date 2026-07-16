import Image from "next/image";

type BrandLogoVariant = "header" | "footer";

type BrandLogoProps = {
  href?: string;
  className?: string;
  variant?: BrandLogoVariant;
};

const logoConfig: Record<
  BrandLogoVariant,
  {
    width: number;
    height: number;
    sizes: string;
    priority: boolean;
  }
> = {
  header: {
    width: 520,
    height: 150,
    sizes: "(max-width: 560px) 220px, (max-width: 980px) 320px, 400px",
    priority: true,
  },
  footer: {
    width: 720,
    height: 210,
    sizes: "(max-width: 560px) 340px, (max-width: 980px) 420px, 520px",
    priority: false,
  },
};

export function BrandLogo({
  href = "/",
  className = "",
  variant = "header",
}: BrandLogoProps) {
  const logo = logoConfig[variant];

  return (
    <a
      href={href}
      className={[
        "brand-logo-link",
        `brand-logo-link--${variant}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Go to McKenzie House Massage homepage"
    >
      <Image
        className="brand-logo-image"
        src="/brand/mckenzie-house-logo-wide.png"
        alt="McKenzie House Massage"
        width={logo.width}
        height={logo.height}
        sizes={logo.sizes}
        priority={logo.priority}
      />
    </a>
  );
}