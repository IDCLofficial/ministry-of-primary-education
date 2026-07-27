'use client'
import { useState, useRef, useEffect, JSX } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Lock, User as UserIcon, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomerSupport, useCustomerSupportMutation } from "../store/api/studentApi";
import { ExamTypeEnum } from "@/app/portal/store/api/authApi";
import { LgaEnum } from "@/app/portal/dashboard/[schoolCode]/types";
import { SUPPORTED_EXAM_TYPE_VALUES, SUPPORT_REASON_VALUES, LGA_VALUES } from "../data/supportChatPrompt";
import ClickCopy from "@/components/ClickCopy";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
}

interface TicketArgs {
    fullName?: string;
    lga?: string;
    schoolName?: string;
    year?: number;
    exam?: string;
    examNo?: string;
    reasonForContact?: string;
    other?: string;
    email?: string;
    phone?: string;
}

function greetingFor(prefillExamType?: ExamTypeEnum): string {
    const examLabel = prefillExamType === ExamTypeEnum.BECE
        ? "BECE"
        : prefillExamType === ExamTypeEnum.UBEAT
            ? "UBEAT"
            : null;
    return examLabel
        ? `Hi, I'm Adaure, your support assistant for the Imo State result-checking portal. I see you're looking at ${examLabel} — what can I help you with?`
        : "Hi, I'm Adaure, your support assistant for the Imo State result-checking portal. What can I help you with today?";
}

function newId() {
    return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function validateTicketArgs(args: TicketArgs): string | null {
    if (!args.fullName?.trim()) return "I didn't catch your full name — could you repeat it?";
    if (!args.lga || !LGA_VALUES.includes(args.lga as LgaEnum)) return "That LGA doesn't look right — could you confirm which of the Imo State LGAs you're in?";
    if (!args.schoolName?.trim()) return "What's the school name again?";
    if (!args.year || !Number.isFinite(args.year)) return "Which exam year was this for?";
    if (!args.exam || !SUPPORTED_EXAM_TYPE_VALUES.includes(args.exam as ExamTypeEnum)) return "Which exam was this — BECE, UBEAT, or Common Entrance?";
    if (!args.reasonForContact || !SUPPORT_REASON_VALUES.includes(args.reasonForContact)) return "Could you clarify the reason for contacting support?";
    if (!args.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) return "That email address doesn't look valid — could you double check it?";
    if (!args.phone?.trim() || !/^0?[789][01]\d{8}$/.test(args.phone)) return "That phone number doesn't look like a valid Nigerian number — could you resend it (e.g. 08012345678)?";
    return null;
}

function TypingDots(): JSX.Element {
    return (
        <span className="inline-flex items-center gap-1 px-1">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
            ))}
        </span>
    );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }): JSX.Element {
    const isUser = role === "user";
    return (
        <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${isUser ? "bg-slate-200 text-slate-600" : ""}`}>
                {isUser
                    ? <UserIcon size={12} />
                    : <Image src="/images/adaure.png" alt="Adaure" width={28} height={28} className="w-full h-full object-cover" />}
            </div>
            <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap break-words
                    ${isUser
                        ? "bg-[#1a8a3c] text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-700 rounded-bl-sm"}
                `}
            >
                {children}
            </div>
        </div>
    );
}

function SuccessScreen({ ticketRef, onReset }: { ticketRef: string; onReset: () => void }): JSX.Element {
    return (
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

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.28 }}>
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
                <p className="font-mono text-[15px] font-bold text-[#1a6630] tracking-widest">
                    <ClickCopy text={ticketRef} onCopied={() => { }}><>{ticketRef}</></ClickCopy>
                </p>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }} className="text-[11.5px] text-slate-400">
                Save this reference for any follow-up enquiries
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Button
                    variant="outline"
                    onClick={onReset}
                    className="border-slate-200 text-slate-500 hover:text-[#1a8a3c] hover:border-[#1a8a3c] text-[13px] h-9 mt-1"
                >
                    Start a New Chat
                </Button>
            </motion.div>
        </motion.div>
    );
}

