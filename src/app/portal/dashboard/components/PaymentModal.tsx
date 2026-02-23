'use client'

import React, { useState, useEffect } from 'react'
import { useCreateStudentPaymentMutation, ExamTypeEnum, SchoolByCodeResponse } from '../../store/api/authApi'
import toast from 'react-hot-toast'

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
  
  const minStudentsForCustom = 1 // Minimum students to allow custom input
  const studentFees = selectedStudentCount * feePerStudent
  const processingFee = Math.round(studentFees * 0.015) // 1.5% processing fee
  const totalAmount = studentFees + processingFee

  
  // Preset suggestions (filtered to not exceed max allowed and start from 10)
  const suggestions = [10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500].filter(count => count <= maxPointsAllowed)
  const allowCustomInput = maxPointsAllowed > minStudentsForCustom

  const handleSuggestionClick = (count: number) => {
    if (count <= maxPointsAllowed) {
      setSelectedStudentCount(count)
      setCustomInput(count.toString())
    }
  }

  const handleCustomInputChange = (value: string) => {
    setCustomInput(value)
    const numValue = parseInt(value) || 0
    if (!isNaN(numValue) && numValue >= minStudentsForCustom && numValue <= maxPointsAllowed) {
      setSelectedStudentCount(numValue)
    } else if (numValue > maxPointsAllowed) {
      // Optionally cap at max
      setSelectedStudentCount(maxPointsAllowed)
    } else if (numValue > 0 && numValue < minStudentsForCustom) {
      // Set to minimum
      setSelectedStudentCount(minStudentsForCustom)
    }
  }

  // Reset selected count when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      // If less than 10 points available, select all available
      // If 10 or more available, start at 10 or the numberOfStudents (whichever is less)
      let initialCount
      if (maxPointsAllowed < minStudentsForCustom) {
        initialCount = maxPointsAllowed
      } else {
        initialCount = Math.max(minStudentsForCustom, Math.min(numberOfStudents, maxPointsAllowed))
      }
      setSelectedStudentCount(initialCount)
      setCustomInput(initialCount.toString())
    }
  }, [isOpen, numberOfStudents, maxPointsAllowed])

  const handlePayment = async () => {
    if (!school?._id) {
      toast.error('School information not found. Please try logging in again.')
      return
    }

    if (selectedStudentCount < 1 || selectedStudentCount > maxPointsAllowed) {
      toast.error(`Please select between 1 and ${maxPointsAllowed} points`)
      return
    }

    setIsProcessing(true)
    
    try {
      const response = await createStudentPayment({
        schoolId: school._id,
        paymentData: {
          examType: examType,
          numberOfStudents: selectedStudentCount
        }
      }).unwrap()

      // If successful, redirect to Paystack authorization URL
      if (response.data.authorizationUrl) {
        // Save current URL to localStorage for payment callback to return to
        localStorage.setItem('payment-return-url', window.location.href)
        window.location.href = response.data.authorizationUrl
      } else {
        // Fallback: show success and close modal
        onPaymentSuccess()
        onClose()
      }
    } catch (error) {
      setIsProcessing(false)
      console.error('Payment initiation failed:', error)
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Payment initiation failed. Please try again.'
      toast.error(errorMessage)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 z-50 bg-white/50 backdrop-blur-lg shadow-lg shadow-black/5">
          <h2 className="text-xl font-semibold text-gray-900">School Payment</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 active:scale-95 active:rotate-1 cursor-pointer hover:text-gray-600 transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {maxPointsAllowed === 0 ? (
            /* No Points Needed Message */
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Points Sufficient</h3>
              <p className="text-gray-600 mb-4">
                You already have enough points ({examPoints}) for all your students ({examNumberOfStudents}).
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Student Count Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Number of Points to Purchase</h3>
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Available:</span> {maxPointsAllowed.toLocaleString()} points
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {maxPointsAllowed >= minStudentsForCustom ? `Minimum for custom input: ${minStudentsForCustom} points | ` : ''}({examNumberOfStudents} students - {examTotalPoints} available = {maxPointsAllowed} needed)
                  </p>
                </div>
                
                {allowCustomInput ? (
                  <>
                    {/* Preset Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Quick Select:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((count) => (
                            <button
                              key={count}
                              onClick={() => handleSuggestionClick(count)}
                              className={`px-3 active:scale-95 active:rotate-1 cursor-pointer py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
                                selectedStudentCount === count
                                  ? 'bg-green-600 text-white border-green-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Input */}
                    <div>
                      <label htmlFor="customStudentCount" className="block text-sm text-gray-600 mb-2">
                        Or enter custom number:
                      </label>
                      <input
                        id="customStudentCount"
                        type="number"
                        min={minStudentsForCustom}
                        max={maxPointsAllowed}
                        value={customInput}
                        onChange={(e) => handleCustomInputChange(e.target.value)}
                        placeholder={`Enter number of points (${minStudentsForCustom}-${maxPointsAllowed})`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </>
                ) : null}

                {/* Selected Count Display */}
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Selected:</span> {selectedStudentCount.toLocaleString()} points
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Number of Points</span>
                    <span className="font-medium">{selectedStudentCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fee per Point</span>
                    <span className="font-medium">₦{feePerStudent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Points Fees</span>
                    <span className="font-medium">₦{studentFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee (1.5%)</span>
                    <span className="font-medium">₦{processingFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total Amount</span>
                      <span className="font-bold text-lg text-green-600">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Online Payment</p>
                      <p className="text-sm text-gray-500">Secure payment via Paystack</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 active:scale-95 active:rotate-1 cursor-pointer border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || selectedStudentCount < 1}
                  className="flex-1 px-4 py-2 active:scale-95 active:rotate-1 cursor-pointer border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Pay ₦{totalAmount.toLocaleString()}
                    </>
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