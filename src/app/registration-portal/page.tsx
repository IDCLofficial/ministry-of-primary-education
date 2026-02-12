import { FaCheckCircle, FaFileAlt, FaAward, FaGlobe, FaClock, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import { TopHero } from '@/components/TopHero'

export default function RegistrationPortal() {
    const features = [
        {
            icon: FaFileAlt,
            title: "Register for Exams",
            description: "Complete your exam registration online with ease. Submit applications, upload required documents, and track your registration status in real-time.",
            color: "bg-green-50 text-green-600"
        },
        {
            icon: FaCheckCircle,
            title: "Check Results",
            description: "Access your examination results instantly. View detailed performance reports and download result slips anytime, anywhere.",
            color: "bg-green-50 text-green-600"
        },
        {
            icon: FaAward,
            title: "Generate Certificates",
            description: "Download and print your certificates online from anywhere in the world. Secure, verified, and instantly accessible digital certificates.",
            color: "bg-green-50 text-green-600"
        }
    ];

    const examinations = [
        {
            name: "Universal Basic Education General Placement Test (UBEGPT)",
            fee: "₦5,000",
            lateFee: "₦5,500"
        },
        {
            name: "Universal Basic Education Test into Model Schools (UBETMS)",
            fee: "₦3,000",
            lateFee: null
        },
        {
            name: "Common Entrance into Science Schools",
            fee: "₦3,000",
            lateFee: "₦3,500"
        },
        {
            name: "Basic Education Certificate Examination (BECE)",
            fee: "₦7,000",
            lateFee: "₦7,500"
        },
        {
            name: "Resit Exams (BECE)",
            fee: "₦2,000",
            lateFee: null
        },
        {
            name: "Universal Basic Education Assessment Test (UBEAT)",
            fee: "₦5,000",
            lateFee: "₦5,500"
        },
        {
            name: "Junior School Business Certificate Examination (JSCBE)",
            fee: "₦7,000",
            lateFee: "₦7,500"
        }
    ];

    const benefits = [
        {
            icon: FaGlobe,
            title: "Access from Anywhere",
            description: "Manage your educational records from any location worldwide"
        },
        {
            icon: FaClock,
            title: "24/7 Availability",
            description: "Portal services available round the clock for your convenience"
        },
        {
            icon: FaShieldAlt,
            title: "Secure & Verified",
            description: "Your data is protected with industry-standard security measures"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
      <TopHero
              ministryName="Welcome to the Imo State Education E-Portal"
              titleLabel="Ministry of Primary & Secondary Education "
            />
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Are You a Principal?
                    </h2>
                    <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                        Create your school profile and get registered for exams with the Ministry of Primary & Secondary Education
                    </p>
                    <Link 
                        href="/portal"
                        className="inline-block bg-white text-green-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg"
                    >
                        Create Your Profile
                    </Link>
                </div>
            </div>

            {/* About Section */}
            <div id="about" className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            About Imo State Ministry of Primary and Secondary Education
                        </h2>
                        <div className="max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed space-y-4">
                            <p>
                                The Imo State Ministry of Primary and Secondary Education is committed to delivering quality, accessible, and inclusive education to all students across Imo State. Our mission is to foster innovation, growth, and opportunity through comprehensive educational programs and services.
                            </p>
                            <p>
                                Through the Examinations Development Center (EDC), we oversee the administration of various standardized examinations that assess student performance, facilitate school placements, and certify educational achievements. Our online portal provides a modern, efficient platform for students and parents to access examination services from anywhere in the world.
                            </p>
                            <p>
                                We are dedicated to maintaining the highest standards of educational excellence while ensuring that our services remain accessible, transparent, and student-centered. Our digital transformation initiative enables seamless registration, result checking, and certificate generation, making educational processes more convenient for all stakeholders.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Portal Features
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to manage your educational journey in one place
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div 
                                key={index}
                                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100"
                            >
                                <div className={`${feature.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Benefits Section */}
                <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-8 md:p-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        Why Use Our Portal?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={index} className="flex flex-col items-center text-center">
                                    <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md">
                                        <Icon className="w-7 h-7 text-green-600" />
                                    </div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                        {benefit.title}
                                    </h4>
                                    <p className="text-gray-600">
                                        {benefit.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Examinations Section */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Available Examinations
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Fees for various examinations at the Examinations Development Center (EDC)
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {examinations.map((exam, index) => (
                            <div 
                                key={index}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-600"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    {exam.name}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Regular Fee:</span>
                                        <span className="text-2xl font-bold text-green-600">{exam.fee}</span>
                                    </div>
                                    {exam.lateFee && (
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                            <span className="text-gray-600">Late Fee:</span>
                                            <span className="text-xl font-semibold text-orange-600">{exam.lateFee}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Get Started
                    </h2>
                    <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                        Create your school profile today
                    </p>
                    <Link 
                        href="/portal"
                        className="inline-block bg-white text-green-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg"
                    >
                        Create Your Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}