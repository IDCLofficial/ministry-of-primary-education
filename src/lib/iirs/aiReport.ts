import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import customFont from '@/utils/font';
import { BASE_URL } from './dataInteraction';

export interface ExamBreakdown {
  examType: string;
  label: string;
  resultChecks: number;
  examNumberFinds: number;
  revenue: number;
  traffic: number;
}

export interface AiReport {
  metrics: {
    period: { from: string | null; to: string; tillDate: boolean; label: string };
    totals: { resultChecks: number; examNumberFinds: number; revenue: number; traffic: number };
    exams: ExamBreakdown[];
    topExam: { examType: string; label: string; traffic: number; shareOfTraffic: number } | null;
  };
  narrative: { summary: string; highlights: string[]; recommendations: string[] };
  provider: string;
  generatedAt: string;
}

export interface AiReportRequest {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  tillDate?: boolean;
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

export function generateAiReportPDF(report: AiReport) {
  const { metrics, narrative } = report;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.addFileToVFS('CustomFont.ttf', customFont);
  doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
  // Same file for bold: without it jsPDF falls back to Times Bold, which breaks digit spacing.
  doc.addFont('CustomFont.ttf', 'CustomFont', 'bold');
  doc.setFont('CustomFont', 'normal');
  // The embedded font has no ₦ glyph, so the PDF uses NGN.
  const money = (n: number) => `NGN ${(n ?? 0).toLocaleString('en-US')}`;

  // Header band
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('Result Checking Report', 14, 16);
  doc.setFontSize(11);
  doc.setFont('CustomFont', 'bold');
  doc.text(`Period: ${metrics.period.label}`, 14, 24);
  doc.setFont('CustomFont', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated ${new Date(report.generatedAt).toLocaleString()}`, 14, 30);

  // Summary narrative
  let y = 46;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(13);
  doc.text('Executive summary', 14, y);
  doc.setFontSize(10);
  doc.setTextColor(70, 70, 70);
  const summaryLines = doc.splitTextToSize(narrative.summary, pageWidth - 28);
  doc.text(summaryLines, 14, y + 7);
  y += 7 + summaryLines.length * 5 + 6;

  // Overall totals
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text('Overall totals', 14, y);
  autoTable(doc, {
    startY: y + 3,
    head: [['Metric', 'Value']],
    body: [
      ['Students who paid to check their result', metrics.totals.resultChecks.toLocaleString()],
      ['Students who paid to find their exam number', metrics.totals.examNumberFinds.toLocaleString()],
      ['Total revenue generated', money(metrics.totals.revenue)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74], font: 'CustomFont' },
    styles: { fontSize: 10, cellPadding: 3, font: 'CustomFont' },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold', font: 'CustomFont' } },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Per exam
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text('Breakdown per exam', 14, y);
  const topType = metrics.topExam?.examType;
  autoTable(doc, {
    startY: y + 3,
    head: [['Exam', 'Result checks', 'Exam number finds', 'Revenue', 'Traffic']],
    body: metrics.exams.map((e) => [
      e.examType === topType ? `${e.label}  (most traffic)` : e.label,
      e.resultChecks.toLocaleString(),
      e.examNumberFinds.toLocaleString(),
      money(e.revenue),
      e.traffic.toLocaleString(),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74], font: 'CustomFont' },
    styles: { fontSize: 10, cellPadding: 3, font: 'CustomFont' },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && metrics.exams[data.row.index]?.examType === topType) {
        data.cell.styles.fillColor = [220, 252, 231];
        data.cell.styles.textColor = [21, 128, 61];
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  if (metrics.topExam) {
    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61);
    const t = metrics.topExam;
    doc.text(
      `${t.label} had the most traffic: ${t.traffic.toLocaleString()} paid activities (${t.shareOfTraffic}% of the total).`,
      14,
      y,
    );
    y += 10;
  }

  // Bullet sections
  const bullets = (title: string, items: string[]) => {
    if (!items.length) return;
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    for (const item of items) {
      const lines = doc.splitTextToSize(item, pageWidth - 36);
      if (y + lines.length * 5 > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text('•', 16, y);
      doc.text(lines, 22, y);
      y += lines.length * 5 + 2;
    }
    y += 4;
  };
  bullets('Key insights', narrative.highlights);
  bullets('Recommendations', narrative.recommendations);

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Narrative by ${providerLabel(report.provider)} · Powered by Imo Digital City Limited`,
      14,
      pageHeight - 8,
    );
    doc.text(`Page ${i} of ${pages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`iirs-ai-report-${stamp}.pdf`);
}
