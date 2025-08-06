import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { TopHero } from "@/components/TopHero";
import ProjectCard from "@/app/projects/ProjectCard";
import type { Project } from "@/app/projects/ProjectCard";

const projectsData: Project[] = [
    {
      title: "Private School License Revocation Enforcement",
      description:
        "State-wide shutdown and license withdrawal of private schools operating illegally, especially in residential complexes—enforced via Quality Assurance and UBSE inspection teams.",
      status: "active",
    },
    {
      title: "Missionary Schools Compliance Summit",
      description:
        "Hosted a high-level compliance meeting with all missionary school operators to enforce unified curriculum, textbook use, official resumption schedules and approved school hours.",
      status: "active",
    },
    {
      title: "ImoCare School Health Enrollment Initiative",
      description:
        "Partnership with Imo State Health Insurance Agency to enroll primary and secondary school pupils into ImoCare, extending healthcare coverage to learners.",
      status: "active",
    },
    {
      title: "Education Monitoring & Digital Verification Pilot",
      description:
        "Rolling out teacher verification and school infrastructure profiling via digital tools to standardise school data and accountability mechanisms.",
      status: "active",
    },
    {
      title: "2025 Education Budget Oversight & Utility Allocation",
      description:
        "Implementation of N49.46 billion education budget—including classrooms renovation, resource procurement, and teacher training grants across LGAs.",
      status: "active",
    },
    {
      title: "Closed Legacy Projects – Past Revocations",
      description:
        "Projects formerly closed include corridor-specific school building interventions under prior schemes now concluded.",
      status: "closed",
    },
  ];
export default function Projects() {
 

  const imagePaths = [
    "/images/imoschool1.png",
    "/images/imoschool2.png",
    "/images/class5.png",
  ];

  return (
    <div>
      <TopHero
        ministryName="Ministry of Primary & Secondary Education"
        titleLabel="Projects & Initiatives"
      />
      <ProjectCard projectlist={projectsData} images={imagePaths} />

      <CTASection
        heading="Partner with Us to Improve Education in Imo State"
        subtext="Join our efforts to enforce standards, enhance learning infrastructure and support student well-being across public and private schools."
        buttonLabel="Contact the Ministry"
        buttonHref="/contact-us"
      />

      <Footer />
    </div>
  );
}
