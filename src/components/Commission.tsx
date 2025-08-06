import Image from "next/image";
import { AppLink } from "../components/AppLink";

interface CommissionProps {
    imgSrc: string;
    altText: string;
    commissionerName: string;
    commissionerDescription: string;
}

export const Commission = ({ imgSrc, altText, commissionerName, commissionerDescription }: CommissionProps) => {
    return (
        <section className="w-full bg-gray-100 py-20">
            <div className="w-full mx-auto px-8">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    {/* Left Section - Commissioner Profile Card */}
                    <div className="relative">
                        <div className="relative rounded-xl overflow-hidden shadow-xl">
                            <Image 
                                src={imgSrc}
                                alt={altText}
                                width={1300}
                                height={1300}
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                    
                    {/* Right Section - Text Content */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-[43px] font-medium text-dark-primary leading-tight">
                                Hon. Commissioner <br/>
                                {commissionerName}
                            </h2>
                        </div>
                        
                        <p className="text-dark-primary-body text-[1rem] leading-relaxed text-justify">
                            {commissionerDescription}
                        </p>
                        <AppLink label="Learn More" href="/about-us/team" variant="primary"/>
                    </div>
                </div>
            </div>
        </section>
    );
}; 