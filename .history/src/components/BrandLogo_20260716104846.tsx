type BrandLogoProps = {
  href?: string;
  className?: string;
  showTagline?: boolean;
};

export function BrandLogo({
  href = "/#home",
  className = "",
  showTagline = true,
}: BrandLogoProps) {
  const content = (
    <span className={`brand-logo ${className}`.trim()}>
      <span className="brand-logo__text">
        <span className="brand-logo__eyebrow">Massage Therapy • Calgary / Okotoks</span>
        <span className="brand-logo__name">McKenzie House Massage</span>
        {showTagline ? (
          <span className="brand-logo__tagline">
            Calm, personalized care with clear communication and convenient online booking.
          </span>
        ) : null}
      </span>
    </span>
  );

  return (
    <a href={href} className="brand-logo-link" aria-label="Go to homepage">
      {content}
    </a>
  );
}