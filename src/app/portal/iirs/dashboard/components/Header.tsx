"use client"

import { useState } from 'react';
import { PiUserCircleFill } from "react-icons/pi"
import ProfileModal from './ProfileModal';
import { useAuth } from '../../context/authContext';
import { IoLogOutOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

export default function Header(){
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    
    // Sample user profile data - replace with actual user data from your auth context
    const userProfile = {
        id: user?.id || "68da2735d5267ad3fbf84396",
        name: user?.name || "IIRS Imo State Admin",
        email: user?.email || "admin@iirs.gov.ng",
        percentage: (user as any)?.percentage || 5,
        state: (user as any)?.state || "Imo State",
        totalEarnings: (user as any)?.totalEarnings || 0,
        totalAmountProcessed: (user as any)?.totalAmountProcessed || 0,
        adminType: (user as any)?.adminType || "iirs_admin"
    };

    const logout = () => {
        localStorage.removeItem("token");
        router.push('/portal/iirs/login')
    }

    return(
        <>
            <header className="w-full flex sticky top-0 py-4 px-6 items-center justify-center bg-white/30 backdrop-blur-[25px]">
                <div className="w-full flex items-center justify-between backdrop-blur-[25px] rounded-[100px] py-4 px-4 border border-gray-200">
                    <img src="/images/iirs/logo.png" alt="" />
                    <div className='flex items-center gap-2'>
                        <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                            onClick={() => setIsProfileModalOpen(true)}
                        >
                            <PiUserCircleFill size={25} color="#121212"/>
                            <p className="font-medium text-gray-700">{userProfile.name.split(' ')[0]}</p>
                        </div>
                        <button className='text-sm text-red-500 cursor-pointer flex items-center' onClick={logout}>
                            <IoLogOutOutline size={25}/> Logout
                        </button>
                    </div>
                </div>
            </header>
            
            <ProfileModal 
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userProfile={userProfile}
            />
        </>
    )
}