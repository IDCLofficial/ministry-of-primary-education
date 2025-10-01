"use client"

import { useState } from 'react';
import { PiUserCircleFill, PiX, PiEnvelope, PiMapPin, PiCurrencyDollar, PiTrendUp, PiShield, PiKey } from 'react-icons/pi';
import { FaEye, FaEyeSlash, FaChevronLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    percentage: number;
    state: string;
    totalEarnings: number;
    totalAmountProcessed: number;
    adminType: string;
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const getAdminTypeDisplay = (adminType: string) => {
    switch (adminType) {
        case 'iirs_admin':
            return 'IIRS Administrator';
        case 'super_admin':
            return 'Super Administrator';
        case 'state_admin':
            return 'State Administrator';
        default:
            return 'Administrator';
    }
};


export default function ProfileModal({ isOpen, onClose, userProfile }: ProfileModalProps) {
    if (!isOpen) return null;

    const [credentials, setCredentials] = useState({
        currentPassword:"",
        newPassword:""
    })
    
    const [revealPassword, setRevealPassword] = useState(false)
    const [changePassword, setChangePassword] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

    const toastOptions = {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    };

    async function handleChangePassword(e:React.FormEvent){
        e.preventDefault();
        try{
            setIsChanging(true)
            const req = await fetch('https://moe-backend-nwp2.onrender.com/iirs-admin/change-password', {
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                    "Authorization":`Bearer ${localStorage.getItem("token")}`
                },
                body:JSON.stringify(credentials)
            });
            const res = await req.json();
            console.log(res)
            if(res.error){
                toast.error(res.message, {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                })
                setIsChanging(false);
            }else{
                toast.success("Password changed successfully", {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                })
                setIsChanging(false);
                setChangePassword(false);
            }
        }catch(e){
            console.log(e)
            toast.error("Failed to change password", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            })
            setIsChanging(false);
        }finally{
            setIsChanging(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center py-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <ToastContainer />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 h-full overflow-y-auto">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-8 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <PiX size={20} />
                    </button>
                    
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl font-bold text-white">
                                A
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-center">{userProfile.name}</h2>
                        <p className="text-blue-100 text-sm mt-1">{getAdminTypeDisplay(userProfile.adminType)}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {!changePassword ? (
                        /* Contact Information */
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Contact Information
                            </h3>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <PiEnvelope className="text-gray-500" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{userProfile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <PiMapPin className="text-gray-500" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">State</p>
                                    <p className="font-medium text-gray-900">{userProfile.state}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <PiKey className="text-gray-500" size={20} />
                                <div className='w-full flex items-center justify-between'>
                                    <div>
                                        <p className="text-sm text-gray-500">Password</p>
                                        <p className="font-medium text-gray-900">********</p>
                                    </div>
                                    <button 
                                        className='text-blue-500 cursor-pointer text-sm hover:text-blue-600 transition-colors' 
                                        onClick={() => setChangePassword(true)}
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Change Password Form */
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Change Password
                                </h3>
                            </div>
                            
                            <form className="space-y-4" onSubmit={(e)=>handleChangePassword(e)}>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                                    <div className="w-full flex items-center gap-2 border border-gray-300 p-3 rounded-lg focus-within:border-blue-500 transition-all">
                                        <input 
                                            type={revealPassword ? "text" : "password"}
                                            name="currentPassword" 
                                            placeholder="Enter current password"
                                            className="w-full outline-0 text-gray-900" 
                                            value={credentials.currentPassword} 
                                            onChange={(e) => setCredentials((credentials) => ({
                                                ...credentials,
                                                currentPassword: e.target.value
                                            }))}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setRevealPassword(!revealPassword)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {revealPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">New Password</label>
                                    <div className="w-full flex items-center gap-2 border border-gray-300 p-3 rounded-lg focus-within:border-blue-500 transition-all">
                                        <input 
                                            type={revealPassword ? "text" : "password"}
                                            name="newPassword" 
                                            placeholder="Enter new password"
                                            className="w-full outline-0 text-gray-900" 
                                            value={credentials.newPassword} 
                                            onChange={(e) => setCredentials((credentials) => ({
                                                ...credentials,
                                                newPassword: e.target.value
                                            }))}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={(e) => setChangePassword(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className={`flex-1 px-4 py-2 bg-blue-600 ${isChanging && 'opacity-70'} text-white rounded-lg hover:bg-blue-700 transition-colors`}
                                        disabled={isChanging}
                                    >
                                        {isChanging ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
