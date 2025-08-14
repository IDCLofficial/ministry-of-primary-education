import EventsListSection from "./EventsListSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { TopHero } from "@/components/TopHero";

export default function EventsPage() {
  return (
    <div className="bg-white">
      {/* top hero */}
      <TopHero ministryName="Quality Education is Our Priority" titleLabel="Events" />
      <EventsListSection />
      <CTASection
          heading="Join Us in Quality Education"
          subtext="Be part of our mission to improve the quality of education in Imo State."
          buttonLabel="Contact Us"
          buttonHref="/contact-us"
      />
      <Footer />
    </div>
  );
}
