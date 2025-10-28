"use client"
import Link from "next/link"
import { useState } from "react"
import { BiChevronLeft, BiChevronRight } from "react-icons/bi"

export default function Otp(){

    const [otp, setOtp] = useState("");
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    return(
        <div className="h-screen w-full bg-[#f1f1f1] flex justify-center items-center">
            <form className="shadow-sm p-10 rounded-lg lg:w-[30%] flex flex-col gap-6 mt-8 bg-white">
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-gray-500 mt-2">
                        Enter the 6-digit code sent to your email
                    </p>
                    <div className="flex gap-2 justify-center">
                        {[...Array(6)].map((_, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                className="w-12 h-12 text-center border border-gray-400 rounded-lg outline-0 focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all text-lg font-semibold"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value && index < 5) {
                                        const nextInput = (e.target as HTMLInputElement).parentElement?.children[index + 1] as HTMLInputElement;
                                        nextInput?.focus();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
                                        const prevInput = (e.target as HTMLInputElement).parentElement?.children[index - 1] as HTMLInputElement;
                                        prevInput?.focus();
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div className="w-full flex justify-between items-center">
                    <Link href={'/portal/iirs/login'} className="flex items-center gap-1"><i><BiChevronLeft /></i>Back to login</Link>
                    <button type="submit" className={`bg-green-600 text-white text-sm p-2 px-6 rounded-lg text-center cursor-pointer ${isSubmitting ? 'opacity-50 animate-pulse ease-in-out duration-300' : ''}`} 
                        disabled={isSubmitting}
                        >
                        {isSubmitting ? 'Loading...' : 'Confirm'}
                    </button>
                </div>
            </form>
        </div>
    )
}
                        