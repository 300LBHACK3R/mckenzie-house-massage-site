const DEFAULT_SITE_DOMAIN =
  "https://www.mckenziehousemassage.ca";

const CLINICSENSE_BOOKING_URL =
  "https://mckenziehousemassage.clinicsense.com/book/";

const PHONE_DISPLAY = "778-751-4455";
const PHONE_E164 = "+17787514455";

function normalizeSiteDomain(value: string | undefined): string {
  const candidate = value?.trim() || DEFAULT_SITE_DOMAIN;

  try {
    const parsedUrl = new URL(candidate);

    if (
      parsedUrl.protocol !== "https:" &&
      parsedUrl.protocol !== "http:"
    ) {
      return DEFAULT_SITE_DOMAIN;
    }

    return parsedUrl.origin;
  } catch {
    return DEFAULT_SITE_DOMAIN;
  }
}

const siteDomain = normalizeSiteDomain(
  process.env.NEXT_PUBLIC_SITE_URL,
);

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLinks = {
  facebook: string;
  instagram: string;
  google: string;
};

export type OpeningHoursEntry = {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  opens: string | null;
  closes: string | null;
  isByRequest: boolean;
};

export type SiteAssetConfig = {
  logo: string;
  logoMark: string;
  openGraphImage: string;
  openGraphImageAlt: string;
  heroImage: string;
  heroImageAlt: string;
  detailImage: string;
  detailImageAlt: string;
  heroVideo: string;
  heroVideoPoster: string;
};

export type DirectBillingConfig = {
  enabled: boolean;
  providerListStatus:
    | "pending-client-confirmation"
    | "confirmed";
  providers: string[];
  heading: string;
  summary: string;
  disclaimer: string;
  placeholder: string;
};

export type TippingPolicyConfig = {
  acceptsTips: boolean;
  heading: string;
  statement: string;
};

export type WaitlistConfig = {
  enabled: boolean;
  heading: string;
  description: string;
  buttonLabel: string;
  href: string;
  method: "text";
  requestPrompt: string;
};

export type SiteConfig = {
  businessName: string;
  legalName: string;
  currentName: string;
  description: string;
  locale: "en-CA";
  currency: "CAD";
  location: string;
  primaryCity: string;
  secondaryCity: string;
  region: string;
  country: string;
  countryCode: "CA";
  phone: string;
  phoneE164: string;
  email: string;
  bookingProvider: "ClinicSense";
  bookingUrl: string;
  domain: string;
  hours: string[];
  openingHours: OpeningHoursEntry[];
  addressNote: string;
  futureLocationNote: string;
  directBilling: DirectBillingConfig;
  tippingPolicy: TippingPolicyConfig;
  waitlist: WaitlistConfig;
  assets: SiteAssetConfig;
  social: SocialLinks;
};

export type ServiceStatus =
  | "active"
  | "planned"
  | "paused";

