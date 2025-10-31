'use client'

import { useEffect, useState } from "react"
import { useAuth } from "./context/authContext"

export default function IIRS(){
    const { isAuthenticated, user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        // Wait a moment for the auth context to complete token validation
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [])

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                window.location.href = '/portal/iirs/login';
            } else {
                window.location.href = '/portal/iirs/dashboard';
            }
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Validating authentication...</p>
                </div>
            </div>
        );
    }

    return(
        <div>
            <div></div>
        </div>
    )
}