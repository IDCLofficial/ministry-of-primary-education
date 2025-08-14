import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { TopHero } from "@/components/TopHero";
import OngoingProjects from "./ProjectCard";

export default function Projects() {
    return (
        <div>

            <TopHero
                ministryName="Driving Education Reforms"
                titleLabel="Projects"
            />

            {/* SkillUp Project */}
            <OngoingProjects />

            <CTASection
                heading="Join Us in Driving Education Reforms"
                subtext="Be part of our mission."
                buttonLabel="Contact Us"
                buttonHref="/contact-us"
            />
            {/* Footer */}
            <Footer />

        </div>
    )
}