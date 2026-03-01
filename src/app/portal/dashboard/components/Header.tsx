'use client'

import React, { useRef, useState } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import Image from 'next/image'
import HeaderSkeleton from './HeaderSkeleton'
import ChangePasswordModal from './ChangePasswordModal'
import DeleteAccountModal from './DeleteAccountModal'
import { useClickAway } from 'react-use'

// ─── Icons ───────────────────────────────────────────────────────────────────

const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
)

const KeyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
)

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
)

const LogoutIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg
        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
)

const MenuIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
)

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)

// ─── Subcomponents ────────────────────────────────────────────────────────────

function Avatar({ email }: { email: string }) {
    const initials = email.slice(0, 2).toUpperCase()
    return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold shrink-0 select-none">
            {initials}
        </div>
    )
}

interface DropdownMenuProps {
    email: string
    lga: string
    schoolCount: number
    onChangePassword: () => void
    onDeleteAccount: () => void
    onLogout: () => void
}

function DropdownMenu({ email, lga, schoolCount, onChangePassword, onDeleteAccount, onLogout }: DropdownMenuProps) {
    return (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in">
            {/* Profile summary */}
            <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <Avatar email={email} />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{email}</p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{lga} LGA &middot; {schoolCount} schools</p>
                    </div>
                </div>
            </div>

            <div className="py-1">
                <button onClick={onChangePassword} className="menu-item group">
                    <span className="menu-icon text-gray-500 group-hover:text-green-600"><KeyIcon /></span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Change Password</p>
                        <p className="text-xs text-gray-400">Update your password</p>
                    </div>
                </button>

                <button onClick={onDeleteAccount} className="menu-item group">
                    <span className="menu-icon text-red-400 group-hover:text-red-600"><TrashIcon /></span>
                    <div>
                        <p className="text-sm font-medium text-red-500">Delete Account</p>
                        <p className="text-xs text-red-400">Permanently remove account</p>
                    </div>
                </button>
            </div>

            <div className="border-t border-gray-100 pt-1">
                <button onClick={onLogout} className="menu-item group">
                    <span className="menu-icon text-gray-500 group-hover:text-gray-800"><LogoutIcon /></span>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Logout</p>
                        <p className="text-xs text-gray-400">Sign out of your account</p>
                    </div>
                </button>
            </div>
        </div>
    )
}

// Mobile bottom drawer menu
interface MobileDrawerProps extends DropdownMenuProps {
    onClose: () => void
}

