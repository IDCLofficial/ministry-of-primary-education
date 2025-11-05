"use client"

import { useState } from 'react';
import { IoClose, IoMailOutline, IoLocationOutline, IoKeyOutline, IoEyeOutline, IoEyeOffOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useAuth } from '../../providers/AuthProvider';

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
    if (!name) return 'U';
    
    const words = name.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
        // Single word: first and last character
        const word = words[0].toUpperCase();
        return word.length > 1 ? word[0] + word[word.length - 1] : word[0];
    } else {
        // Multiple words: first character of first and last word
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
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
    const { token } = useAuth();
    const [credentials, setCredentials] = useState({
        currentPassword: "",
        newPassword: ""
    });
    
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [isChanging, setIsChanging] = useState(false);

    if (!isOpen) return null;

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        
        if (!token) {
            toast.error('User not authenticated');
            return;
        }

        if (!credentials.currentPassword || !credentials.newPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        const loadingToast = toast.loading('Changing password...');
        
        try {
            setIsChanging(true);
            const req = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/iirs-admin/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(credentials)
            });
            
            const res = await req.json();
            
            if (res.error) {
                toast.error(res.message || 'Failed to change password', { id: loadingToast });
            } else {
                toast.success('Password changed successfully!', { id: loadingToast });
                setCredentials({ currentPassword: "", newPassword: "" });
                onClose();
            }
        } catch (error) {
            console.error('Password change error:', error);
            toast.error('Failed to change password. Please try again.', { id: loadingToast });
        } finally {
            setIsChanging(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Compact Header */}
                <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 cursor-pointer hover:bg-white/20 rounded-full transition-colors"
                    >
                        <IoClose size={20} className="text-white" />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        {/* Profile Picture */}
                        <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-3 border-white/40 shadow-lg flex-shrink-0">
                            <span className="text-2xl font-bold text-white">
                                {getInitials(userProfile.name)}
                            </span>
                        </div>
                        
                        {/* User Info */}
                        <div className="flex-1 text-white">
                            <h2 className="text-xl font-bold mb-0.5">{userProfile.name}</h2>
                            <div className="flex items-center gap-2 text-sm">
                                <IoShieldCheckmarkOutline size={14} />
                                <span className="font-medium opacity-90">{getAdminTypeDisplay(userProfile.adminType)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-gray-50">
                    <div className="flex px-6">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-3 text-sm cursor-pointer font-medium border-b-2 transition-colors ${
                                activeTab === 'profile'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Profile Information
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`px-4 py-3 text-sm cursor-pointer font-medium border-b-2 transition-colors ${
                                activeTab === 'security'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Security
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'profile' ? (
                        /* Profile Information Tab */
                        <div className="space-y-4">
                            {/* Email */}
                            <div className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <IoMailOutline className="text-blue-600" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                                        <p className="font-medium text-gray-900">{userProfile.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* State */}
                            <div className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                        <IoLocationOutline className="text-purple-600" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State</p>
                                        <p className="font-medium text-gray-900 capitalize">{userProfile.state}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Type */}
                            <div className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                        <IoShieldCheckmarkOutline className="text-green-600" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</p>
                                        <p className="font-medium text-gray-900">{getAdminTypeDisplay(userProfile.adminType)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Security Tab */
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <IoKeyOutline className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                                    <p className="text-sm text-gray-500">Update your account password</p>
                                </div>
                            </div>
                            
                            <form className="space-y-4" onSubmit={handleChangePassword}>
                                {/* Current Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Current Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="currentPassword" 
                                            placeholder="Enter your current password"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900" 
                                            value={credentials.currentPassword} 
                                            onChange={(e) => setCredentials({
                                                ...credentials,
                                                currentPassword: e.target.value
                                            })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        >
                                            {showCurrentPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword" 
                                            placeholder="Enter your new password"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900" 
                                            value={credentials.newPassword} 
                                            onChange={(e) => setCredentials({
                                                ...credentials,
                                                newPassword: e.target.value
                                            })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        >
                                            {showNewPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setCredentials({ currentPassword: "", newPassword: "" });
                                        }}
                                        className="flex-1 px-4 cursor-pointer py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        disabled={isChanging}
                                    >
                                        Reset
                                    </button>
                                    <button 
                                        type="submit"
                                        className={`flex-1 px-4 cursor-pointer py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all ${isChanging ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                                        disabled={isChanging}
                                    >
                                        {isChanging ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </span>
                                        ) : 'Update Password'}
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
