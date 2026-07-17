import fs from "node:fs";
import path from "node:path";

function replaceExportedFunction(source, functionName, replacement) {
  const start = source.indexOf(`export function ${functionName}`);

  if (start === -1) {
    return `${source.trimEnd()}\n\n${replacement}\n`;
  }

  const openBrace = source.indexOf("{", start);

  if (openBrace === -1) {
    throw new Error(`Could not find opening brace for ${functionName}`);
  }

  let depth = 0;
  let end = -1;

  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }

  if (end === -1) {
    throw new Error(`Could not find closing brace for ${functionName}`);
  }

  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

const sitePath = path.join("src", "lib", "site.ts");
const servicePagePath = path.join("src", "app", "services", "[slug]", "page.tsx");

const cleanGetServiceBySlug = `export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}`;

let site = fs.readFileSync(sitePath, "utf8");
site = replaceExportedFunction(site, "getServiceBySlug", cleanGetServiceBySlug);
fs.writeFileSync(sitePath, site.trimEnd() + "\n", "utf8");

const servicePage = String.raw`
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { getServiceBySlug, services, siteConfig } from "@/lib/site";

type ServicePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  const title = service.name + " | " + siteConfig.businessName;
  const description = service.description;
  const url = siteConfig.domain + "/services/" + service.slug;
  const image = service.image || siteConfig.assets.openGraphImage;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: service.name + " at " + siteConfig.businessName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const relatedServices = services
    .filter((item) => item.slug !== service.slug)
    .slice(0, 3);

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "HealthAndBeautyBusiness",
      name: siteConfig.businessName,
      telephone: siteConfig.phone,
      email: siteConfig.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.primaryCity,
        addressRegion: siteConfig.region,
        addressCountry: siteConfig.country,
      },
    },
    areaServed: [
      siteConfig.primaryCity + ", " + siteConfig.region,
      siteConfig.secondaryCity + ", " + siteConfig.region,
    ],
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <JsonLd data={serviceStructuredData} />

      <MotionProvider />
      <Header />

      <main id="main-content" className="service-detail-page">
        <section
          className="service-detail-hero"
          aria-labelledby="service-heading"
        >
          <div className="service-detail-hero__inner">
            <div className="service-detail-hero__copy">
              <p className="eyebrow">McKenzie House Massage</p>

              <h1 id="service-heading">{service.name}</h1>

              <p className="service-detail-hero__lead">
                {service.longDescription}
              </p>

              <div className="service-detail-hero__meta">
                <div>
                  <span>Duration</span>
                  <strong>{service.duration}</strong>
                </div>

                <div>
                  <span>Pricing</span>
                  <strong>{service.price}</strong>
                </div>
              </div>

              <div className="hero-actions">
                <a className="button primary" href={siteConfig.bookingUrl}>
                  Book This Service
                </a>

                <a className="button secondary" href="/#services">
                  Back to Services
                </a>
              </div>
            </div>

            <div className="service-detail-hero__media">
              <Image
                src={service.image || siteConfig.assets.detailImage}
                alt={service.name + " at " + siteConfig.businessName}
                fill
                priority
                sizes="(max-width: 980px) 100vw, 44vw"
              />
            </div>
          </div>
        </section>

        <section
          className="section service-detail-overview scroll-reveal"
          aria-label={service.name + " overview"}
        >
          <article>
            <span>What it is</span>
            <h2>{service.what}</h2>
          </article>

          <article>
            <span>Who it is for</span>
            <h2>{service.who}</h2>
          </article>

          <article>
            <span>Pressure / Style</span>
            <h2>{service.style}</h2>
          </article>
        </section>

        <section
          className="section service-detail-breakdown scroll-reveal"
          aria-labelledby="service-includes-heading"
        >
          <div className="service-detail-panel">
            <p className="eyebrow">Treatment Details</p>
            <h2 id="service-includes-heading">
              What this service may include.
            </h2>

            <ul>
              {service.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <aside className="service-detail-aside">
            <p className="eyebrow">Good Fit For</p>

            <div className="chip-row">
              {service.bestFor.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="service-detail-quick-facts">
              <div>
                <span>Duration</span>
                <strong>{service.duration}</strong>
              </div>

              <div>
                <span>Price</span>
                <strong>{service.price}</strong>
              </div>

              <div>
                <span>Pressure</span>
                <strong>{service.pressure}</strong>
              </div>
            </div>
          </aside>
        </section>

        {service.notes.length > 0 ? (
          <section
            className="section service-detail-notes scroll-reveal"
            aria-labelledby="service-notes-heading"
          >
            <div className="section-heading centered">
              <p className="eyebrow">Before You Book</p>
              <h2 id="service-notes-heading">
                Helpful notes for this treatment.
              </h2>
            </div>

            <div className="service-detail-note-grid">
              {service.notes.map((item) => (
                <article key={item}>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section
          id="booking"
          className="section booking-section scroll-reveal"
          aria-labelledby="booking-heading"
        >
          <div className="booking-card">
            <p className="eyebrow">Online Booking</p>
            <h2 id="booking-heading">Book through ClinicSense.</h2>
            <p>
              Booking will connect through Heather’s ClinicSense system once the
              final booking link is added. For service fit, flexible
              availability, or questions before booking, clients can text
              Heather directly.
            </p>

            <a className="button primary" href={siteConfig.bookingUrl}>
              Open Booking
            </a>
          </div>
        </section>

        <section
          className="section related-services scroll-reveal"
          aria-labelledby="related-services-heading"
        >
          <div className="section-heading">
            <p className="eyebrow">More Services</p>
            <h2 id="related-services-heading">Explore other treatments.</h2>
          </div>

          <div className="service-grid">
            {relatedServices.map((item) => (
              <a
                className="service-card service-card-link"
                href={"/services/" + item.slug}
                key={item.slug}
              >
                <div className="service-image">
                  {item.image ? (
                    <Image
                      className="service-card-image"
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 980px) 100vw, 33vw"
                    />
                  ) : null}
                </div>

                <div className="service-content">
                  <p className="mini-eyebrow">View treatment</p>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="service-link-text">Explore service →</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      <a className="mobile-sticky-book" href={siteConfig.bookingUrl}>
        Book Now
      </a>

      <Footer />
    </>
  );
}
`;

fs.writeFileSync(servicePagePath, servicePage.trimStart(), "utf8");

console.log("Cleaned getServiceBySlug in src/lib/site.ts");
console.log("Rebuilt src/app/services/[slug]/page.tsx");
console.log("Done.");