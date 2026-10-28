"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi2";
import { FiDownload, FiX, FiRefreshCw, FiCalendar } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { FaTrophy } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useAuth } from "../../providers/AuthProvider";
import {
  AiReport,
  buildWhatsAppMessage,
  Change,
  changeText,
  generateAiReport,
  generateAiReportPDF,
  naira,
  providerLabel,
  whatsappLink,
} from "@/lib/iirs/aiReport";

type Step = "pick" | "loading" | "done" | "error";

// Reports follow Nigerian (Lagos) calendar days, matching the backend.
const lagosToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
const shift = (isoDate: string, days: number) =>
  new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

/** The last day a report can cover: yesterday, or today when partial days are allowed. */
const lastDay = (includeToday: boolean) => (includeToday ? lagosToday() : shift(lagosToday(), -1));

const PRESETS: {
  label: string;
  get: (includeToday: boolean) => { from: string; to: string; tillDate: boolean };
}[] = [
  { label: "Last 7 days", get: (t) => ({ from: shift(lastDay(t), -6), to: lastDay(t), tillDate: false }) },
  { label: "Last 30 days", get: (t) => ({ from: shift(lastDay(t), -29), to: lastDay(t), tillDate: false }) },
  {
    label: "This month",
    get: (t) => {
      const end = lastDay(t);
      return { from: `${end.slice(0, 8)}01`, to: end, tillDate: false };
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

function Delta({ c }: { c?: Change }) {
  const t = changeText(c);
  if (!t) return null;
  const down = (c?.changePct ?? 0) < 0;
  return (
    <span className={`text-[11px] font-medium ${down ? "text-red-600" : "text-green-600"}`}>
      {t}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-gray-900 mb-1.5">{title}</p>
      {children}
    </div>
  );
}

function ReportView({ report }: { report: AiReport }) {
  const { metrics, narrative } = report;
  const { totals, comparison, trend, revenueBySource } = metrics;
  const topType = metrics.topExam?.examType;
  const maxDay = Math.max(...trend.daily.map((d) => d.traffic), 1);
  const mix = [
    ["Single checks", revenueBySource.singleCheck, "bg-green-600"],
    ["Batch checks", revenueBySource.batchCheck, "bg-emerald-400"],
    ["Exam no. finds", revenueBySource.examNumberFind, "bg-teal-300"],
  ] as const;

  return (
    <div className="space-y-4 w-full">
      <p className="leading-relaxed">{narrative.summary}</p>
      {metrics.period.partial && (
        <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          Partial report: today is still in progress, so the latest figures will keep changing.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          ["Paid to check result", totals.resultChecks.toLocaleString(), comparison?.resultChecks],
          ["Paid to find exam no.", totals.examNumberFinds.toLocaleString(), comparison?.examNumberFinds],
          ["Revenue", naira(totals.revenue), comparison?.revenue],
        ].map(([label, value, change]) => (
          <div key={label as string} className="rounded-xl bg-white border border-gray-200 p-2.5">
            <p className="text-[11px] text-gray-500 leading-tight">{label as string}</p>
            <p className="mt-1 font-semibold text-gray-900 text-sm break-words">{value as string}</p>
            <Delta c={change as Change | undefined} />
          </div>
        ))}
      </div>
      {comparison && (
        <p className="text-[11px] text-gray-400 -mt-2">Change vs {comparison.previousLabel}</p>
      )}
      <p className="text-xs text-gray-600">
        {totals.resultCheckTransactions.toLocaleString()} payments covered the {totals.resultChecks.toLocaleString()} result
        checks; {totals.examNumberFindTransactions.toLocaleString()} payments were made by{" "}
        {totals.examNumberFinds.toLocaleString()} students to find an exam number.
      </p>

      {totals.revenue > 0 && (
        <Section title="Revenue by source">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
            {mix.map(([l, v, c]) => (
              <div key={l} className={c} style={{ width: `${(v / totals.revenue) * 100}%` }} />
            ))}
          </div>
          <div className="mt-2 space-y-1">
            {mix.map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className={`h-2 w-2 rounded-full ${c}`} /> {l}
                </span>
                <span className="font-medium text-gray-900">
                  {naira(v)} · {Math.round((v / totals.revenue) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="By exam">
        <div className="space-y-2">
          {metrics.exams.map((e) => {
            const top = e.examType === topType;
            return (
              <div
                key={e.examType}
                className={`rounded-xl border p-3 ${top ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"}`}
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
                <p className="mt-2 text-[11px] text-gray-500">
                  {e.shareOfTraffic}% of traffic · {e.shareOfRevenue}% of revenue
                  {e.conversionRate !== null && ` · ${e.conversionRate}% of payments completed`}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      {trend.daily.length > 1 && (
        <Section title="Daily activity">
          <div className="flex h-16 items-end gap-0.5">
            {trend.daily.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.traffic} activities · ${naira(d.revenue)}`}
                className={`flex-1 rounded-t-sm ${d.date === trend.peakDay?.date ? "bg-green-700" : "bg-green-300"}`}
                style={{ height: `${Math.max((d.traffic / maxDay) * 100, 3)}%` }}
              />
            ))}
          </div>
          {trend.peakDay && (
            <p className="mt-1 text-[11px] text-gray-500">
              Busiest day {trend.peakDay.date}: {trend.peakDay.traffic.toLocaleString()} activities,{" "}
              {naira(trend.peakDay.revenue)}
            </p>
          )}
        </Section>
      )}

      {metrics.topLgas.length > 0 && (
        <Section title="Top LGAs">
          <div className="space-y-1">
            {metrics.topLgas.map((l) => (
              <div key={l.lga} className="flex justify-between text-xs">
                <span className="text-gray-600">{l.lga}</span>
                <span className="font-medium text-gray-900">
                  {l.traffic.toLocaleString()} · {naira(l.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {narrative.highlights.length > 0 && (
        <Section title="Key insights">
          <ul className="list-disc pl-5 space-y-1">
            {narrative.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </Section>
      )}
      {narrative.recommendations.length > 0 && (
        <Section title="Recommendations">
          <ul className="list-disc pl-5 space-y-1">
            {narrative.recommendations.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </Section>
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
  const [includeToday, setIncludeToday] = useState(false);
  const [to, setTo] = useState(lastDay(false));
  const [tillDate, setTillDate] = useState(false);
  const [asked, setAsked] = useState("");
  const [report, setReport] = useState<AiReport | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [step, report, open]);

  const maxDate = lastDay(includeToday);
  const rangeInvalid = !tillDate && !!from && !!to && from > to;
  const canSubmit = !rangeInvalid && (tillDate || !!to);

  const describe = (f: string, t: string, till: boolean) =>
    (!f && till ? "All time" : till ? `From ${f} till ${maxDate}` : `${f || "Beginning"} to ${t}`) +
    (includeToday ? " (including today)" : "");

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
        includeToday,
      });
      setReport(result);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("error");
    }
  };

  // WhatsApp links can't carry attachments: download the PDF, then open the chat with the
  // message prefilled so the PDF can be attached from the device.
  const sendViaWhatsApp = () => {
    if (!report) return;
    const { url, hasNumber } = whatsappLink(buildWhatsAppMessage(report));
    window.open(url, "_blank", "noopener,noreferrer");
    generateAiReportPDF(report);
    toast.success(
      hasNumber
        ? "Report PDF downloaded. Attach it in the WhatsApp chat."
        : "Commissioner's number isn't configured, so choose the contact in WhatsApp. Attach the downloaded PDF.",
      { duration: 6000 },
    );
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
                covered — a date range, or from a date till now. Days still in progress are left out unless you include today.
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
                            const v = p.get(includeToday);
                            setFrom(v.from);
                            setTo(v.to || maxDate);
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
                        max={maxDate}
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
                      {includeToday ? "Till date (up to now)" : "Till date (up to yesterday)"}
                    </label>
                    <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeToday}
                        onChange={(e) => {
                          setIncludeToday(e.target.checked);
                          if (!e.target.checked) {
                            const cap = lastDay(false);
                            if (to > cap) setTo(cap);
                            if (from > cap) setFrom(cap);
                          }
                        }}
                        className="mt-0.5 accent-green-600"
                      />
                      <span>
                        Include today
                        <span className="block text-[11px] text-gray-500">
                          Today is still in progress, so its figures are partial and will change.
                        </span>
                      </span>
                    </label>
                    {!tillDate && (
                      <label className="block text-xs text-gray-600">
                        To
                        <input
                          type="date"
                          value={to}
                          max={maxDate}
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
                  <button
                    onClick={sendViaWhatsApp}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2 text-sm font-semibold text-white hover:bg-[#1ebe5b] cursor-pointer"
                  >
                    <FaWhatsapp className="text-lg" /> Send via WhatsApp
                  </button>
                  <p className="-mt-1 text-[11px] text-gray-500">
                    Downloads the PDF and opens WhatsApp with the message ready. Attach the PDF in the chat before sending.
                  </p>
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
