"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi2";
import { FiDownload, FiX, FiRefreshCw, FiCalendar } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa6";
import { useAuth } from "../../providers/AuthProvider";
import {
  AiReport,
  generateAiReport,
  generateAiReportPDF,
  naira,
  providerLabel,
} from "@/lib/iirs/aiReport";

type Step = "pick" | "loading" | "done" | "error";

const iso = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

const PRESETS: { label: string; get: () => { from: string; to: string; tillDate: boolean } }[] = [
  { label: "Last 7 days", get: () => ({ from: daysAgo(6), to: iso(new Date()), tillDate: false }) },
  { label: "Last 30 days", get: () => ({ from: daysAgo(29), to: iso(new Date()), tillDate: false }) },
  {
    label: "This month",
    get: () => {
      const n = new Date();
      return { from: iso(new Date(n.getFullYear(), n.getMonth(), 1)), to: iso(n), tillDate: false };
    },
  },
  { label: "All time", get: () => ({ from: "", to: "", tillDate: true }) },
];

function Bubble({ from, children }: { from: "ai" | "user"; children: React.ReactNode }) {
  const ai = from === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${ai ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${
          ai
            ? "bg-gray-100 text-gray-800 rounded-tl-sm"
            : "bg-green-600 text-white rounded-tr-sm"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}

function ReportView({ report }: { report: AiReport }) {
  const { metrics, narrative } = report;
  const topType = metrics.topExam?.examType;
  return (
    <div className="space-y-4 w-full">
      <p className="leading-relaxed">{narrative.summary}</p>

      <div className="grid grid-cols-3 gap-2">
        {[
          ["Paid to check result", metrics.totals.resultChecks.toLocaleString()],
          ["Paid to find exam no.", metrics.totals.examNumberFinds.toLocaleString()],
          ["Revenue", naira(metrics.totals.revenue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white border border-gray-200 p-2.5">
            <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
            <p className="mt-1 font-semibold text-gray-900 text-sm break-words">{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {metrics.exams.map((e) => {
          const top = e.examType === topType;
          return (
            <div
              key={e.examType}
              className={`rounded-xl border p-3 ${
                top ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-gray-900 text-[13px]">{e.label}</p>
                {top && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5 shrink-0">
                    <FaTrophy /> Most traffic
                  </span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                <span>
                  <b className="block text-gray-900 text-sm">{e.resultChecks.toLocaleString()}</b>
                  result checks
                </span>
                <span>
                  <b className="block text-gray-900 text-sm">{e.examNumberFinds.toLocaleString()}</b>
                  exam no. finds
                </span>
                <span>
                  <b className="block text-gray-900 text-sm">{naira(e.revenue)}</b>
                  revenue
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {narrative.highlights.length > 0 && (
        <div>
          <p className="font-semibold text-gray-900 mb-1">Key insights</p>
          <ul className="list-disc pl-5 space-y-1">
            {narrative.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}
      {narrative.recommendations.length > 0 && (
        <div>
          <p className="font-semibold text-gray-900 mb-1">Recommendations</p>
          <ul className="list-disc pl-5 space-y-1">
            {narrative.recommendations.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-gray-400">Written by {providerLabel(report.provider)}</p>
    </div>
  );
}

export default function AiReportChat() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("pick");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(iso(new Date()));
  const [tillDate, setTillDate] = useState(false);
  const [asked, setAsked] = useState("");
  const [report, setReport] = useState<AiReport | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [step, report, open]);

  const today = iso(new Date());
  const rangeInvalid = !tillDate && !!from && !!to && from > to;
  const canSubmit = !rangeInvalid && (tillDate || !!to);

  const describe = (f: string, t: string, till: boolean) =>
    !f && till ? "All time, till date" : till ? `From ${f} till date` : `${f || "Beginning"} to ${t}`;

  const run = async (f: string, t: string, till: boolean) => {
    if (!token) return;
    setAsked(describe(f, t, till));
    setStep("loading");
    setError("");
    try {
      const result = await generateAiReport(token, {
        from: f || undefined,
        to: till ? undefined : t,
        tillDate: till,
      });
      setReport(result);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("pick");
    setReport(null);
    setError("");
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/30 cursor-pointer"
          >
            <span className="absolute inset-0 rounded-full bg-green-400/40 animate-ping [animation-duration:2.5s]" />
            <HiSparkles className="relative text-lg" />
            <span className="relative">Generate report</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[440px] h-[85vh] sm:h-[640px] sm:max-h-[calc(100vh-40px)] flex flex-col bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-green-600 to-teal-500 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <HiSparkles className="text-xl" />
                <div>
                  <p className="font-semibold leading-tight">AI Report Assistant</p>
                  <p className="text-[11px] text-white/80">Payments insights for IIRS</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1.5 hover:bg-white/20 cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <Bubble from="ai">
                Hi! I can put together a payments report for you. Pick the period you want
                covered — a date range, or from a date till today.
              </Bubble>

              {step === "pick" ? (
                <Bubble from="ai">
                  <div className="space-y-3 w-[17rem] max-w-full">
                    <p className="flex items-center gap-2 font-medium text-gray-900">
                      <FiCalendar /> Select a period
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESETS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => {
                            const v = p.get();
                            setFrom(v.from);
                            setTo(v.to || today);
                            setTillDate(v.tillDate);
                          }}
                          className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs hover:border-green-500 hover:text-green-700 cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <label className="block text-xs text-gray-600">
                      From
                      <input
                        type="date"
                        value={from}
                        max={today}
                        onChange={(e) => setFrom(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tillDate}
                        onChange={(e) => setTillDate(e.target.checked)}
                        className="accent-green-600"
                      />
                      Till date (up to today)
                    </label>
                    {!tillDate && (
                      <label className="block text-xs text-gray-600">
                        To
                        <input
                          type="date"
                          value={to}
                          max={today}
                          onChange={(e) => setTo(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                        />
                      </label>
                    )}
                    {rangeInvalid && (
                      <p className="text-xs text-red-600">“From” must be on or before “To”.</p>
                    )}
                    <button
                      disabled={!canSubmit}
                      onClick={() => run(from, to, tillDate)}
                      className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Generate report
                    </button>
                  </div>
                </Bubble>
              ) : (
                <Bubble from="user">{asked}</Bubble>
              )}

              {step === "loading" && (
                <Bubble from="ai">
                  <span className="flex items-center gap-2">
                    <HiSparkles className="animate-pulse text-green-600" />
                    Crunching the numbers and writing your report…
                  </span>
                </Bubble>
              )}

              {step === "error" && (
                <Bubble from="ai">
                  <p className="text-red-600 mb-2">{error}</p>
                  <button
                    onClick={reset}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs cursor-pointer"
                  >
                    <FiRefreshCw /> Try again
                  </button>
                </Bubble>
              )}

              {step === "done" && report && (
                <>
                  <Bubble from="ai">
                    <ReportView report={report} />
                  </Bubble>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateAiReportPDF(report)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 cursor-pointer"
                    >
                      <FiDownload /> Download PDF
                    </button>
                    <button
                      onClick={reset}
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <FiRefreshCw /> New report
                    </button>
                  </div>
                </>
              )}
              <div ref={bottomRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
