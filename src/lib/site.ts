const siteDomain =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://example.com";

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
  assets: SiteAssetConfig;
  social: SocialLinks;
};

export type DeveloperCredit = {
  name: string;
  label: string;
  url: string;
};

export type Service = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  bestFor: string[];
  pressure: string;
  mediaLabel: string;
  image: string;
  video: string;
  longDescription: string;
  originStory: string;
  heatherApproach: string;
  sessionFlow: string[];
  clientFit: string;
};

export type SimpleContentItem = {
  title: string;
  text: string;
};

export type PricingPreviewItem = {
  duration: string;
  price: string;
};

export type ClientReflection = {
  quote: string;
  label: string;
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
    "Personalized massage therapy in Okotoks and Calgary with calm, professional care, clear communication, and convenient online booking.",
  location: "Calgary / Okotoks, Alberta",
  primaryCity: "Okotoks",
  secondaryCity: "Calgary",
  region: "Alberta",
  country: "Canada",
  phone: "",
  email: "",
  bookingUrl: "#booking",
  domain: siteDomain,
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

export const developerCredit: DeveloperCredit = {
  name: "L&L Tech Solutions",
  label: "Designed, developed & maintained by",
  url: "",
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Experience", href: "/#experience" },
  { label: "Reviews", href: "/reviews" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export const serviceTags = [
  "Therapeutic massage",
  "Relaxation massage",
  "Scalp, neck & shoulder focus",
  "Deep pressure options",
  "Clear communication",
  "Online booking",
];

export const services: Service[] = [
  {
    slug: "therapeutic-massage",
    name: "Therapeutic Massage",
    eyebrow: "Focused care for tension, stiffness, and deeper treatment goals",
    description:
      "Focused massage care for clients who want to address tension, stiffness, and areas that need deeper attention.",
    bestFor: ["Tension", "Stiffness", "Deep pressure", "Focused treatment"],
    pressure: "Medium to firm, adjusted to comfort",
    mediaLabel: "Therapeutic massage media",
    image: "",
    video: "",
    longDescription:
      "Therapeutic massage is designed for clients who want a more focused session. The treatment can be shaped around areas that feel tight, restricted, overworked, or in need of deeper attention.",
    originStory:
      "The final wording here should come from Heather. This section can explain how her therapeutic style has developed through experience, client communication, and hands-on work with different treatment goals.",
    heatherApproach:
      "Heather’s approach can be written around clear communication, pressure control, body awareness, and adapting the session to what the client needs that day.",
    sessionFlow: [
      "Brief check-in about pressure, focus areas, and comfort.",
      "Focused work through areas of tension while keeping the session calm and professional.",
      "Pressure is adjusted throughout the treatment based on client feedback.",
      "Helpful aftercare guidance can be added once Heather confirms her preferred recommendations.",
    ],
    clientFit:
      "A strong option for clients who want deeper work, focused attention, or a session shaped around specific tension patterns.",
  },
  {
    slug: "relaxation-massage",
    name: "Relaxation Massage",
    eyebrow: "A calming full-body reset for rest, stress relief, and ease",
    description:
      "A calming full-body treatment designed to help the nervous system settle while supporting rest and restoration.",
    bestFor: ["Stress", "Relaxation", "Gentle pressure", "Full-body reset"],
    pressure: "Light to medium, slow and calming",
    mediaLabel: "Relaxation massage media",
    image: "",
    video: "",
    longDescription:
      "Relaxation massage is built around slowing down, softening tension, and creating a calm treatment experience. It can support clients who want a gentler session without needing deep or intense pressure.",
    originStory:
      "The final wording here should come from Heather. This section can describe how she creates a relaxing treatment rhythm, how she adjusts the session, and what she wants clients to feel during and after care.",
    heatherApproach:
      "Heather’s relaxation style can be positioned around warmth, flow, steady pressure, respectful communication, and creating a treatment that feels restorative instead of rushed.",
    sessionFlow: [
      "Calm intake and pressure check before the session begins.",
      "Slow, steady massage flow designed to help the body settle.",
      "Pressure remains comfortable and can be adjusted at any time.",
      "Clients can stay quiet, talk, or simply relax depending on what feels best.",
    ],
    clientFit:
      "A good fit for clients looking for stress relief, lighter pressure, nervous-system calm, or a full-body reset.",
  },
  {
    slug: "scalp-neck-shoulder-focus",
    name: "Scalp, Neck & Shoulder Focus",
    eyebrow: "Focused upper-body care for clients who carry tension high",
    description:
      "A focused treatment option for clients who carry tension through the upper body, jaw, neck, and shoulders.",
    bestFor: ["Neck tension", "Headaches", "Shoulder tightness", "Stress"],
    pressure: "Customized pressure with focused upper-body care",
    mediaLabel: "Scalp, neck, and shoulder media",
    image: "",
    video: "",
    longDescription:
      "This focused session is designed for clients who feel tension through the scalp, jaw, neck, shoulders, and upper back. It gives extra attention to areas that often hold stress and daily strain.",
    originStory:
      "The final wording here should come from Heather. This section can explain why she offers focused upper-body work, what clients tend to ask for, and how the treatment is shaped around comfort.",
    heatherApproach:
      "Heather’s approach can highlight slow, careful focus through the upper body, communication around sensitivity, and adapting pressure in areas that can feel tender or overworked.",
    sessionFlow: [
      "Check-in about upper-body tension, pressure comfort, and sensitive areas.",
      "Focused work through the scalp, neck, shoulders, jaw area, and upper back as appropriate.",
      "Pressure is customized because these areas can be sensitive.",
      "The session can be paired with relaxation or therapeutic work depending on Heather’s final service menu.",
    ],
    clientFit:
      "A strong option for clients who carry stress in the neck and shoulders, experience upper-body tightness, or want a more focused appointment.",
  },
];

export const whatToExpect: SimpleContentItem[] = [
  {
    title: "Before your appointment",
    text: "Clients can review services, pricing, location details, and booking information clearly before choosing a treatment.",
  },
  {
    title: "During the treatment",
    text: "Sessions are shaped around comfort, communication, pressure preference, and the client’s treatment goals.",
  },
  {
    title: "Pressure and communication",
    text: "Pressure can be adjusted throughout the session so the treatment feels effective without feeling overwhelming.",
  },
  {
    title: "Comfort, draping, and privacy",
    text: "The treatment experience should feel professional, respectful, and comfortable from start to finish.",
  },
  {
    title: "Aftercare",
    text: "Helpful aftercare notes and service guidance can be included so clients know what to expect after their session.",
  },
];

export const experiencePillars: SimpleContentItem[] = [
  {
    title: "Personalized pressure",
    text: "Each session is adjusted to the client’s comfort level, treatment goals, and preferred pressure.",
  },
  {
    title: "Clear service guidance",
    text: "Each treatment is explained in plain language so clients know what to book and what to expect.",
  },
  {
    title: "Professional presentation",
    text: "Photography and video will show the treatment experience, the space, and Heather’s approach clearly.",
  },
];

export const pricingPreview: PricingPreviewItem[] = [
  { duration: "60 minutes", price: "Price to confirm" },
  { duration: "90 minutes", price: "Price to confirm" },
  { duration: "120 minutes", price: "Price to confirm" },
];

export const clientReflections: ClientReflection[] = [
  {
    quote:
      "Real client feedback can be highlighted here once Heather approves which reviews should be featured.",
    label: "Review highlight",
  },
  {
    quote:
      "This section will help carry over the strength of word-of-mouth referrals into the website experience.",
    label: "Client trust",
  },
  {
    quote:
      "Approved Google review excerpts can be added here later without fabricating or over-polishing the client voice.",
    label: "Google reviews",
  },
];

export const faqs: FaqItem[] = [
  {
    question: "What if I am not sure which treatment to book?",
    answer:
      "The website explains each service clearly. Heather can also guide clients toward the treatment that best fits their comfort level and goals.",
  },
  {
    question: "Can pressure be adjusted during the session?",
    answer:
      "Yes. The treatment can be adjusted to the client’s comfort, preference, and goals throughout the appointment.",
  },
  {
    question: "Do I need to talk during the treatment?",
    answer:
      "Clients can communicate as much or as little as they prefer. The goal is to create a comfortable, calm, and respectful experience.",
  },
  {
    question: "How do I book?",
    answer:
      "Online booking connects through Heather’s ClinicSense booking system once the final booking link is added.",
  },
  {
    question: "Where is the practice located?",
    answer:
      "Current and future location wording will be finalized with Heather. The website will be updated as the Okotoks move comes together.",
  },
];

export const seoKeywords = [
  "McKenzie House Massage",
  "Heather Knorr massage",
  "Okotoks massage",
  "Okotoks massage therapy",
  "massage therapy Okotoks",
  "therapeutic massage Okotoks",
  "relaxation massage Okotoks",
  "deep tissue massage Okotoks",
  "neck and shoulder massage Okotoks",
  "scalp massage Okotoks",
  "Calgary massage therapy",
  "ClinicSense massage booking",
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

