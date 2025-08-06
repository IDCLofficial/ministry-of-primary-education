import UnitsTabsSection from "./UnitsTabsSection";
import Footer from "@/components/Footer";
import { TopHero } from "@/components/TopHero";
import CTASection from "@/components/CTASection";

const departmentsData = [
  {
    name: "Basic Education Department",
    image: "/images/imoschool1.png",
    description:
      "Oversees primary and junior secondary education delivery, ensuring compliance with the Universal Basic Education (UBE) mandate across all LGAs.",
  },
  {
    name: "School Services & Inspectorate Department",
    image: "/images/imoschool3.png",
    description:
      "Conducts routine school inspections, enforces operational standards, and ensures quality assurance in public and private institutions.",
  },
  {
    name: "Teacher Management & Professional Development",
    image: "/images/permsec.jpg",
    description:
      "Handles teacher recruitment, deployment, training, and continuous professional development in collaboration with TRCN and UBEC.",
  },
  {
    name: "Planning, Research & Statistics Department",
    image: "/images/dept1.png",
    description:
      "Collects and analyzes education data for policy formulation, school mapping, enrollment tracking, and budget planning.",
  },
  {
    name: "Student Welfare & Inclusive Education Unit",
    image: "/images/media1.png",
     description:
      "Ensures child protection, inclusive education, school feeding programs, and psychosocial support for learners in need.",
  },
];

export default function UnitsPage() {
  return (
    <div className="bg-white">
      <TopHero
        ministryName="Ministry of Primary & Secondary Education"
        titleLabel="Departments"
      />

      <UnitsTabsSection departments={departmentsData} />

      <CTASection
        heading="Work With Us to Strengthen Basic Education"
        subtext="Join hands to ensure quality learning, safer schools, and teacher development for every child in Imo State."
        buttonLabel="Contact the Ministry"
        buttonHref="/contact-us"
      />
      <Footer />
    </div>
  );
}
