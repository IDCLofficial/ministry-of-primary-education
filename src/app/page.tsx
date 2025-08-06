import AboutMandateSection from "@/components/AboutMandateSection";
import HeroSection from "@/components/HeroSection";
import CommissionerSection from "@/components/CommissionerSection";
import QuickLinksSection from "@/components/QuickLinksSection";
import SkillUpSection from "@/components/SkillUpSection";
import LatestNewsSection from "@/components/LatestNewsSection";
import Stats from "@/components/Stats";
import FeaturedPartners from "@/components/FeaturedPartners";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>

     
      {/* hero section */}
      <HeroSection
        backgroundImages={["/images/home1.jpg", "/images/home2.jpg", "/images/home2.jpeg"]}
        overlayText="Imo State Ministry of Primary and Secondary Education"
        heading="Transforming Education in Imo State"
        subheading="Delivering Quality Education"
        description="Our mission is to deliver quality, accessible, and inclusive education to all primary and secondary school students in Imo State, fostering innovation, growth, and opportunity."
      
      />
      {/* About Mandate Section */}
      <AboutMandateSection
        label="ABOUT US"
        title="Our Mandate —"
        subheading="Ministry of Primary and Secondary Education"
        description="The Imo State Ministry of Education (Primary and Secondary) is charged with overseeing the formulation and implementation of education policies that promote excellence, inclusivity, and innovation in public and private schools. We ensure the effective management of primary and secondary school education through curriculum development, teacher training, infrastructure provision, and performance monitoring.

        Our vision is to make Imo a center of educational excellence where students are equipped with the skills and knowledge to thrive in a competitive world."
                buttonText="Our Mandate"
        image1="/images/about1.jpg"
        image2="/images/home2.png"
      />

      {/* Commissioner Section */}
      <CommissionerSection
  imageSrc="/images/commisioner.png"
  imageAlt="Professor Bernard Thompson Onyemechukwu Ikegwuoha, Commissioner for Primary and Secondary Education in Imo State"
  title="About The Commissioner"
  bio="Professor Bernard Thompson Onyemechukwu Ikegwuoha is an accomplished academic, seasoned administrator, and transformational leader serving as the Honourable Commissioner for Primary and Secondary Education in Imo State. A scholar of national repute, Professor Ikegwuoha brings decades of experience in educational reform, institutional leadership, and policy implementation. His tenure is marked by a visionary commitment to repositioning the educational sector for excellence, innovation, and inclusivity."
  details="As Commissioner, Professor Ikegwuoha has overseen critical reforms including the enforcement of academic standards, revitalization of infrastructure, and introduction of digital tools in schools. He has championed the closure of substandard institutions and spearheaded the rehabilitation of public schools across the state. With a deep understanding of the challenges facing education in Nigeria, he collaborates actively with educators, communities, and development partners to ensure that every child in Imo State receives quality, equitable, and future-ready education. His leadership reflects a rare blend of intellectual depth, integrity, and hands-on governance, earning him admiration within and beyond Imo State."
/>

      <div className="bg-white">

      {/* Skill Up Section */}
      <SkillUpSection />
      {/* Quick Links Section */}
      <QuickLinksSection />
      {/* Latest News Section */}
      <LatestNewsSection />
      </div>

      {/* Stats Section */}
      <Stats />
      {/* Featured Partners Section */}
      <FeaturedPartners />
      {/* CTASection */}
      <CTASection
        heading="Work With Us to Strengthen Basic Education"
        subtext="Join hands to ensure quality learning, safer schools, and teacher development for every child in Imo State."
        buttonLabel="Contact the Ministry"
        buttonHref="/contact-us"
      />
      {/* Footer */}
      <Footer />
    </>
  );
}
