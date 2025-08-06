import EventsListSection from "./EventsListSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { TopHero } from "@/components/TopHero";

export default function EventsPage() {
  const Events = [
    {
      date: "JULY 3, 2025",
      location: "IMO STATE (VARIOUS HOUSING ESTATES)",
      title: "Ban on Private Schools in Residential Apartments",
      description:
        "The Ministry of Primary & Secondary Education revoked licenses of private schools operating in residential apartments to enforce uniform educational standards.",
      img: "/images/imoschool2.png",
      details: `On 3 July 2025, Commissioner Prof. B. T. O. Ikegwuoha signed a directive withdrawing approvals of schools in non‑designated residential properties. Parents were advised to re‑register children in approved institutions, while proprietors faced sanctions for non-compliance.:contentReference[oaicite:6]{index=6}`,
      dateString: "2025-07-03T10:00:00",
    },

  ];

  return (
    <div className="bg-white">
  <TopHero
    ministryName="Ministry of Primary & Secondary Education"
    titleLabel="Events"
  />

  <EventsListSection events={Events} />

  <CTASection
    heading="Support Quality Education Across Imo State"
    subtext="Join us to strengthen school standards, improve learning outcomes, and ensure safe, inclusive education for every child."
    buttonLabel="Partner With Us"
    buttonHref="/contact-us"
  />

  <Footer />
</div>

  );
}
