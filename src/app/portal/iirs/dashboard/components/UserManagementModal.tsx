"use client"

import { useState, useEffect, useCallback } from 'react';
import { IoClose, IoPersonAddOutline, IoSearchOutline, IoTrashOutline, IoShieldCheckmarkOutline, IoMailOutline, IoDiceOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useAuth } from '../../providers/AuthProvider';

interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    adminType: string;
    isActive: boolean;
    percentage: number;
    state: string;
    totalEarnings: number;
    totalAmountProcessed: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface UserManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'add'>('users');
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                if (value.trim().length > 50) return 'Name must be less than 50 characters';
                return undefined;
            
            case 'email':
                if (!value.trim()) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Invalid email format';
                return undefined;
            
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (value.length > 50) return 'Password must be less than 50 characters';
                if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
                if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
                if (!/[0-9]/.test(value)) return 'Password must contain a number';
                if (!/[!@#$%^&*.,<>?()_+]/.test(value)) return 'Password must contain a special character';
                return undefined;
            
            default:
                return undefined;
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {
            name: validateField('name', newUser.name),
            email: validateField('email', newUser.email),
            password: validateField('password', newUser.password)
        };
        
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== undefined);
    };

    const handleFieldChange = (field: string, value: string) => {
        setNewUser({ ...newUser, [field]: value });
        
        // Validate on change if field has been touched
        if (touched[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const handleFieldBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, newUser[field as keyof typeof newUser]);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const generatePassword = () => {
        const length = 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*.,<>?()_+";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setNewUser({ ...newUser, password });
        
        // Clear password error when generated
        if (touched.password) {
            setErrors(prev => ({ ...prev, password: undefined }));
        }
    };

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setFetchError(false);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/iirs-admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json() as User[];
            console.log({data});
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setFetchError(true);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, fetchUsers]);

    if (!isOpen) return null;

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Mark all fields as touched
        setTouched({ name: true, email: true, password: true });
        
        // Validate form
        if (!validateForm()) {
            toast.error('Please fix all errors before submitting');
            return;
        }

        const loadingToast = toast.loading('Creating user...');
        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/iirs-admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });

            const data = await response.json();

            if (data.error) {
                toast.error(data.message || 'Failed to create user', { id: loadingToast });
            } else {
                toast.success('User created successfully!', { id: loadingToast });
                setNewUser({ name: '', email: '', password: '' });
                setErrors({});
                setTouched({});
                setActiveTab('users');
                fetchUsers();
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Failed to create user', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

        const loadingToast = toast.loading('Deleting user...');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/iirs-admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.error) {
                toast.error(data.message || 'Failed to delete user', { id: loadingToast });
            } else {
                toast.success('User deleted successfully!', { id: loadingToast });
                fetchUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user', { id: loadingToast });
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAdminTypeDisplay = (type: string) => {
        switch (type) {
            case 'iirs_admin': return 'Admin';
            case 'iirs_user': return 'Viewer';
            default: return 'Admin';
        }
    };

    const getAdminTypeBadge = (type: string) => {
        switch (type) {
            case 'iirs_user':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'iirs_admin':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 cursor-pointer hover:bg-white/20 rounded-full transition-colors"
                    >
                        <IoClose size={20} className="text-white" />
                    </button>
                    
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <IoShieldCheckmarkOutline size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">User Management</h2>
                            <p className="text-sm opacity-90">Manage IIRS administrators</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-gray-50">
                    <div className="flex px-6">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-3 text-sm cursor-pointer font-medium border-b-2 transition-colors ${
                                activeTab === 'users'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            All Users
                        </button>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`px-4 py-3 text-sm cursor-pointer font-medium border-b-2 transition-colors ${
                                activeTab === 'add'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <IoPersonAddOutline size={16} />
                                Add New User
                            </div>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'add' ? (
                        /* Add User Tab */
                    <div className="border-b border-gray-200 bg-gray-50 p-6">
                        <form onSubmit={handleAddUser} className="space-y-4 max-w-2xl mx-auto">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        onBlur={() => handleFieldBlur('name')}
                                        className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 transition-colors ${
                                            errors.name && touched.name
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                        placeholder="John Doe"
                                    />
                                    {errors.name && touched.name && (
                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                            <span>⚠</span> {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                        onBlur={() => handleFieldBlur('email')}
                                        className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 transition-colors ${
                                            errors.email && touched.email
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && touched.email && (
                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                            <span>⚠</span> {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-semibold text-gray-700">Password *</label>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="flex items-center group gap-1 px-2 py-1 text-xs cursor-pointer text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors font-medium"
                                        >
                                            <span className='group-active:rotate-45 transition-all duration-300'>
                                                <IoDiceOutline size={14} />
                                            </span>
                                            Generate
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newUser.password}
                                            onChange={(e) => handleFieldChange('password', e.target.value)}
                                            onBlur={() => handleFieldBlur('password')}
                                            className={`w-full px-4 py-3 pr-12 border rounded-lg outline-none focus:ring-2 transition-colors ${
                                                errors.password && touched.password
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:ring-green-500'
                                            }`}
                                            placeholder="Minimum 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        >
                                            {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && touched.password ? (
                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                            <span>⚠</span> {errors.password}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Must contain: 8+ chars, uppercase, lowercase, number, special char
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewUser({ name: '', email: '', password: '' });
                                        setErrors({});
                                        setTouched({});
                                    }}
                                    className="flex-1 px-4 py-3 cursor-pointer border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    disabled={isSubmitting}
                                >
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    className={`flex-1 px-6 py-3 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </span>
                                    ) : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                    ) : (
                        /* Users List Tab */
                        <>
                            {/* Search Bar */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="relative">
                                    <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {/* Users List */}
                            <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading users...</p>
                            </div>
                        </div>
                    ) : fetchError ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-900 font-semibold mb-2">Failed to load users</p>
                            <p className="text-gray-500 text-sm mb-4">
                                There was an error loading the user list. Please try again.
                            </p>
                            <button
                                onClick={fetchUsers}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Retry
                            </button>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <IoShieldCheckmarkOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No users found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm ? `No results for "${searchTerm}"` : 'Add your first user to get started'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredUsers.map((user) => (
                                <div key={user._id} className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">{user.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <IoMailOutline size={14} />
                                                <span>{user.email}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                            className="opacity-0 group-hover:opacity-100 cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete user"
                                        >
                                            <IoTrashOutline size={18} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getAdminTypeBadge(user.adminType)}`}>
                                            {getAdminTypeDisplay(user.adminType)}
                                        </span>
                                        {user.state && (
                                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700">
                                                {user.state}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
