import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import customFont from '@/utils/font';

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
  iirsEarning: number;
}

interface StatsData {
  totalPayments: number;
  totalAmountProcessedByTsa: number;
  totalTsaEarnings: number;
  totalIdclEarnings: number;
  totalPaystackCharge: number;
}

// Helper function to determine if a payment is settled
// Settlement Rule: Payments made before 12:00 AM (midnight) are settled at 6:00 AM the next day
function isPaymentSettled(paymentDate: string): boolean {
  const payment = new Date(paymentDate);
  const now = new Date();
  
  // Get midnight of the day AFTER the payment was made
  const nextDayMidnight = new Date(payment);
  nextDayMidnight.setHours(0, 0, 0, 0);
  nextDayMidnight.setDate(nextDayMidnight.getDate() + 1);
  
  // Get the settlement time (6 AM of the day after payment)
  const settlementTime = new Date(nextDayMidnight);
  settlementTime.setHours(6, 0, 0, 0);
  
  // Payment is settled if current time is past 6 AM of the day after payment
  // Example: Payment at 25/02/2026 08:43 PM -> Settles at 26/02/2026 06:00 AM
  return now >= settlementTime;
}

export async function generatePaymentReportPDF(
  payments: PaymentData[],
  stats: StatsData,
  period: string = 'All Time'
) {
  const doc = new jsPDF();
  
  // Add custom font to fix character spacing issues
  doc.addFileToVFS('CustomFont.ttf', customFont);
  doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
  doc.setFont('CustomFont');
  
  // Categorize payments based on settlement status
  const settledPayments = payments.filter(p => isPaymentSettled(p.paidAt));
  const pendingPayments = payments.filter(p => !isPaymentSettled(p.paidAt));
  
  // Calculate settled amounts
  const settledAmount = settledPayments.reduce((sum, p) => sum + p.amount, 0);
  const settledEarnings = settledPayments.reduce((sum, p) => sum + p.iirsEarning, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingEarnings = pendingPayments.reduce((sum, p) => sum + p.iirsEarning, 0);
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('IIRS Payment Report', 14, 22);
  
  // Add period info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${period}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
  doc.text('Settlement Rule: Payments before midnight settle at 6:00 AM next day', 14, 42);
  
  // Add summary statistics
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary Statistics', 14, 54);
  
  const summaryData = [
    ['Total Payments', stats.totalPayments.toLocaleString()],
    ['Total Amount Processed', `₦${stats.totalAmountProcessedByTsa.toLocaleString()}`],
    ['TSA Earnings', `₦${stats.totalTsaEarnings.toLocaleString()}`],
    ['IDCL Earnings', `₦${stats.totalIdclEarnings.toLocaleString()}`],
    ['Paystack Charges', `₦${stats.totalPaystackCharge.toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: 58,
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
  
  // Add settlement breakdown
  const summaryY = (doc as any).lastAutoTable.finalY || 58;
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Settlement Breakdown', 14, summaryY + 12);
  
  const settlementData = [
    ['Settled Payments', settledPayments.length.toLocaleString()],
    ['Settled Amount', `₦${settledAmount.toLocaleString()}`],
    ['Settled Earnings', `₦${settledEarnings.toLocaleString()}`],
    ['Pending Payments', pendingPayments.length.toLocaleString()],
    ['Pending Amount', `₦${pendingAmount.toLocaleString()}`],
    ['Pending Earnings', `₦${pendingEarnings.toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: summaryY + 16,
    head: [['Category', 'Value']],
    body: settlementData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], font: 'CustomFont' },
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
  const finalY = (doc as any).lastAutoTable.finalY || 52;
  doc.setFontSize(12);
  doc.text('Payment Details', 14, finalY + 12);
  
  const paymentTableData = payments.map((payment) => {
    const settled = isPaymentSettled(payment.paidAt);
    return [
      payment.schoolName,
      payment.schoolCode,
      `₦${payment.amount.toLocaleString()}`,
      payment.numberOfStudents.toString(),
      `₦${payment.iirsEarning.toLocaleString()}`,
      new Date(payment.paidAt).toLocaleDateString(),
      new Date(payment.paidAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      settled ? 'Settled' : 'Pending',
    ];
  });
  
  autoTable(doc, {
    startY: finalY + 16,
    head: [['School Name', 'Code', 'Amount', 'Students', 'IIRS Earning', 'Date', 'Time', 'Settlement']],
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
      0: { cellWidth: 38 },
      1: { cellWidth: 22 },
      2: { cellWidth: 24, halign: 'right' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 20, halign: 'center' },
    },
    didParseCell: function(data: any) {
      // Color code settlement status
      if (data.column.index === 7 && data.section === 'body') {
        if (data.cell.text[0] === 'Settled') {
          data.cell.styles.textColor = [34, 197, 94]; // Green
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.text[0] === 'Pending') {
          data.cell.styles.textColor = [234, 179, 8]; // Yellow/Amber
          data.cell.styles.fontStyle = 'bold';
        }
      }
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
  }
  
  // Save the PDF
  const fileName = `IIRS_Payment_Report_${period.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
