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
    | "partially-confirmed"
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

export type PaymentMethod = {
  name: "Debit" | "E-transfer" | "Credit card";
  preferred: boolean;
  note?: string;
};

export type PaymentConfig = {
  heading: string;
  summary: string;
  methods: PaymentMethod[];
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
  payment: PaymentConfig;
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
  displayOrder: number;
  isSignature: boolean;
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
  | "payments"
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
    | "payment-methods"
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
  attribution?: string;
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
    "Personalized massage therapy in Prestwick, Calgary with client-led pressure, thoughtful intake, direct-billing support, signature sensory care, and treatment options adapted to the person booking.",

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
    "Tuesday 10:00 AMâ€“4:30 PM",
    "Wednesday 10:00 AMâ€“4:30 PM",
    "Thursday 10:00 AMâ€“4:30 PM",
    "Friday 10:00 AMâ€“4:30 PM",
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
    providerListStatus: "partially-confirmed",

    providers: [
      "Alberta Blue Cross",
      "Canadian Armed Forces (CAF)",
      "Medavie Blue Cross",
      "Royal Canadian Mounted Police (RCMP)",
      "Sun Life",
      "Veterans Affairs Canada",
    ],

    heading: "Direct Billing Available",

    summary:
      "Direct billing is available for several major insurers and federal programs.",

    disclaimer:
      "Coverage, eligibility, approval, and reimbursement depend on each clientâ€™s individual plan. Clients should confirm their benefits before their appointment.",

    placeholder:
      "Additional providers may also be supported. Contact Heather before booking if your provider is not listed.",
  },

  payment: {
    heading: "Payment Options",

    summary:
      "Debit and e-transfer are preferred. Credit-card payment can also be accepted when needed.",

    methods: [
      {
        name: "Debit",
        preferred: true,
      },
      {
        name: "E-transfer",
        preferred: true,
      },
      {
        name: "Credit card",
        preferred: false,
        note:
          "Available when needed. Contact Heather before your appointment if credit card is your preferred payment method.",
      },
    ],
  },

  tippingPolicy: {
    acceptsTips: false,
    heading: "No Tipping Expected",

    statement:
      "No tipping is expected or accepted. The listed treatment price is the full price of your appointment.",
  },

  waitlist: {
    enabled: true,

    heading: "Canâ€™t find a time that works?",

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
     * Temporary social-sharing image until the final 1200 Ã— 630
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
    heroImage: "/images/heather-detail-01.png",

    heroImageAlt:
      "Calm treatment detail at McKenzie House Massage",

    detailImage: "/images/heather-detail-01.png",

    detailImageAlt:
      "Heather preparing a professional massage treatment",

    heroVideo: "/videos/heather-hero.mp4",

    heroVideoPoster: "/images/heather-detail-01.png",
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
 * They directly reflect Heatherâ€™s current client policies.
 */
export const serviceTags = [
  "Signature sensory massage",
  "Client-led care",
  "Direct billing available",
  "No tipping expected",
];

export const services: Service[] = [
  {
    slug: "massage",
    name: "Massage",
    status: "active",
    featured: true,
    displayOrder: 1,
    isSignature: false,

    description:
      "A customized, client-led massage for focused tension, general maintenance, prenatal or postnatal needs, youth appointments, and clients who prefer more targeted work.",

    longDescription:
      "Choose Massage when you want a treatment that can be shaped around specific areas, pressure preferences, work or activity-related tension, pregnancy or postpartum positioning, youth needs, or general body maintenance. Heather begins with a clear intake conversation, then adjusts pressure, pace, positioning, and focus throughout the appointment.",

    image: "/services/therapeutic-massage.png",

    imageAlt:
      "Heather providing a professional customized massage treatment at McKenzie House Massage",

    duration:
      "30, 45, 60, 75, 90, or 120 minutes",

    price: "$60â€“$205 + GST",

    bestFor: [
      "Focused tension",
      "Customized pressure",
      "Pregnancy-aware and family care",
    ],

    pressure:
      "Fully customizable. Heatherâ€™s natural style is firm, broad, flowing, and thorough, but pressure can be adjusted throughout the appointment.",

    what:
      "A personalized massage appointment for focused treatment, general maintenance, pregnancy or postpartum adaptations, youth appointments, sports or work-related tension, and changing day-to-day needs.",

    who:
      "Clients who want a massage therapist who listens first, adapts the treatment, and avoids applying the same routine to every body.",

    style:
      "Firm, flowing, broad-handed, client-led, and adaptable. Pressure, pace, positioning, and treatment focus are adjusted according to the clientâ€™s needs and feedback.",

    includes: [
      "A clear intake conversation before hands-on treatment begins",
      "Customized pressure, pacing, positioning, and focus areas",
      "Pregnancy and postpartum positioning when appropriate",
      "Youth appointments introduced gradually and respectfully",
      "Focused care for requested areas",
      "Ongoing client communication and adjustments",
    ],

    notes: [
      "The booked treatment time begins when hands-on treatment starts.",
      "Clients are encouraged to communicate what they enjoy, dislike, need, or want adjusted.",
      "Clients seeking a deliberately slower, lighter, full-body experience may prefer Relaxation Massage.",
      "Child and youth bookings should be discussed with Heather before booking so consent, comfort, timing, and expectations are clear.",
      siteConfig.tippingPolicy.statement,
    ],
  },

  {
    slug: "relaxation-massage",
    name: "Relaxation Massage",
    status: "active",
    featured: true,
    displayOrder: 3,
    isSignature: false,

    description:
      "A slower, flowing massage designed around rest, gentle-to-moderate pressure, and a calm full-body experience.",

    longDescription:
      "Relaxation Massage is for clients who want a quieter pace and less emphasis on intense or highly targeted work. Heather uses smooth, connected movements, client-selected pressure, comfortable positioning, and an unrushed treatment rhythm to create a grounded full-body experience.",

    image: "/services/relaxation-massage.png",

    imageAlt:
      "Heather providing a calm, flowing relaxation massage treatment",

    duration:
      "30, 45, 60, 75, 90, or 120 minutes",

    price: "$60â€“$205 + GST",

    bestFor: [
      "Rest and unwinding",
      "Gentle-to-moderate pressure",
      "A slower full-body experience",
    ],

    pressure:
      "Light to moderate pressure, adjusted to the client. The emphasis is on comfort, flow, rhythm, and relaxation rather than forceful targeted work.",

    what:
      "A dedicated relaxation-focused massage using slower pacing, flowing movements, comfortable positioning, and client-led pressure.",

    who:
      "Clients who want to slow down, settle into the treatment, and receive a calmer massage without making deeper or more vigorous work the priority.",

    style:
      "Slow, flowing, quiet, comfortable, and full-body focused. Conversation can remain minimal when the client prefers a peaceful appointment.",

    includes: [
      "A brief intake and pressure discussion",
      "Slow, connected massage movements",
      "Comfort-focused positioning and draping",
      "Gentle-to-moderate client-selected pressure",
      "Optional quiet treatment with minimal conversation",
      "A full-body or client-selected-area approach based on booked time",
    ],

    notes: [
      "Relaxation Massage uses the same duration-based pricing as Massage.",
      "Clients can ask for pressure, pace, positioning, or focus areas to be adjusted at any time.",
      "A shorter appointment may focus on selected areas rather than a complete full-body sequence.",
      siteConfig.tippingPolicy.statement,
    ],
  },

  {
    slug: "sensory-massage",
    name: "Sensory Massage",
    status: "active",
    featured: true,
    displayOrder: 2,
    isSignature: true,

    description:
      "Heatherâ€™s signature light-touch service: a quiet sensory massage that may include scalp work, hair play, gentle back scratches, symmetrical tracing, and calming upper-body techniques.",

    longDescription:
      "Sensory Massage is Heatherâ€™s signature gentle-care service for clients who want a peaceful, light-touch experience rather than traditional deeper pressure. The appointment can include slow scalp massage, hair brushing or hair play, gentle back scratches, symmetrical tracing, soft neck and shoulder work, arm care, and other client-selected sensory techniques within a professional treatment setting.",

    image: "/services/scalp-neck-shoulder-focus.png",

    imageAlt:
      "Professional sensory massage with gentle scalp, hair, neck, shoulder, and light-touch care",

    duration: "45 or 60 minutes",
    price: "$80â€“$105 + GST",

    bestFor: [
      "A quiet sensory reset",
      "Light-touch relaxation",
      "Scalp, hair, and upper-body care",
    ],

    pressure:
      "Very light to gentle pressure. Slow, calm, symmetrical, professional, and fully client-led.",

    what:
      "A professional sensory massage that may include scalp massage, hair brushing or hair play, gentle back scratches, symmetrical tracing, soft neck and shoulder work, arm care, and calming sensory tools.",

    who:
      "Clients who want a gentle, peaceful appointment with less traditional massage pressure and more light-touch, scalp, hair, back, neck, shoulder, or arm-focused care.",

    style:
      "Gentle, slow, supportive, quiet, and sensory-focused. Every technique can be included, adjusted, or omitted according to the clientâ€™s comfort.",

    includes: [
      "Gentle back, neck, shoulder, and arm work",
      "Slow scalp massage",
      "Optional hair brushing or hair play",
      "Optional gentle back scratches",
      "Optional symmetrical tracing or calming sensory tools",
      "Client-led customization throughout the appointment",
    ],

    notes: [
      "This is a professional wellness service with clear treatment boundaries.",
      "Hair play and back scratches are optional techniques within Sensory Massage, not separate services.",
      "Clients can request more, less, or none of any sensory technique.",
      "The appointment can remain very quiet when that is what the client prefers.",
      siteConfig.tippingPolicy.statement,
    ],
  },

  {
    slug: "seasonal-body-renewal",
    name: "Seasonal Body Renewal Ritual",
    status: "active",
    featured: true,
    displayOrder: 4,
    isSignature: false,

    description:
      "A spa-inspired full-body renewal with seasonal exfoliation, dry brushing, a private rinse, and a moisturizing finish.",

    longDescription:
      "The Seasonal Body Renewal Ritual begins with a full-body sugar- or salt-style scrub followed by dry brushing. The client then receives private time to rinse before returning for a moisturizing finish using cocoa butter or another selected seasonal moisturizer.",

    /*
     * Temporary existing image. Replace this path with the final
     * body-renewal photo after the specialty content session.
     */
    image: "/services/relaxation-massage.png",

    imageAlt:
      "Seasonal full-body exfoliation, dry brushing, rinse, and moisturizing treatment",

    duration: "75 minutes",
    price: "Introductory price $105 + GST",

    bestFor: [
      "Seasonal body care",
      "Full-body exfoliation",
      "A refreshed, moisturized finish",
    ],

    pressure:
      "Moderate exfoliating pressure, adjusted for comfort. The ritual may feel invigorating while remaining professional and client-led.",

    what:
      "A seasonal body-care ritual combining exfoliating scrub, dry brushing, a private rinse, and a full-body moisturizing finish.",

    who:
      "Clients who enjoy spa-style exfoliation or want a refreshing seasonal body-care appointment with a polished moisturizing finish.",

    style:
      "Rhythmic, exfoliating, refreshing, spa-inspired, and professionally paced.",

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
    slug: "active-recovery-cupping",
    name: "Active Recovery Cupping",
    status: "active",
    featured: true,
    displayOrder: 5,
    isSignature: false,

    description:
      "A stronger recovery-focused treatment combining massage, heated silicone cupping, and broad vibration work for active and high-tension bodies.",

    longDescription:
      "Active Recovery Cupping is the refined name for Heatherâ€™s Cup & Buff treatment. It combines massage, heated silicone cups, moving or temporarily parked cups when appropriate, and broad vibration work across larger muscle groups and selected areas of tension.",

    /*
     * Temporary existing image. Replace this path with the final
     * cupping photo after the specialty content session.
     */
    image: "/services/therapeutic-massage.png",

    imageAlt:
      "Heated silicone cupping, massage, and broad vibration treatment for an active client",

    duration: "45, 60, 75, or 90 minutes",
    price: "$80â€“$155 + GST",

    bestFor: [
      "Athletes and active clients",
      "Gym clients",
      "Trades and physical work",
    ],

    pressure:
      "Moderate to vigorous. Intended for clients who enjoy stronger, warmer, and more active treatment work.",

    what:
      "A targeted treatment blending massage, heated silicone cupping, moving cups, temporarily parked cups when appropriate, and broad vibration work.",

    who:
      "Active clients, gym-goers, athletes, labourers, tradespeople, and clients who prefer a stronger treatment experience.",

    style:
      "Active, strong, warm, rhythmic, and focused on high-tension areas while remaining adjustable and client-led.",

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

const standardMassagePrices: PricingItem[] = [
  { duration: "30 min", price: "$60 + GST" },
  { duration: "45 min", price: "$80 + GST" },
  { duration: "60 min", price: "$105 + GST" },
  { duration: "75 min", price: "$130 + GST" },
  { duration: "90 min", price: "$155 + GST" },
  { duration: "120 min", price: "$205 + GST" },
];

export const pricingGroups: PricingGroup[] = [
  {
    name: "Massage",
    serviceSlug: "massage",

    note:
      "Customized, client-led massage for focused care, general maintenance, pregnancy or postpartum needs, youth appointments, and changing treatment goals.",

    prices: standardMassagePrices,
  },

  {
    name: "Relaxation Massage",
    serviceSlug: "relaxation-massage",

    note:
      "A slower, flowing massage using the same duration-based pricing as Massage.",

    prices: standardMassagePrices,
  },

  {
    name: "Sensory Massage",
    serviceSlug: "sensory-massage",

    note:
      "Heatherâ€™s signature professional light-touch service. Hair play, scalp care, gentle back scratches, and other sensory techniques remain optional and client-led.",

    prices: [
      { duration: "45 min", price: "$80 + GST" },
      { duration: "60 min", price: "$105 + GST" },
    ],
  },

  {
    name: "Seasonal Body Renewal Ritual",
    serviceSlug: "seasonal-body-renewal",

    note:
      "Spa-inspired exfoliation, dry brushing, a private rinse, and a moisturizing finish. Introductory promotional pricing.",

    prices: [
      { duration: "75 min", price: "$105 + GST" },
    ],
  },

  {
    name: "Active Recovery Cupping",
    serviceSlug: "active-recovery-cupping",

    note:
      "Massage, heated silicone cupping, and broad vibration work for active and high-tension bodies.",

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
      .join(" Â· "),
  }),
);

export const pricingNotices: PricingNotice[] = [
  {
    id: "no-tipping",
    title: siteConfig.tippingPolicy.heading,
    text: siteConfig.tippingPolicy.statement,
  },
  {
    id: "payment-methods",
    title: siteConfig.payment.heading,
    text: getPaymentMethodsDisplayText(),
  },
  {
    id: "direct-billing",
    title: siteConfig.directBilling.heading,
    text: getDirectBillingDisplayText(),
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
    label: "Signature sensory massage",

    title:
      "A peaceful service built around slow, gentle, client-led touch.",

    text:
      "Sensory Massage is Heatherâ€™s signature light-touch treatment, with optional scalp work, hair play, back scratches, tracing, and calming upper-body techniques.",
  },
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
];

export const bookingSupportItems: BookingSupportItem[] = [
  {
    id: "direct-billing",
    eyebrow: "Insurance Support",
    title: siteConfig.directBilling.heading,
    text: getDirectBillingDisplayText(),
  },
  {
    id: "payment-methods",
    eyebrow: "Payment",
    title: siteConfig.payment.heading,
    text: getPaymentMethodsDisplayText(),
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
      "Online booking is available through Heatherâ€™s ClinicSense booking page. Clients can view current availability, select a service and duration, and complete their booking online.",

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

    answer: getDirectBillingDisplayText(),
    category: "billing",
  },
  {
    question:
      "What payment methods are accepted?",

    answer: getPaymentMethodsDisplayText(),
    category: "payments",
  },
  {
    question:
      "Are tips expected or accepted?",

    answer: siteConfig.tippingPolicy.statement,
    category: "policies",
  },
  {
    question:
      "How do I choose between Massage and Relaxation Massage?",

    answer:
      "Choose Massage when you want a highly customized appointment, focused areas, stronger work, pregnancy or postpartum adaptations, youth care, or general maintenance. Choose Relaxation Massage when your priority is a slower, flowing, gentle-to-moderate full-body experience. Both remain client-led, and pressure can be adjusted throughout the appointment.",

    category: "booking",
  },
  {
    question: "Can I ask for very light pressure?",

    answer:
      "Yes. Heatherâ€™s natural Massage style is firm and flowing, while Relaxation Massage and Sensory Massage are designed around gentler options. Pressure, pacing, positioning, and techniques can always be adjusted according to the clientâ€™s comfort.",

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
      "What is Sensory Massage?",

    answer:
      "Sensory Massage is Heatherâ€™s signature professional light-touch service. It may include slow scalp massage, hair brushing or hair play, gentle back scratches, symmetrical tracing, soft neck and shoulder work, arm care, and other calming sensory techniques. Every element is optional and adjusted according to the clientâ€™s preferences.",

    category: "services",
  },
  {
    question:
      "What is the Seasonal Body Renewal Ritual?",

    answer:
      "The Seasonal Body Renewal Ritual is a spa-inspired body-care appointment combining a seasonal full-body scrub, dry brushing, private rinse time, and a moisturizing finish.",

    category: "services",
  },
  {
    question:
      "What is Active Recovery Cupping?",

    answer:
      "Active Recovery Cupping is the refined name for the Cup & Buff treatment. It combines massage, heated silicone cupping, moving or temporarily parked cups when appropriate, and broad vibration work for clients who prefer a more active treatment style.",

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
  "sensory massage Calgary",
  "light touch massage Calgary",
  "scalp massage Calgary",
  "hair play massage Calgary",
  "gentle back scratch massage Calgary",
  "prenatal massage Calgary",
  "postnatal massage Calgary",
  "youth massage Calgary",
  "direct billing massage Calgary",
  "seasonal body renewal Calgary",
  "body scrub Calgary",
  "full body exfoliation Calgary",
  "heated cupping massage Calgary",
  "active recovery cupping Calgary",
];

const legacyServiceSlugAliases: Readonly<
  Record<string, string>
> = {
  "hair-play-back-scratches": "sensory-massage",
  "seasonal-body-scrub-rinse-moisturizing":
    "seasonal-body-renewal",
  "cup-and-buff": "active-recovery-cupping",
};

export function getServiceBySlug(
  slug: string,
): Service | undefined {
  const normalizedSlug = slug.trim().toLowerCase();

  const resolvedSlug =
    legacyServiceSlugAliases[normalizedSlug] ??
    normalizedSlug;

  return services.find(
    (service) =>
      service.slug === resolvedSlug &&
      service.status === "active",
  );
}

export function getActiveServices(): Service[] {
  return services
    .filter((service) => service.status === "active")
    .sort(
      (first, second) =>
        first.displayOrder - second.displayOrder,
    );
}

export function getFeaturedServices(): Service[] {
  return services
    .filter(
      (service) =>
        service.status === "active" &&
        service.featured,
    )
    .sort(
      (first, second) =>
        first.displayOrder - second.displayOrder,
    );
}

export function getSignatureService(): Service | undefined {
  return getActiveServices().find(
    (service) => service.isSignature,
  );
}

export function getDirectBillingDisplayText(): string {
  const {
    providers,
    placeholder,
    summary,
    disclaimer,
    providerListStatus,
  } = siteConfig.directBilling;

  if (providers.length === 0) {
    return `${summary} ${placeholder} ${disclaimer}`;
  }

  const confirmedProviders =
    `Currently confirmed options include ${providers.join(
      ", ",
    )}.`;

  const additionalProviderNote =
    providerListStatus === "partially-confirmed"
      ? ` ${placeholder}`
      : "";

  return `${summary} ${confirmedProviders}${additionalProviderNote} ${disclaimer}`;
}

export function getPaymentMethodsDisplayText(): string {
  const preferredMethods = siteConfig.payment.methods
    .filter((method) => method.preferred)
    .map((method) => method.name);

  const creditCardMethod = siteConfig.payment.methods.find(
    (method) => method.name === "Credit card",
  );

  const preferredText =
    preferredMethods.length > 0
      ? `Preferred payment methods are ${preferredMethods.join(" and ")}.`
      : siteConfig.payment.summary;

  const creditCardText = creditCardMethod
    ? ` Credit cards can also be accepted when needed.${
        creditCardMethod.note
          ? ` ${creditCardMethod.note}`
          : ""
      }`
    : "";

  return `${preferredText}${creditCardText}`.trim();
}
