'use client'
import { useState, useRef, useEffect, JSX, Suspense } from "react";
import Image from "next/image";
import { useClickAway } from "react-use";
import {
    MessageCircle,
    X,
} from "lucide-react";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useTransform,
    PanInfo,
} from "framer-motion";
import { ExamTypeEnum } from "@/app/portal/store/api/authApi";
import { usePathname, useSearchParams } from "next/navigation";
import { removeSearchParam, updateSearchParam } from "@/lib";
import SupportChatContent from "./SupportChatContent";

/* ── Hook: detect mobile ── */
function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [breakpoint]);
    return isMobile;
}

/* ── Hook: scroll lock ── */
function useScrollLock(locked: boolean) {
    useEffect(() => {
        if (!locked) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [locked]);
}

/* ── Hook: focus trap ── */
const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
    useEffect(() => {
        if (!active || !ref.current) return;

        const first = ref.current.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();

        function handleKeyDown(e: KeyboardEvent) {
            if (!ref.current) return;
            const focusable = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (!focusable.length) return;

            const firstEl = focusable[0];
            const lastEl = focusable[focusable.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    }
                } else {
                    if (document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [active, ref]);
}

/* ── Shared Header ── */
function PanelHeader({ onClose }: { onClose: () => void }) {
    return (
        <div className="bg-gradient-to-br from-[#1a8a3c] to-[#145f2a] px-5 py-4 flex items-start gap-3.5 flex-shrink-0">
            <div className="relative w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-white/25 overflow-hidden">
                <Image src="/images/adaure.png" alt="Adaure" width={40} height={40} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] ring-2 ring-white" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
                <h2 className="text-[15.5px] font-bold text-white leading-tight tracking-tight">Adaure</h2>
                <p className="text-[12px] text-green-200 mt-0.5">Student Support Assistant · Ministry of Primary & Secondary Education</p>
            </div>
            <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Close support panel"
            >
                <X size={14} />
            </button>
        </div>
    );
}

/* ── Bottom Sheet (mobile) ── */
const SNAP_CLOSE_THRESHOLD = 120;

function BottomSheet({
    open,
    onClose,
    children,
    trapRef,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    trapRef: React.RefObject<HTMLDivElement | null>;
}) {
    const y = useMotionValue(0);
    const overlayOpacity = useTransform(y, [0, SNAP_CLOSE_THRESHOLD * 2], [0.45, 0]);

    function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        if (info.offset.y > SNAP_CLOSE_THRESHOLD || info.velocity.y > 500) {
            onClose();
        } else {
            y.set(0);
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ opacity: overlayOpacity }}
                        className="fixed inset-0 z-50 bg-black"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    <motion.div
                        key="sheet"
                        ref={trapRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Student Support Centre"
                        className="fixed left-1/2 -translate-x-1/2 w-full bottom-0 z-50 flex flex-col bg-white rounded-t-2xl shadow-2xl overflow-hidden max-w-[calc(100dvw-.25rem)]"
                        style={{
                            y,
                            maxHeight: "90dvh",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 340, damping: 34 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={{ top: 0.02, bottom: 0.3 }}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing" aria-hidden="true">
                            <div className="w-10 h-1 rounded-full bg-slate-200" />
                        </div>

                        <div className="flex flex-col flex-1 overflow-hidden" onPointerDown={(e) => e.stopPropagation()}>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ── Desktop Popover ── */
function DesktopPopover({
    open,
    onClose,
    children,
    trapRef,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    trapRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="desktop-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    <motion.div
                        key="popover"
                        ref={trapRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Student Support Centre"
                        className="fixed bottom-[88px] right-7 z-50 w-[430px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                        style={{
                            maxWidth: "calc(100vw - 28px)",
                            fontFamily: "'DM Sans', sans-serif",
                            transformOrigin: "bottom right",
                        }}
                        initial={{ opacity: 0, scale: 0.88, y: 18 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 14 }}
                        transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ── FAB ── */
function FAB({ onClick, fabRef }: { onClick: () => void; fabRef: React.RefObject<HTMLButtonElement | null> }) {
    return (
        <motion.button
            ref={fabRef}
            onClick={onClick}
            className="fixed bottom-7 right-7 z-50"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            whileHover={{ y: -2, boxShadow: "0 16px 32px -4px rgba(26,138,60,0.38)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            aria-haspopup="dialog"
            aria-expanded={false}
        >
            <div className="relative flex items-center gap-2.5 bg-[#1a8a3c] text-white rounded-full px-5 py-3.5 shadow-lg shadow-green-900/30 font-semibold text-[14.5px] tracking-tight cursor-pointer">
                <span
                    className="absolute inset-0 rounded-full border-2 border-green-400/80"
                    style={{ animation: 'pulse-ring 1.8s ease-in-out infinite' }}
                    aria-hidden="true"
                />
                <MessageCircle size={18} className="flex-shrink-0" />
                Need Help?
            </div>
        </motion.button>
    );
}

/* ── Main ── */
function Widget() {
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile(640);
    const pathName = usePathname();

    const isOpen = searchParams.get("contacting-support");

    useEffect(() => {
        if (!isOpen) return;
        setOpen(true);
    }, [isOpen]);

    const panelRef = useRef<HTMLDivElement>(null);
    const fabRef = useRef<HTMLButtonElement>(null);

    const [prefillExamType, setPrefillExamType] = useState<ExamTypeEnum | undefined>(undefined);

    useEffect(() => {
        if (!pathName) return;
        const endsWith = pathName.split("/")[pathName.split("/").length - 1];

        switch (endsWith) {
            case "bece":
                setPrefillExamType(ExamTypeEnum.BECE);
                break;
            case "ubeat":
                setPrefillExamType(ExamTypeEnum.UBEAT);
                break;
            default:
                break;
        }
    }, [pathName]);

    useScrollLock(open);
    useFocusTrap(panelRef, open);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    useClickAway(panelRef, (e) => {
        if (!open || isMobile) return;
        if (fabRef.current?.contains(e.target as Node)) return;
        close();
    });

    function close() {
        removeSearchParam("contacting-support");
        setOpen(false);
    }

    const panelContent = (
        <>
            <PanelHeader onClose={close} />
            <SupportChatContent prefillExamType={prefillExamType} />
        </>
    );

    const isBulkDownloads = pathName?.includes('bulk-downloads')

    return (
        <div className="font-sans">
            {(!isBulkDownloads || !isMobile) && (
                <FAB onClick={() => updateSearchParam("contacting-support", "true")} fabRef={fabRef} />
            )}

            {isMobile ? (
                <BottomSheet open={open} onClose={close} trapRef={panelRef}>
                    {panelContent}
                </BottomSheet>
            ) : (
                <DesktopPopover open={open} onClose={close} trapRef={panelRef}>
                    {panelContent}
                </DesktopPopover>
            )}
        </div>
    );
}

export default function SupportWidget() {
    return (
        <div className="relative z-[999]">
            <Suspense>
                <Widget />
            </Suspense>
        </div>
    );
}
