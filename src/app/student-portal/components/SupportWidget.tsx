'use client'
import { useState, useRef, useEffect, JSX, useMemo, Suspense } from "react";
import { useClickAway } from "react-use";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    MessageCircle,
    X,
    Send,
    CheckCircle2,
    Lock,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useTransform,
    PanInfo,
} from "framer-motion";
import { SchoolName, useGetSchoolNamesQuery } from "@/app/portal/store/api/authApi";
import CustomDropdown from "@/app/portal/dashboard/components/CustomDropdown";
import { useSearchParams } from "next/navigation";
import { removeSearchParam } from "@/lib";

/* ── Data ── */
const IMO_STATE_LGAS = [
    'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte',
    'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru',
    'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba',
    'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema',
    'Okigwe', 'Onuimo', 'Orlu', 'Orsu', 'Oru East', 'Oru West',
    'Owerri Municipal', 'Owerri North', 'Owerri West',
].sort();

const EXAM_TYPES = [
    { value: "BECE", label: "BECE — Basic Education Certificate Examination" },
    { value: "UBEAT", label: "UBEAT — Universal Basic Education Achievement Test" },
    { value: "COMMON_ENTRANCE", label: "Common Entrance Examination" },
    { value: "NECO", label: "NECO — National Examinations Council" },
    { value: "NABTEB", label: "NABTEB — National Business & Technical Examinations" },
    { value: "JAMB", label: "JAMB — Joint Admissions and Matriculation Board" },
];

const SUPPORT_REASONS = [
    { value: "result_not_found", label: "Result Not Found" },
    { value: "wrong_result", label: "Wrong Result Displayed" },
    { value: "name_mismatch", label: "Name / Details Mismatch" },
    { value: "missing_subjects", label: "Missing Subjects or Scores" },
    { value: "portal_access", label: "Unable to Access Portal" },
    // { value: "forgot_login_code", label: "Forgot my Login Code" },
    { value: "other", label: "Other (please specify)" },
];

