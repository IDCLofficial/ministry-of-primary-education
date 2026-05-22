'use client'
import { useState, useEffect } from 'react'
import { IoClose, IoLogoWhatsapp } from 'react-icons/io5'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SessionStore } from '@/app/result-checking/utils/secureStorage'

interface DetailsCheckBannerProps {
  examNo: string
  studentName?: string
  school?: string
  examYear?: string
  context: 'paywall' | 'dashboard' | 'retrieval'
  onDismiss?: () => void
}

export default function DetailsCheckBanner({ examNo, studentName, school, examYear: examYearProp, context, onDismiss }: DetailsCheckBannerProps) {
  const [open, setOpen] = useState(false)
  const [examYear, setExamYear] = useState(examYearProp || '')
  const [message, setMessage] = useState('')
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348123456789'

  useEffect(() => {
    const key = `details_check_dismissed_${context}_${examNo}`
    const stored = localStorage.getItem(key)
    if (!stored) setOpen(true)
  }, [examNo, context])

  useEffect(() => {
    if (examYearProp) {
      setExamYear(examYearProp)
    } else {
      SessionStore.get('student_exam_year').then((year) => {
        if (year) setExamYear(year)
      })
    }
  }, [examYearProp])

  const handleDismiss = () => {
    const key = `details_check_dismissed_${context}_${examNo}`
    localStorage.setItem(key, 'true')
    setOpen(false)
    onDismiss?.()
  }

  if (!open) return null

  const whatsappText = encodeURIComponent(
    `Hello, I noticed an issue with my details on the result-checking portal.\n\n${message ? `Issue: ${message}\n\n` : ''}Name: ${studentName || '—'}\nSchool: ${school || '—'}\nExam No: ${examNo}\nYear: ${examYear || '—'}`
  )

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${whatsappText}`

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Check Your Details</DialogTitle>
          <DialogDescription>
            Please review the details below. If anything is incorrect, let us know via WhatsApp and we&apos;ll help fix it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900 capitalize text-right max-w-[60%]">
              {studentName?.toLowerCase() || '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">School</span>
            <span className="font-medium text-gray-900 capitalize text-right max-w-[60%]">
              {school?.toLowerCase() || '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Exam Number</span>
            <span className="font-mono text-xs font-medium text-gray-900 uppercase">
              {examNo}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Year</span>
            <span className="font-medium text-gray-900">{examYear || '—'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Describe the issue <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. My name is misspelt, the school name is wrong..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
          />
        </div>

        <DialogFooter className="sm:justify-between gap-3">
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 flex-1 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Proceed to Dashboard
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm"
          >
            <IoLogoWhatsapp className="w-4 h-4" />
            Reach Out via WhatsApp
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
