'use client'

import React, { useState, useEffect } from 'react'
import { useCreateStudentPaymentMutation, ExamTypeEnum, SchoolByCodeResponse } from '../../store/api/authApi'
import toast from 'react-hot-toast'
import { setSecureItem } from '@/app/result-checking/utils/secureStorage'

// ─── Maintenance Config ────────────────────────────────────────────────────
if (process.env.NEXT_PUBLIC_MODE === undefined){
  throw new Error("Missing important variable: NEXT_PUBLIC_MODE") 
}

const PAYMENT_MAINTENANCE_MODE = false;

const MAINTENANCE_ETA: string | null = null;

// ─── MaintenanceOverlay ────────────────────────────────────────────────────
function MaintenanceOverlay({ onClose }: { onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState<{ h: string; m: string; s: string } | null>(null)
  const [dotCount, setDotCount] = useState(0)

  // Countdown timer
  useEffect(() => {
    if (!MAINTENANCE_ETA) return
    const tick = () => {
      const diff = new Date(MAINTENANCE_ETA).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft(null); return }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      setTimeLeft({ h, m, s })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Animated dots
  useEffect(() => {
    const id = setInterval(() => setDotCount(d => (d + 1) % 4), 500)
    return () => clearInterval(id)
  }, []);

  const dots = '.'.repeat(dotCount)

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="maintenance-card bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        {/* ── Header strip ── */}
        <div className="hex-grid px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="status-dot" />
            <span className="text-xs font-semibold tracking-widest text-orange-600 uppercase">System Maintenance</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100 cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Icon ── */}
        <div className="flex flex-col items-center pt-8 pb-2 px-6">
          <div className="relative mb-6">
            {/* Outer pulse ring */}
            <div className="pulse-ring absolute inset-0 rounded-full bg-green-200" style={{ margin: '-10px' }} />
            {/* Outer gear */}
            <svg className="spin-slow w-20 h-20 text-green-100" viewBox="0 0 64 64" fill="currentColor">
              <path d="M54.5 36.8l-3.8-.6c-.3-1.1-.7-2.2-1.3-3.2l2.2-3.1a1 1 0 00-.1-1.3l-4.1-4.1a1 1 0 00-1.3-.1l-3.1 2.2c-1-.6-2.1-1-3.2-1.3l-.6-3.8A1 1 0 0038.2 20h-5.8a1 1 0 00-1 .8l-.6 3.8c-1.1.3-2.2.7-3.2 1.3l-3.1-2.2a1 1 0 00-1.3.1l-4.1 4.1a1 1 0 00-.1 1.3l2.2 3.1c-.6 1-1 2.1-1.3 3.2l-3.8.6a1 1 0 00-.8 1v5.8a1 1 0 00.8 1l3.8.6c.3 1.1.7 2.2 1.3 3.2l-2.2 3.1a1 1 0 00.1 1.3l4.1 4.1a1 1 0 001.3.1l3.1-2.2c1 .6 2.1 1 3.2 1.3l.6 3.8a1 1 0 001 .8h5.8a1 1 0 001-.8l.6-3.8c1.1-.3 2.2-.7 3.2-1.3l3.1 2.2a1 1 0 001.3-.1l4.1-4.1a1 1 0 00.1-1.3l-2.2-3.1c.6-1 1-2.1 1.3-3.2l3.8-.6a1 1 0 00.8-1v-5.8a1 1 0 00-.8-1z" />
            </svg>
            {/* Inner gear */}
            <div className="float-icon absolute inset-0 flex items-center justify-center">
              <svg className="spin-rev w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Payment Unavailable</h2>
          <p className="text-sm text-gray-500 mb-5 text-center leading-relaxed max-w-xs">
            Our payment system is currently undergoing scheduled maintenance to improve your experience.
          </p>

          {/* ETA countdown */}
          {MAINTENANCE_ETA && timeLeft && (
            <div className="w-full mb-5 p-3 rounded-xl border border-dashed border-green-200 bg-green-50/60">
              <p className="text-xs text-center text-green-800 font-medium mb-2">Estimated time remaining</p>
              <div className="flex justify-center gap-3">
                {[['h', timeLeft.h], ['m', timeLeft.m], ['s', timeLeft.s]].map(([unit, val]) => (
                  <div key={unit} className="flex flex-col items-center">
                    <span className="text-xl font-black text-green-700 font-mono tabular-nums">{val}</span>
                    <span className="text-xs text-green-500 uppercase tracking-wider">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Animated working message */}
          <p className="text-xs text-gray-400 mb-6 blink">
            Our engineers are working on this{dots}
          </p>

          {/* Status lines */}
          <div className="w-full mt-4 space-y-2 mb-5">
            {[
              { label: 'Payment gateway', status: 'Maintenance', color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-400' },
              { label: 'Transaction records', status: 'Operational', color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
              { label: 'Student data', status: 'Operational', color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
            ].map(item => (
              <div key={item.label} className={`flex items-center justify-between px-3 py-2 rounded-lg ${item.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                  <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                </div>
                <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-all duration-150 shadow-sm shadow-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Got it, I'll try later
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PaymentModal ──────────────────────────────────────────────────────────
interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  numberOfStudents: number
  examType: ExamTypeEnum
  feePerStudent: number
  school: SchoolByCodeResponse | null
}

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess, numberOfStudents, examType, feePerStudent, school }: PaymentModalProps) {
  const [createStudentPayment] = useCreateStudentPaymentMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStudentCount, setSelectedStudentCount] = useState(numberOfStudents);
  const [customInput, setCustomInput] = useState('');


  const currentExamData = school?.exams?.find(e => e.name === examType);
  const examPoints = currentExamData?.availablePoints || 0;
  const examTotalPoints = currentExamData?.totalPoints || 0;
  const examNumberOfStudents = currentExamData?.numberOfStudents || 0;
  const maxPointsAllowed = examNumberOfStudents > 0 ? Math.max(0, examNumberOfStudents - examTotalPoints) : 0;

  const minPurchasePoints = 1
  const studentFees = selectedStudentCount * feePerStudent
  const totalAmount = studentFees

  const suggestions = [10, 20, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500].filter(count => count >= minPurchasePoints && count <= maxPointsAllowed)
  const allowCustomInput = maxPointsAllowed >= minPurchasePoints

  const handleSuggestionClick = (count: number) => {
    if (count <= maxPointsAllowed) {
      setSelectedStudentCount(count)
      setCustomInput(count.toString())
    }
  }

  const handleCustomInputChange = (value: string) => {
    setCustomInput(value)
    const numValue = parseInt(value) || 0
    if (!isNaN(numValue) && numValue >= minPurchasePoints && numValue <= maxPointsAllowed) {
      setSelectedStudentCount(numValue)
    } else if (numValue > maxPointsAllowed) {
      setSelectedStudentCount(maxPointsAllowed)
    } else if (numValue > 0 && numValue < minPurchasePoints) {
      setSelectedStudentCount(minPurchasePoints)
    }
  }

  const handleInputBlur = () => {
    const numValue = parseInt(customInput) || 0
    if (numValue < minPurchasePoints) {
      setCustomInput(minPurchasePoints.toString())
      setSelectedStudentCount(minPurchasePoints)
    } else if (numValue > maxPointsAllowed) {
      setCustomInput(maxPointsAllowed.toString())
      setSelectedStudentCount(maxPointsAllowed)
    } else if (numValue === 0 || isNaN(numValue)) {
      setCustomInput(minPurchasePoints.toString())
      setSelectedStudentCount(minPurchasePoints)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    if (isOpen) {
      let initialCount
      if (maxPointsAllowed < minPurchasePoints) {
        initialCount = maxPointsAllowed
      } else {
        initialCount = Math.max(minPurchasePoints, Math.min(numberOfStudents, maxPointsAllowed))
      }
      setSelectedStudentCount(initialCount)
      setCustomInput(initialCount.toString())
    }
  }, [isOpen, numberOfStudents, maxPointsAllowed, minPurchasePoints])

  const handlePayment = async () => {
    if (!school?._id) {
      toast.error('School information not found. Please try logging in again.')
      return
    }
    if (selectedStudentCount < minPurchasePoints || selectedStudentCount > maxPointsAllowed) {
      toast.error(`Please select between ${minPurchasePoints} and ${maxPointsAllowed} points`)
      return
    }
    setIsProcessing(true)
    try {
      const response = await createStudentPayment({
        schoolId: school._id,
        paymentData: { examType, numberOfStudents: selectedStudentCount }
      }).unwrap()
      if (!response.authorizationUrl) throw new Error('Payment authorization URL not found.')
      await setSecureItem('payment-return-url', window.location.href)
      window.location.href = response.authorizationUrl
    } catch (error) {
      setIsProcessing(false)
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Payment initiation failed. Please try again.'
      toast.error(errorMessage)
    }
  }

  // ── Bail early with maintenance screen ──
  if (!isOpen) return null
  if (PAYMENT_MAINTENANCE_MODE) return <MaintenanceOverlay onClose={onClose} />

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 z-50 bg-white/50 backdrop-blur-lg shadow-lg shadow-black/5">
          <h2 className="text-xl font-semibold text-gray-900">School Payment</h2>
          <button onClick={onClose} disabled={isProcessing} className="text-gray-400 active:scale-95 cursor-pointer hover:text-gray-600 transition-all duration-200 disabled:opacity-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {maxPointsAllowed === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Points Sufficient</h3>
              <p className="text-gray-600 mb-4">You already have enough points ({examPoints}) for all your students ({examNumberOfStudents}).</p>
              <button onClick={onClose} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">Close</button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Number of Points to Purchase</h3>
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800"><span className="font-medium">Available:</span> {maxPointsAllowed.toLocaleString()} points</p>
                  <p className="text-xs text-yellow-700 mt-1"><span className="font-medium">Minimum purchase:</span> {minPurchasePoints} points | ({examNumberOfStudents} students - {examTotalPoints} available = {maxPointsAllowed} needed)</p>
                </div>
                {allowCustomInput && (
                  <>
                    {suggestions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Quick Select:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((count) => (
                            <button key={count} onClick={() => handleSuggestionClick(count)}
                              className={`px-3 active:scale-95 cursor-pointer py-2 text-sm font-medium rounded-md border transition-all duration-200 ${selectedStudentCount === count ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label htmlFor="customStudentCount" className="block text-sm text-gray-600 mb-2">Or enter custom number:</label>
                      <input id="customStudentCount" type="number" min={minPurchasePoints} max={maxPointsAllowed} value={customInput}
                        onChange={(e) => handleCustomInputChange(e.target.value)} onBlur={handleInputBlur} onKeyDown={handleKeyDown}
                        placeholder={`Enter number of points (${minPurchasePoints}-${maxPointsAllowed})`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                  </>
                )}
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800"><span className="font-medium">Selected:</span> {selectedStudentCount.toLocaleString()} points</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Number of Points</span><span className="font-medium">{selectedStudentCount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Fee per Point</span><span className="font-medium">₦{feePerStudent.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Points Fees</span><span className="font-medium">₦{studentFees.toLocaleString()}</span></div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between"><span className="font-medium text-gray-900">Total Amount</span><span className="font-bold text-lg text-green-600">₦{totalAmount.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Online Payment</p>
                      <p className="text-sm text-gray-500">Secure payment via Paystack</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} disabled={isProcessing} className="flex-1 px-4 py-2 active:scale-95 cursor-pointer border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                <button onClick={handlePayment} disabled={isProcessing || selectedStudentCount < 1}
                  className="flex-1 px-4 py-2 active:scale-95 cursor-pointer border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {isProcessing ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Processing...</>
                  ) : (
                    <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>Pay ₦{totalAmount.toLocaleString()}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}