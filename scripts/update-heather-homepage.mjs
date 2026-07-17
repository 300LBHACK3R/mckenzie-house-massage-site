import fs from "node:fs";

const pagePath = "src/app/page.tsx";

let page = fs.readFileSync(pagePath, "utf8");

if (!page.includes("pricingGroups")) {
  page = page.replace(
    /pricingPreview,\s*\r?\n\s*services,/,
    "pricingPreview,\n  pricingGroups,\n  services,"
  );
}

page = page.replace(
  /const siteImages = \{\s*hero:\s*"[^"]+",\s*detail:\s*"[^"]+",\s*\};/s,
  `const siteImages = {
  hero: siteConfig.assets.heroImage,
  detail: siteConfig.assets.detailImage,
};`
);

page = page.replace(
  "Massage therapy · Calgary · Okotoks",
  "Massage therapy · Prestwick Calgary · Okotoks-ready"
);

page = page.replace(
  "Calm, skilled massage therapy designed around your body.",
  "Massage that adapts to you — not the other way around."
);

page = page.replace(
  /A warm, professional treatment experience focused on comfort,\s*communication, and personalized care\./,
  "A calm, client-led massage experience built around pressure preference, comfort, communication, and what your body needs that day."
);

page = page.replace(
  "Every session is adjusted to the client.",
  "Every appointment is shaped around the person booking."
);

page = page.replace(
  "Clear booking, calm presentation, thoughtful care.",
  "A professional space where pressure, comfort, and goals are discussed clearly."
);

page = page.replace(
  "Built now and ready to evolve with the new space.",
  "Located in Prestwick now, with future Okotoks details to be confirmed."
);

page = page.replace(
  /<p className="eyebrow">Signature Services<\/p>\s*<h2[^>]*>\s*Clear treatment options clients can understand\.\s*<\/h2>\s*<p>\s*Each service opens into a dedicated page with room for treatment\s*photos, short video, service background, technique notes, and\s*booking guidance\.\s*<\/p>/s,
  `<p className="eyebrow">Services</p>
            <h2 id="services-heading">
              Choose a treatment style, then Heather customizes the session.
            </h2>
            <p>
              Massage is kept simple and client-led. Instead of forcing every
              person into a rigid category, Heather listens first, adjusts
              pressure, adapts positioning, and builds the appointment around
              what the client actually needs.
            </p>`
);

page = page.replace(
  /\r?\n\s*<section\s+id="about"[\s\S]*?<\/section>/,
  `
        <section
          id="about"
          className="section meet-heather-luxury scroll-reveal"
          aria-labelledby="about-heading"
        >
          <div className="meet-heather-luxury__media">
            <div className="meet-heather-luxury__image-frame">
              <Image
                src={siteImages.detail}
                alt="Heather from McKenzie House Massage"
                width={980}
                height={720}
                sizes="(max-width: 980px) 100vw, 48vw"
              />
            </div>

            <div className="meet-heather-luxury__badge">
              <span>Client-led</span>
              <strong>Personalized care</strong>
            </div>
          </div>

          <div className="meet-heather-luxury__copy">
            <p className="eyebrow">Meet Heather</p>

            <h2 id="about-heading">
              Thoughtful massage therapy for people who want to be heard first.
            </h2>

            <p className="meet-heather-luxury__lead">
              Heather’s approach is built around listening, comfort, and
              adapting the treatment to the person in front of her. Each session
              starts with what the client needs, what they prefer, what they do
              not want, and how their body feels that day.
            </p>

            <div className="meet-heather-luxury__quote">
              <p>
                “The treatment should fit the client — pressure, pace,
                positioning, and focus areas should never feel forced.”
              </p>
            </div>

            <div className="meet-heather-luxury__details">
              <div>
                <span>Location</span>
                <strong>Prestwick, Calgary</strong>
              </div>
              <div>
                <span>Style</span>
                <strong>Firm, flowing, customized care</strong>
              </div>
              <div>
                <span>Booking</span>
                <strong>ClinicSense connection coming</strong>
              </div>
              <div>
                <span>Future</span>
                <strong>Okotoks details to be confirmed</strong>
              </div>
            </div>
          </div>
        </section>`
);

page = page.replace(
  "A clear, comfortable experience from start to finish.",
  "A massage experience built around communication, consent, and comfort."
);

page = page.replace(
  "A simple look at how the appointment flows, how pressure is guided, and how comfort is handled from start to finish.",
  "A simple look at how Heather listens, protects hands-on time, adapts pressure, and shapes each appointment around the client."
);

page = page.replace(
  /\r?\n\s*<section\s+id="pricing"[\s\S]*?<\/section>/,
  `
        <section
          id="pricing"
          className="section pricing-luxury scroll-reveal"
          aria-labelledby="pricing-heading"
        >
          <div className="pricing-luxury__intro">
            <p className="eyebrow">Pricing</p>

            <h2 id="pricing-heading">
              Clear treatment durations and pricing before booking.
            </h2>

            <p>
              Pricing is organized by service and duration so clients can
              understand the appointment options before continuing into online
              booking. Final booking and availability will be managed through
              ClinicSense.
            </p>
          </div>

          <div className="pricing-luxury__list">
            {pricingGroups.map((group) => (
              <article className="pricing-luxury__group" key={group.name}>
                <div>
                  <span>Service</span>
                  <h3>{group.name}</h3>
                  {group.note ? <p>{group.note}</p> : null}
                </div>

                <div className="pricing-luxury__prices">
                  {group.prices.map((item) => (
                    <div key={\`\${group.name}-\${item.duration}\`}>
                      <strong>{item.duration}</strong>
                      <span>{item.price}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>`
);

page = page.replace(
  /Clients will be directed into Heather’s existing ClinicSense\s*booking system, where availability, services, intake, and\s*scheduling remain securely managed\./,
  "Clients will be directed into Heather’s ClinicSense booking system once the final booking link is connected. For questions about flexible availability, service fit, or times outside the listed hours, clients can text Heather directly."
);

page = page.replace(
  /These FAQs will be refined once Heather confirms policies,\s*booking details, location wording, and service information\./,
  "These answers help clients understand location, booking, treatment style, pressure, youth appointments, and Heather’s client-led approach before they book."
);

fs.writeFileSync(pagePath, page, "utf8");

console.log("Updated src/app/page.tsx successfully.");