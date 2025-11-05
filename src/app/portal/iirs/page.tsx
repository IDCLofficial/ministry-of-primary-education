"use client"

import LoginForm from "./login/LoginForm";
import {login} from "@/lib/iirs/dataInteraction"
import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/portal/iirs/providers/AuthProvider";
import Image from 'next/image';
import HangingTree from '../components/HangingTree';

export default function Revenue() {
    const {login: authLogin} = useAuth();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleLogin = async (email: string, password: string) => {
        try {
            setIsSubmitting(true);
            const result = await login(email, password);
            if(!result?.success){
                throw new Error(result?.message)
            }
            authLogin(result.access_token)
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error((error as Error)?.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const watchLogin = (email: string, password: string) => {
        const promise = handleLogin(email, password)

        toast.promise(promise, {
            loading: 'Logging in...',
            success: 'Login successful',
            error: 'Login failed'
        })
    }
        
    

    return (
        <div className="min-h-screen grid place-items-center bg-[#F3F3F3]">
            <HangingTree finance />
            
            {/* Header */}
            <div className="flex max-md:flex-row flex-col justify-center gap-2 items-center absolute top-10 left-1/2 -translate-x-1/2">
                <Image
                    src="/images/iirs/iirs-logo.png"
                    alt="logo"
                    width={150}
                    height={150}
                    className='object-cover -mb-8'
                    title='Imo State Internal Revenue Service logo'
                />
                <span className='sm:text-2xl text-lg font-bold max-md:block hidden'>
                    <abbr title="Imo State Internal Revenue Service">IIRS</abbr>
                </span>
                <span className='sm:text-xl text-lg font-bold max-md:hidden block'>
                    Imo State Internal Revenue Service
                </span>
            </div>

            {/* Main Content */}
            <main className="py-8 gap-4 flex flex-col w-full relative z-10">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <LoginForm onSubmit={watchLogin} isSubmitting={isSubmitting} />
                </div>
            </main>
        </div>
    )
}