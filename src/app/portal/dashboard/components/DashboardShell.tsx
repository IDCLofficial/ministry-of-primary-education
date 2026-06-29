'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { IoSchoolOutline, IoReceiptOutline, IoMenu, IoClose } from 'react-icons/io5'

type DashboardView = 'schools' | 'transactions'

const NAV_ITEMS: { key: DashboardView; label: string; href: string; icon: React.ReactNode }[] = [
  { key: 'schools', label: 'Schools', href: '/portal/dashboard', icon: <IoSchoolOutline className="w-5 h-5" /> },
  { key: 'transactions', label: 'Transaction History', href: '/portal/dashboard/transactions', icon: <IoReceiptOutline className="w-5 h-5" /> },
]

export default function DashboardShell({
  active,
  children,
}: {
  active: DashboardView
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {NAV_ITEMS.map(item => (
        <Link
          key={item.key}
          href={item.href}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            active === item.key
              ? 'bg-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  )

  return (
    <div className="flex gap-4">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-3">
          <NavLinks />
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-green-600 text-white rounded-full shadow-lg"
        aria-label="Open menu"
      >
        <IoMenu className="w-6 h-6" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white z-50 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <IoClose className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
