"use client"

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function LoginForm({onSubmit, isSubmitting}:{onSubmit:(email: string, password: string) => void, isSubmitting: boolean}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [revealPasssword, setRevealPassword] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        onSubmit(email, password)
    }

    return (
        <form onSubmit={(e)=>handleSubmit(e)} className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">IIRS Login</h1>
                <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                </label>
                <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="you@example.com"
                    required
                />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <div className="relative">
                    <input 
                        type={revealPasssword ? "text" : "password"} 
                        name="password" 
                        id="password" 
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Enter your password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setRevealPassword(!revealPasssword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        {revealPasssword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                className={`w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'} cursor-pointer`} 
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                    </span>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    );
}  