export default function SupportChatContent({ prefillExamType }: { prefillExamType?: ExamTypeEnum }): JSX.Element {
    const [messages, setMessages] = useState<ChatMessage[]>(() => [
        { id: newId(), role: "assistant", text: greetingFor(prefillExamType) },
    ]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [ticketRef, setTicketRef] = useState("");

    const [contactSupport] = useCustomerSupportMutation();

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, sending]);

    async function submitTicket(args: TicketArgs) {
        const problem = validateTicketArgs(args);
        if (problem) {
            setMessages((prev) => [...prev, { id: newId(), role: "assistant", text: problem }]);
            return;
        }

        const payload: CustomerSupport = {
            fullName: args.fullName!,
            lga: args.lga as LgaEnum,
            schoolName: args.schoolName!,
            year: Number(args.year),
            exam: args.exam as ExamTypeEnum,
            examNo: args.examNo,
            reasonForContact: args.reasonForContact!,
            other: args.other,
            email: args.email!,
            phone: Number(args.phone),
        };

        try {
            const result = await contactSupport(payload).unwrap();
            setTicketRef(result.reference);
            setSubmitted(true);
        } catch (e) {
            console.error(e);
            setMessages((prev) => [...prev, { id: newId(), role: "assistant", text: "Sorry, I couldn't file that ticket just now — please try again in a moment." }]);
        }
    }

    async function handleSend() {
        const text = input.trim();
        if (!text || sending) return;

        const userMessage: ChatMessage = { id: newId(), role: "user", text };
        const history = [...messages, userMessage];
        setMessages(history);
        setInput("");
        setNotice(null);
        setSending(true);

        const assistantId = newId();
        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "" }]);

        try {
            const res = await fetch("/api/support-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, text: m.text })) }),
            });

            if (!res.ok || !res.body) {
                const body = await res.json().catch(() => ({}));
                setMessages((prev) => prev.map((m) => m.id === assistantId
                    ? { ...m, text: body?.error || "Something went wrong — please try again." }
                    : m));
                setSending(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let assistantText = "";
            let pendingTicket: TicketArgs | null = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                let newlineIndex: number;
                while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
                    const line = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);
                    if (!line) continue;

                    try {
                        const event = JSON.parse(line) as { type: string; value: unknown };
                        if (event.type === "text") {
                            assistantText += event.value as string;
                            setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, text: assistantText } : m));
                        } else if (event.type === "function_call") {
                            const call = event.value as { name: string; args: TicketArgs };
                            if (call.name === "submit_ticket") pendingTicket = call.args;
                        } else if (event.type === "error") {
                            setNotice(event.value as string);
                        }
                    } catch {
                        // ignore malformed line
                    }
                }
            }

            if (!assistantText.trim()) {
                setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            }

            if (pendingTicket) {
                await submitTicket(pendingTicket);
            }
        } catch (e) {
            console.error(e);
            setMessages((prev) => prev.map((m) => m.id === assistantId
                ? { ...m, text: "I couldn't reach the assistant just now — please try again." }
                : m));
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }

    function resetChat() {
        setMessages([{ id: newId(), role: "assistant", text: greetingFor(prefillExamType) }]);
        setSubmitted(false);
        setTicketRef("");
        setNotice(null);
        setInput("");
    }

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
                {submitted ? (
                    <SuccessScreen ticketRef={ticketRef} onReset={resetChat} />
                ) : (
                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
                            {messages.map((m) => (
                                <Bubble key={m.id} role={m.role}>
                                    {m.text || (m.role === "assistant" && sending ? <TypingDots /> : "")}
                                </Bubble>
                            ))}
                            <AnimatePresence>
                                {notice && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-[11.5px] text-red-500 flex items-center gap-1"
                                    >
                                        <AlertCircle size={11} /> {notice}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex-shrink-0 border-t border-slate-100 px-3.5 py-3">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message…"
                                    disabled={sending}
                                    maxLength={2000}
                                    className="flex-1 h-10 rounded-full border border-slate-200 px-4 text-[13.5px] outline-none focus:border-[#1a8a3c] focus:ring-2 focus:ring-green-100 disabled:opacity-60"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !input.trim()}
                                    aria-label="Send message"
                                    className="w-10 h-10 rounded-full bg-[#1a8a3c] hover:bg-[#22a84a] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
                                >
                                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                                </button>
                            </form>
                            <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1.5">
                                <Lock size={10} />
                                Your data is handled securely and used only for issue resolution
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
