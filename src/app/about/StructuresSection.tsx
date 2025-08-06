import AnimatedSection from "@/components/AnimatedSection2";
import Image from "next/image";

interface Department {
  title: string;
  description: string;
}

interface StructuresSectionProps {
  imgSrc: string;
  heading?: string;
  description?: string;
  departments: {
    row1: Department[];
    row2: Department[];
  };
}

export const StructuresSection = ({
  imgSrc,
  heading = "Our Structure",
  description,
  departments,
}: StructuresSectionProps) => {
  return (
    <section className="w-full bg-[#1D1D1D] py-20">
      <div className="max-w-7xl mx-auto px-8 text-center flex flex-col items-center">
        {/* Header */}
        <h2 className="text-[43px] font-medium text-white">{heading}</h2>
        <p className="text-white text-sm sm:text-base md:text-[1rem] mb-8 sm:mb-16 w-full sm:w-[80%] md:w-[70%] mx-auto">
          {description}
        </p>

        {/* Main Image */}
        <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg mb-20">
          <Image
            src={imgSrc}
            alt="Ministry Structure"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Department Cards Grid */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col md:flex-row gap-2 w-full justify-between">
            {departments.row1.map((department, index) => (
              <div
                key={`row1-${index}`}
                className="flex-1 bg-white p-8 shadow-md border border-gray-200"
              >
                <h3 className="font-bold text-[22px] text-dark-primary mb-3">
                  {department.title}
                </h3>
                <p className="text-dark-secondary-body text-[16px]">
                  {department.description}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row w-full gap-2">
            {departments.row2.map((department, index) => (
              <div
                key={`row2-${index}`}
                className="flex-1 bg-white p-8 shadow-md border border-gray-200"
              >
                <AnimatedSection>
                  <h3 className="font-bold text-[22px] text-dark-primary mb-3">
                    {department.title}
                  </h3>
                  <p className="text-dark-secondary-body text-[16px]">
                    {department.description}
                  </p>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-10">
          <a
            href="/departments"
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-12 py-3 rounded text-lg transition-colors shadow-md"
          >
            See More
          </a>
        </div>
      </div>
    </section>
  );
};
