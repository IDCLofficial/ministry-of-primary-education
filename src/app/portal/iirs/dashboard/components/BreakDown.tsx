"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { BsReceipt } from "react-icons/bs";
import { useAuth } from "@/app/portal/iirs/providers/AuthProvider";
import { getPaymentBreakdownStats, PaymentBreakdownByExamType } from "@/lib/iirs/dataInteraction";
import { ExamTypeEnum } from "@/app/portal/store/api/authApi";

const examTypeColors: Record<string, { bg: string; border: string; icon: string; text: string; badge: string }> = {
  [ExamTypeEnum.UBEGPT]:          { bg: 'from-blue-50 to-blue-100',     border: 'border-blue-200',   icon: 'bg-blue-500',   text: 'text-blue-900',   badge: 'text-blue-700 bg-blue-200'     },
  [ExamTypeEnum.UBETMS]:          { bg: 'from-green-50 to-green-100',   border: 'border-green-200',  icon: 'bg-green-500',  text: 'text-green-900',  badge: 'text-green-700 bg-green-200'   },
  [ExamTypeEnum.COMMON_ENTRANCE]: { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', icon: 'bg-purple-500', text: 'text-purple-900', badge: 'text-purple-700 bg-purple-200' },
  [ExamTypeEnum.BECE]:            { bg: 'from-amber-50 to-amber-100',   border: 'border-amber-200',  icon: 'bg-amber-500',  text: 'text-amber-900',  badge: 'text-amber-700 bg-amber-200'   },
  [ExamTypeEnum.BECE_RESIT]:      { bg: 'from-rose-50 to-rose-100',     border: 'border-rose-200',   icon: 'bg-rose-500',   text: 'text-rose-900',   badge: 'text-rose-700 bg-rose-200'     },
  [ExamTypeEnum.UBEAT]:           { bg: 'from-teal-50 to-teal-100',     border: 'border-teal-200',   icon: 'bg-teal-500',   text: 'text-teal-900',   badge: 'text-teal-700 bg-teal-200'     },
  [ExamTypeEnum.JSCBE]:           { bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200', icon: 'bg-indigo-500', text: 'text-indigo-900', badge: 'text-indigo-700 bg-indigo-200' },
  [ExamTypeEnum.WAEC]:            { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', icon: 'bg-orange-500', text: 'text-orange-900', badge: 'text-orange-700 bg-orange-200' },
};

const fallbackColor = { bg: 'from-gray-50 to-gray-100', border: 'border-gray-200', icon: 'bg-gray-500', text: 'text-gray-900', badge: 'text-gray-700 bg-gray-200' };

interface BreakDownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BreakDown({ isOpen, onClose }: BreakDownProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [breakdown, setBreakdown] = useState<Record<string, PaymentBreakdownByExamType>>({});

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  // Track whether the pointer actually moved so backdrop clicks still close
  const didMoveRef = useRef(false);

  // Reset position every time the modal opens
  useEffect(() => {
    if (isOpen) setPosition({ x: 0, y: 0 });
  }, [isOpen]);

  // Data fetch
  useEffect(() => {
    if (!isOpen || !token) return;

    async function fetchBreakdown() {
      try {
        setIsLoading(true);
        const result = await getPaymentBreakdownStats(token!);
        setTotalAmount(result.totalAmount ?? 0);
        setBreakdown(result.amountByExamType ?? {});
      } catch (e) {
        console.error('Error fetching payment breakdown:', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBreakdown();
  }, [isOpen, token]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      // Only drag with primary button; ignore clicks on the close button
      if (e.button !== 0) return;
      e.preventDefault();
      didMoveRef.current = false;
      setIsDragging(true);
      dragOrigin.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [position],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragOrigin.current.mouseX;
      const dy = e.clientY - dragOrigin.current.mouseY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didMoveRef.current = true;
      setPosition({ x: dragOrigin.current.posX + dx, y: dragOrigin.current.posY + dy });
    };

    const onMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const handleBackdropClick = () => {
    // Don't close if the user just finished dragging the modal
    if (!didMoveRef.current) onClose();
    didMoveRef.current = false;
  };

  if (!isOpen) return null;

  const allExamTypes = Object.values(ExamTypeEnum);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Draggable modal — centred by default, offset by drag delta */}
      <div
        className="absolute top-1/2 left-1/2 w-[92vw] max-w-3xl"
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
        }}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl max-h-[88vh] overflow-hidden flex flex-col
            ${isDragging ? 'shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] scale-[1.01]' : 'shadow-2xl scale-100'}
            transition-shadow duration-200`}
        >
          {/* Header — drag handle */}
          <div
            onMouseDown={handleDragStart}
            className={`relative bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex-shrink-0
              select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            <button
              onClick={onClose}
              onMouseDown={(e) => e.stopPropagation()} // prevent drag starting from close btn
              className="absolute top-4 right-4 p-1.5 cursor-pointer hover:bg-white/20 rounded-full transition-colors"
            >
              <IoClose size={20} className="text-white" />
            </button>

            <h2 className="text-xl font-bold text-white">Payment Breakdown</h2>
            <p className="text-sm text-white/75 mt-0.5">Summary of all payments received, grouped by exam type</p>

            {/* Subtle drag hint dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-40">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-white" />
              ))}
            </div>
          </div>

          {/* Total amount banner */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Amount Processed</p>
            {isLoading ? (
              <div className="h-9 bg-gray-200 rounded-lg w-52 mt-1.5 animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Per-exam cards */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-xl p-5 border border-gray-200 bg-gray-50 animate-pulse">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-5 bg-gray-300 rounded-full w-24" />
                      <div className="h-8 w-8 bg-gray-300 rounded-lg" />
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-28 mb-2" />
                    <div className="h-7 bg-gray-300 rounded w-20 mb-3" />
                    <div className="h-4 bg-gray-300 rounded w-28 mb-2" />
                    <div className="h-6 bg-gray-300 rounded w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allExamTypes.map((examType) => {
                  const data = breakdown[examType];
                  const colors = examTypeColors[examType] ?? fallbackColor;
                  const studentCount = data?.count ?? 0;
                  const amountPerStudent = data?.amountPerStudent;

                  return (
                    <div
                      key={examType}
                      className={`bg-gradient-to-br ${colors.bg} rounded-xl p-5 border ${colors.border} shadow-sm hover:shadow-md transition-shadow duration-200`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${colors.badge}`}>
                          {examType}
                        </span>
                        <div className={`p-2 ${colors.icon} rounded-lg shadow-sm`}>
                          <BsReceipt className="text-white text-sm" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Students Paid For</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <FiUsers className={`text-base ${colors.text}`} />
                          <p className={`text-2xl font-bold ${colors.text}`}>
                            {studentCount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Amount Per Student</p>
                        <p className={`text-xl font-bold ${colors.text} mt-1`}>
                          ₦{amountPerStudent}
                        </p>
                      </div>

                      {!data && (
                        <p className="text-xs text-gray-400 mt-3 italic">No payments recorded yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
