@'
export const siteConfig = {
  businessName: "Heather Knorr Massage",
  legalName: "Heather Knorr",
  currentName: "McKenzie House Massage",
  description:
    "Calming, personalized massage therapy with clear communication, professional care, and convenient online booking.",
  location: "Calgary / Okotoks, Alberta",
  phone: "",
  email: "",
  bookingUrl: "#",
  domain: "https://example.com",
  heroVideo: "",
  social: {
    facebook: "",
    instagram: "",
  },
};

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "Pricing", href: "#pricing" },
  { label: "Booking", href: "#booking" },
  { label: "Contact", href: "#contact" },
];

export const serviceTags = [
  "Therapeutic massage",
  "Relaxation",
  "Scalp & neck focus",
  "Deep tissue",
  "Direct billing",
  "Online booking",
];

export const services = [
  {
    name: "Therapeutic Massage",
    description:
      "Focused massage care for clients who want to address tension, stiffness, and areas that need deeper attention.",
    bestFor: "Tension, stiffness, deep pressure, focused treatment",
  },
  {
    name: "Relaxation Massage",
    description:
      "A calming full-body treatment designed to help the nervous system settle while supporting rest and restoration.",
    bestFor: "Stress, relaxation, gentle pressure, full-body reset",
  },
  {
    name: "Scalp, Neck & Shoulder Focus",
    description:
      "A focused treatment option for clients who carry tension through the upper body, jaw, neck, and shoulders.",
    bestFor: "Neck tension, headaches, shoulder tightness, stress",
  },
];
'@ | Set-Content -Encoding UTF8 "src/lib/site.ts"