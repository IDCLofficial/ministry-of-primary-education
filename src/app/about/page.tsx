import { SectionHero } from "@/components/SectionHero";
import { ObjectivesSection } from "@/app/about/ObjectivesSection";
import { StructuresSection } from "@/app/about/StructuresSection";
import CTASection from "../../components/CTASection";
import Footer from "../../components/Footer";
import { TopHero } from "@/components/TopHero";
import MissionVisionCard from "@/app/about/MissionVisionCard";
import TeamPage from "./Team";

// Team (executive leadership)
const teamMembers = [
  {
    name: "Prof. Bernard Thompson O. Ikegwuoha",
    role: "Commissioner for Primary & Secondary Education",
    image: "/images/commisioner.png",
    bio: "Leads the Imo State Ministry of Primary & Secondary Education and drives policy reforms and standards across public and private schools.",
  },
  {
    name: "Mrs. Okorie Benedicta Chinonye",
    role: "Permanent Secretary",
    image: "/images/permsec.jpg",
    bio: "Coordinates administrative implementation of education policies across primary and secondary levels.",
  },
];

// Objectives
const objectives = [
  {
    title: "Standards & Accreditation",
    description:
      "Monitor compliance of private and public schools with government‑approved curricula and textbooks, enforce licensing and safety standards.",
  },
  {
    title: "Access & Equity",
    description:
      "Ensure every child has access to basic and secondary schooling across Imo State, promote fair enrollment and reduce out‑of‑school rates.",
  },
  {
    title: "Quality of Teaching",
    description:
      "Strengthen teacher capacity via training and regular appraisal in collaboration with IMSUBEB and SEMB.",
  },
  {
    title: "Infrastructure & Learning Environment",
    description:
      "Upgrade classrooms, laboratories, and facilities in public schools to ensure conducive teaching and learning environments.",
  },
  {
    title: "Data & Monitoring",
    description:
      "Track enrollment, teacher deployment, infra‑condition and school performance through IMSUBEB oversight.",
  },
  {
    title: "Stakeholder Engagement",
    description:
      "Collaborate with PTAs, local communities, and regulatory bodies to maintain high educational standards.",
  },
];

// Core values
const coreValues = [
  "Quality",
  "Integrity",
  "Inclusiveness",
  "Transparency",
  "Accountability",
  "Excellence",
];

export default function AboutUs() {
  return (
    <div className="h-screen bg-white">
      <TopHero
        ministryName="Ministry of Primary & Secondary Education"
        titleLabel="About Us"
      />

      <SectionHero
        aboutText={`The Imo State Ministry of Primary & Secondary Education is responsible for the regulation, standards, and administration of basic and secondary schooling across the state.\n
Under the leadership of Prof. Bernard T.O. Ikegwuoha, the ministry ensures adherence to government‑approved curricula, oversees licensing of private schools, and collaborates with IMSUBEB and SEMB to raise teaching quality and infrastructure readiness.`}
        imgSrc="/images/class5.png"
        altText="Students in Imo State primary/secondary school"
      />

      <MissionVisionCard
        ministryName="Ministry of Primary & Secondary Education"
        state="Imo State"
        mission="To ensure quality, licensed, and accessible primary and secondary education for all children in Imo State through effective regulation and capacity building."
        vision="A future where all Imo State children receive safe, accredited, and high‑standard basic and secondary education."
      />

      <TeamPage teamMembers={teamMembers} />

      <ObjectivesSection
        objectives={objectives}
        coreValues={coreValues}
        ministryName="Ministry of Primary & Secondary Education"
      />

      <StructuresSection
        imgSrc="/images/building.png"
        departments={{
          row1: [
            {
              title: "Curriculum & Accreditation Unit",
              description:
                "Enforces compliance with government curricula, monitors private school licensing and standards.",
            },
            {
              title: "Teacher Quality & Development",
              description:
                "Coordinates teacher training, deployment, and evaluation with IMSUBEB and SEMB.",
            },
            {
              title: "Infrastructure & Facilities",
              description:
                "Oversees renovation of classrooms, laboratories, sanitation and learning spaces.",
            },
          ],
          row2: [
            {
              title: "Monitoring & Evaluation",
              description:
                "Tracks school performance, enrollment, accreditation, and inspection results across levels.",
            },
            {
              title: "Stakeholder Engagement & Community Affairs",
              description:
                "Engages PTAs, community leaders, and regulatory bodies to improve participation and standards.",
            },
          ],
        }}
      />

      <CTASection
        heading="Work with us to uphold quality education across Imo State"
        buttonLabel="View Our Policies & Standards"
        buttonHref="/services"
      />

      <Footer />
    </div>
  );
}
