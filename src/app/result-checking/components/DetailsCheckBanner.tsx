'use client'
import { useState, useEffect } from 'react'
import { IoClose, IoAlertCircle } from 'react-icons/io5'
import { updateSearchParam } from '@/lib'

interface DetailsCheckBannerProps {
  examNo: string
}

export default function DetailsCheckBanner({ examNo }: DetailsCheckBannerProps) {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const key = `details_check_dismissed_${examNo}`
    const stored = localStorage.getItem(key)
    if (!stored) setDismissed(false)
  }, [examNo])

  if (dismissed) return null

  const handleDismiss = () => {
    const key = `details_check_dismissed_${examNo}`
    localStorage.setItem(key, 'true')
    setDismissed(true)
  }

  const handleReachOut = () => {
    updateSearchParam('contacting-support', 'true')
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-amber-400 hover:text-amber-600 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <IoClose className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <IoAlertCircle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 mb-1">
            Check your details
          </p>
          <p className="text-xs text-amber-700 leading-relaxed mb-3">
            Take a moment to verify that your name, school, and exam number above are correct. If anything is misspelt or incorrect, please reach out to our support team.
          </p>
          <button
            onClick={handleReachOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
          >
            <IoAlertCircle className="w-3.5 h-3.5" />
            Reach Out to Support
          </button>
        </div>
      </div>
    </div>
  )
}
