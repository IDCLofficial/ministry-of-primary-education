'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { IoMenu, IoClose } from 'react-icons/io5'
import {
    useToggle,
    useClickAway,
    useKey,
    useScrolling,
    useMedia,
    useLockBodyScroll,
} from 'react-use'
import { AnimatePresence, motion, type Variants } from 'framer-motion'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HeaderAction {
    key: string
    label: string
    /** Shorter label for tablet (md–lg). Falls back to `label` if omitted */
    shortLabel?: string
    icon: React.ReactNode
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    loading?: boolean
    loadingLabel?: string
    disabled?: boolean
    /** Hide completely on mobile — neither icon tray nor drawer menu. */
    hideOnMobile?: boolean
    /** Hide from the mobile icon tray only; still appears in the drawer menu. */
    hideOnMobileTray?: boolean
    /** Hide from the desktop action bar. */
    hideOnDesktop?: boolean
}

export interface PortalHeaderProps {
    logoSrc?: string
    logoAlt?: string
    title: string
    subtitle?: string
    actions: HeaderAction[]
    className?: string
}

// ─── Tailwind variant maps ────────────────────────────────────────────────────

const variantDesktop: Record<NonNullable<HeaderAction['variant']>, string> = {
    primary:   'text-white bg-green-600 hover:bg-green-700 border border-transparent font-semibold',
    secondary: 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200',
    ghost:     'text-gray-700 bg-white hover:bg-gray-50 border border-gray-200',
    danger:    'text-red-600 bg-white hover:bg-red-50 border border-red-200',
}

const variantMobileIcon: Record<NonNullable<HeaderAction['variant']>, string> = {
    primary:   'text-white bg-green-600 hover:bg-green-700',
    secondary: 'text-blue-700 bg-blue-50 hover:bg-blue-100',
    ghost:     'text-gray-600 hover:bg-gray-100',
    danger:    'text-red-600 hover:bg-red-50',
}

const variantDrawerRow: Record<NonNullable<HeaderAction['variant']>, string> = {
    primary:   'text-white bg-green-600 hover:bg-green-700',
    secondary: 'text-blue-700 bg-blue-50 hover:bg-blue-100',
    ghost:     'text-gray-700 hover:bg-gray-100',
    danger:    'text-red-600 hover:bg-red-50',
}

// ─── Framer Motion variants ───────────────────────────────────────────────────

/** Backdrop: simple opacity fade in & out */
const backdropVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1,  transition: { duration: 0.2, ease: 'easeOut' } },
    exit:    { opacity: 0,  transition: { duration: 0.18, ease: 'easeIn' } },
}

/**
 * Drawer panel: springs open from the top, collapses back up on exit.
 * `originY: 0` pins the transform origin to the top edge.
 */
const drawerPanelVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -12,
        scaleY: 0.94,
        originY: 0,
    },
    visible: {
        opacity: 1,
        y: 0,
        scaleY: 1,
        originY: 0,
        transition: {
            type: 'spring',
            stiffness: 340,
            damping: 28,
            // Stagger children (label + row container) after panel arrives
            staggerChildren: 0.04,
            delayChildren: 0.06,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        scaleY: 0.95,
        originY: 0,
        transition: {
            duration: 0.16,
            ease: 'easeIn',
            // Stagger children in reverse on exit
            staggerChildren: 0.03,
            staggerDirection: -1,
        },
    },
}

/** "Menu" label inside the drawer */
const labelVariants: Variants = {
    hidden:  { opacity: 0, y: -4 },
    visible: { opacity: 1, y: 0,  transition: { duration: 0.18 } },
    exit:    { opacity: 0, y: -4, transition: { duration: 0.1  } },
}

/**
 * Individual drawer rows.
 * Enter: slide in from left + fade.
 * Exit:  slide out to left + fade — staggered in reverse by parent.
 */
