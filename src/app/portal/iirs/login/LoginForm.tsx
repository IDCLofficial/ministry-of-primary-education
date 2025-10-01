"use client"

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function LoginForm({onSubmit}:{onSubmit:(email: string, password: string) => Promise<any>}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [revealPasssword, setRevealPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(email, password)
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={(e)=>handleSubmit(e)} className="shadow-sm p-10 rounded-lg lg:w-[30%] flex flex-col gap-6 justify-center items-center mt-8 bg-white">
            <h1 className="text-2xl font-bold">IIRS Login</h1>
            <div className="flex flex-col gap-1 w-full">
                {/* <label htmlFor="email">Email</label> */}
                <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    className="border border-gray-400 p-2 rounded-lg outline-0 focus:border-black transition-all" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email"
                    required
                />
            </div>
            <div className="flex flex-col gap-1 w-full">
                {/* <label htmlFor="password">Password</label> */}
                <div className="w-full flex items-center gap-2 border border-gray-400 p-2 rounded-lg focus:border-black transition-all">
                    <input 
                        type={revealPasssword ? "text" : "password"} 
                        name="password" 
                        id="password" 
                        className="w-full outline-0" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password"
                        required
                    />
                    {revealPasssword ? <FaEyeSlash className="text-gray-400" onClick={() => setRevealPassword(!revealPasssword)} /> : <FaEye className="text-gray-400" onClick={() => setRevealPassword(!revealPasssword)} />}
                </div>
            </div>
            <button type="submit" className={`bg-green-600 text-white p-2 w-[100px] rounded-lg mt-4 text-center cursor-pointer shadow-md shadow-black/20 ${isSubmitting ? 'opacity-50 animate-pulse ease-in-out duration-300' : ''}`} 
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Loading...' : 'Login'}
            </button>
        </form>
    );
}  