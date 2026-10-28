'use client'
import { useState, useEffect } from 'react'
import { IoCheckmarkCircle, IoSchoolOutline } from 'react-icons/io5'
import { MessageCircle, Pencil, ChevronRight, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SessionStore } from '@/app/result-checking/utils/secureStorage'
import { ExamTypeEnum } from '@/app/portal/store/api/authApi'
import { classifyNameEdit, isSimpleNameEdit } from '@/app/result-checking/data/nameEditClassifier'
import { buildWhatsappHref } from '@/app/result-checking/data/whatsapp'

interface DetailsCheckBannerProps {
  examNo: string
  studentId?: string
  studentName?: string
  school?: string
  examYear?: string
  examType: ExamTypeEnum
  context: 'paywall' | 'dashboard' | 'retrieval'
  onDismiss?: () => void
}

type NameFixStep = 'closed' | 'editing' | 'confirm' | 'applied' | 'needs-review'

export default function DetailsCheckBanner({ examNo, studentId, studentName, school, examYear: examYearProp, examType, context, onDismiss }: DetailsCheckBannerProps) {
  const [open, setOpen] = useState(false)
  const [examYear, setExamYear] = useState(examYearProp || '')

  const [nameFixStep, setNameFixStep] = useState<NameFixStep>('closed')
  const [newName, setNewName] = useState('')
  const [currentDisplayName, setCurrentDisplayName] = useState(studentName || '')
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  const [otherIssueOpen, setOtherIssueOpen] = useState(false)
  const [otherIssueText, setOtherIssueText] = useState('')

  useEffect(() => {
    setOpen(true)
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

  useEffect(() => {
    setCurrentDisplayName(studentName || '')
  }, [studentName])

  const handleDismiss = () => {
    setOpen(false)
    onDismiss?.()
  }

  if (!open) return null

  const startNameFix = () => {
    setNewName('')
    setApplyError(null)
    setNameFixStep('editing')
  }

  const handleCheckName = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const classification = classifyNameEdit(currentDisplayName, trimmed)
    if (classification === 'identical') {
      setApplyError("That's the same name already on record.")
      return
    }
    setApplyError(null)
    setNameFixStep(isSimpleNameEdit(classification) ? 'confirm' : 'needs-review')
  }

  const handleConfirmApply = async () => {
    if (!studentId) {
      setApplyError('Missing student reference — please use the WhatsApp option below instead.')
      return
    }
    setApplying(true)
    setApplyError(null)
    try {
      const res = await fetch('/api/name-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, examType, currentName: currentDisplayName, newName: newName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 422) {
          setNameFixStep('needs-review')
        } else {
          setApplyError(data?.error || 'That failed — please try again.')
        }
        return
      }
      setCurrentDisplayName(data.updatedName)
      setNameFixStep('applied')
    } catch {
      setApplyError("Couldn't reach the server — please try again.")
    } finally {
      setApplying(false)
    }
  }

  const nameChangeWhatsappHref = buildWhatsappHref([
    `Hi, I need my name corrected on my ${examType} result.`,
    `Exam number: ${examNo}`,
    `Current name on record: ${currentDisplayName}`,
    `Should be: ${newName.trim()}`,
  ])

  const otherIssueWhatsappHref = buildWhatsappHref([
    `Hi, I have an issue with my ${examType} result.`,
    `Exam number: ${examNo}`,
    `Name on record: ${currentDisplayName}`,
    `School on record: ${school || '—'}`,
    otherIssueText.trim() ? `Issue: ${otherIssueText.trim()}` : `Issue: (not described)`,
  ])

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Check Your Details</DialogTitle>
          <DialogDescription>
            Make sure everything below is correct before you continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-700">
            Your name is <span className="font-semibold text-gray-900 capitalize">{currentDisplayName?.toLowerCase() || '—'}</span>
          </p>
          <p className="text-sm text-gray-700">
            Your school is <span className="font-semibold text-gray-900 capitalize">{school?.toLowerCase() || '—'}</span>
          </p>
          <div className="flex items-center gap-4 pt-1 text-xs text-gray-500">
            <span className="font-mono uppercase">{examNo}</span>
            <span>{examYear || '—'}</span>
          </div>
        </div>

        {/* ── Card A: Name correction ── */}
        <div className="rounded-xl border border-green-200 bg-green-50/60 overflow-hidden">
          {nameFixStep === 'closed' && (
            <button
              onClick={startNameFix}
              disabled={!studentId}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-green-50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-600 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Is there a mistake in your name?</p>
                <p className="text-xs text-gray-600 mt-0.5 font-semibold">Click here to correct it instantly.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
          )}

          {nameFixStep === 'editing' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-green-700" />
                <p className="text-sm font-semibold text-gray-900">Fix your name</p>
              </div>

              <div className="bg-white border border-green-200 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-medium text-gray-700">We can fix this instantly if it's one of these:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li><span className="font-medium text-gray-800">Reordered</span> — e.g. OBI COLLINS CHIDI → CHIDI OBI COLLINS</li>
                  <li><span className="font-medium text-gray-800">Typo</span> — e.g. JOHN MICHEAL → JOHN MICHAEL</li>
                  <li><span className="font-medium text-gray-800">Shortened</span> — e.g. SUNDAY AKU → SUNDAY AKUCHUKWU</li>
                </ul>
                <p className="text-xs text-gray-500 pt-0.5">Anything else — like swapping a name entirely — will need manual review.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Your correct name</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={currentDisplayName}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
                />
              </div>
              {applyError && <p className="text-xs text-red-600">{applyError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setNameFixStep('closed')} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleCheckName} disabled={!newName.trim()} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  Check my name
                </button>
              </div>
            </div>
          )}

          {nameFixStep === 'confirm' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-green-700" />
                <p className="text-sm font-semibold text-gray-900">Confirm the change</p>
              </div>
              <div className="bg-white border border-green-200 rounded-lg p-3 space-y-1 text-sm">
                <p className="text-gray-500 text-xs">From</p>
                <p className="font-medium text-gray-900 capitalize">{currentDisplayName.toLowerCase()}</p>
                <p className="text-gray-500 text-xs pt-1">To</p>
                <p className="font-medium text-green-700 capitalize">{newName.trim().toLowerCase()}</p>
              </div>
              {applyError && <p className="text-xs text-red-600">{applyError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setNameFixStep('editing')} disabled={applying} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  Back
                </button>
                <button onClick={handleConfirmApply} disabled={applying} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  {applying ? 'Applying…' : 'Yes, update my name'}
                </button>
              </div>
            </div>
          )}

          {nameFixStep === 'applied' && (
            <div className="p-4 flex items-center gap-2 text-sm text-green-700">
              <IoCheckmarkCircle className="w-5 h-5 flex-shrink-0" />
              <span>Done! Your name is now <span className="font-semibold capitalize">{currentDisplayName.toLowerCase()}</span>.</span>
            </div>
          )}

          {nameFixStep === 'needs-review' && (
            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-green-700" />
                <p className="text-sm font-semibold text-gray-900">This needs a closer look</p>
              </div>
              <p className="text-xs text-gray-600">
                That change is bigger than a typo, reorder, or completion, so we can't apply it automatically — our team will need to verify it with you directly.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setNameFixStep('editing')} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  Back
                </button>
                <a
                  href={nameChangeWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#25D366] hover:bg-[#1fb855] text-white transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Request this change on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── Card B: Everything else ── */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {!otherIssueOpen ? (
            <button
              onClick={() => setOtherIssueOpen(true)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                <IoSchoolOutline className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Wrong school, or something else?</p>
                <p className="text-xs text-gray-600 mt-0.5">For school-name errors or anything beyond a simple name fix, send our team a WhatsApp request.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
          ) : (
            <div className="p-4 space-y-3">
              <button onClick={() => setOtherIssueOpen(false)} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Describe the issue <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={otherIssueText}
                  onChange={(e) => setOtherIssueText(e.target.value)}
                  placeholder="e.g. My school name is spelt wrong..."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
                />
              </div>
              <a
                href={otherIssueWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#25D366] hover:bg-[#1fb855] text-white transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Send Request via WhatsApp
              </a>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 w-full text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer shadow-sm"
          >
            My details are correct, proceed to dashboard
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
