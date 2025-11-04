"use client"

import LoginForm from "./login/LoginForm";
import {login} from "@/lib/iirs/dataInteraction"
import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/portal/iirs/providers/AuthProvider";

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
        <React.Fragment>
            <div className="h-screen w-full bg-[#f1f1f1] flex justify-center items-center">
                <LoginForm onSubmit={watchLogin} isSubmitting={isSubmitting} />
            </div>
        </React.Fragment>
    )
}