import CTASection from "../../components/CTASection";
import Footer from "../../components/Footer";
import { TopHero } from "@/components/TopHero";
import ServicesGrid from "./ServiceCard";

const services = [
  {
    title: "Curriculum Compliance & Accreditation",
    description:
      "Enforcing uniform standards by ensuring all schools—public and private—adopt government‑approved curricula, textbooks, official holidays, and resumption schedules under Commissioner Ikegwuoha’s directive.",
  },
  {
    title: "School Monitoring & Licensing Enforcement",
    description:
      "Monitoring private schools, revoking licenses of illegally-operated schools—especially those in residential apartments—and ensuring full compliance with state regulations and quality assurance procedures.",
  },
  {
    title: "Teacher Verification & Infrastructure Profiling",
    description:
      "Rolling out facial-recognition-based verification of teachers along with school infrastructure documentation (facilities, libraries, ICT labs) to improve data accuracy and accountability.",
  },
  {
    title: "School Building Renovation Program",
    description:
      "In partnership with IMSUBEB, transforming and equipping primary and junior secondary school buildings across all wards under the 'Reconstruction, Rehabilitation & Recovery' initiative.",
  },
  {
    title: "Teacher Recruitment & Capacity Building",
    description:
      "Engaging and training approximately 10,000 new teachers, enhancing instructional standards across primary and secondary schools to elevate learning outcomes.",
  },
  {
    title: "Health & Welfare Partnerships",
    description:
      "Collaborating with the Imo State Health Insurance Agency to enroll pupils in the ImoCare health insurance scheme—supporting access to healthcare as part of holistic student welfare.",
  },
  {
    title: "Public Engagement & Educational Accountability",
    description:
      "Engaging communities, NAPPS, PTAs, and stakeholders through public campaigns and stakeholder correspondence to uphold policy compliance and school quality.",
  },
];

export default function Services() {
  return (
    <div className="h-screen bg-white">
      {/* Top Hero */}
      <TopHero
        ministryName="Ministry of Primary & Secondary Education"
        titleLabel="What We Do"
      />
      <ServicesGrid services={services} />

      {/* CTASection */}
      <CTASection
        heading="Support Quality Education in Imo State"
        subtext="Partner with us to enhance learning environments, uphold school standards, and support students’ well‑being."
        buttonLabel="Contact the Ministry"
        buttonHref="/contact-us"
      />
      {/* Footer */}
      <Footer />
    </div>
  );
}
