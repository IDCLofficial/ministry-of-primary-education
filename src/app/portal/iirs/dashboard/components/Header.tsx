"use client"

import { useMemo, useState, useRef, useEffect } from 'react';
import { PiUserCircleFill } from "react-icons/pi"
import ProfileModal from './ProfileModal';
import UserManagementModal from './UserManagementModal';
import { IoLogOutOutline, IoPersonOutline, IoPeopleOutline, IoChevronDown } from 'react-icons/io5';
import { useAuth } from '@/app/portal/iirs/providers/AuthProvider';
import Image from 'next/image';

export default function Header(){
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout, role } = useAuth();
    
    const userProfile = useMemo(()=>{
        return {
            id: user?.id || "",
            name: user?.name || "",
            email: user?.email || "",
            percentage: user?.percentage || 0,
            state: user?.state || "",
            totalEarnings: user?.totalEarnings || 0,
            totalAmountProcessed: user?.totalAmountProcessed || 0,
            adminType: user?.adminType || ""
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        setIsProfileModalOpen(true);
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        setIsDropdownOpen(false);
        logout();
    };

    const handleManageUsers = () => {
        if (role !== "admin") return;
        setIsDropdownOpen(false);
        setIsUserManagementOpen(true);
    };

    return(
        <>
            <header className="w-full flex sticky top-0 py-4 px-6 items-center justify-center bg-white/30 backdrop-blur-[25px] z-50">
                <div className="w-full flex items-center justify-between backdrop-blur-[25px] rounded-[100px] py-4 px-4 border border-gray-200 bg-white/50">
                    <Image 
                        src="/images/iirs/logo.png" 
                        alt="IIRS Logo"
                        width={100}
                        priority
                        height={100}
                    />
                    
                    {/* User Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-full transition-all duration-200 border border-gray-200"
                        >
                            <PiUserCircleFill size={28} color="#121212"/>
                            <div className="flex flex-col items-start">
                                <p className="font-semibold text-gray-800 text-sm">{userProfile.name}</p>
                                <p className="text-xs text-gray-500">{userProfile.adminType}</p>
                            </div>
                            <IoChevronDown 
                                className={`text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                size={16}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* User Info Section */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="font-semibold text-gray-900 text-sm">{userProfile.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{userProfile.email}</p>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        onClick={handleProfileClick}
                                        className="w-full flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <IoPersonOutline size={18} className="text-gray-500" />
                                        <span>View Profile</span>
                                    </button>

                                    {role === "admin" && <button
                                        onClick={handleManageUsers}
                                        className="w-full flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <IoPeopleOutline size={18} className="text-gray-500" />
                                        <span>Manage Users</span>
                                    </button>}
                                </div>

                                {/* Logout Section */}
                                <div className="border-t border-gray-100 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <IoLogOutOutline size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <ProfileModal 
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userProfile={userProfile}
            />
            
            <UserManagementModal 
                isOpen={isUserManagementOpen}
                onClose={() => setIsUserManagementOpen(false)}
            />
        </>
    )
}