export type Service = {
  slug: string;
  name: string;
  status: ServiceStatus;
  featured: boolean;
  description: string;
  longDescription: string;
  image: string;
  imageAlt: string;
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

export type PricingItem = {
  duration: string;
  price: string;
};

export type PricingGroup = {
  name: string;
  serviceSlug?: string;
  note?: string;
  prices: PricingItem[];
};

export type SimpleContentItem = {
  title: string;
  text: string;
};

export type FaqCategory =
  | "location"
  | "booking"
  | "services"
  | "pricing"
  | "billing"
  | "policies"
  | "availability";

export type FaqItem = {
  question: string;
  answer: string;
  category?: FaqCategory;
};

export type TrustSignal = {
  label: string;
  title: string;
  text: string;
};

export type BookingSupportItem = {
  id:
    | "direct-billing"
    | "no-tipping"
    | "earlier-opening";
  eyebrow: string;
  title: string;
  text: string;
  buttonLabel?: string;
  href?: string;
};

export type PricingNotice = {
  id: string;
  title: string;
  text: string;
};

export type ClientReflection = {
  id: string;
  quote: string;
  label: string;
  source: "Google" | "Direct";
  sourceUrl?: string;
  isApproved: boolean;
  approvedAt?: string;
};

export type PricingReview = {
  status:
    | "not-required"
    | "pending-client-decision"
    | "approved";
  currentPricingSince: number;
  note: string;
};

export type AdditionalServicePlanning = {
  status:
    | "awaiting-client-details"
    | "ready-for-review"
    | "approved";
  requestedInformation: string[];
  note: string;
};

export const siteConfig: SiteConfig = {
  businessName: "McKenzie House Massage",
  legalName: "Heather Knorr",
  currentName: "McKenzie House Massage",

  description:
    "Personalized massage therapy in Prestwick, Calgary with client-led pressure, thoughtful intake, professional care, direct-billing support, and treatment options adapted to the person booking.",

  locale: "en-CA",
  currency: "CAD",

  location: "Prestwick, Calgary, Alberta",
  primaryCity: "Calgary",
  secondaryCity: "Okotoks",
  region: "Alberta",
  country: "Canada",
  countryCode: "CA",

  phone: PHONE_DISPLAY,
  phoneE164: PHONE_E164,
  email: "knorrheather@gmail.com",

  bookingProvider: "ClinicSense",
  bookingUrl: CLINICSENSE_BOOKING_URL,
  domain: siteDomain,

  hours: [
    "Tuesday 10:00 AM–4:30 PM",
    "Wednesday 10:00 AM–4:30 PM",
    "Thursday 10:00 AM–4:30 PM",
    "Friday 10:00 AM–4:30 PM",
    "Saturday, Sunday, and Monday may be available by request.",
  ],

  openingHours: [
    {
      day: "Monday",
      opens: null,
      closes: null,
      isByRequest: true,
    },
    {
      day: "Tuesday",
      opens: "10:00",
      closes: "16:30",
      isByRequest: false,
    },
    {
      day: "Wednesday",
      opens: "10:00",
      closes: "16:30",
      isByRequest: false,
    },
    {
      day: "Thursday",
      opens: "10:00",
      closes: "16:30",
      isByRequest: false,
    },
    {
      day: "Friday",
      opens: "10:00",
      closes: "16:30",
      isByRequest: false,
    },
    {
      day: "Saturday",
      opens: null,
      closes: null,
      isByRequest: true,
    },
    {
      day: "Sunday",
      opens: null,
      closes: null,
      isByRequest: true,
    },
  ],

  addressNote:
    "Located in Prestwick, close to Prestwick Pond. Exact appointment details are shared privately through the booking process.",

  futureLocationNote:
    "A potential Okotoks location may be added later. Website and Google information will be updated once Heather confirms the final plan.",

  directBilling: {
    enabled: true,
    providerListStatus: "pending-client-confirmation",
    providers: [],

    heading: "Direct Billing Available",

    summary:
      "Direct billing is available for many major insurance providers.",

    disclaimer:
      "Coverage, eligibility, approval, and reimbursement depend on each client’s individual insurance plan. Clients should confirm their benefits before their appointment.",

    placeholder:
      "The confirmed insurance-provider list will be added before launch once Heather supplies the final details.",
  },

  tippingPolicy: {
    acceptsTips: false,
    heading: "No Tipping Expected",

    statement:
      "No tipping is expected or accepted. The listed treatment price is the full price of your appointment.",
  },

  waitlist: {
    enabled: true,

    heading: "Can’t find a time that works?",

    description:
      "Request an earlier opening and Heather can contact you if a cancellation becomes available or additional appointment times are opened.",

    buttonLabel: "Request an Earlier Opening",

    /*
     * Texting is the confirmed working method until a dedicated
     * ClinicSense waitlist destination or website waitlist form is
     * fully tested.
     */
    href: `sms:${PHONE_E164}`,
    method: "text",

    requestPrompt:
      "Clients should include their preferred days, approximate times, appointment length, and best contact number.",
  },

  assets: {
    logo: "/brand/mckenzie-house-logo-wide.png",

    /*
     * Corrected to match the confirmed file currently available in
     * the project.
     */
    logoMark: "/brand/mckenzie-house-mark.png",

    /*
     * Temporary social-sharing image until the final 1200 × 630
     * Open Graph image is produced.
     */
    openGraphImage:
      "/brand/mckenzie-house-logo-wide.png",

    openGraphImageAlt:
      "McKenzie House Massage logo",

    /*
     * Uses a confirmed existing image as a safe fallback until final
     * content-session imagery is delivered.
     */
    heroImage: "/images/heather-detail-01.jpg",

    heroImageAlt:
      "Calm treatment detail at McKenzie House Massage",

    detailImage: "/images/heather-detail-01.jpg",

    detailImageAlt:
      "Heather preparing a professional massage treatment",

    heroVideo: "/videos/heather-hero.mp4",

    heroVideoPoster: "/images/heather-detail-01.jpg",
  },

  social: {
    facebook: "",
    instagram: "",

    /*
     * Temporary Google search destination until Heather provides
     * Business Profile manager access and the canonical profile URL
     * is confirmed.
     */
    google:
      "https://www.google.com/search?q=McKenzie+House+Massage",
  },
};

export const developerCredit = {
  label: "Designed, developed & maintained by",
  name: "L&L Tech Solutions",

  /*
   * Add the final public L&L Tech Solutions URL before launch.
   * Leaving this empty prevents an incorrect public link.
   */
  url: "",
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "Experience", href: "/#experience" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

/**
 * These are visible premium trust signals, not generic keyword tags.
 * They directly reflect Heather’s current client policies.
 */
export const serviceTags = [
  "Client-led pressure",
  "Direct billing available",
  "No tipping expected",
  "ClinicSense online booking",
];

export const services: Service[] = [
  {
    slug: "massage",
    name: "Massage",
    status: "active",
    featured: true,

    description:
      "A customized appointment that may include therapeutic, relaxation, prenatal, postnatal, child, youth, or general wellness-focused massage depending on the client.",

    longDescription:
      "Massage at McKenzie House Massage is booked by duration and then shaped around the person on the table. Heather uses the intake conversation to understand what the client needs, what they usually enjoy or dislike about massage, their pressure preferences, comfort needs, and what treatment approach makes sense that day.",

    image: "/services/therapeutic-massage.png",

    imageAlt:
      "Professional customized massage treatment at McKenzie House Massage",

    duration:
      "30, 45, 60, 75, 90, or 120 minutes",

    price: "$60–$205 + GST",

    bestFor: [
      "Customized massage",
      "Pregnancy-aware care",
      "Youth and family needs",
    ],

    pressure:
      "Customizable pressure. Heather’s natural style is firm, flowing, and thorough, but treatment can be adjusted for lighter, slower, or gentler touch when requested.",

    what:
      "A personalized massage appointment that may include therapeutic work, relaxation-focused care, prenatal or postnatal adaptations, child or youth appointments, sports-related tension, work-related strain, or general maintenance.",

    who:
      "Clients who want a massage therapist who listens first, adapts the appointment, and avoids forcing one treatment style onto every body.",

    style:
      "Firm, flowing, broad-handed, client-led, and customized. Pressure, pace, positioning, and focus areas are adjusted based on the client’s needs and communication.",

    includes: [
      "A clear intake conversation before hands-on treatment begins",
      "Customized pressure, pacing, and positioning",
      "Pregnancy and postpartum positioning when appropriate",
      "Youth appointments introduced gradually and respectfully",
      "Focused care for requested areas",
      "Optional lighter or calming touch when requested",
    ],

    notes: [
      "The booked treatment time begins when hands-on treatment starts.",
      "Clients are encouraged to communicate what they enjoy, dislike, need, or want adjusted.",
      "Child and youth bookings should be discussed with Heather before booking so consent, comfort, timing, and expectations are clear.",
      siteConfig.tippingPolicy.statement,
    ],
  },

  {
    slug: "seasonal-body-scrub-rinse-moisturizing",
    name: "Seasonal Body Scrub, Rinse & Moisturizing",
    status: "active",
    featured: true,

    description:
      "A full-body exfoliation service with scrub, dry brushing, a rinse, and a moisturizing finish for skin that feels refreshed and cared for.",

    longDescription:
      "This seasonal body-care treatment begins with a full-body sugar- or salt-style scrub, followed by dry brushing. The client then rinses before returning for a moisturizing finish using cocoa butter or another selected moisturizer.",

    image: "/services/relaxation-massage.jpg",

    imageAlt:
      "Seasonal body scrub and moisturizing treatment setup",

    duration: "75 minutes",
    price: "Introductory price $105 + GST",

    bestFor: [
      "Dry-feeling skin",
      "Seasonal body care",
      "Full-body exfoliation",
    ],

    pressure:
      "Moderate exfoliating pressure. The service may feel invigorating while remaining comfortable and professional.",

    what:
      "A seasonal body-care service combining exfoliating scrub, dry brushing, a rinse, and a full-body moisturizing finish.",

    who:
      "Clients who enjoy exfoliating body treatments or want a refreshing seasonal body-care experience.",

    style:
      "Rhythmic, exfoliating, refreshing, and spa-like without feeling overly complicated.",

    includes: [
      "Full-body sugar- or salt-style scrub",
      "Dry brushing",
      "Private time to rinse",
      "Full-body moisturizing finish",
      "Seasonal product selections that may change throughout the year",
    ],

    notes: [
      "This is a cosmetic body-care service and is not a replacement for medical skin care.",
      "Clients with sensitive skin, irritation, allergies, or skin concerns should discuss them before booking.",
      siteConfig.tippingPolicy.statement,
    ],
  },

  {
    slug: "hair-play-back-scratches",
    name: "Hair Play & Back Scratches",
    status: "active",
    featured: true,

    description:
      "A gentle, calming treatment focused on the back, neck, shoulders, scalp, hair, and arms for clients who want a softer sensory-focused appointment.",

    longDescription:
      "Hair Play & Back Scratches is designed for clients who want gentle, supportive care rather than a traditional deep massage. It may include light neck and shoulder massage, slow scalp work, gentle back scratches, hair brushing, and calming sensory tools in a professional treatment setting.",

    image: "/services/scalp-neck-shoulder-focus.jpg",

    imageAlt:
      "Professional scalp, neck, shoulder, and calming sensory treatment",

    duration: "45 or 60 minutes",
    price: "$80–$105 + GST",

    bestFor: [
      "A quiet reset",
      "Gentle sensory care",
      "Scalp and upper-body focus",
    ],

    pressure:
      "Light to gentle pressure. Slow, calm, symmetrical, professional, and client-led.",

    what:
      "A professional calming treatment that may include scalp massage, hair brushing, gentle back scratches, neck and shoulder care, and soothing upper-body touch.",

    who:
      "Clients who want a quiet, gentle appointment with less traditional massage pressure and more calming scalp, hair, back, neck, shoulder, or arm-focused care.",

    style:
      "Gentle, slow, supportive, quiet, and sensory-focused. Every element can be adjusted or omitted according to the client’s comfort.",

    includes: [
      "Gentle back, neck, and shoulder work",
      "Scalp massage",
      "Optional hair brushing or hair play",
      "Optional gentle back scratches",
      "Optional calming scalp or sensory tools",
      "Client-led customization throughout the appointment",
    ],

    notes: [
      "This is a professional wellness service with clear therapeutic boundaries.",
      "Clients can request more or less scalp work, brushing, scratches, or massage-style touch.",
      "The appointment can remain very quiet when that is what the client prefers.",
      siteConfig.tippingPolicy.statement,
    ],
  },

  {
    slug: "cup-and-buff",
    name: "Cup & Buff",
    status: "active",
    featured: true,

    description:
      "A more active treatment combining massage, heated silicone cupping, and broad vibration work for athletes, active bodies, tradespeople, and high-tension clients.",

    longDescription:
      "Cup & Buff is designed for clients who want a stronger, more active treatment experience. Heather combines massage, heated silicone cups, moving or temporarily parked cups when appropriate, and broad vibration work across larger muscle groups and selected areas of tension.",

    image: "/services/therapeutic-massage.png",

    imageAlt:
      "Heated silicone cupping and massage treatment for an active client",

    duration: "45, 60, 75, or 90 minutes",
    price: "$80–$155 + GST",

    bestFor: [
      "Athletes and active clients",
      "Gym clients",
      "Trades and physical work",
    ],

    pressure:
      "Moderate to vigorous. Intended for clients who enjoy stronger and more active treatment work.",

    what:
      "A targeted session blending massage, heated silicone cupping, moving cups, temporarily parked cups when appropriate, and broad vibration work.",

    who:
      "Active clients, gym-goers, athletes, labourers, tradespeople, and clients who prefer a stronger treatment experience.",

    style:
      "Active, strong, warm, rhythmic, and focused on creating a satisfying treatment experience for high-tension areas.",

    includes: [
      "Massage warm-up",
      "Heated silicone cupping",
      "Moving cup work",
      "Temporarily parked cups when appropriate",
      "Broad vibration work",
      "Focused treatment for selected areas",
    ],

    notes: [
      "Cupping may leave temporary marks.",
      "This service may not suit every client. Heather can recommend a gentler option when appropriate.",
      "Clients should communicate discomfort or request adjustments at any time.",
      siteConfig.tippingPolicy.statement,
    ],
  },
];

export const pricingGroups: PricingGroup[] = [
  {
    name: "Massage",
    serviceSlug: "massage",

    note:
      "Customized therapeutic, relaxation, prenatal, postnatal, child, youth, and general wellness-focused massage. No tipping is expected or accepted.",

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
    serviceSlug:
      "seasonal-body-scrub-rinse-moisturizing",

    note:
      "Introductory promotional pricing. No tipping is expected or accepted.",

    prices: [
      { duration: "75 min", price: "$105 + GST" },
    ],
  },

  {
    name: "Hair Play & Back Scratches",
    serviceSlug: "hair-play-back-scratches",

    note:
      "Gentle, professional, client-led sensory care. No tipping is expected or accepted.",

    prices: [
      { duration: "45 min", price: "$80 + GST" },
      { duration: "60 min", price: "$105 + GST" },
    ],
  },

  {
    name: "Cup & Buff",
    serviceSlug: "cup-and-buff",

    note:
      "Massage, heated silicone cupping, and broad vibration work. No tipping is expected or accepted.",

    prices: [
      { duration: "45 min", price: "$80 + GST" },
      { duration: "60 min", price: "$105 + GST" },
      { duration: "75 min", price: "$130 + GST" },
      { duration: "90 min", price: "$155 + GST" },
    ],
  },
];

export const pricingPreview = pricingGroups.map(
  (group) => ({
    duration: group.name,

    price: group.prices
      .map(
        (item) =>
          `${item.duration} ${item.price}`,
      )
      .join(" · "),
  }),
);

export const pricingNotices: PricingNotice[] = [
  {
    id: "no-tipping",
    title: siteConfig.tippingPolicy.heading,
    text: siteConfig.tippingPolicy.statement,
  },
  {
    id: "direct-billing",
    title: siteConfig.directBilling.heading,

    text:
      `${siteConfig.directBilling.summary} ` +
      siteConfig.directBilling.disclaimer,
  },
  {
    id: "gst",
    title: "GST",

    text:
      "All listed prices are shown before GST unless specifically stated otherwise.",
  },
];

export const trustSignals: TrustSignal[] = [
  {
    label: "Client-led",

    title:
      "Pressure, pace, positioning, and focus are adjusted.",

    text:
      "Heather listens first and adapts the appointment instead of applying the same routine to every client.",
  },
  {
    label: "Clear pricing",

    title:
      "The listed treatment price is the full service price.",

    text: siteConfig.tippingPolicy.statement,
  },
  {
    label: "Booking support",

    title:
      "Regular availability and earlier-opening requests are both supported.",

    text: siteConfig.waitlist.description,
  },
];

export const bookingSupportItems: BookingSupportItem[] = [
  {
    id: "direct-billing",
    eyebrow: "Insurance Support",
    title: siteConfig.directBilling.heading,

    text:
      siteConfig.directBilling.providers.length > 0
        ? `${siteConfig.directBilling.summary} ${siteConfig.directBilling.disclaimer}`
        : `${siteConfig.directBilling.summary} ${siteConfig.directBilling.placeholder} ${siteConfig.directBilling.disclaimer}`,
  },
  {
    id: "no-tipping",
    eyebrow: "Simple Pricing",
    title: siteConfig.tippingPolicy.heading,
    text: siteConfig.tippingPolicy.statement,
  },
  {
    id: "earlier-opening",
    eyebrow: "Flexible Availability",
    title: siteConfig.waitlist.heading,
    text: siteConfig.waitlist.description,
    buttonLabel: siteConfig.waitlist.buttonLabel,
    href: siteConfig.waitlist.href,
  },
];

export const whatToExpect: SimpleContentItem[] = [
  {
    title: "You are listened to first",

    text:
      "Heather listens before treatment so your comfort, pressure preferences, previous massage experiences, and goals are clear before hands-on care begins.",
  },
  {
    title: "Your hands-on time is protected",

    text:
      "The intake conversation guides the treatment, but the booked massage time begins when hands-on care starts.",
  },
  {
    title: "Pressure stays client-led",

    text:
      "Treatment can be firm, gentle, flowing, focused, or calming. Clients are encouraged to ask for adjustments at any point.",
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
      "Pressure, positioning, treatment goals, boundaries, and comfort are discussed so clients know they can speak up.",
  },
  {
    title: "Grounded treatment style",

    text:
      "The experience is professional, calm, thoughtful, and focused on what the client actually needs that day.",
  },
];

export const faqs: FaqItem[] = [
  {
    question:
      "Where is McKenzie House Massage located?",

    answer:
      "McKenzie House Massage is currently located in Prestwick, Calgary, close to Prestwick Pond. Exact appointment details are shared privately through the booking process. A potential Okotoks location may be added later once Heather confirms the final plan.",

    category: "location",
  },
  {
    question: "What are the current hours?",

    answer:
      "Regular hours are Tuesday to Friday from 10:00 AM to 4:30 PM. Saturday, Sunday, and Monday may occasionally be available by request, so clients may text Heather when they need a time outside the listed schedule.",

    category: "availability",
  },
  {
    question:
      "How do I book an appointment?",

    answer:
      "Online booking is available through Heather’s ClinicSense booking page. Clients can view current availability, select a service and duration, and complete their booking online.",

    category: "booking",
  },
  {
    question:
      "What if I cannot find a time that works?",

    answer:
      "Check the regular ClinicSense schedule first. If no available time works, text Heather and request an earlier opening. She may contact you if a cancellation becomes available or additional appointment times are opened.",

    category: "availability",
  },
  {
    question:
      "Do you offer direct billing?",

    answer:
      "Yes. Direct billing is available for many major insurance providers. The confirmed provider list will be published once finalized. Coverage, eligibility, approval, and reimbursement depend on each client’s individual plan, so clients should confirm their benefits before their appointment.",

    category: "billing",
  },
  {
    question:
      "Are tips expected or accepted?",

    answer: siteConfig.tippingPolicy.statement,
    category: "policies",
  },
  {
    question:
      "Do I book therapeutic, relaxation, prenatal, or another massage type separately?",

    answer:
      "No. Heather keeps massage under one simple umbrella. Clients choose the duration, and the treatment is customized based on intake, pressure preference, pregnancy or postpartum needs, youth needs, comfort, and treatment goals.",

    category: "booking",
  },
  {
    question: "Can I ask for very light pressure?",

    answer:
      "Yes. Heather’s natural treatment style is firm and flowing, but treatment can be adjusted for very light, slow, symmetrical, or calming touch when requested.",

    category: "services",
  },
  {
    question:
      "Can children or youth book massage?",

    answer:
      "Child and youth massage should be discussed with Heather before booking. Parent or guardian involvement and consent are required where appropriate. Shorter first appointments may be recommended so younger clients can become comfortable with the space, expectations, boundaries, and treatment style.",

    category: "services",
  },
  {
    question:
      "What is Hair Play & Back Scratches?",

    answer:
      "It is a professional, gentle, client-led treatment focused on calming care through the back, neck, shoulders, scalp, hair, and arms. It may include scalp massage, hair brushing, gentle back scratches, and quiet upper-body care according to the client’s preferences.",

    category: "services",
  },
  {
    question: "What is Cup & Buff?",

    answer:
      "Cup & Buff combines massage, heated silicone cupping, moving or temporarily parked cups when appropriate, and broad vibration work. It is designed for clients who prefer a more active and vigorous treatment style.",

    category: "services",
  },
];

/**
 * Keep this empty until Heather approves exact review excerpts for
 * public website use. The Reviews page should display polished
 * placeholders while this array is empty.
 */
export const clientReflections: ClientReflection[] = [];

export const pricingReview: PricingReview = {
  status: "pending-client-decision",
  currentPricingSince: 2022,

  note:
    "Heather is considering a modest price adjustment. Do not change public pricing until she approves the final amounts. Website and ClinicSense pricing must be updated together.",
};

/**
 * Heather mentioned possible additional services but has not supplied
 * enough information to publish them safely.
 */
export const additionalServicePlanning: AdditionalServicePlanning = {
  status: "awaiting-client-details",

  requestedInformation: [
    "Final service name",
    "What the service includes",
    "Who the service is intended for",
    "Available durations",
    "Final pricing",
    "Preparation instructions",
    "Important limitations or suitability notes",
  ],

  note:
    "Additional services should not be published until Heather confirms the complete details and final pricing.",
};

export const seoKeywords = [
  "McKenzie House Massage",
  "Prestwick massage",
  "massage near Prestwick Pond",
  "Calgary massage therapy",
  "customized massage Calgary",
  "therapeutic massage Calgary",
  "relaxation massage Calgary",
  "prenatal massage Calgary",
  "postnatal massage Calgary",
  "youth massage Calgary",
  "direct billing massage Calgary",
  "body scrub Calgary",
  "cupping massage Calgary",
  "scalp massage Calgary",
  "Hair Play and Back Scratches Calgary",
  "Cup and Buff Calgary",
  "Okotoks massage therapy",
];

export function getServiceBySlug(
  slug: string,
): Service | undefined {
  const normalizedSlug = slug.trim().toLowerCase();

  return services.find(
    (service) =>
      service.slug === normalizedSlug &&
      service.status === "active",
  );
}

export function getActiveServices(): Service[] {
  return services.filter(
    (service) => service.status === "active",
  );
}

export function getFeaturedServices(): Service[] {
  return services.filter(
    (service) =>
      service.status === "active" &&
      service.featured,
  );
}

export function getDirectBillingDisplayText(): string {
  const { providers, placeholder, summary, disclaimer } =
    siteConfig.directBilling;

  if (providers.length === 0) {
    return `${summary} ${placeholder} ${disclaimer}`;
  }

  return `${summary} Providers currently confirmed include ${providers.join(
    ", ",
  )}. ${disclaimer}`;
}