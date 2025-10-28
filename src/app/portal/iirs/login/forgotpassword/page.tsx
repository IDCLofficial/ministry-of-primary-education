"use client"
import Link from "next/link"
import { useState } from "react"
import { BiChevronLeft, BiChevronRight } from "react-icons/bi"

export default function ForgotPassword(){

    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    return(
        <div className="h-screen w-full bg-[#f1f1f1] flex justify-center items-center">
            <form className="shadow-sm p-10 rounded-lg lg:w-[30%] flex flex-col gap-6 mt-8 bg-white">
                <h1 className="text-2xl font-bold">Enter your email address</h1>
                <div className="flex flex-col gap-1 w-full text-sm">
                    {/* <label htmlFor="email">Email</label> */}
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        className="border border-gray-400 p-2 rounded-lg outline-0 focus:border-black transition-all text-sm" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email"
                        required
                    />
                </div>
                <div className="w-full flex justify-between items-center">
                    <Link href={'/portal/iirs/login'} className="flex items-center gap-1 text-blue-500"><i><BiChevronLeft /></i>Back to login</Link>
                    <button type="submit" className={`text-green-600 p-2 px-8  rounded-lg text-center cursor-pointer ${isSubmitting ? 'opacity-50 animate-pulse ease-in-out duration-300' : ''}`} 
                        disabled={isSubmitting}
                        >
                        {isSubmitting ? 'Loading...' : 'Next'}
                    </button>
                </div>
            </form>
        </div>
    )
}
                        