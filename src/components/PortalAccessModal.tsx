'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaFileAlt, FaAward, FaTimes } from 'react-icons/fa';

export default function PortalAccessModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeenModal = sessionStorage.getItem('hasSeenPortalModal');
        
        if (!hasSeenModal) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem('hasSeenPortalModal', 'true');
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, []);

    const closeModal = () => {
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-slideUp">
                {/* Close Button */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label="Close modal"
                >
                    <FaTimes className="w-6 h-6" />
                </button>

                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-8">
                    <h2 className="text-3xl font-bold mb-2">
                        Welcome to Imo State Education Portal
                    </h2>
                    <p className="text-green-100 text-lg">
                        Quick access to all your educational services
                    </p>
                </div>

                {/* Content */}
                <div className="px-8 py-6">
                    <div className="grid gap-4 mb-6">
                        {/* Feature 1 */}
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                            <div className="bg-green-600 text-white p-3 rounded-lg flex-shrink-0">
                                <FaFileAlt className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Register for Exams</h3>
                                <p className="text-sm text-gray-600">
                                    Complete exam registration and track your status online
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                            <div className="bg-green-600 text-white p-3 rounded-lg flex-shrink-0">
                                <FaCheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Check Results</h3>
                                <p className="text-sm text-gray-600">
                                    Access your examination results instantly
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                            <div className="bg-green-600 text-white p-3 rounded-lg flex-shrink-0">
                                <FaAward className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Generate Certificates</h3>
                                <p className="text-sm text-gray-600">
                                    Download and print your certificates online
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/registration-portal"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold text-center transition-colors shadow-lg hover:shadow-xl"
                            onClick={closeModal}
                        >
                            Access Portal Now
                        </Link>
                        <button
                            onClick={closeModal}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-lg font-semibold transition-colors"
                        >
                            Continue Browsing
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}
