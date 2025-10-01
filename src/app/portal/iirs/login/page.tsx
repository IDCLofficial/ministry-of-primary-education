"use client"

import LoginForm from "./LoginForm";
import {login} from "@/lib/iirs/dataInteraction"
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Revenue() {
    const router = useRouter();
    const handleLogin = async (email: string, password: string) => {
        try {
            const result = await login(email, password);
            if(!result?.success){
                toast.error(`${result?.message}`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                })
            }else{
                toast.success(`Login successful`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                })
                router.push('/portal/iirs/dashboard')
            }
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(`Login failed`, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            })
        }
    };

    return (
        <div className="h-screen w-full bg-[#f1f1f1] flex justify-center items-center">
            <ToastContainer />
            <LoginForm onSubmit={handleLogin} />
        </div>
    )
}