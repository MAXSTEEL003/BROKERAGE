// PDF export utilities
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Safely check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to dynamically load jsPDF
export async function getJsPDF() {
  if (isBrowser) {
    try {
      const jspdf = await import('jspdf');
      const autoTable = await import('jspdf-autotable');
      return { jsPDF: jspdf.jsPDF, autoTable };
    } catch (error) {
      console.error('Error loading jsPDF:', error);
      return null;
    }
  }
  return null;
}

// Function to export data to PDF
export async function exportToPDF(data, summaryData, title = 'Brokerage Report', fileName = 'brokerage_report.pdf') {
  if (!isBrowser) return false;
  
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 14, 30);
    
    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary', 14, 40);
    
    // Add summary table
    doc.autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Transactions', summaryData.transactions],
        ['Total Quantity', `${summaryData.quantity.toFixed(2)} qtl`],
        ['Total Amount', `₹${summaryData.amount.toFixed(2)}`],
        ['Commission Type', summaryData.commissionType === 'percentage' ? 'Percentage of Amount' : 'Fixed Rate per Quantity'],
        ['Commission Rate', summaryData.commissionType === 'percentage' ? `${(summaryData.commissionRate * 100).toFixed(2)}%` : `₹${summaryData.fixedRate.toFixed(2)} per qtl`],
        ['Total Commission', `₹${summaryData.commission.toFixed(2)}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: 255 },
      margin: { top: 45 }
    });
    
    // Add transactions title
    doc.setFontSize(14);
    doc.text('Transaction Details', 14, doc.autoTable.previous.finalY + 15);
    
    // Prepare data for transactions table
    const tableData = data.map(row => {
      const quantity = parseFloat(row['QUANTITY'] || 0);
      const amount = parseFloat(row['AMOUNT'] || 0);
      const commission = summaryData.commissionType === 'percentage'
        ? amount * summaryData.commissionRate
        : quantity * summaryData.fixedRate;
      
      return [
        row['DATE'] || 'N/A',
        row['MILLER NAME'] || 'N/A',
        row['BUYER NAME'] || 'N/A',
        isNaN(quantity) ? 'N/A' : quantity.toFixed(2),
        row['RATE'] || 'N/A',
        isNaN(amount) ? 'N/A' : `₹${amount.toFixed(2)}`,
        `₹${commission.toFixed(2)}`
      ];
    });
    
    // Add transactions table
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [['Date', 'Miller', 'Buyer', 'Quantity (qtl)', 'Rate', 'Amount', 'Commission']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: 255 },
      margin: { top: doc.autoTable.previous.finalY + 20 }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text('TEJAS CANVASSING BROKERAGE CALCULATOR', 14, doc.internal.pageSize.height - 10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}

export default {
  getJsPDF,
  exportToPDF
};