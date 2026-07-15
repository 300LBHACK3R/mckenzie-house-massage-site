import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>{siteConfig.businessName}</strong>
        <p>{siteConfig.description}</p>
      </div>

      <div>
        <p>{siteConfig.location}</p>
        <p>Online booking through ClinicSense</p>
      </div>
    </footer>
  );
}
