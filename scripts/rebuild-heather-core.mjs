import fs from "node:fs";
import path from "node:path";

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trimStart(), "utf8");
  console.log("Wrote " + filePath);
}

writeFile(
  "src/lib/site.ts",
  String.raw`
const siteDomain =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.mckenziehousemassage.ca";

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLinks = {
  facebook: string;
  instagram: string;
};

export type SiteAssetConfig = {
  logo: string;
  logoMark: string;
  openGraphImage: string;
  heroImage: string;
  detailImage: string;
  heroVideo: string;
};

export type SiteConfig = {
  businessName: string;
  legalName: string;
  currentName: string;
  description: string;
  location: string;
  primaryCity: string;
  secondaryCity: string;
  region: string;
  country: string;
  phone: string;
  email: string;
  bookingUrl: string;
  domain: string;
  hours: string[];
  addressNote: string;
  futureLocationNote: string;
  assets: SiteAssetConfig;
  social: SocialLinks;
};

export type Service = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  duration: string;
  price: string;
  bestFor: string[];
  pressure: string;
  what: string;
  who: string;
  style: string;
  includes: string[];
  notes: string[];
};

export type PricingGroup = {
  name: string;
  note?: string;
  prices: {
    duration: string;
    price: string;
  }[];
};

export type SimpleContentItem = {
  title: string;
  text: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const siteConfig: SiteConfig = {
  businessName: "McKenzie House Massage",
  legalName: "Heather Knorr",
  currentName: "McKenzie House Massage",
  description:
    "Personalized massage therapy in Calgary with client-led pressure, thoughtful intake, professional care, and treatment options that adapt to the person booking.",
  location: "Prestwick, Calgary, Alberta",
  primaryCity: "Calgary",
  secondaryCity: "Okotoks",
  region: "Alberta",
  country: "Canada",
  phone: "778-751-4455",
  email: "knorrheather@gmail.com",
  bookingUrl: "#booking",
  domain: siteDomain,
  hours: [
    "Tuesday 10:00 AM – 4:30 PM",
    "Wednesday 10:00 AM – 4:30 PM",
    "Thursday 10:00 AM – 4:30 PM",
    "Friday 10:00 AM – 4:30 PM",
    "Saturday, Sunday, and Monday may be available by request.",
  ],
  addressNote: "Located in Prestwick, close to Prestwick Pond.",
  futureLocationNote:
    "A potential Okotoks location may be added later. Details will be updated once Heather confirms the final plan.",
  assets: {
    logo: "/brand/mckenzie-house-logo-wide.png",
    logoMark: "/brand/mckenzie-house-logo-mark.png",
    openGraphImage: "/og/mckenzie-house-og.jpg",
    heroImage: "/images/heather-room-01.jpg",
    detailImage: "/images/heather-detail-01.jpg",
    heroVideo: "/videos/heather-hero.mp4",
  },
  social: {
    facebook: "",
    instagram: "",
  },
};

export const developerCredit = {
  label: "Designed, developed & maintained by",
  name: "L&L Tech Solutions",
  url: "",
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Reviews", href: "/reviews" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export const serviceTags = [
  "Client-led pressure",
  "Customized massage",
  "Calgary massage therapy",
  "Nervous-system focused care",
];

export const services: Service[] = [
  {
    slug: "massage",
    name: "Massage",
    description:
      "A customized massage appointment that can include therapeutic, relaxation, prenatal, postnatal, child, youth, or general wellness-focused care depending on the client.",
    longDescription:
      "Massage at McKenzie House Massage is booked by duration, then shaped around the person on the table. Heather uses the intake conversation to understand what the client needs, what they usually love or dislike about massage, their pressure preference, comfort needs, and the kind of treatment that makes sense for their body that day.",
    image: "/services/therapeutic-massage.jpg",
    duration: "30, 45, 60, 75, 90, or 120 minutes",
    price: "$60 – $205 + GST",
    bestFor: ["General massage", "Pregnancy-aware care", "Youth and family needs"],
    pressure:
      "Customizable pressure. Heather’s natural style is firm, flowing, and thorough, but the treatment can be adapted for lighter touch when requested.",
    what:
      "A personalized massage treatment that can include therapeutic work, relaxation-focused care, prenatal or postnatal adaptations, child and youth appointments, sports-related tension, work-related strain, or general maintenance.",
    who:
      "Clients who want a massage therapist who listens first, adapts the appointment, and avoids forcing one treatment style onto every body.",
    style:
      "Firm, flowing, broad-handed, client-led, and customized. Pressure, pace, positioning, and focus areas are adjusted based on the client.",
    includes: [
      "A clear intake conversation before hands-on time begins",
      "Customized pressure and pacing",
      "Pregnancy and postpartum positioning when needed",
      "Youth appointments introduced gradually and respectfully",
      "Focused work for areas like glutes, shoulders, forearms, back, neck, hands, and hips",
      "Optional lighter touch when that is what the client needs",
    ],
    notes: [
      "The booked treatment time begins when hands-on treatment starts.",
      "Clients are encouraged to communicate what they like, dislike, need, or want adjusted.",
      "Child and youth bookings should be discussed with Heather before booking so comfort, timing, and expectations are clear.",
    ],
  },
  {
    slug: "seasonal-body-scrub-rinse-moisturizing",
    name: "Seasonal Body Scrub, Rinse & Moisturizing",
    description:
      "A full-body exfoliation treatment with scrub, dry brushing, a rinse, and a moisturizing finish for skin that feels refreshed and cared for.",
    longDescription:
      "This seasonal body treatment begins with a full-body sugar or salt-style scrub followed by dry brushing to support exfoliation and leave the skin feeling fresh. The client then rinses off before returning for a full-body moisturizing finish with cocoa butter or another rich moisturizer.",
    image: "/services/relaxation-massage.jpg",
    duration: "75 minutes",
    price: "Promo price $105 + GST",
    bestFor: ["Dry skin", "Seasonal reset", "Full-body exfoliation"],
    pressure:
      "Moderate exfoliating pressure. The treatment can feel invigorating while still staying comfortable and professional.",
    what:
      "A seasonal exfoliation and moisturizing treatment that combines scrub, dry brushing, rinse, and full-body moisturizing.",
    who:
      "Clients with dry skin, people who enjoy exfoliating body treatments, or anyone wanting a refreshing seasonal reset.",
    style:
      "Rhythmic, exfoliating, refreshing, and spa-like without feeling overly complicated.",
    includes: [
      "Full-body sugar or salt-style scrub",
      "Dry brushing with upward limb strokes and broad back work",
      "Time to rinse off",
      "Full-body moisturizing finish",
      "Seasonal product direction that can change throughout the year",
    ],
    notes: [
      "This is a body-care treatment, not a replacement for medical skin care.",
      "Clients with sensitive skin, open irritation, or skin concerns should mention that before booking.",
    ],
  },
  {
    slug: "hair-play-back-scratches",
    name: "Hair Play & Back Scratches",
    description:
      "A gentle, calming treatment focused on the back, neck, shoulders, scalp, hair, and arms for clients who want a softer nervous-system focused appointment.",
    longDescription:
      "Hair Play & Back Scratches is designed for clients who want gentle, supportive care rather than a traditional deep massage. The treatment may include light massage through the neck and shoulders, slow scalp work, gentle back scratches, hair brushing, and calming sensory tools used in a professional treatment setting.",
    image: "/services/scalp-neck-shoulder-focus.jpg",
    duration: "45 or 60 minutes",
    price: "$80 – $105 + GST",
    bestFor: ["Stress reset", "Gentle care", "Scalp and upper body focus"],
    pressure: "Light to gentle pressure. Slow, calm, symmetrical, and client-led.",
    what:
      "A professional calming treatment that can include scalp massage, hair brushing, gentle back scratches, neck and shoulder work, and soothing upper-body care.",
    who:
      "Clients who feel overstimulated, emotionally heavy, burned out, touched-out, or simply in need of a quiet appointment where the goal is to feel regulated and cared for.",
    style:
      "Gentle, slow, supportive, quiet, and nervous-system focused. This service is fully professional and customized based on what the client is comfortable receiving.",
    includes: [
      "Gentle back, neck, and shoulder work",
      "Scalp massage",
      "Hair brushing or hair play",
      "Gentle back scratches when requested",
      "Slow sensory tools or scalp tools when appropriate",
      "Client-led customization throughout the appointment",
    ],
    notes: [
      "This is a professional massage/wellness service with clear boundaries.",
      "Clients can request more or less hair play, scalp work, scratches, or massage-style touch.",
      "The appointment can be kept very quiet and calming when that is what the client needs.",
    ],
  },
  {
    slug: "cup-and-buff",
    name: "Cup & Buff",
    description:
      "A vigorous treatment using massage, heated silicone cupping, and broad vibration work for active bodies, athletes, and high-tension clients.",
    longDescription:
      "Cup & Buff is designed for people who want a more active, muscular treatment experience. Heather combines massage, heated silicone cups, moving cup work, parked cups when appropriate, and a broad vibration buffer to work through larger muscle groups and areas of tension.",
    image: "/services/therapeutic-massage.jpg",
    duration: "45, 60, 75, or 90 minutes",
    price: "$80 – $155 + GST",
    bestFor: ["Athletes", "Gym clients", "Blue-collar tension"],
    pressure:
      "Moderate to vigorous. Designed for clients who enjoy stronger, more active treatment work.",
    what:
      "A targeted massage session that blends hands-on work, heated silicone cupping, moving cups, parked cups, and broad vibration work.",
    who:
      "Active clients, gym-goers, athletes, labourers, people with dense muscle tension, and clients who dislike leaving a massage feeling like nothing therapeutic happened.",
    style:
      "Active, strong, warm, rhythmic, and focused on creating a satisfying treatment experience for high-tension areas.",
    includes: [
      "Massage warm-up",
      "Heated silicone cupping",
      "Moving cup work",
      "Parked cups when appropriate",
      "Broad vibration buffer work",
      "Focused work for areas like traps, back, hips, glutes, hamstrings, IT band, forearms, and shoulders",
    ],
    notes: [
      "Cupping may leave temporary marks.",
      "This service is not ideal for every client. Heather can recommend a different treatment if a gentler appointment makes more sense.",
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export const pricingGroups: PricingGroup[] = [
  {
    name: "Massage",
    note:
      "General umbrella massage including therapeutic, relaxation, prenatal, postnatal, child, and youth appointments.",
    prices: [
      { duration: "30 min", price: "$60 + GST" },
      { duration: "45 min", price: "$80 + GST" },
      { duration: "60 min", price: "$105 + GST" },
      { duration: "75 min", price: "$130 + GST" },
      { duration: "90 min", price: "$155 + GST" },
      { duration: "120 min", price: "$205 + GST" },
    ],
  },
  {
    name: "Seasonal Body Scrub, Rinse & Moisturizing",
    note: "Introductory promo pricing.",
    prices: [{ duration: "75 min", price: "$105 + GST" }],
  },
  {
    name: "Hair Play & Back Scratches",
    note: "Gentle, client-led nervous-system focused care.",
    prices: [
      { duration: "45 min", price: "$80 + GST" },
      { duration: "60 min", price: "$105 + GST" },
    ],
  },
  {
    name: "Cup & Buff",
    note: "Massage, heated silicone cupping, and broad vibration work.",
    prices: [
      { duration: "45 min", price: "$80 + GST" },
      { duration: "60 min", price: "$105 + GST" },
      { duration: "75 min", price: "$130 + GST" },
      { duration: "90 min", price: "$155 + GST" },
    ],
  },
];

export const pricingPreview = pricingGroups.map((group) => ({
  duration: group.name,
  price: group.prices.map((item) => item.duration + " " + item.price).join(" · "),
}));

export const whatToExpect: SimpleContentItem[] = [
  {
    title: "You are listened to first",
    text:
      "Heather uses the conversation before treatment to understand your body, comfort level, pressure preference, previous massage experiences, and what you are hoping to feel by the end of the appointment.",
  },
  {
    title: "Your hands-on time is protected",
    text:
      "The intake conversation helps guide the treatment, but the booked massage time begins when hands-on care begins.",
  },
  {
    title: "Pressure stays client-led",
    text:
      "The treatment can be firm, gentle, flowing, focused, or calming. Clients are encouraged to ask for changes at any point.",
  },
  {
    title: "The session adapts to your life",
    text:
      "Pregnancy, postpartum changes, sports, work strain, stress, youth appointments, and comfort needs can all shape how the appointment is approached.",
  },
];

export const experiencePillars: SimpleContentItem[] = [
  {
    title: "Customized care",
    text:
      "Treatments are adjusted instead of forcing every client into the same massage style.",
  },
  {
    title: "Clear communication",
    text:
      "Pressure, positioning, treatment goals, and comfort are discussed so clients know they can speak up.",
  },
  {
    title: "Grounded treatment style",
    text:
      "The experience is professional, calm, thoughtful, and focused on what the client actually needs that day.",
  },
];

export const faqs: FaqItem[] = [
  {
    question: "Where is McKenzie House Massage located?",
    answer:
      "McKenzie House Massage is currently located in Prestwick, Calgary, close to Prestwick Pond. A potential Okotoks location may be added later once Heather confirms the final plan.",
  },
  {
    question: "What are the current hours?",
    answer:
      "Listed hours are Tuesday to Friday from 10:00 AM to 4:30 PM. Saturday, Sunday, and Monday may be available by request, so clients are encouraged to text Heather if they need a time outside the listed hours.",
  },
  {
    question: "Do I book therapeutic, relaxation, prenatal, or another massage type separately?",
    answer:
      "No. Heather keeps massage under one simple umbrella. Clients choose the duration, then the treatment is customized based on intake, pressure preference, pregnancy or postpartum needs, youth needs, comfort, and treatment goals.",
  },
  {
    question: "Can I ask for very light pressure?",
    answer:
      "Yes. Heather’s natural treatment style is firm and flowing, but she can adjust for clients who need very light, slow, symmetrical, or calming touch.",
  },
  {
    question: "Can children or youth book massage?",
    answer:
      "Child and youth massage should be discussed with Heather before booking. Shorter first appointments may be recommended so younger clients can become comfortable with the space, expectations, and treatment style.",
  },
  {
    question: "What is Hair Play & Back Scratches?",
    answer:
      "It is a professional, gentle, client-led treatment focused on calming care through the back, neck, shoulders, scalp, hair, and arms. It can include scalp massage, hair brushing, gentle back scratches, and quiet upper-body care.",
  },
  {
    question: "What is Cup & Buff?",
    answer:
      "Cup & Buff combines massage, heated silicone cupping, moving or parked cups, and broad vibration work. It is designed for clients who like a more active, vigorous treatment style.",
  },
  {
    question: "How do I book?",
    answer:
      "Online booking will connect through Heather’s ClinicSense system once the final booking link is added. Clients can also text Heather directly if they have questions about timing, service fit, or flexible availability.",
  },
];

export const clientReflections = [
  {
    quote:
      "Placeholder review. Final approved client review excerpts can be added before launch.",
    label: "Client reflection",
  },
  {
    quote:
      "Placeholder review. Real testimonials should only be used once Heather approves the exact wording.",
    label: "Client reflection",
  },
  {
    quote:
      "Placeholder review. This section is ready for approved Google review highlights later.",
    label: "Client reflection",
  },
];

export const seoKeywords = [
  "McKenzie House Massage",
  "Calgary massage therapy",
  "Prestwick massage",
  "massage near Prestwick Pond",
  "Okotoks massage therapy",
  "custom massage Calgary",
  "prenatal massage Calgary",
  "postnatal massage Calgary",
  "youth massage Calgary",
  "body scrub Calgary",
  "cupping massage Calgary",
  "scalp massage Calgary",
];
`
);

writeFile(
  "src/app/services/[slug]/page.tsx",
  String.raw`
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
            <h2 id="service-includes-heading">What this service may include.</h2>

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
`
);

console.log("Heather core rebuild complete.");
`
);