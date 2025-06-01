// PDF export utilities
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Safely check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to dynamically load jsPDF
export async function getJsPDF() {
  if (isBrowser) {
    try {
      // Import both libraries
      const jspdf = await import('jspdf');
      // Import autoTable separately
      await import('jspdf-autotable');
      
      // Return the jsPDF constructor
      return jspdf.jsPDF;
    } catch (error) {
      console.error('Error loading jsPDF:', error);
      return null;
    }
  }
  return null;
}

// Function to export data to PDF
export async function exportToPDF(data, summaryData, companyDetails, title = 'Brokerage Report', fileName = 'brokerage_report.pdf') {
  if (!isBrowser) return false;
  
  try {
    // Ensure companyDetails has all required fields with defaults
    companyDetails = {
      name: "TEJAS CANVASSING",
      address: "123 Business Park, Main Street, City - 400001",
      phone: "+91 9876543210",
      email: "info@tejascanvassing.com",
      bankName: "HDFC Bank",
      accountNo: "12345678901234",
      ifscCode: "HDFC0001234",
      accountHolder: "Tejas Enterprises",
      ...companyDetails
    };
    
    console.log("Bank details being used:", {
      bankName: companyDetails.bankName,
      accountNo: companyDetails.accountNo,
      ifscCode: companyDetails.ifscCode,
      accountHolder: companyDetails.accountHolder
    });
    
    // Get jsPDF constructor
    const JsPDF = await getJsPDF();
    if (!JsPDF) {
      console.error('jsPDF is not available');
      return false;
    }
    
    // Create new PDF document
    const doc = new JsPDF();
    
    // Define colors
    const primaryColor = [41, 128, 185]; // Blue
    const secondaryColor = [52, 73, 94]; // Dark blue-gray
    const textColor = [44, 62, 80]; // Dark slate
    const mutedColor = [127, 140, 141]; // Gray
    
    // Add company header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(companyDetails.name.toUpperCase(), 14, 20);
    
    // Add company address
    doc.setFontSize(10);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(companyDetails.address, 14, 28);
    doc.text(`Phone: ${companyDetails.phone} | Email: ${companyDetails.email}`, 14, 34);
    
    // Add horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);
    
    // Add title
    doc.setFontSize(16);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 14, 48);
    
    // Add date
    const date = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.setFontSize(9);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${date}`, 14, 54);
    
    // Add filter information
    doc.setFontSize(11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Filters:', 14, 62);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Miller: ${summaryData.selectedMiller}`, 14, 68);
    doc.text(`Buyer: ${summaryData.selectedBuyer}`, 14, 74);
    
    // Format commission rate display
    const commissionRateDisplay = summaryData.commissionType === 'percentage' 
      ? `${(summaryData.commissionRate * 100).toFixed(2)}%` 
      : `${summaryData.fixedRate.toFixed(2)} per qtl`;
    
    // Check if autoTable is available on the doc object
    if (typeof doc.autoTable !== 'function') {
      console.error('autoTable is not available on the jsPDF instance');
      return false;
    }
    
    // Add summary table
    doc.autoTable({
      startY: 80,
      head: [['Metric', 'Value']],
      body: [
        ['Total Transactions', summaryData.transactions],
        ['Total Quantity', `${summaryData.quantity.toFixed(2)} qtl`],
        ['Total Amount', `${summaryData.amount.toFixed(2)}`],
        ['Commission Rate', commissionRateDisplay],
        ['Total Commission', `${summaryData.commission.toFixed(2)}`]
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10,
        textColor: textColor
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 'auto' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto'
    });
    
    // Add transactions title
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Details', 14, doc.autoTable.previous.finalY + 15);
    
    // Prepare data for transactions table
    const tableData = data.map(row => {
      const quantity = findQuantityField(row);
      const amount = findAmountField(row);
      const date = findDateField(row);
      const billNo = findBillNumberField(row);
      
      // Format date using the helper function
      const formattedDate = formatDate(date);
      
      // Check if this is Nidhi Agros (special case)
      const millerName = row['MILLER NAME'] || row['Miller Name'] || '';
      const buyerName = row['BUYER NAME'] || row['BUYER NAMER'] || row['Buyer Name'] || '';
      const isNidhiAgros = millerName.toLowerCase().includes('nidhi agro');
      
      // Calculate commission based on miller and type
      let commission = 0;
      let commissionRateUsed = '';
      
      if (isNidhiAgros) {
        // Always use 1% for Nidhi Agros, regardless of selected type
        commission = amount * 0.01;
        commissionRateUsed = '1.00%';
      } else if (summaryData.commissionType === 'percentage') {
        // Percentage-based commission for other millers
        commission = amount * summaryData.commissionRate;
        commissionRateUsed = `${(summaryData.commissionRate * 100).toFixed(2)}%`;
      } else {
        // Fixed rate commission for other millers
        commission = quantity * summaryData.fixedRate;
        commissionRateUsed = `${summaryData.fixedRate.toFixed(2)}/qtl`;
      }
      
      return [
        formattedDate,
        billNo || 'N/A',
        millerName || 'N/A',
        buyerName || 'N/A',
        isNaN(quantity) ? 'N/A' : quantity.toFixed(2),
        commissionRateUsed,
        isNaN(amount) ? 'N/A' : `${amount.toFixed(2)}`,
        `${commission.toFixed(2)}`
      ];
    });
    
    // Add transactions table - more compact for portrait mode
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [['Date', 'Bill No', 'Miller', 'Buyer', 'Qty (qtl)', 'Rate', 'Amount', 'Commission']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        lineColor: [220, 220, 220],
        textColor: textColor
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        cellPadding: 3,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 22 }, // Date
        1: { cellWidth: 20 }, // Bill No
        2: { cellWidth: 30 }, // Miller
        3: { cellWidth: 30 }, // Buyer
        4: { cellWidth: 15, halign: 'right' }, // Quantity
        5: { cellWidth: 15, halign: 'center' }, // Commission Rate
        6: { cellWidth: 20, halign: 'right' }, // Amount
        7: { cellWidth: 20, halign: 'right' } // Commission
      },
      margin: { left: 14, right: 14 }
    });

    // After the transactions table, add bank details
    const finalY = doc.autoTable.previous.finalY;
    const bankDetailsY = finalY + 15;

    // Add bank details title
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details', 14, bankDetailsY);

    // Draw box for bank details
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, bankDetailsY + 5, 182, 35, 3, 3, 'FD');

    // Add bank details content
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');

    // Bank details in a table format
    doc.autoTable({
      startY: bankDetailsY + 10,
      head: [['Account Holder', 'Bank Name', 'Account Number', 'IFSC Code']],
      body: [[
        companyDetails.accountHolder || 'N/A',
        companyDetails.bankName || 'N/A',
        companyDetails.accountNo || 'N/A',
        companyDetails.ifscCode || 'N/A'
      ]],
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor,
        halign: 'center'
      },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto'
    });

    // Add footer with a light background
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer background
      doc.setFillColor(245, 247, 250);
      doc.rect(0, doc.internal.pageSize.height - 18, doc.internal.pageSize.width, 18, 'F');
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(companyDetails.name.toUpperCase(), 14, doc.internal.pageSize.height - 8);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 8);
    }
    
    // Save the PDF
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}

