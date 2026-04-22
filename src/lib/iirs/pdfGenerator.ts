import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import customFont from '@/utils/font';
import { ResultPaymentExamTypeStats, ResultPaymentRecord } from './dataInteraction';

const lgaMapping: Record<string, string> = {
  "A M": "Aboh Mbaise",
  "O M": "Owerri Municipal",
  "O N": "Owerri North",
};

interface PaymentData {
  id: string;
  schoolName: string;
  schoolCode: string;
  state: string;
  amount: number;
  numberOfStudents: number;
  paymentStatus: string;
  paymentMethod: string;
  paidAt: string;
  reference: string;
  tsaEarnings: number;
  idclEarnings: number;
}

interface StatsData {
  totalPayments: number;
  totalAmountProcessedByTsa: number;
  totalTsaEarnings: number;
  totalIdclEarnings: number;
  totalPaystackCharge: number;
  recentPayments: PaymentData[];
  totalLatestPayout: number;
  totalLatestIdclPayout: number;
  totalLatestTsaPayout: number;
}

interface ResultPaymentsReportData {
  filters: {
    examType?: string;
    year?: string;
    paymentStatus?: string;
  };
  total: number;
  totalAmount: number;
  amountByExamType: Record<string, ResultPaymentExamTypeStats>;
  rows: ResultPaymentRecord[];
}

type ResultPaymentsPdfAction = 'download' | 'print';

export async function generatePaymentReportPDF(
  stats: StatsData,
  date: string
) {
  const doc = new jsPDF();

  // Add custom font to fix character spacing issues
  doc.addFileToVFS('CustomFont.ttf', customFont);
  doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
  doc.setFont('CustomFont');

  // Add header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Payments Report', 14, 22);

  // Add period info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${date}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

  // Add summary statistics
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary Statistics', 14, 48);

  const summaryData = [
    ['Total Payments', stats.totalPayments.toLocaleString()],
    ['Total Amount Processed', `₦${stats.totalAmountProcessedByTsa.toLocaleString()}`],
    ['TSA Earnings', `₦${stats.totalTsaEarnings?.toLocaleString()}`],
    ['IDCL Earnings', `₦${stats.totalIdclEarnings?.toLocaleString()}`],
    ['Paystack Charges', `₦${stats.totalPaystackCharge?.toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: 52,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], font: 'CustomFont' },
    margin: { left: 14 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      font: 'CustomFont'
    },
    columnStyles: {
      1: { halign: 'right' }
    }
  });

  // Add payment details table
  const summaryY = (doc as any).lastAutoTable.finalY || 52;
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Payment Details', 14, summaryY + 12);

  const paymentTableData = stats.recentPayments.map((payment) => {
    return [
      payment.schoolName,
      payment.schoolCode,
      `₦${payment.amount?.toLocaleString()}`,
      payment.numberOfStudents?.toString() || '0',
      `₦${payment.tsaEarnings?.toLocaleString()}`,
      `₦${payment.idclEarnings?.toLocaleString()}`,
      new Date(payment.paidAt).toLocaleDateString(),
      new Date(payment.paidAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    ];
  });

  autoTable(doc, {
    startY: summaryY + 16,
    head: [['School Name', 'Code', 'Amount', 'Students', 'TSA Earning', 'IDCL Earning', 'Date', 'Time']],
    body: paymentTableData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], font: 'CustomFont' },
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      font: 'CustomFont'
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 20 },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 18, halign: 'center' },
    }
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'Powered by Imo Digital City Limited',
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `MOE_Payment_Report_${date.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export async function generateResultPaymentsReportPDF(
  report: ResultPaymentsReportData,
  action: ResultPaymentsPdfAction = 'download'
) {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.addFileToVFS('CustomFont.ttf', customFont);
  doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
  doc.setFont('CustomFont');

  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('Result Payment Statistics Report', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
  doc.text(`Exam Type: ${report.filters.examType || 'All'}`, 14, 31);
  doc.text(`Year: ${report.filters.year || 'All'}`, 80, 31);
  doc.text(`Payment Status: ${report.filters.paymentStatus || 'All'}`, 130, 31);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary', 14, 42);

  autoTable(doc, {
    startY: 46,
    head: [['Metric', 'Value']],
    body: [
      ['Total Records', report.total.toLocaleString()],
      ['Total Amount', `NGN ${report.totalAmount.toLocaleString()}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], font: 'CustomFont' },
    margin: { left: 14 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
      font: 'CustomFont',
    },
    columnStyles: {
      1: { halign: 'right' },
    },
  });

  const summaryY = (doc as any).lastAutoTable.finalY || 46;

  doc.setFontSize(12);
  doc.text('Amount By Exam Type', 14, summaryY + 12);

  autoTable(doc, {
    startY: summaryY + 16,
    head: [['Exam Type', 'Total Amount', 'Count']],
    body: Object.entries(report.amountByExamType).map(([examType, breakdown]) => [
      examType,
      `NGN ${breakdown.totalAmount.toLocaleString()}`,
      breakdown.count.toLocaleString(),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], font: 'CustomFont' },
    margin: { left: 14 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
      font: 'CustomFont',
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
  });

  const breakdownY = (doc as any).lastAutoTable.finalY || summaryY + 16;

  doc.setFontSize(12);
  doc.text('Payment Records', 14, breakdownY + 12);

  autoTable(doc, {
    startY: breakdownY + 16,
    head: [[
      'Exam Type',
      'Amount',
      'Exam No.',
      'Year',
      'Student Name',
      'LGA',
      'School Name',
      'Reference',
      'Status',
      'Mode',
      'Created At',
    ]],
    body: report.rows.map((row) => [
      row.examType,
      `NGN ${row.amount.toLocaleString()}`,
      row.examNumber,
      String(row.examYear),
      row.studentName,
      lgaMapping[row.lga] || row.lga,
      row.schoolName,
      row.paymentReference,
      row.paymentStatus,
      row.searchMode,
      new Date(row.createdAt).toLocaleString(),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], font: 'CustomFont' },
    margin: { left: 10, right: 10 },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      font: 'CustomFont',
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 24 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 34 },
      5: { cellWidth: 24 },
      6: { cellWidth: 34 },
      7: { cellWidth: 38 },
      8: { cellWidth: 18 },
      9: { cellWidth: 16 },
      10: { cellWidth: 28 },
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'Powered by Imo Digital City Limited',
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }

  const suffix = [report.filters.examType || 'all', report.filters.year || 'all', report.filters.paymentStatus || 'all']
    .join('-')
    .replace(/\s+/g, '-')
    .toLowerCase();
  const fileName = `result-payment-report-${suffix}-${new Date().toISOString().split('T')[0]}.pdf`;

  if (action === 'print') {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    const printWindow = window.open(blobUrl, '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print preview. Please allow pop-ups and try again.');
    }
    return;
  }

  doc.save(fileName);
}