import React from "react";
import ContactInfoSection from "./ContactInfoSection";
import ContactFormSection from "./ContactFormSection";
import ContactImageSection from "./ContactImageSection";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { TopHero } from "@/components/TopHero";

export default function ContactUsPage() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col">
      {/* top hero */}
      <TopHero ministryName="We would love to hear from you" titleLabel="Contact Us" />
      <section className="w-full mx-auto py-20 px-12 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row gap-8 relative">    
            <div className="flex-1">
              <ContactInfoSection />
            </div>
            <div className="hidden md:flex flex-1 justify-center items-start absolute right-0 z-5">
              <ContactFormSection />
            </div>
        </div>
        <ContactImageSection />
        <div className="md:hidden">
          <ContactFormSection />
        </div>
      </section>
      <CTASection
    heading="Support Quality Education Across Imo State"
    subtext="Join us to strengthen school standards, improve learning outcomes, and ensure safe, inclusive education for every child."
    buttonLabel="Partner With Us"
    buttonHref="/contact-us"
  />
      <Footer />
    </main>
  );
}
