type BrandLogoProps = {
  href?: string;
  className?: string;
  variant?: "header" | "footer";
};

export function BrandLogo({
  href = "/#home",
  className = "",
  variant = "header",
}: BrandLogoProps) {
  return (
    <a
      href={href}
      className={`brand-logo-link brand-logo-link--${variant} ${className}`.trim()}
      aria-label="Go to homepage"
    >
      <img
        className="brand-logo-image"
        src="/brand/mckenzie-house-logo-wide.png"
        alt="McKenzie House Massage"
      />
    </a>
  );
}