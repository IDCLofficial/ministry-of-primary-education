'use client'
import { useEffect, useState } from 'react'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { MessageCircle, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExamTypeEnum } from '@/app/portal/store/api/authApi'
import { classifyNameEdit, isSimpleNameEdit } from '@/app/result-checking/data/nameEditClassifier'
import { buildWhatsappHref } from '@/app/result-checking/data/whatsapp'

interface NameCorrectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  examType: ExamTypeEnum
  examNo?: string
  currentName: string
  /** Called with the new name once a correction is successfully applied. */
  onUpdated?: (newName: string) => void
}

type Step = 'editing' | 'confirm' | 'applied' | 'needs-review'

/**
 * Same self-service name-correction flow as the "Fix my name" card in
 * DetailsCheckBanner, packaged as a standalone dialog so it can be
 * triggered from a per-row action (e.g. the bulk-payment review list)
 * instead of living inside the "Check Your Details" screen.
 */
export default function NameCorrectionDialog({ open, onOpenChange, studentId, examType, examNo, currentName, onUpdated }: NameCorrectionDialogProps) {
  const [step, setStep] = useState<Step>('editing')
  const [newName, setNewName] = useState('')
  const [displayName, setDisplayName] = useState(currentName)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setStep('editing')
      setNewName('')
      setDisplayName(currentName)
      setApplyError(null)
    }
  }, [open, currentName])

  const handleCheckName = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const classification = classifyNameEdit(displayName, trimmed)
    if (classification === 'identical') {
      setApplyError("That's the same name already on record.")
      return
    }
    setApplyError(null)
    setStep(isSimpleNameEdit(classification) ? 'confirm' : 'needs-review')
  }

  const handleConfirmApply = async () => {
    setApplying(true)
    setApplyError(null)
    try {
      const res = await fetch('/api/name-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, examType, currentName: displayName, newName: newName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 422) {
          setStep('needs-review')
        } else {
          setApplyError(data?.error || 'That failed — please try again.')
        }
        return
      }
      setDisplayName(data.updatedName)
      setStep('applied')
      onUpdated?.(data.updatedName)
    } catch {
      setApplyError("Couldn't reach the server — please try again.")
    } finally {
      setApplying(false)
    }
  }

  const whatsappHref = buildWhatsappHref([
    `Hi, I need a student's name corrected on their ${examType} result.`,
    examNo ? `Exam number: ${examNo}` : undefined,
    `Current name on record: ${displayName}`,
    `Should be: ${newName.trim()}`,
  ].filter((l): l is string => Boolean(l)))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Pencil className="w-4 h-4 text-green-700" />
            Fix name
          </DialogTitle>
          <DialogDescription>
            Currently on record: <span className="font-medium text-gray-900 capitalize">{displayName.toLowerCase()}</span>
          </DialogDescription>
        </DialogHeader>

        {step === 'editing' && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium text-gray-700">We can fix this instantly if it's one of these:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><span className="font-medium text-gray-800">Reordered</span> — e.g. OBI COLLINS CHIDI → CHIDI OBI COLLINS</li>
                <li><span className="font-medium text-gray-800">Typo</span> — e.g. JOHN MICHEAL → JOHN MICHAEL</li>
                <li><span className="font-medium text-gray-800">Shortened</span> — e.g. SUNDAY AKU → SUNDAY AKUCHUKWU</li>
              </ul>
              <p className="text-xs text-gray-500 pt-0.5">Anything else — like swapping a name entirely — will need manual review.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Correct name</label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={displayName}
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
              />
            </div>
            {applyError && <p className="text-xs text-red-600">{applyError}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => onOpenChange(false)} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleCheckName} disabled={!newName.trim()} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Check name
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1 text-sm">
              <p className="text-gray-500 text-xs">From</p>
              <p className="font-medium text-gray-900 capitalize">{displayName.toLowerCase()}</p>
              <p className="text-gray-500 text-xs pt-1">To</p>
              <p className="font-medium text-green-700 capitalize">{newName.trim().toLowerCase()}</p>
            </div>
            {applyError && <p className="text-xs text-red-600">{applyError}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStep('editing')} disabled={applying} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                Back
              </button>
              <button onClick={handleConfirmApply} disabled={applying} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {applying ? 'Applying…' : 'Yes, update name'}
              </button>
            </div>
          </div>
        )}

        {step === 'applied' && (
          <div className="flex items-center gap-2 text-sm text-green-700 py-1">
            <IoCheckmarkCircle className="w-5 h-5 flex-shrink-0" />
            <span>Done! Name is now <span className="font-semibold capitalize">{displayName.toLowerCase()}</span>.</span>
          </div>
        )}

        {step === 'needs-review' && (
          <div className="space-y-2.5">
            <p className="text-xs text-gray-600">
              That change is bigger than a typo, reorder, or completion, so it can't be applied automatically — our team will need to verify it directly.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStep('editing')} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                Back
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#25D366] hover:bg-[#1fb855] text-white transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Request on WhatsApp
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