// Helper functions for PDF generation
function findQuantityField(row) {
  if (!row) return 0;
  
  // Try different possible field names for quantity
  const possibleFields = ['QUANTITY', 'QTY', 'QTLS', 'QUINTAL', 'QUINTALS', 'qtls'];
  
  for (const field of possibleFields) {
    if (row[field] !== undefined && row[field] !== null) {
      return parseFloat(row[field]) || 0;
    }
  }
  
  return 0;
}

function findAmountField(row) {
  if (!row) return 0;
  
  // Try different possible field names for amount
  const possibleFields = ['AMOUNT', 'AMT', 'TOTAL', 'TOTAL AMOUNT', 'VALUE', 'Amount'];
  
  for (const field of possibleFields) {
    if (row[field] !== undefined && row[field] !== null) {
      return parseFloat(row[field]) || 0;
    }
  }
  
  return 0;
}

function findDateField(row) {
  if (!row) return null;
  
  // Try different possible field names for date
  const possibleFields = ['DATE', 'TRANSACTION DATE', 'TRANS DATE', 'BILL DATE', 'Date'];
  
  for (const field of possibleFields) {
    if (row[field] !== undefined && row[field] !== null) {
      return row[field];
    }
  }
  
  return null;
}

// Helper function to format dates, handling Excel date format
function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  
  // Try to parse the date
  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'number') {
    // Excel date (number of days since 1900-01-01)
    date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
  } else {
    try {
      date = new Date(dateValue);
    } catch (e) {
      return 'Invalid Date';
    }
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  // Format the date
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Helper function to find bill number field
function findBillNumberField(row) {
  if (!row) return null;
  
  // Try different possible field names for bill number
  const possibleFields = ['BILL NO', 'BILL NUMBER', 'INVOICE NO', 'INVOICE NUMBER', 'BILL', 'INVOICE', 'BILL NO.', 'INVOICE NO.'];
  
  for (const field of possibleFields) {
    if (row[field] !== undefined && row[field] !== null) {
      return row[field];
    }
  }
  
  return null;
}

export default {
  getJsPDF,
  exportToPDF
};



















