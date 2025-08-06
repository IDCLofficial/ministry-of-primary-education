import { Title } from "@/components/Title";
import AnimatedSection from "./AnimatedSection";

interface TopHeroProps {
    ministryName: string;
    titleLabel: string; 
}

export const TopHero = ({ ministryName, titleLabel }: TopHeroProps) => {
    return (
        <div className="relative h-[50vh] md:h-[70vh] px-4 sm:px-8 md:px-[3rem] py-10 flex flex-col justify-center bg-gradient-to-r from-green-900/20 via-black to-black">
            <div className="absolute inset-0 bg-[url('/images/gradient.png')] bg-cover bg-center z-0"></div>
        <AnimatedSection>
            {/* Navigation Highlight */}
            <div className="relative z-10 flex justify-center">
                <Title label={titleLabel} />
            </div>
            <div className="relative z-10 flex justify-center mt-4">
                <div className="w-full sm:w-[80%] md:w-[95%] flex flex-col items-center text-center">
                    <h1 className="text-2xl sm:text-3xl 2xl:text-[3rem] font-bold text-white leading-tight">
                         {ministryName}
                    </h1>
                </div>
            </div>
        </AnimatedSection>
        </div>
    );
}; 