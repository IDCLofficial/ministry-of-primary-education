'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { BsDownload } from 'react-icons/bs'

interface CertificatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  schoolName: string
  studentsApproved: number
  examSession: string
  approvalId: string
  issueDate: string
}

export default function CertificatePreviewModal({
  isOpen,
  onClose,
  schoolName,
  studentsApproved,
  examSession,
  approvalId,
  issueDate
}: CertificatePreviewModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const downloadAsImage = useCallback(async () => {
    if (!certificateRef.current) {
      toast.error('Certificate not ready for download')
      return
    }

    try {
      setIsDownloading(true)
      toast.loading('Generating image...', { id: 'img-gen' })

      await new Promise(resolve => setTimeout(resolve, 100))

      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      })

      const link = document.createElement('a')
      link.download = `WAEC_Approval_Certificate_${schoolName.replace(/[^a-z0-9]/gi, '_')}.png`
      link.href = dataUrl
      link.click()

      toast.success('Image downloaded successfully!', { id: 'img-gen' })
    } catch (error) {
      console.error('Error generating image:', error)
      toast.error('Failed to generate image. Please try again.', { id: 'img-gen' })
    } finally {
      setIsDownloading(false)
    }
  }, [schoolName])

  const downloadAsPDF = useCallback(async () => {
    if (!certificateRef.current) {
      toast.error('Certificate not ready for download')
      return
    }

    try {
      setIsDownloading(true)
      toast.loading('Generating PDF...', { id: 'pdf-gen' })

      await new Promise(resolve => setTimeout(resolve, 100))

      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      })

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`WAEC_Approval_Certificate_${schoolName.replace(/[^a-z0-9]/gi, '_')}.pdf`)

      toast.success('PDF downloaded successfully!', { id: 'pdf-gen' })
      onClose()
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf-gen' })
    } finally {
      setIsDownloading(false)
    }
  }, [schoolName, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Certificate Preview</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadAsImage}
              disabled={isDownloading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:rotate-2 cursor-pointer"
            >
              <BsDownload className="w-4 h-4 mr-2" />
              Image
            </button>
            <button
              onClick={downloadAsPDF}
              disabled={isDownloading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:rotate-2 cursor-pointer"
            >
              <BsDownload className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Certificate Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-purple-100 to-blue-100">
          <div className="flex items-center justify-center min-h-full">
            <div ref={certificateRef} className="certificate-container" style={{ width: '1000px', height: '707px', background: 'linear-gradient(to bottom right, #fef9e7, #fdebd0)', position: 'relative', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}>
              {/* Decorative Elements */}
              <div className="corner-ornament top-left" style={{ position: 'absolute', width: '100px', height: '100px', background: 'radial-gradient(circle, #d4af37 0, transparent 70%)', opacity: 0.3, top: 0, left: 0, borderRadius: '0 0 100px 0' }}></div>
              <div className="corner-ornament top-right" style={{ position: 'absolute', width: '100px', height: '100px', background: 'radial-gradient(circle, #d4af37 0, transparent 70%)', opacity: 0.3, top: 0, right: 0, borderRadius: '0 0 0 100px' }}></div>
              <div className="corner-ornament bottom-left" style={{ position: 'absolute', width: '100px', height: '100px', background: 'radial-gradient(circle, #d4af37 0, transparent 70%)', opacity: 0.3, bottom: 0, left: 0, borderRadius: '0 100px 0 0' }}></div>
              <div className="corner-ornament bottom-right" style={{ position: 'absolute', width: '100px', height: '100px', background: 'radial-gradient(circle, #d4af37 0, transparent 70%)', opacity: 0.3, bottom: 0, right: 0, borderRadius: '100px 0 0 0' }}></div>
              
              <div className="decorative-circle circle-1" style={{ position: 'absolute', borderRadius: '50%', border: '2px solid #d4af37', opacity: 0.2, width: '300px', height: '300px', top: '-100px', right: '-100px' }}></div>
              <div className="decorative-circle circle-2" style={{ position: 'absolute', borderRadius: '50%', border: '2px solid #d4af37', opacity: 0.2, width: '200px', height: '200px', bottom: '-50px', left: '-50px' }}></div>
              <div className="decorative-circle circle-3" style={{ position: 'absolute', borderRadius: '50%', border: '2px solid #d4af37', opacity: 0.2, width: '150px', height: '150px', top: '353px', left: '-75px' }}></div>
              
              <div className="border-pattern" style={{ position: 'absolute', inset: '20px', border: '3px solid #c19a6b', pointerEvents: 'none' }}>
                <div style={{ content: '', position: 'absolute', background: 'linear-gradient(45deg, #d4af37, #f4e4c1, #d4af37)', top: '-3px', left: '-3px', right: '-3px', height: '3px' }}></div>
                <div style={{ content: '', position: 'absolute', background: 'linear-gradient(45deg, #d4af37, #f4e4c1, #d4af37)', left: '-3px', top: '-3px', bottom: '-3px', width: '3px' }}></div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[120px] font-bold text-black/5 -rotate-45">CERTIFIED</div>

              <div className="certificate-content" style={{ position: 'relative', zIndex: 10, padding: '4vmin 5vmin', height: '707px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* Header */}
                <div className="header" style={{ textAlign: 'center' }}>
                  <div className="logo-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', marginBottom: '20px' }}>
                    <Image src="/images/ministry-logo.png" alt="Ministry Logo" width={60} height={60} className="logo" style={{ width: '6vmin', height: '6vmin', objectFit: 'contain' }} />
                  </div>
                  <div className="ministry-name" style={{ fontSize: '1.4vmin', fontWeight: 'bold', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '0.15vmin', marginBottom: '0.5vmin' }}>Ministry of Primary & Secondary Education</div>
                  <div className="state-name" style={{ fontSize: '1.1vmin', color: '#5d6d7e', fontStyle: 'italic' }}>Imo State Government, Nigeria</div>
                  <h1 className="certificate-title" style={{ fontSize: '4vmin', fontWeight: 'bold', color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.3vmin', margin: '2vmin 0 1.5vmin', textShadow: '0.15vmin 0.15vmin 0.3vmin rgba(0, 0, 0, 0.1)' }}>Certificate</h1>
                  <p className="certificate-subtitle" style={{ fontSize: '1.3vmin', color: '#7f8c8d', fontStyle: 'italic', marginBottom: '1vmin' }}>of Approval</p>
                  <div className="divider" style={{ width: '15vmin', height: '0.25vmin', background: 'linear-gradient(to right, transparent, #d4af37, transparent)', margin: '1.5vmin auto' }}></div>
                </div>

                {/* Body */}
                <div className="body" style={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="presented-to" style={{ fontSize: '1.4vmin', color: '#34495e', marginBottom: '1.2vmin' }}>This certificate is hereby issued to</p>
                  
                  <div className="recipient-name" style={{ fontSize: '3.2vmin', fontWeight: 'bold', color: '#1e3a5f', margin: '1.5vmin 0', padding: '1.2vmin 3vmin', borderBottom: '0.25vmin solid #d4af37', display: 'inline-block', textTransform: 'capitalize' }}>{schoolName}</div>
                  
                  <p className="achievement-text" style={{ fontSize: '1.2vmin', color: '#5d6d7e', lineHeight: 1.6, maxWidth: '900px', margin: '2vmin auto', padding: '0 2vmin' }}>
                    For successful submission and approval of <strong>WAEC Student Registration</strong> for the upcoming examination. The Ministry hereby certifies that all submitted student records have been reviewed, verified, and approved for registration with the West African Examinations Council (WAEC).
                  </p>

                  <div className="completion-details" style={{ display: 'flex', justifyContent: 'center', gap: '4vmin', marginTop: '2vmin' }}>
                    <div className="detail-item" style={{ textAlign: 'center' }}>
                      <div className="detail-label" style={{ fontSize: '0.9vmin', color: '#95a5a6', textTransform: 'uppercase', letterSpacing: '0.08vmin', marginBottom: '0.4vmin' }}>Students Approved</div>
                      <div className="detail-value" style={{ fontSize: '1.3vmin', color: '#2c3e50', fontWeight: 'bold' }}>{studentsApproved}</div>
                    </div>
                    <div className="detail-item" style={{ textAlign: 'center' }}>
                      <div className="detail-label" style={{ fontSize: '0.9vmin', color: '#95a5a6', textTransform: 'uppercase', letterSpacing: '0.08vmin', marginBottom: '0.4vmin' }}>Exam Session</div>
                      <div className="detail-value" style={{ fontSize: '1.3vmin', color: '#2c3e50', fontWeight: 'bold' }}>{examSession}</div>
                    </div>
                    <div className="detail-item" style={{ textAlign: 'center' }}>
                      <div className="detail-label" style={{ fontSize: '0.9vmin', color: '#95a5a6', textTransform: 'uppercase', letterSpacing: '0.08vmin', marginBottom: '0.4vmin' }}>Approval ID</div>
                      <div className="detail-value" style={{ fontSize: '1.3vmin', color: '#2c3e50', fontWeight: 'bold' }}>{approvalId}</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3vmin' }}>
                  <div className="signature-block" style={{ textAlign: 'center', flex: 1 }}>
                    <Image 
                      src="/images/signature.png" 
                      alt="Signature" 
                      width={120} 
                      height={50} 
                      className="w-[12vmin] h-[5vmin] object-contain mb-[0.8vmin] ml-[23vmin]" 
                    />
                    <div className="signature-line" style={{ width: '15vmin', height: '0.15vmin', background: '#2c3e50', margin: '0 auto 0.8vmin' }}></div>
                    <div className="signature-name" style={{ fontSize: '1.1vmin', fontWeight: 'bold', color: '#2c3e50', marginBottom: '0.25vmin' }}>Prof. Bernard Thompson Ikegwuoha</div>
                    <div className="signature-title" style={{ fontSize: '0.95vmin', color: '#7f8c8d', fontStyle: 'italic' }}>Honorable Commissioner</div>
                    <div className="signature-title" style={{ fontSize: '0.95vmin', color: '#7f8c8d', fontStyle: 'italic' }}>Ministry of Primary & Secondary Education</div>
                  </div>

                  <div className="date-block" style={{ textAlign: 'center', flex: 1 }}>
                    <div className="date-label" style={{ fontSize: '0.9vmin', color: '#95a5a6', textTransform: 'uppercase', letterSpacing: '0.08vmin', marginBottom: '0.4vmin' }}>Date Issued</div>
                    <div className="date-value" style={{ fontSize: '1.3vmin', color: '#2c3e50', fontWeight: 'bold' }}>{issueDate}</div>
                  </div>
                </div>
              </div>

              {/* Official Seal */}
              <div className="official-seal" style={{ position: 'absolute', bottom: '60px', right: '80px', width: '100px', height: '100px', borderRadius: '50px', border: '3px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1), transparent)', transform: 'rotate(-15deg)' }}>
                <div className="seal-text" style={{ textAlign: 'center', fontSize: '10px', color: '#d4af37', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  Official<br />Seal<br />Imo State
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