const rowVariants: Variants = {
    hidden:  { opacity: 0, x: -14 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 380, damping: 26 },
    },
    exit: {
        opacity: 0,
        x: -10,
        transition: { duration: 0.1, ease: 'easeIn' },
    },
}

/** Menu icon: rotates + scales between ☰ and ✕ */
const menuIconVariants: Variants = {
    enter: (open: boolean) => ({
        rotate: 0, opacity: 1, scale: 1,
        transition: { type: 'spring', stiffness: 400, damping: 22 },
    }),
    exit: (open: boolean) => ({
        rotate: open ? -90 : 90,
        opacity: 0,
        scale: 0.6,
        transition: { duration: 0.12 },
    }),
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const Spinner = ({ className }: { className?: string }) => (
    <div
        className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className ?? 'h-4 w-4'}`}
    />
)

// ─── Component ───────────────────────────────────────────────────────────────

export default function PortalHeader({
    logoSrc = '/images/ministry-logo.png',
    logoAlt = 'Logo',
    title,
    subtitle,
    actions,
    className = '',
}: PortalHeaderProps) {

    // ── react-use ─────────────────────────────────────────────────────────────
    const [drawerOpen, toggleDrawer] = useToggle(false)
    const isMobile   = useMedia('(max-width: 639px)', false)
    const containerRef = useRef<HTMLDivElement>(null)
    const headerRef    = useRef<HTMLElement>(null)
    const isScrolling  = useScrolling(headerRef as React.RefObject<HTMLElement>)

    useClickAway(containerRef, () => { if (drawerOpen) toggleDrawer(false) })
    useKey('Escape',            () => { if (drawerOpen) toggleDrawer(false) })
    useLockBodyScroll(drawerOpen && isMobile)

    // ── Derived action lists ───────────────────────────────────────────────────
    const desktopActions = actions.filter(a => !a.hideOnDesktop)
    // Drawer menu shows everything except fully-hidden-on-mobile
    const menuActions    = actions.filter(a => !a.hideOnMobile)
    // Icon tray also excludes tray-hidden actions
    const trayActions    = menuActions.filter(a => !a.hideOnMobileTray)

    // ── Render: desktop button ────────────────────────────────────────────────
    const renderDesktopButton = (action: HeaderAction) => {
        const variant   = action.variant ?? 'ghost'
        const isLoading = action.loading ?? false

        return (
            <button
                key={action.key}
                onClick={action.onClick}
                disabled={action.disabled || isLoading}
                className={[
                    'inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl',
                    'transition-all duration-150 cursor-pointer',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variantDesktop[variant],
                ].join(' ')}
            >
                {isLoading ? (
                    <>
                        <Spinner />
                        {action.loadingLabel && (
                            <span className="hidden md:inline">{action.loadingLabel}</span>
                        )}
                    </>
                ) : (
                    <>
                        {action.icon}
                        {action.shortLabel ? (
                            <>
                                <span className="hidden md:inline lg:hidden">{action.shortLabel}</span>
                                <span className="hidden lg:inline">{action.label}</span>
                            </>
                        ) : (
                            <span className="hidden md:inline">{action.label}</span>
                        )}
                    </>
                )}
            </button>
        )
    }

    // ── Render: mobile icon tray button ───────────────────────────────────────
    const renderTrayButton = (action: HeaderAction) => {
        const variant   = action.variant ?? 'ghost'
        const isLoading = action.loading ?? false

        return (
            <button
                key={action.key}
                onClick={action.onClick}
                disabled={action.disabled || isLoading}
                aria-label={action.label}
                className={[
                    'flex items-center justify-center w-9 h-9 rounded-xl',
                    'transition-colors duration-150 cursor-pointer',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variantMobileIcon[variant],
                ].join(' ')}
            >
                {isLoading ? <Spinner className="h-4 w-4" /> : action.icon}
            </button>
        )
    }

    // ── Render: animated drawer row ───────────────────────────────────────────
    const renderDrawerRow = (action: HeaderAction) => {
        const variant   = action.variant ?? 'ghost'
        const isLoading = action.loading ?? false

        return (
            <motion.button
                key={action.key}
                variants={rowVariants}
                // Each row gets its own whileTap for tactile feedback
                whileTap={{ scale: 0.98, x: 2 }}
                onClick={() => { toggleDrawer(false); action.onClick() }}
                disabled={action.disabled || isLoading}
                className={[
                    'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl',
                    'cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                    variantDrawerRow[variant],
                ].join(' ')}
            >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {isLoading ? <Spinner /> : action.icon}
                </span>
                <span>
                    {isLoading && action.loadingLabel ? action.loadingLabel : action.label}
                </span>
            </motion.button>
        )
    }

    return (
        // containerRef spans header + drawer so useClickAway covers both
        <div ref={containerRef} className="relative z-50 print:hidden">

            {/* ── Header bar ─────────────────────────────────────────────── */}
            <motion.header
                ref={headerRef}
                animate={{
                    boxShadow: isScrolling
                        ? '0 4px 16px rgba(0,0,0,0.08)'
                        : '0 0px 0px rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.25 }}
                className={['bg-white border-b border-gray-100 sticky top-0', className].join(' ')}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">

                    {/* Logo + Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {logoSrc && (
                            <Image
                                src={logoSrc}
                                width={40}
                                height={40}
                                alt={logoAlt}
                                className="h-10 w-auto object-contain flex-shrink-0"
                            />
                        )}
                        <div className="border-l border-gray-200 pl-3 min-w-0">
                            <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
                            {subtitle && (
                                <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    {/* Desktop actions (sm+) */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        {desktopActions.map(renderDesktopButton)}
                    </div>

                    {/* Mobile: icon tray + animated menu trigger */}
                    <div className="flex sm:hidden items-center gap-1 flex-shrink-0">
                        {trayActions.map(renderTrayButton)}

                        <button
                            onClick={() => toggleDrawer()}
                            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={drawerOpen}
                            aria-haspopup="true"
                            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-700 bg-white border border-gray-200 ml-1 overflow-hidden cursor-pointer"
                        >
                            {/* AnimatePresence swaps ☰ ↔ ✕ with rotate + scale */}
                            <AnimatePresence mode="sync" initial={false}>
                                <motion.span
                                    key={drawerOpen ? 'close' : 'open'}
                                    initial={{ rotate: drawerOpen ? -90 : 90, opacity: 0, scale: 0.5 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    exit={{   rotate: drawerOpen ? 90 : -90, opacity: 0, scale: 0.5 }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                                    className="flex items-center justify-center absolute"
                                >
                                    {drawerOpen
                                        ? <IoClose className="w-5 h-5" />
                                        : <IoMenu  className="w-5 h-5" />
                                    }
                                </motion.span>
                            </AnimatePresence>
                        </button>
                    </div>

                </div>
            </motion.header>

            {/* ── Animated mobile drawer ──────────────────────────────────── */}
            <AnimatePresence>
                {isMobile && drawerOpen && (
                    <>
                        {/* Backdrop — fades independently of the panel */}
                        <motion.div
                            key="drawer-backdrop"
                            variants={backdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed inset-0 bg-black/25 backdrop-blur-[2px]"
                            style={{ zIndex: -1 }}
                            onClick={toggleDrawer}
                        />

                        {/* Panel — springs down; propagates variants to children for stagger */}
                        <motion.div
                            key="drawer-panel"
                            variants={drawerPanelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute top-full left-0 right-0 bg-white shadow-xl border-b border-gray-100 px-3 py-3 overflow-hidden rounded-b-3xl"
                        >
                            {/* Section label — fades in after panel */}
                            <motion.p
                                variants={labelVariants}
                                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-2 select-none"
                            >
                                Menu
                            </motion.p>

                            {/* Row list — each row inherits rowVariants via propagation */}
                            <div className="space-y-1">
                                {menuActions.map(renderDrawerRow)}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    )
}