function MobileDrawer({ email, lga, schoolCount, onChangePassword, onDeleteAccount, onLogout, onClose }: MobileDrawerProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl pb-safe drawer-slide-up">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                {/* Profile summary */}
                <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Avatar email={email} />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{email}</p>
                            <p className="text-xs text-gray-500 capitalize mt-0.5">{lga} LGA &middot; {schoolCount} schools</p>
                        </div>
                    </div>
                </div>

                <div className="px-3 py-2 space-y-0.5">
                    <button onClick={onChangePassword} className="mobile-menu-item group">
                        <span className="mobile-menu-icon text-gray-500 group-hover:text-green-600 bg-gray-100 group-hover:bg-green-50">
                            <KeyIcon />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Change Password</p>
                            <p className="text-xs text-gray-400">Update your password</p>
                        </div>
                    </button>

                    <button onClick={onDeleteAccount} className="mobile-menu-item group">
                        <span className="mobile-menu-icon text-red-400 bg-red-50">
                            <TrashIcon />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-red-500">Delete Account</p>
                            <p className="text-xs text-red-400">Permanently remove account</p>
                        </div>
                    </button>
                </div>

                <div className="px-3 pb-4 pt-1 border-t border-gray-100 mt-1">
                    <button onClick={onLogout} className="mobile-menu-item group w-full">
                        <span className="mobile-menu-icon text-gray-500 group-hover:text-gray-800 bg-gray-100 group-hover:bg-gray-200">
                            <LogoutIcon />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Logout</p>
                            <p className="text-xs text-gray-400">Sign out of your account</p>
                        </div>
                    </button>
                </div>
            </div>
        </>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Header({ schoolCount }: { schoolCount: number }) {
    const { school, logout, isLoading } = useAuth()
    const [showDesktopMenu, setShowDesktopMenu] = useState(false)
    const [showMobileDrawer, setShowMobileDrawer] = useState(false)
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

    const desktopMenuRef = useRef<HTMLDivElement>(null)
    useClickAway(desktopMenuRef, () => setShowDesktopMenu(false))

    if (isLoading) return <HeaderSkeleton />

    const handleChangePassword = () => {
        setShowDesktopMenu(false)
        setShowMobileDrawer(false)
        setShowChangePasswordModal(true)
    }

    const handleDeleteAccount = () => {
        setShowDesktopMenu(false)
        setShowMobileDrawer(false)
        setShowDeleteAccountModal(true)
    }

    const handleLogout = () => {
        setShowDesktopMenu(false)
        setShowMobileDrawer(false)
        logout()
    }

    const menuProps = {
        email: school?.email ?? '',
        lga: school?.lga ?? '',
        schoolCount,
        onChangePassword: handleChangePassword,
        onDeleteAccount: handleDeleteAccount,
        onLogout: handleLogout,
    }

    return (
        <>
            <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-in        { animation: fadeInDown 0.15s ease both; }
        .drawer-slide-up   { animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1) both; }
        .menu-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 8px 16px;
          text-align: left; transition: background 0.15s;
          border-radius: 6px;
        }
        .menu-item:hover    { background: #f9fafb; }
        .menu-icon          { display:flex; align-items:center; justify-content:center; transition: color 0.15s; }
        .mobile-menu-item {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 10px 8px;
          text-align: left; border-radius: 10px; transition: background 0.15s;
        }
        .mobile-menu-item:hover { background: #f9fafb; }
        .mobile-menu-icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 10px; shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .pb-safe { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
      `}</style>

            <header className="sticky top-2 sm:top-4 z-50 mx-2 sm:mx-0">
                <div className="bg-white/70 backdrop-blur-xl border border-black/[0.08] rounded-xl shadow-lg shadow-black/[0.06] px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">

                    {/* ── Logo + Name ── */}
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0">
                            <Image
                                src="/images/ministry-logo.png"
                                alt="MOPSE logo"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        {/* Mobile: abbreviation only */}
                        <span className="sm:hidden text-sm font-extrabold text-gray-900 tracking-tight">
                            <abbr title="Imo State Ministry of Primary and Secondary Education" className="no-underline">
                                MOPSE
                            </abbr>
                        </span>
                        {/* Tablet: short form */}
                        <span className="hidden sm:block lg:hidden text-sm font-extrabold text-gray-900 tracking-tight whitespace-nowrap">
                            <abbr title="Imo State Ministry of Primary and Secondary Education" className="no-underline">
                                MOPSE
                            </abbr>
                        </span>
                        {/* Desktop: full name */}
                        <span className="hidden lg:block text-sm font-extrabold text-gray-900 tracking-tight leading-tight">
                            Imo State Ministry of Primary and Secondary Education
                        </span>
                    </div>

                    {/* ── Right side ── */}
                    {school && (
                        <div className="flex items-center gap-2 shrink-0">
                            {/* ── Desktop dropdown trigger (md+) ── */}
                            <div className="relative hidden md:block" ref={desktopMenuRef}>
                                <button
                                    onClick={() => setShowDesktopMenu(v => !v)}
                                    aria-haspopup="true"
                                    aria-expanded={showDesktopMenu}
                                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="text-right leading-tight">
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs font-semibold text-gray-800 max-w-[160px] truncate">{school.email}</p>
                                            <ChevronIcon open={showDesktopMenu} />
                                        </div>
                                        <p className="text-[11px] text-gray-400 capitalize">AEE: {school.lga}</p>
                                    </div>
                                    <Avatar email={school.email} />
                                </button>

                                {showDesktopMenu && <DropdownMenu {...menuProps} />}
                            </div>

                            {/* ── Mobile/tablet avatar + hamburger (< md) ── */}
                            <div className="flex items-center gap-1.5 md:hidden">
                                {/* Email pill — visible on sm only */}
                                <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
                                    <p className="text-xs font-semibold text-gray-800 max-w-[140px] truncate">{school.email}</p>
                                    <p className="text-[11px] text-gray-400 capitalize">AEE: {school.lga}</p>
                                </div>

                                <button
                                    onClick={() => setShowMobileDrawer(true)}
                                    aria-label="Open account menu"
                                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                                >
                                    <Avatar email={school.email} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile bottom drawer */}
            {showMobileDrawer && (
                <MobileDrawer {...menuProps} onClose={() => setShowMobileDrawer(false)} />
            )}

            {/* Modals */}
            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />
            <DeleteAccountModal
                isOpen={showDeleteAccountModal}
                onClose={() => setShowDeleteAccountModal(false)}
                userEmail={school?.email ?? ''}
            />
        </>
    )
}