import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import customFont from '@/utils/font';
import { BASE_URL } from './dataInteraction';

export interface ActivityRow {
  activity: string;
  transactions: number;
  students: number;
  amount: number;
}

export interface ExamBreakdown {
  examType: string;
  label: string;
  resultChecks: number;
  examNumberFinds: number;
  revenue: number;
  traffic: number;
  shareOfTraffic: number;
  shareOfRevenue: number;
  rows: ActivityRow[];
  initiated: number;
  successful: number;
  conversionRate: number | null;
}

export interface Change {
  current: number;
  previous: number;
  changePct: number | null;
}

export interface AiReport {
  metrics: {
    period: { from: string | null; to: string; tillDate: boolean; label: string; days: number | null; partial: boolean; todayExcluded: boolean };
    totals: {
      resultChecks: number;
      resultCheckTransactions: number;
      examNumberFinds: number;
      examNumberFindTransactions: number;
      revenue: number;
      traffic: number;
      transactions: number;
      averageRevenuePerTransaction: number;
      repeatFinderPayments: number;
    };
    revenueBySource: { singleCheck: number; batchCheck: number; examNumberFind: number };
    exams: ExamBreakdown[];
    topExam: { examType: string; label: string; traffic: number; shareOfTraffic: number } | null;
    comparison: {
      previousLabel: string;
      resultChecks: Change;
      examNumberFinds: Change;
      revenue: Change;
      traffic: Change;
    } | null;
    trend: {
      daily: { date: string; traffic: number; revenue: number }[];
      peakDay: { date: string; traffic: number; revenue: number } | null;
      activeDays: number;
      averageDailyRevenue: number;
    };
    topLgas: { lga: string; traffic: number; revenue: number }[];
    conversion: { initiated: number; successful: number; rate: number | null };
  };
  narrative: { summary: string; highlights: string[]; recommendations: string[] };
  provider: string;
  generatedAt: string;
}

export interface AiReportRequest {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  tillDate?: boolean;
  includeToday?: boolean;
}

export async function generateAiReport(token: string, payload: AiReportRequest): Promise<AiReport> {
  const response = await fetch(`${BASE_URL}/ai-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message || 'Could not generate the report');
  }
  return body;
}

export const naira = (n: number) => `₦${(n ?? 0).toLocaleString('en-NG')}`;

const PROVIDER_LABELS: Record<string, string> = {
  groq: 'Groq',
  claude: 'Claude',
  fallback: 'built-in summary',
};
export const providerLabel = (p: string) => PROVIDER_LABELS[p] ?? p;

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "9 Oct – 16 Oct 2026" (years shown only when they differ). */
export function shortPeriod(period: AiReport['metrics']['period']): string {
  if (!period.from) return period.tillDate ? 'All time' : `Up to ${period.to}`;
  const part = (iso: string, year: boolean) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${SHORT_MONTHS[m - 1]}${year ? ` ${y}` : ''}`;
  };
  const sameYear = period.from.slice(0, 4) === period.to.slice(0, 4);
  return `${part(period.from, !sameYear)} – ${part(period.to, true)}`;
}

/** The plain-text WhatsApp message for the Commissioner. */
export function buildWhatsAppMessage(report: AiReport): string {
  const { metrics } = report;
  const n = (v: number) => v.toLocaleString('en-US');
  const exam: string[] = [];
  for (const e of metrics.exams) {
    if (e.resultChecks > 0) exam.push(`${n(e.resultChecks)} students paid for ${e.label}`);
    if (e.examNumberFinds > 0) exam.push(`${n(e.examNumberFinds)} students paid to find their ${e.examType === 'UBEAT' ? e.examType : e.label} exam number`);
  }
  return [
    'Good morning Sir',
    'Please Sir below is a comprehensive report for result checking',
    '',
    shortPeriod(metrics.period) + (metrics.period.partial ? ' (today still in progress)' : ''),
    `${n(metrics.totals.resultChecks)} students have checked their results`,
    `${n(metrics.totals.examNumberFinds)} students paid to find their exam number`,
    '',
    `A total revenue of ${n(metrics.totals.revenue)} naira was generated`,
    ...(exam.length ? ['', ...exam] : []),
    '',
    'Thank you Sir',
  ].join('\n');
}

