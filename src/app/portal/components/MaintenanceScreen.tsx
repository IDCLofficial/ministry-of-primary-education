import React from 'react';
import Image from 'next/image';

export const MaintenanceScreen = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-orange-200 p-8 text-center">
                <Image 
                    src="/images/ministry-logo.png" 
                    alt="Ministry Logo" 
                    width={80} 
                    height={80} 
                    className="mx-auto mb-6"
                />
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Portal Under Maintenance
                </h1>
                <p className="text-gray-600 mb-6">
                    We&apos;re performing scheduled maintenance on the school portal. 
                    The system will be back online shortly.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-orange-800 font-medium animate-pulse">
                        Please check back in a few hours
                    </p>
                </div>
                <div className="pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        For urgent matters, please contact the ministry office directly.
                    </p>
                </div>
            </div>
        </div>
    );
};
