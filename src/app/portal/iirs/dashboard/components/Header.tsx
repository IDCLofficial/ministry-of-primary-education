"use client"

import { useMemo, useState, useRef, useEffect } from 'react';
import { PiUserCircleFill } from "react-icons/pi"
import ProfileModal from './ProfileModal';
import UserManagementModal from './UserManagementModal';
import { IoLogOutOutline, IoPersonOutline, IoPeopleOutline, IoChevronDown, IoWalletOutline, IoGridOutline } from 'react-icons/io5';
import { useAuth } from '@/app/portal/iirs/providers/AuthProvider';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header(){
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout, role } = useAuth();
    const pathname = usePathname();
    
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
        if (role !== "idcl") return;
        setIsDropdownOpen(false);
        setIsUserManagementOpen(true);
    };

    return(
        <>
            <header className="w-full flex flex-col sticky top-0 py-2 sm:py-4 px-3 sm:px-6 gap-3 bg-white/30 backdrop-blur-[25px] z-50">
                <div className="w-full flex items-center justify-between backdrop-blur-[25px] rounded-full sm:rounded-[100px] px-3 sm:px-4 border border-gray-200 bg-white/50">
                    <Image 
                        src="/images/iirs/logo.png" 
                        alt="IIRS Logo"
                        width={100}
                        priority
                        height={100}
                        className="w-24 h-16 sm:w-28 sm:h-20 md:w-32 md:h-24 object-contain"
                    />

                    {/* Navigation Menu */}
                    <nav className="hidden md:flex items-center gap-2">
                        <Link
                            href="/portal/iirs/dashboard"
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                pathname === '/portal/iirs/dashboard'
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <IoGridOutline size={18} />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            href="/portal/iirs/dashboard/payouts"
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                pathname === '/portal/iirs/dashboard/payouts'
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <IoWalletOutline size={18} />
                            <span>Payouts</span>
                        </Link>
                    </nav>
                    
                    {/* User Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-gray-100 px-2 sm:px-4 py-2 rounded-full transition-all duration-200 border border-gray-200"
                        >
                            <PiUserCircleFill size={24} className="sm:w-7 sm:h-7" color="#121212"/>
                            <div className="hidden sm:flex flex-col items-start">
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

                                    {role === "idcl" && <button
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

                {/* Mobile Navigation */}
                <nav className="md:hidden flex items-center justify-center gap-2 px-2">
                    <Link
                        href="/portal/iirs/dashboard"
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            pathname === '/portal/iirs/dashboard'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <IoGridOutline size={18} />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href="/portal/iirs/dashboard/payouts"
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            pathname === '/portal/iirs/dashboard/payouts'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <IoWalletOutline size={18} />
                        <span>Payouts</span>
                    </Link>
                </nav>
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