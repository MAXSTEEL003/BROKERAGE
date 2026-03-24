'use client';

import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import '../styles/DataPreviewB.css';


interface Props {
  data: any[];
  commissionRate: number;
  commissionType: 'percentage' | 'fixed';
  fixedRate: number;
  totalTransactions: number;
  totalQuantity: number;
  totalAmount: number;
  totalCommission: number;
  selectedMiller: string;
  selectedBuyer: string;
  companyName?: string;
  userBillNo?: string;
  userBillDate?: string;
  periodOfBilling?: string;
  selectedShopLoc?: string;
}

const findQuantityField = (row: any) => {
  const fields = ['QUINTALS', 'QUANTITY', 'QTY', 'QTLS', 'QUINTAL', 'qtls'];
  for (const field of fields) {
    if (row[field] !== undefined) return parseFloat(row[field]) || 0;
  }
  return 0;
};

const findAmountField = (row: any) => {
  const fields = ['Net Amt.', 'AMOUNT', 'AMT', 'TOTAL', 'TOTAL AMOUNT', 'VALUE', 'Amount'];
  for (const field of fields) {
    if (row[field] !== undefined) return parseFloat(row[field]) || 0;
  }
  return 0;
};

const formatDate = (value: any): string => {
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const parsed = new Date(excelEpoch.getTime() + value * 86400000);
    return format(parsed, 'dd-MM-yyyy');
  }
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) return format(parsed, 'dd-MM-yyyy');
  return String(value);
};

// Builds calculated rows for a slice of data
const buildRows = (
  data: any[],
  commissionType: 'percentage' | 'fixed',
  commissionRate: number,
  fixedRate: number
) =>
  data.map((row, idx) => {
    const quantity = findQuantityField(row);
    const amount = findAmountField(row);
    const buyer = row['BUYER NAME'] || '';
    const miller = row['MILLER NAME'] || '';
    let commission = 0;
    if ((miller || '').toLowerCase().includes('nidhi agro')) {
      commission = amount * 0.02;
    } else if (commissionType === 'percentage') {
      commission = amount * commissionRate;
    } else {
      commission = quantity * fixedRate;
    }
    return {
      idx: idx + 1,
      date: formatDate(row['DATE'] || row['Date'] || ''),
      buyer,
      miller,
      // NOTE: billNo from raw data is intentionally NOT used in bulk PDF generation
      billNo: row['BILL NO'] || row['BILL'] || '',
      quantity,
      rate:
        commissionType === 'percentage'
          ? `${(commissionRate * 100).toFixed(2)}%`
          : `${fixedRate}`,
      amount,
      commission: commission.toFixed(2),
    };
  });

