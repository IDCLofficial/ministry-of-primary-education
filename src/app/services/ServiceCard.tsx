import React from "react";
import AnimatedSection from "@/components/AnimatedSection2";

type Service = {
  title: string;
  description: string;
  source?: string;
};

const ServiceCard = ({ title, description }: Service) => (
  <AnimatedSection>
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <h3 className="text-lg font-bold text-green-700 mb-2">{title}</h3>
      <p className="text-gray-700 text-sm flex-1 mb-3">{description}</p>
    </div>
  </AnimatedSection>
);

export default function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <section className="w-full py-12 bg-[#f7f9fa] flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {services.map((service, idx) => (
          <ServiceCard key={idx} {...service} />
        ))}
      </div>
    </section>
  );
}
