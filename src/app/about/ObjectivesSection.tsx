import AnimatedSection2 from "@/components/AnimatedSection2";

interface Objective {
  title: string;
  description: string;
}

interface ObjectivesSectionProps {
  objectives: Objective[];
  coreValues: string[];
  ministryName?: string; 
}

export const ObjectivesSection = ({
  objectives,
  coreValues,
  ministryName
}: ObjectivesSectionProps) => {
  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-6xl mx-auto px-8">
        {/* Objectives Section */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-[43px] font-medium text-center mb-12">
            {`Objectives of the ${ministryName}`}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {objectives.map((objective, index) => (
              <AnimatedSection2 key={index} delay={0.2}>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md text-center">
                  <h3 className="font-medium text-[22px] mb-3">{objective.title}</h3>
                  <p className="text-dark-primary-body text-[1rem]">{objective.description}</p>
                </div>
              </AnimatedSection2>
            ))}
          </div>
        </div>

        {/* Core Values Section */}
        <div>
          <h2 className="text-[43px] font-medium text-center mb-12">Our Core Values</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {coreValues.slice(0, 4).map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 border border-gray-200 rounded-lg shadow-md text-center"
              >
                <span className="font-bold text-lg">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6">
            {coreValues.slice(4).map((value, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-md text-center w-48"
              >
                <span className="font-bold text-lg">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