// Generates a single buyer PDF with a given sequential bill number
const generateBuyerPDF = async (params: {
  buyer: string;
  rows: ReturnType<typeof buildRows>;
  billNo: number;
  companyName: string;
  periodOfBilling?: string;
  selectedShopLoc?: string;
  totalQuantity: number;
  totalAmount: number;
  totalCommission: number;
}) => {
  const {
    buyer,
    rows,
    billNo,
    companyName,
    periodOfBilling,
    selectedShopLoc,
    totalQuantity,
    totalAmount,
    totalCommission,
  } = params;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let finalY = 40;

  // ── Header ──
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, pageWidth / 2, finalY, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'No. 12, 1st Floor, Market Road, Yeshwanthpur, Bengaluru - 560022',
    pageWidth / 2,
    finalY + 18,
    { align: 'center' }
  );
  finalY += 40;

  // ── Bill metadata ──
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Bill No: ${billNo}`, marginX, finalY);
  doc.text(`Buyer: ${buyer}`, marginX, finalY + 16);
  if (periodOfBilling) doc.text(`Period: ${periodOfBilling}`, marginX, finalY + 32);
  if (selectedShopLoc) doc.text(`Shop Location: ${selectedShopLoc}`, marginX, finalY + 48);
  finalY += periodOfBilling || selectedShopLoc ? 70 : 40;

  // ── Summary table ──
  autoTable(doc, {
    startY: finalY,
    head: [['Summary', 'Value']],
    body: [
      ['Total Transactions', rows.length.toString()],
      ['Total Quantity (Quintals)', totalQuantity.toFixed(2)],
      ['Total Amount', `₹${totalAmount.toFixed(2)}`],
      ['Total Commission', `₹${totalCommission.toFixed(2)}`],
    ],
    headStyles: { fillColor: [63, 81, 181], textColor: 255 },
    theme: 'grid',
    styles: { fontSize: 10 },
    margin: { left: marginX, right: marginX },
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // ── Transactions table ──
  autoTable(doc, {
    startY: finalY,
    head: [['#', 'Date', 'Buyer', 'Miller', 'Quantity', 'Rate', 'Amount', 'Commission']],
    body: rows.map((r) => [
      r.idx,
      r.date,
      r.buyer,
      r.miller,
      r.quantity,
      r.rate,
      r.amount,
      r.commission,
    ]),
    styles: { fontSize: 9 },
    theme: 'striped',
    margin: { left: marginX, right: marginX },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // ── Bank details ──
  autoTable(doc, {
    startY: finalY,
    head: [['Bank Name', 'Branch', 'IFSC Code', 'Account No', 'UPI']],
    body: [['Canara Bank', 'Yeshwanthpur', 'CNRB0001234', '1234567890', 'tejas@upi']],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [76, 175, 80], textColor: 255 },
    theme: 'striped',
    margin: { left: marginX, right: marginX },
  });

  const safeFileName = buyer.replace(/[^a-z0-9]/gi, '_').substring(0, 40);
  doc.save(`Bill_${String(billNo).padStart(3, '0')}_${safeFileName}.pdf`);
};

const DataPreview: React.FC<Props> = ({
  data,
  commissionRate,
  commissionType,
  fixedRate,
  totalTransactions,
  totalQuantity,
  totalAmount,
  totalCommission,
  selectedMiller,
  selectedBuyer,
  companyName = 'Tejas Canvassing Services',
  userBillNo,
  userBillDate,
  periodOfBilling,
  selectedShopLoc,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // UX state for bulk PDF generation
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');

  const calculatedRows = useMemo(
    () => buildRows(data, commissionType, commissionRate, fixedRate),
    [data, commissionRate, commissionType, fixedRate]
  );

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return calculatedRows.slice(start, start + rowsPerPage);
  }, [calculatedRows, currentPage]);

  const totalPages = Math.ceil(calculatedRows.length / rowsPerPage);

  // ── Single buyer PDF (existing functionality) ──
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 40;
    let finalY = 40;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, pageWidth / 2, finalY, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'No. 12, 1st Floor, Market Road, Yeshwanthpur, Bengaluru - 560022',
      pageWidth / 2,
      finalY + 20,
      { align: 'center' }
    );
    doc.text('Phone: +91-9876543210', pageWidth / 2, finalY + 35, { align: 'center' });
    finalY += 60;

    autoTable(doc, {
      startY: finalY,
      head: [['Summary', 'Value']],
      body: [
        ['Total Transactions', totalTransactions.toString()],
        ['Total Quantity (Quintals)', totalQuantity.toFixed(2)],
        ['Total Amount', totalAmount.toFixed(2)],
        ['Total Commission', totalCommission.toFixed(2)],
      ],
      headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      theme: 'grid',
      styles: { fontSize: 10 },
      margin: { left: marginX, right: marginX },
    });

    finalY = (doc as any).lastAutoTable.finalY + 20;

    autoTable(doc, {
      startY: finalY,
      head: [['#', 'Date', 'Buyer', 'Miller', 'Bill No', 'Quantity', 'Rate', 'Amount', 'Commission']],
      body: calculatedRows.map((row) => [
        row.idx,
        row.date,
        row.buyer,
        row.miller,
        row.billNo,
        row.quantity,
        row.rate,
        row.amount,
        row.commission,
      ]),
      styles: { fontSize: 9 },
      theme: 'striped',
      margin: { left: marginX, right: marginX },
      headStyles: { fillColor: [0, 123, 255], textColor: 255 },
    });

    finalY = (doc as any).lastAutoTable.finalY + 20;

    autoTable(doc, {
      startY: finalY,
      head: [['Bank Name', 'Branch', 'IFSC Code', 'Account No', 'UPI']],
      body: [['Canara Bank', 'Yeshwanthpur', 'CNRB0001234', '1234567890', 'tejas@upi']],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [76, 175, 80], textColor: 255 },
      theme: 'striped',
      margin: { left: marginX, right: marginX },
    });

    doc.save('Tejas_Canvassing_Report.pdf');
  };

  // ── Generate All Buyer PDFs ──
  const handleGenerateAllPDFs = async () => {
    if (pdfLoading || data.length === 0) return;

    // Group filteredData (= prop `data`) by buyer
    const grouped: Record<string, any[]> = data.reduce((acc: Record<string, any[]>, item) => {
      const buyer = item['BUYER NAME'] || 'Unknown';
      if (!acc[buyer]) acc[buyer] = [];
      acc[buyer].push(item);
      return acc;
    }, {});

    // Sort buyers A → Z
    const buyers = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    setPdfLoading(true);
    setPdfProgress(`Starting… 0/${buyers.length}`);

    // Assign sequential bill numbers 1 → n (strictly, ignores any row-level billNo)
    let billNo = 1;

    for (let i = 0; i < buyers.length; i++) {
      const buyer = buyers[i];
      setPdfProgress(`Generating ${i + 1}/${buyers.length}: ${buyer}`);

      const buyerRows = buildRows(grouped[buyer], commissionType, commissionRate, fixedRate);
      const buyerQty = buyerRows.reduce((s, r) => s + r.quantity, 0);
      const buyerAmt = buyerRows.reduce((s, r) => s + r.amount, 0);
      const buyerComm = buyerRows.reduce((s, r) => s + parseFloat(r.commission), 0);

      await generateBuyerPDF({
        buyer,
        rows: buyerRows,
        billNo,          // ✅ sequential number, NOT from row data
        companyName,
        periodOfBilling,
        selectedShopLoc,
        totalQuantity: buyerQty,
        totalAmount: buyerAmt,
        totalCommission: buyerComm,
      });

      billNo++;

      // Small delay to prevent browser from blocking rapid downloads
      await new Promise((res) => setTimeout(res, 300));
    }

    setPdfLoading(false);
    setPdfProgress(`✅ Done — ${buyers.length} PDF${buyers.length !== 1 ? 's' : ''} generated`);
  };

  return (
    <div className="data-preview">
      <div className="preview-header">
        <div className="header-title">
          <h3>Buyer Side View</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="export-button" onClick={exportToPDF}>
              Export to PDF
            </button>
            <button
              className="export-button"
              onClick={handleGenerateAllPDFs}
              disabled={pdfLoading || data.length === 0}
              style={{
                background: pdfLoading ? '#6c757d' : '#155724',
                cursor: pdfLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {pdfLoading ? 'Generating…' : 'Generate All Buyer PDFs'}
            </button>
          </div>
        </div>
        {pdfProgress && (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '13px',
              color: pdfProgress.startsWith('✅') ? '#155724' : '#333',
              fontWeight: 500,
            }}
          >
            {pdfProgress}
          </p>
        )}
      </div>
      <div className="preview-table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              <th>#</th><th>Date</th><th>Buyer</th><th>Miller</th><th>Bill No</th><th>Quantity</th><th>Rate</th><th>Amount</th><th>Commission</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map(row => (
              <tr key={row.idx}>
                <td>{row.idx}</td>
                <td>{row.date}</td>
                <td>{row.buyer}</td>
                <td>{row.miller}</td>
                <td>{row.billNo}</td>
                <td>{row.quantity}</td>
                <td>{row.rate}</td>
                <td>{row.amount}</td>
                <td>{row.commission}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Prev</button>
          <span className="pagination-info">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
        </div>
      </div>

      <div className="preview-summary">
        <div className="summary-grid">
          <div className="summary-item"><strong>Total Transactions</strong><span>{totalTransactions}</span></div>
          <div className="summary-item"><strong>Total Quantity</strong><span>{totalQuantity}</span></div>
          <div className="summary-item"><strong>Total Amount</strong><span>{totalAmount.toLocaleString()}</span></div>
          <div className="summary-item"><strong>Total Commission</strong><span>{totalCommission.toLocaleString()}</span></div>
          <div className="summary-item"><strong>Commission Type</strong><span>{commissionType === 'percentage' ? `${(commissionRate * 100).toFixed(2)}%` : `${fixedRate} per unit`}</span></div>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;