/** wa.me link with the message prefilled. The number comes from NEXT_PUBLIC_COMMISSIONER_WHATSAPP_NUMBER. */
export function whatsappLink(message: string): { url: string; hasNumber: boolean } {
  let digits = (process.env.NEXT_PUBLIC_COMMISSIONER_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) digits = `234${digits.slice(1)}`;
  return { url: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`, hasNumber: !!digits };
}

export const changeText = (c: Change | undefined) =>
  !c || c.changePct === null ? null : `${c.changePct >= 0 ? '▲' : '▼'} ${Math.abs(c.changePct)}%`;

export function generateAiReportPDF(report: AiReport) {
  const { metrics, narrative } = report;
  const { totals, comparison, trend } = metrics;
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const GREEN: [number, number, number] = [22, 163, 74];

  doc.addFileToVFS('CustomFont.ttf', customFont);
  doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
  // Same file for bold: without it jsPDF falls back to Times Bold, which breaks digit spacing.
  doc.addFont('CustomFont.ttf', 'CustomFont', 'bold');
  doc.setFont('CustomFont', 'normal');
  // The embedded font has no ₦ glyph, so the PDF uses NGN.
  const money = (n: number) => `NGN ${(n ?? 0).toLocaleString('en-US')}`;
  // jsPDF's default font has no ▲/▼ either.
  const delta = (c: Change | undefined) =>
    !c || c.changePct === null ? '' : `${c.changePct >= 0 ? '+' : '-'}${Math.abs(c.changePct)}% vs previous period`;

  // Header band
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('Result Checking Report', M, 16);
  doc.setFontSize(11);
  doc.setFont('CustomFont', 'bold');
  doc.text(`Period: ${metrics.period.label}`, M, 24);
  doc.setFont('CustomFont', 'normal');
  doc.setFontSize(10);
  doc.text(
    `Generated ${new Date(report.generatedAt).toLocaleString()}` +
      (metrics.period.partial ? '  |  PARTIAL: today is still in progress' : ''),
    M,
    30,
  );

  let y = 46;
  const ensure = (h: number) => {
    if (y + h > H - 18) {
      doc.addPage();
      y = 20;
    }
  };
  const heading = (t: string) => {
    ensure(16);
    doc.setFont('CustomFont', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(21, 128, 61);
    doc.text(t, M, y);
    doc.setFont('CustomFont', 'normal');
    y += 5;
  };
  const paragraph = (t: string, size = 10) => {
    doc.setFontSize(size);
    doc.setTextColor(70, 70, 70);
    const lines = doc.splitTextToSize(t, W - 2 * M);
    ensure(lines.length * 5 + 2);
    doc.text(lines, M, y + 3);
    y += lines.length * 5 + 4;
  };
  const after = () => {
    y = (doc as any).lastAutoTable.finalY + 9;
  };
  const tableBase = {
    theme: 'grid' as const,
    headStyles: { fillColor: GREEN, font: 'CustomFont' },
    styles: { fontSize: 9.5, cellPadding: 2.8, font: 'CustomFont' },
    margin: { left: M, right: M },
  };

  // Executive summary
  heading('Executive summary');
  paragraph(narrative.summary);

  // KPI cards
  ensure(34);
  const cardW = (W - 2 * M - 8) / 3;
  const cards: [string, string, string][] = [
    ['Students who checked a result', totals.resultChecks.toLocaleString(), delta(comparison?.resultChecks)],
    ['Students who paid to find exam number', totals.examNumberFinds.toLocaleString(), delta(comparison?.examNumberFinds)],
    ['Revenue generated', money(totals.revenue), delta(comparison?.revenue)],
  ];
  cards.forEach(([label, value, change], i) => {
    const x = M + i * (cardW + 4);
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(...GREEN);
    doc.roundedRect(x, y, cardW, 28, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(doc.splitTextToSize(label, cardW - 6), x + 3, y + 6);
    doc.setFont('CustomFont', 'bold');
    doc.setFontSize(i === 2 ? 13 : 16);
    doc.setTextColor(30, 41, 59);
    doc.text(value, x + 3, y + 18);
    doc.setFont('CustomFont', 'normal');
    if (change) {
      doc.setFontSize(7.5);
      const down = change.startsWith('-');
      doc.setTextColor(down ? 185 : 21, down ? 28 : 128, down ? 28 : 61);
      doc.text(change, x + 3, y + 24.5);
    }
  });
  y += 36;

  const repeat =
    totals.repeatFinderPayments > 0
      ? ` (${totals.repeatFinderPayments.toLocaleString()} of them repeat payments by students who had already paid)`
      : '';
  paragraph(
    `${totals.resultCheckTransactions.toLocaleString()} successful payments covered the ${totals.resultChecks.toLocaleString()} students who checked a result (one batch payment can cover several students). ` +
      `A further ${totals.examNumberFindTransactions.toLocaleString()} successful payments were made by ${totals.examNumberFinds.toLocaleString()} distinct students to find an exam number${repeat}. ` +
      `Average revenue per payment: ${money(totals.averageRevenuePerTransaction)}.`,
  );

  // Revenue by source
  heading('Revenue by source');
  autoTable(doc, {
    ...tableBase,
    startY: y,
    head: [['Revenue source', 'Share', 'Amount']],
    body: [
      ['Checking a result (single-student)', metrics.revenueBySource.singleCheck],
      ['Checking a result (batch / school)', metrics.revenueBySource.batchCheck],
      ['Finding a lost exam number', metrics.revenueBySource.examNumberFind],
    ].map(([l, a]) => [
      l as string,
      totals.revenue ? `${Math.round(((a as number) / totals.revenue) * 1000) / 10}%` : '-',
      money(a as number),
    ]),
    foot: [['Total', '100%', money(totals.revenue)]],
    footStyles: { fillColor: [240, 253, 244], textColor: [30, 41, 59], font: 'CustomFont', fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    didParseCell: (d) => {
      if (d.section === 'foot' && d.column.index > 0) d.cell.styles.halign = 'right';
    },
  });
  after();

  // Exams at a glance
  heading('Exams at a glance');
  const topType = metrics.topExam?.examType;
  autoTable(doc, {
    ...tableBase,
    startY: y,
    head: [['Exam', 'Traffic', 'Share of traffic', 'Revenue', 'Share of revenue', 'Payment completion']],
    body: metrics.exams.map((e) => [
      e.examType === topType ? `${e.label} (most traffic)` : e.label,
      e.traffic.toLocaleString(),
      `${e.shareOfTraffic}%`,
      money(e.revenue),
      `${e.shareOfRevenue}%`,
      e.conversionRate === null ? '-' : `${e.conversionRate}%`,
    ]),
    columnStyles: {
      0: { cellWidth: 52 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', cellWidth: 34 },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
    didParseCell: (d) => {
      if (d.section === 'body' && metrics.exams[d.row.index]?.examType === topType) {
        d.cell.styles.fillColor = [220, 252, 231];
        d.cell.styles.textColor = [21, 128, 61];
      }
    },
  });
  after();

  // Per-exam activity breakdown
  heading('Breakdown by exam and activity');
  const body: any[] = [];
  metrics.exams.forEach((e) => {
    e.rows
      .filter((r) => r.transactions > 0 || r.amount > 0)
      .forEach((r) =>
        body.push([e.label, r.activity, r.transactions.toLocaleString(), r.students.toLocaleString(), money(r.amount)]),
      );
  });
  autoTable(doc, {
    ...tableBase,
    startY: y,
    head: [['Exam', 'Activity', 'Transactions', 'Students', 'Amount']],
    body: body.length ? body : [['No activity in this period', '', '', '', '']],
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], font: 'CustomFont' },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
  });
  after();

  // Daily trend chart
  if (trend.daily.length > 1) {
    heading('Daily activity');
    const chartH = 34;
    ensure(chartH + 16);
    const max = Math.max(...trend.daily.map((d) => d.traffic), 1);
    const slot = (W - 2 * M) / trend.daily.length;
    const barW = Math.min(slot * 0.7, 8);
    trend.daily.forEach((d, i) => {
      const h = (d.traffic / max) * chartH;
      const isPeak = d.date === trend.peakDay?.date;
      doc.setFillColor(...(isPeak ? ([21, 128, 61] as [number, number, number]) : ([134, 239, 172] as [number, number, number])));
      doc.rect(M + i * slot + (slot - barW) / 2, y + 4 + chartH - h, barW, Math.max(h, 0.4), 'F');
    });
    doc.setDrawColor(200, 200, 200);
    doc.line(M, y + 4 + chartH, W - M, y + 4 + chartH);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(trend.daily[0].date, M, y + chartH + 9);
    doc.text(trend.daily[trend.daily.length - 1].date, W - M, y + chartH + 9, { align: 'right' });
    y += chartH + 14;
    if (trend.peakDay) {
      paragraph(
        `Busiest day: ${trend.peakDay.date} with ${trend.peakDay.traffic.toLocaleString()} paid activities and ${money(trend.peakDay.revenue)}. ` +
          `Active on ${trend.activeDays} day(s); average revenue per day ${money(trend.averageDailyRevenue)}.`,
        9,
      );
    }
  }

  // Top LGAs
  if (metrics.topLgas.length) {
    heading('Top LGAs by activity');
    autoTable(doc, {
      ...tableBase,
      startY: y,
      head: [['LGA', 'Traffic', 'Revenue']],
      body: metrics.topLgas.map((l) => [l.lga, l.traffic.toLocaleString(), money(l.revenue)]),
      theme: 'striped',
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    });
    after();
  }

  const bullets = (title: string, items: string[]) => {
    if (!items.length) return;
    heading(title);
    y += 2;
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    for (const item of items) {
      const lines = doc.splitTextToSize(item, W - 2 * M - 8);
      ensure(lines.length * 5 + 2);
      doc.text('•', M + 2, y);
      doc.text(lines, M + 8, y);
      y += lines.length * 5 + 2;
    }
    y += 5;
  };
  bullets('Key insights', narrative.highlights);
  bullets('Recommendations', narrative.recommendations);

  // Methodology
  heading('Methodology');
  doc.setTextColor(120, 120, 120);
  paragraph(
    'Figures come from the result-checking payment records, filtered to successful payments and dated by the confirmed payment time (Africa/Lagos for daily figures). ' +
      '"Checked a result" counts students covered by a successful single-student or batch payment; "Found exam number" counts distinct students who paid to recover an exam number. ' +
      'Revenue is the face value paid for the service and excludes the gateway processing fee added at checkout. ' +
      'Payment completion is the share of payments started in the period that were completed. ' +
      (comparison ? `Changes compare with the previous period of equal length (${comparison.previousLabel}). ` : '') +
      (metrics.period.partial
        ? 'This report includes today, which is still in progress, so the latest figures are partial and will change. '
        : 'Reports cover complete days only (Africa/Lagos time); today is excluded because it is still in progress. ') +
      'First School Leaving Certificate figures are recorded under the UBEAT exam type.',
    8.5,
  );

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Narrative by ${providerLabel(report.provider)} · Powered by Imo Digital City Limited`, M, H - 8);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 8, { align: 'right' });
  }

  doc.save(`result-checking-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
