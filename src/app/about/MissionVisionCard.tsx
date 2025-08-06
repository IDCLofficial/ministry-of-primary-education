import React from "react";
import AnimatedSection from "../../components/AnimatedSection";

interface MissionVisionCardProps {
  ministryName?: string;
  state?: string;
  mission: string;
  vision: string;
}

const MissionVisionCard: React.FC<MissionVisionCardProps> = ({
  ministryName,
  state,
  mission,
  vision,
}) => {
  return (
    <section className="w-full flex justify-center py-16 bg-[#f7f9fa]">
      <AnimatedSection>
        <div className="bg-white rounded-3xl shadow-xl p-10 w-[80vw] flex flex-col gap-8 items-center">
          <h2 className="text-3xl font-bold text-green-700 mb-2 text-center">
            {ministryName}<br />{state}
          </h2>
          <div className="w-full flex flex-col md:flex-row gap-6">
            <div className="bg-green-50 rounded-xl p-6 shadow-sm w-full">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Mission Statement</h3>
              <p className="text-gray-700 text-base">{mission}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 shadow-sm w-full">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Vision Statement</h3>
              <p className="text-gray-700 text-base">{vision}</p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default MissionVisionCard;