interface FormState {
    fullName: string;
    school: string;
    lga: string;
    examYear: string;
    examType: string;
    examNumber: string;
    email: string;
    reason: string;
    reasonOther: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EXAM_YEARS = ["2026", "2025", "2024", "2023", "2022", "2021"];

/* ── Helpers ── */
function genRef() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    return "SPT-" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function RequiredMark(): JSX.Element {
    return <span className="text-red-500 ml-0.5">*</span>;
}

function FieldLabel({ htmlFor, children, optional }: {
    htmlFor: string;
    children: React.ReactNode;
    optional?: boolean;
}): JSX.Element {
    return (
        <Label htmlFor={htmlFor} className="text-[13px] font-semibold text-slate-700 flex items-center gap-1">
            {children}
            {optional
                ? <span className="text-[11px] font-normal text-slate-400 italic">(optional)</span>
                : <RequiredMark />}
        </Label>
    );
}

function FieldError({ message }: { message?: string }): JSX.Element | null {
    if (!message) return null;
    return (
        <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-[11.5px] text-red-500 flex items-center gap-1 mt-0.5"
        >
            <AlertCircle size={11} /> {message}
        </motion.p>
    );
}

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

/* ── Form Content ── */
function FormContent({
    form,
    errors,
    loading,
    submitted,
    ticketRef,
    set,
    lgaOptions,
    handleSubmit,
    reset,
    schoolNames,
    isLoadingSchools,
}: {
    form: FormState;
    errors: FormErrors;
    loading: boolean;
    submitted: boolean;
    ticketRef: string;
    set: (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    lgaOptions: { value: string, label: string }[];
    schoolNames?: SchoolName[];
    isLoadingSchools: boolean;
    reset: () => void;
}) {
    const isReasonOther = form.reason === "other";

    return (
        <AnimatePresence mode="wait">
            {!submitted ? (
                <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    {/* Sorry banner */}
                    <div className="bg-[#e8f5ee] border-b border-[#c4e8d0] px-4 py-3 flex gap-3 items-start flex-shrink-0">
                        <span className="text-[18px] mt-0.5 flex-shrink-0">🙏</span>
                        <p className="text-[12.5px] text-[#1a4a28] leading-relaxed">
                            <strong className="font-semibold">We're sorry for the inconvenience.</strong> Fill in your details below and our team will reach out to you promptly.
                        </p>
                    </div>

                    {/* Required note */}
                    <div className="px-5 pt-3 pb-0 flex-shrink-0">
                        <p className="text-[11.5px] text-slate-400">
                            Fields marked <span className="text-red-500 font-bold">*</span> are required
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-3 space-y-4" noValidate>

                        {/* Section: Your Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05, duration: 0.28 }}
                        >
                            <p className="text-[10.5px] font-bold text-[#1a8a3c] uppercase tracking-widest mb-3">Your Information</p>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <FieldLabel optional={false} htmlFor="fullName">Full Name</FieldLabel>
                                    <Input
                                        id="fullName"
                                        placeholder="e.g. Chukwuemeka Okonkwo"
                                        value={form.fullName}
                                        onChange={set("fullName")}
                                        className={`text-[13.5px] h-10 ${errors.fullName ? "border-red-400 focus-visible:ring-red-200" : "focus-visible:ring-green-200 focus-visible:border-green-500"}`}
                                    />
                                    <AnimatePresence><FieldError message={errors.fullName} /></AnimatePresence>
                                </div>

                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="lga-trigger">LGA</FieldLabel>
                                    <Select value={form.lga} onValueChange={set("lga")}>
                                        <SelectTrigger
                                            id="lga-trigger"
                                            className={`h-10 w-full text-[13.5px] ${errors.lga ? "border-red-400 focus:ring-red-200" : "focus:ring-green-200 focus:border-green-500"} ${!form.lga ? "text-slate-400" : ""}`}
                                        >
                                            <SelectValue placeholder="Select your LGA" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-56 text-[13px] w-full">
                                            {lgaOptions.map((l) => (
                                                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <AnimatePresence><FieldError message={errors.lga} /></AnimatePresence>
                                </div>

                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="school">School Name</FieldLabel>
                                    <div className="relative">
                                        {!schoolNames && <Input
                                            id="school"
                                            list="schools-list"
                                            placeholder={
                                                !form.lga
                                                    ? "Select an LGA first"
                                                    : isLoadingSchools
                                                        ? "Loading schools…"
                                                        : "Start typing your school…"
                                            }
                                            value={form.school}
                                            onChange={(e) => set("school")(e)}
                                            disabled={!form.lga || isLoadingSchools}
                                            className={`text-[13.5px] h-10 transition-opacity
                                                ${!form.lga || isLoadingSchools ? "opacity-50 cursor-not-allowed bg-slate-50" : ""}
                                                ${errors.school ? "border-red-400 focus-visible:ring-red-200" : "focus-visible:ring-green-200 focus-visible:border-green-500"}
                                            `}
                                            autoComplete="off"
                                        />}
                                        {isLoadingSchools && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="animate-spin h-4 w-4 text-[#1a8a3c]" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                                </svg>
                                            </span>
                                        )}

                                        {schoolNames && <CustomDropdown
                                            options={schoolNames.map(school => ({
                                                value: school._id,
                                                label: String(school.schoolName).startsWith('"') ? String(school.schoolName).slice(1) : school.schoolName,
                                            }))}
                                            value={form.school}
                                            mode="datalist"
                                            onChange={value => {
                                                set("school")(value)
                                            }}
                                            placeholder="Select a school"
                                            searchable
                                            searchPlaceholder="Search school name..."
                                        />}
                                    </div>

                                    {!form.lga && (
                                        <p className="text-[11.5px] text-slate-400 flex items-center gap-1 mt-0.5">
                                            <AlertCircle size={11} /> Select your LGA above to load schools
                                        </p>
                                    )}

                                    <AnimatePresence><FieldError message={errors.school} /></AnimatePresence>
                                </div>
                            </div>
                        </motion.div>

                        <Separator />

                        {/* Section: Exam Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12, duration: 0.28 }}
                        >
                            <p className="text-[10.5px] font-bold text-[#1a8a3c] uppercase tracking-widest mb-3">Exam Details</p>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <FieldLabel htmlFor="year-trigger">Exam Year</FieldLabel>
                                        <Select value={form.examYear} onValueChange={set("examYear")}>
                                            <SelectTrigger
                                                id="year-trigger"
                                                className={`h-10 text-[13.5px] w-full ${errors.examYear ? "border-red-400" : "focus:ring-green-200 focus:border-green-500"} ${!form.examYear ? "text-slate-400" : ""}`}
                                            >
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent className="text-[13px] w-full">
                                                {EXAM_YEARS.map((y) => (
                                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <AnimatePresence><FieldError message={errors.examYear} /></AnimatePresence>
                                    </div>

                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <FieldLabel htmlFor="type-trigger">Exam Type</FieldLabel>
                                        <Select value={form.examType} onValueChange={set("examType")}>
                                            <SelectTrigger
                                                id="type-trigger"
                                                className={`h-10 w-full text-[13.5px] ${errors.examType ? "border-red-400" : "focus:ring-green-200 focus:border-green-500"} ${!form.examType ? "text-slate-400" : ""}`}
                                            >
                                                <SelectValue placeholder="Select exam" />
                                            </SelectTrigger>
                                            <SelectContent className="text-[13px] w-full">
                                                {EXAM_TYPES.map((t) => (
                                                    <SelectItem key={t.value} value={t.value} className="truncate">{t.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <AnimatePresence><FieldError message={errors.examType} /></AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="examNumber" optional>Exam Number</FieldLabel>
                                    <Input
                                        id="examNumber"
                                        placeholder="e.g. 1234567890AB"
                                        value={form.examNumber}
                                        onChange={set("examNumber")}
                                        className="text-[13px] h-10 font-mono tracking-wide focus-visible:ring-green-200 focus-visible:border-green-500"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <Separator />

                        {/* Section: Issue Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.16, duration: 0.28 }}
                        >
                            <p className="text-[10.5px] font-bold text-[#1a8a3c] uppercase tracking-widest mb-3">Issue Details</p>
                            <div className="space-y-3">
                                {/* Reason dropdown */}
                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="reason-trigger">Reason for Contact</FieldLabel>
                                    <Select
                                        value={form.reason}
                                        onValueChange={(val) => {
                                            set("reason")(val);
                                            // Clear "other" text if switching away from Other
                                            if (val !== "other") {
                                                set("reasonOther")("");
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            id="reason-trigger"
                                            className={`h-10 w-full text-[13.5px] ${errors.reason ? "border-red-400 focus:ring-red-200" : "focus:ring-green-200 focus:border-green-500"} ${!form.reason ? "text-slate-400" : ""}`}
                                        >
                                            <SelectValue placeholder="Select a reason" />
                                        </SelectTrigger>
                                        <SelectContent className="text-[13px] w-full">
                                            {SUPPORT_REASONS.map((r) => (
                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <AnimatePresence><FieldError message={errors.reason} /></AnimatePresence>
                                </div>

                                {/* "Other" free-text — animates in/out */}
                                <AnimatePresence>
                                    {isReasonOther && (
                                        <motion.div
                                            key="reason-other"
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            transition={{ duration: 0.22, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-1.5">
                                                <FieldLabel htmlFor="reasonOther">Please describe your issue</FieldLabel>
                                                <Textarea
                                                    id="reasonOther"
                                                    placeholder="Briefly describe what went wrong…"
                                                    value={form.reasonOther}
                                                    onChange={set("reasonOther")}
                                                    rows={3}
                                                    maxLength={500}
                                                    className={`text-[13px] resize-none leading-relaxed
                                                        ${errors.reasonOther
                                                            ? "border-red-400 focus-visible:ring-red-200"
                                                            : "focus-visible:ring-green-200 focus-visible:border-green-500"}
                                                    `}
                                                />
                                                <div className="flex items-start justify-between gap-2">
                                                    <AnimatePresence>
                                                        <FieldError message={errors.reasonOther} />
                                                    </AnimatePresence>
                                                    <p className={`text-[11px] ml-auto flex-shrink-0 tabular-nums ${form.reasonOther.length >= 450 ? "text-amber-500" : "text-slate-400"}`}>
                                                        {form.reasonOther.length}/500
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        <Separator />

                        {/* Section: Contact */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.19, duration: 0.28 }}
                        >
                            <p className="text-[10.5px] font-bold text-[#1a8a3c] uppercase tracking-widest mb-3">Contact</p>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="We'll reply to this address"
                                    value={form.email}
                                    onChange={set("email")}
                                    className={`text-[13.5px] h-10 ${errors.email ? "border-red-400 focus-visible:ring-red-200" : "focus-visible:ring-green-200 focus-visible:border-green-500"}`}
                                />
                                <AnimatePresence><FieldError message={errors.email} /></AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Submit */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.24, duration: 0.28 }}
                            className="pb-1"
                        >
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-[#1a8a3c] hover:bg-[#22a84a] text-white font-bold text-[14px] tracking-tight shadow-md shadow-green-900/20 transition-all"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                        </svg>
                                        Submitting…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Send size={15} />
                                        Submit Request
                                    </span>
                                )}
                            </Button>

                            <p className="text-[11px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1.5">
                                <Lock size={10} />
                                Your data is handled securely and used only for issue resolution
                            </p>
                        </motion.div>
                    </form>
                </motion.div>
            ) : (
                /* ── Success ── */
                <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="flex flex-col items-center justify-center text-center px-7 py-12 gap-4 flex-1"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.08 }}
                        className="w-16 h-16 rounded-full bg-[#e8f5ee] flex items-center justify-center"
                    >
                        <CheckCircle2 size={36} className="text-[#1a8a3c]" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.28 }}
                    >
                        <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">Request Received!</h3>
                        <p className="text-[13px] text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
                            Our support team will review your case and reach out within <strong className="text-slate-700">2–3 working days</strong>.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.26, duration: 0.28 }}
                        className="bg-[#e8f5ee] border border-dashed border-[#a8d8b9] rounded-xl px-6 py-3 mt-1"
                    >
                        <p className="text-[10.5px] text-[#1a8a3c] font-semibold uppercase tracking-widest mb-1">Reference Number</p>
                        <p className="font-mono text-[15px] font-bold text-[#1a6630] tracking-widest">{ticketRef}</p>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.34 }}
                        className="text-[11.5px] text-slate-400"
                    >
                        Save this reference for any follow-up enquiries
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Button
                            variant="outline"
                            onClick={reset}
                            className="border-slate-200 text-slate-500 hover:text-[#1a8a3c] hover:border-[#1a8a3c] text-[13px] h-9 mt-1"
                        >
                            Submit Another Request
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ── Shared Header ── */
function PanelHeader({ onClose }: { onClose: () => void }) {
    return (
        <div className="bg-gradient-to-br from-[#1a8a3c] to-[#145f2a] px-5 py-4 flex items-start gap-3.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} color="white" />
            </div>
            <div className="flex-1 min-w-0">
                <h2 className="text-[15.5px] font-bold text-white leading-tight tracking-tight">Student Support Centre</h2>
                <p className="text-[12px] text-green-200 mt-0.5">Ministry of Primary & Secondary Education</p>
            </div>
            <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors flex-shrink-0"
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
                        className="fixed inset-0 z-40 bg-black"
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
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
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
                <motion.span
                    className="absolute inset-0 rounded-full border-2 border-green-400/80"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
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
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ticketRef, setTicketRef] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const isMobile = useIsMobile(640);

    const isOpen = searchParams.get("contacting-support");

    useEffect(() => {
        if (!isOpen) return;
        setOpen(true);
    }, [isOpen]);

    const panelRef = useRef<HTMLDivElement>(null);
    const fabRef = useRef<HTMLButtonElement>(null);

    const [form, setForm] = useState<FormState>({
        fullName: "",
        school: "",
        lga: "",
        examYear: "",
        examType: "",
        examNumber: "",
        email: "",
        reason: "",
        reasonOther: "",
    });

    const lgaOptions = useMemo(() => IMO_STATE_LGAS.map(lga => ({ value: lga, label: lga })), []);

    const { data: schoolNames, isLoading: isLoadingSchoolNames, isFetching } = useGetSchoolNamesQuery(
        { lga: form.lga },
        { skip: !form.lga },
    );

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

        const target = e.target as Element;

        if (target.closest(
            '[data-radix-popper-content-wrapper], [data-radix-select-viewport], [role="listbox"], [role="option"]'
        )) return;

        if (target.closest('[data-drop="custom"]')) return;
        if (target.closest('[data-drop-menu]')) return;
        if (target.closest('[data-drop="custom"]')) return;
        if (target.closest('.custom-dropdown-menu')) return;

        close();
    });

    const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
        const val = typeof e === "string" ? e : e.target.value;
        setForm((f) => ({ ...f, [key]: val }));
        setErrors((er) => ({ ...er, [key]: "" }));
    };

    function validate() {
        const e: FormErrors = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required";
        if (!form.school.trim()) e.school = "School name is required";
        if (!form.lga) e.lga = "Please select your LGA";
        if (!form.examYear) e.examYear = "Please select an exam year";
        if (!form.examType) e.examType = "Please select your exam type";
        if (!form.reason) e.reason = "Please select a reason for contact";
        if (form.reason === "other") {
            if (!form.reasonOther.trim()) {
                e.reasonOther = "Please describe your issue";
            } else if (form.reasonOther.trim().length < 10) {
                e.reasonOther = "Please provide at least 10 characters";
            }
        }
        if (!form.email.trim()) e.email = "Email address is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
        return e;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        const ref = genRef();
        const payload = { ref, submittedAt: new Date().toISOString(), ...form };

        // 🔒 Replace with your real endpoint:
        // await fetch("https://your-backend.com/api/support", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(payload),
        // });
        console.log("📬 Support ticket:", payload);
        await new Promise((r) => setTimeout(r, 1600));

        setTicketRef(ref);
        setLoading(false);
        setSubmitted(true);
    }

    function reset() {
        setForm({ fullName: "", school: "", lga: "", examYear: "", examType: "", examNumber: "", email: "", reason: "", reasonOther: "" });
        setErrors({});
        setSubmitted(false);
        setTicketRef("");
    }

    function close() {
        removeSearchParam("contacting-support");
        setOpen(false);
    }

    const panelContent = (
        <>
            <PanelHeader onClose={close} />
            <FormContent
                form={form}
                errors={errors}
                lgaOptions={lgaOptions}
                loading={loading}
                submitted={submitted}
                ticketRef={ticketRef}
                set={set}
                handleSubmit={handleSubmit}
                schoolNames={schoolNames}
                isLoadingSchools={isLoadingSchoolNames || isFetching}
                reset={reset}
            />
        </>
    );

    return (
        <div className="font-sans">
            <FAB onClick={() => setOpen(true)} fabRef={fabRef} />

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
        <Suspense>
            <Widget />
        </Suspense>
    );
}