'use client';

import { useState, FormEvent } from 'react';

interface CertificateSearchForm {
    firstName: string;
    lastName: string;
    otherName: string;
    school: string;
    examYear: string;
}

export default function Portal() {
    const [formData, setFormData] = useState<CertificateSearchForm>({
        firstName: '',
        lastName: '',
        otherName: '',
        school: '',
        examYear: ''
    });
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setSearchError('');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearchError('');

        // Validation
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.school.trim() || !formData.examYear) {
            setSearchError('Please fill in all required fields');
            return;
        }

        setIsSearching(true);

        try {
            // TODO: Implement API call to search for certificate
            // const response = await fetch('/api/certificates/search', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('Searching for certificate:', formData);
            // Handle search results here
            
        } catch (error) {
            setSearchError('An error occurred while searching. Please try again.');
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        setFormData({
            firstName: '',
            lastName: '',
            otherName: '',
            school: '',
            examYear: ''
        });
        setSearchError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            FSLC Certificate Portal
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Ministry of Primary and Secondary Education - Imo State
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Info Card */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                                Search for Your Certificate
                            </h3>
                            <p className="mt-2 text-sm text-green-700">
                                Enter your full name exactly as it appears on your certificate, select your school, 
                                and choose the year you took the FSLC examination to retrieve your certificate.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Form Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">
                            Certificate Search
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {/* Name Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* First Name */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-400"
                                    disabled={isSearching}
                                    required
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-400"
                                    disabled={isSearching}
                                    required
                                />
                            </div>
                        </div>

                        {/* Other Name */}
                        <div>
                            <label htmlFor="otherName" className="block text-sm font-medium text-gray-700 mb-2">
                                Other Name(s)
                            </label>
                            <input
                                type="text"
                                id="otherName"
                                name="otherName"
                                value={formData.otherName}
                                onChange={handleChange}
                                placeholder="Enter other name(s) if any"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-400"
                                disabled={isSearching}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Optional: Middle name or any other names
                            </p>
                        </div>

                        {/* School Input */}
                        <div>
                            <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                                School Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="school"
                                name="school"
                                value={formData.school}
                                onChange={handleChange}
                                placeholder="Enter your school name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-400"
                                disabled={isSearching}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Example: St. Mary's Primary School, Owerri
                            </p>
                        </div>

                        {/* Year of Examination */}
                        <div>
                            <label htmlFor="examYear" className="block text-sm font-medium text-gray-700 mb-2">
                                Year of Examination <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="examYear"
                                name="examYear"
                                value={formData.examYear}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 bg-white"
                                disabled={isSearching}
                                required
                            >
                                <option value="">Select year</option>
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Select the year you took the FSLC examination
                            </p>
                        </div>

                        {/* Error Message */}
                        {searchError && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">
                                            {searchError}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                {isSearching ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Search Certificate
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isSearching}
                                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Need Help?
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p>Ensure your name is spelled exactly as it appears on your certificate</p>
                        </div>
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p>Enter the complete school name including location if applicable</p>
                        </div>
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p>If you can't find your certificate, contact the Ministry office for assistance</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            <strong>Contact:</strong> Ministry of Primary and Secondary Education, Imo State
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            <strong>Email:</strong> info@mopse-imo.gov.ng | <strong>Phone:</strong> +234-XXX-XXX-XXXX
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}