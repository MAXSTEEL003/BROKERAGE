'use client';

import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import '../styles/DataPreviewB.css';

interface BankDetails {
  accName: string;
  accNo: string;
  bankName: string;
  ifsc: string;
  upi: string;
}

const DEFAULT_BANK: BankDetails = {
  accName: 'THEJAS CANVASING',
  accNo: '50200113540016',
  bankName: 'HDFC Bank',
  ifsc: 'HDFC0001047',
  upi: '9916416995',
};

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
  selectedShopLoc: string;
  userBillNo: string;
  userBillDate: string;
  periodOfBilling: string;
  onPeriodOfBillingChange: (value: string) => void;
  companyName?: string;
  bankDetails?: BankDetails;
  buyerListForPanel?: { buyer: string; billNo: number; rows: any[] }[];
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

// ── Shared helper: build calculated rows for any slice of data ──
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
    const isNidhiAgro = (miller || '').toLowerCase().includes('nidhi agro');

    let commission = 0;
    if (isNidhiAgro) {
      commission = amount * 0.01;
    } else if (commissionType === 'percentage') {
      commission = amount * commissionRate;
    } else {
      commission = quantity * fixedRate;
    }

    const rate = isNidhiAgro
      ? '1%'
      : commissionType === 'percentage'
      ? `${(commissionRate * 100).toFixed(2)}%`
      : `${fixedRate}`;

    return {
      idx: idx + 1,
      date: formatDate(row['DATE'] || row['Date'] || ''),
      buyer,
      miller,
      billNo: row['BILL NO'] || row['BILL'] || '',
      quantity,
      rate,
      amount,
      commission: commission.toFixed(2),
    };
  });

// ── Core PDF builder — used by both single-export and bulk generation ──
const buildBuyerPDF = async (params: {
  companyHeader: string;
  billNo: string | number;
  billDate: string;
  periodOfBilling: string;
  buyerName: string;
  shopLoc: string;
  rows: ReturnType<typeof buildRows>;
  totalQuantity: number;
  totalCommission: number;
  bank: BankDetails;
}): Promise<jsPDF> => {
  const {
    companyHeader,
    billNo,
    billDate,
    periodOfBilling,
    buyerName,
    shopLoc,
    rows,
    totalQuantity,
    totalCommission,
    bank,
  } = params;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let finalY = 40;

  // ── Company header ──
  doc.setTextColor(0, 0, 255);
  doc.setFontSize(25);
  doc.setFont('helvetica', 'bold');
  doc.text(companyHeader, pageWidth / 2, finalY, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'No. 123, 1st Floor, 4th main Road, Yeshwanthpur,APMC Yard,Bengaluru - 560022',
    pageWidth / 2,
    finalY + 25,
    { align: 'center' }
  );
  doc.text(
    'Phone: 9916416995 ; PAN NO: AEBPA6445G; GST NO: 29AEBPA6445G2Z0',
    pageWidth / 2,
    finalY + 45,
    { align: 'center' }
  );

  doc.setLineWidth(1.5);
  doc.line(40, finalY + 60, pageWidth - 40, finalY + 60);
  finalY += 90;

  // ── Period ──
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`Brokerage  From : ${periodOfBilling}`, pageWidth / 2, finalY, { align: 'center' });
  finalY += 35;

  // ── Bill No & Date ──
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Bill No: ${billNo || '-'}`, marginX, finalY);
  doc.text(
    `Date: ${billDate ? formatDate(billDate) : '-'}`,
    pageWidth - marginX,
    finalY,
    { align: 'right' }
  );
  finalY += 20;

  // ── TO / ROAD table ──
  autoTable(doc, {
    startY: finalY,
    head: [['TO', 'ROAD']],
    body: [[buyerName || '-', shopLoc || '-']],
    theme: 'grid',
    styles: { fontSize: 10, halign: 'center' },
    headStyles: { fillColor: [255, 193, 7], textColor: 0, halign: 'center' },
    margin: { left: marginX, right: marginX },
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // ── Transactions table ──
  autoTable(doc, {
    startY: finalY,
    head: [['#', 'Date', 'Miller', 'Bill No', 'Quantity', 'Rate', 'Amount']],
    body: rows.map((row) => [
      row.idx,
      row.date,
      row.miller,
      row.billNo,
      row.quantity,
      row.rate,
      row.commission,
    ]),
    styles: { fontSize: 9, halign: 'left' },
    theme: 'grid',
    margin: { left: marginX, right: marginX },
    headStyles: { fillColor: [0, 123, 255], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
    },
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // ── Totals summary ──
  autoTable(doc, {
    startY: finalY,
    head: [['Summary', 'Quantity', 'Amount']],
    body: [['Total', totalQuantity.toFixed(2), totalCommission.toFixed(2)]],
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' },
    },
    styles: { fontSize: 10, fontStyle: 'bold' },
    theme: 'grid',
    margin: { left: marginX, right: marginX },
    headStyles: { halign: 'center' },
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // ── Bank details ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details', marginX, finalY);
  finalY += 15;

  autoTable(doc, {
    startY: finalY,
    head: [['Acc Name', 'A/C No', 'Bank Name', 'IFSC', 'UPI NO']],
    body: [[bank.accName, bank.accNo, bank.bankName, bank.ifsc, bank.upi]],
    styles: { fontSize: 9, halign: 'left' },
    headStyles: { fillColor: [76, 175, 80], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
    theme: 'grid',
    margin: { left: marginX, right: marginX },
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // ── Authorized Signatory (right-aligned, above QR) ──
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Authorized Signatory', pageWidth - marginX, finalY, { align: 'right' });

  finalY += 20;

  // ── QR Code (centered, with page-overflow guard) ──
  const qrSize = 110; // pt — large enough to scan reliably
  const qrLabelH = 30; // space for "Scan to Pay" + UPI ID text under QR
  const neededH = qrSize + qrLabelH + 10;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (finalY + neededH > pageHeight - 20) {
    doc.addPage();
    finalY = 40;
  }

  try {
    const res = await fetch('/qr.png.jpeg');
    const blob = await res.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    const qrX = (pageWidth - qrSize) / 2; // centered
    doc.addImage(base64, 'JPEG', qrX, finalY, qrSize, qrSize);

    // "Scan to Pay" label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    doc.text('Scan to Pay', pageWidth / 2, finalY + qrSize + 12, { align: 'center' });

    // UPI ID
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(bank.upi, pageWidth / 2, finalY + qrSize + 23, { align: 'center' });
  } catch {
    // Image unavailable — skip silently
  }

  return doc;

};

const DataPreviewBuyerSide: React.FC<Props> = ({
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
  userBillNo,
  userBillDate,
  periodOfBilling,
  onPeriodOfBillingChange,
  selectedShopLoc,
  companyName = 'Thejas Canvasing',
  bankDetails,
  buyerListForPanel,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Buyer-list panel state
  const [showBuyerList, setShowBuyerList] = useState(false);
  const [generatingBuyer, setGeneratingBuyer] = useState<string | null>(null);
  const [doneBuyers, setDoneBuyers] = useState<Set<string>>(new Set());
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');

  // Use pre-built buyer list from parent (same source as the buyer dropdown)
  const buyerList = useMemo(() => {
    if (buyerListForPanel && buyerListForPanel.length > 0) return buyerListForPanel;
    // Fallback: group from local data
    const grouped: Record<string, any[]> = {};
    data.forEach(item => {
      const buyer = (item['BUYER NAME'] || '').toString().trim();
      if (!buyer) return;
      if (!grouped[buyer]) grouped[buyer] = [];
      grouped[buyer].push(item);
    });
    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map((buyer, idx) => ({ buyer, billNo: idx + 1, rows: grouped[buyer] }));
  }, [buyerListForPanel, data]);

  const calculatedRows = useMemo(
    () => buildRows(data, commissionType, commissionRate, fixedRate),
    [data, commissionRate, commissionType, fixedRate]
  );

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return calculatedRows.slice(start, start + rowsPerPage);
  }, [calculatedRows, currentPage]);

  const totalPages = Math.ceil(calculatedRows.length / rowsPerPage);

  // ── Single buyer PDF (existing "Export to PDF" button) ──
  const exportToPDF = async () => {
    const doc = await buildBuyerPDF({
      companyHeader: companyName,
      billNo: userBillNo,
      billDate: userBillDate,
      periodOfBilling,
      buyerName: selectedBuyer !== 'all' ? selectedBuyer : '',
      shopLoc: selectedShopLoc,
      rows: calculatedRows,
      totalQuantity,
      totalCommission,
      bank: bankDetails ?? DEFAULT_BANK,
    });

    const safeBuyer =
      selectedBuyer && selectedBuyer !== 'all'
        ? selectedBuyer.replace(/[^a-z0-9]/gi, '_')
        : 'AllBuyers';

    doc.save(`${safeBuyer}.pdf`);
  };

  // ── Generate a single buyer's PDF ──
  const generateOneBuyer = async (buyer: string, billNo: number, buyerRows: ReturnType<typeof buildRows>) => {
    setGeneratingBuyer(buyer);
    const buyerQty = buyerRows.reduce((s, r) => s + r.quantity, 0);
    const buyerComm = buyerRows.reduce((s, r) => s + parseFloat(r.commission), 0);
    const doc = await buildBuyerPDF({
      companyHeader: companyName,
      billNo,
      billDate: userBillDate,
      periodOfBilling,
      buyerName: buyer,
      shopLoc: selectedShopLoc,
      rows: buyerRows,
      totalQuantity: buyerQty,
      totalCommission: buyerComm,
      bank: bankDetails ?? DEFAULT_BANK,
    });
    const safeFileName = buyer.replace(/[^a-z0-9]/gi, '_').substring(0, 40);
    doc.save(`Bill_${String(billNo).padStart(3, '0')}_${safeFileName}.pdf`);
    setGeneratingBuyer(null);
    setDoneBuyers(prev => new Set(prev).add(buyer));
  };

  // ── Open buyer-list panel ──
  const handleGenerateAllPDFs = () => {
    if (data.length === 0) return;
    setDoneBuyers(new Set());
    setShowBuyerList(true);
  };

  // ── Generate ALL from within the panel ──
  const handleGenerateAllInPanel = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    setDoneBuyers(new Set());
    for (const { buyer, billNo, rows } of buyerList) {
      setPdfProgress(`Generating ${billNo}/${buyerList.length}: ${buyer}`);
      await generateOneBuyer(buyer, billNo, buildRows(rows, commissionType, commissionRate, fixedRate));
      await new Promise(res => setTimeout(res, 300));
    }
    setPdfLoading(false);
    setPdfProgress(`✅ Done — ${buyerList.length} PDF${buyerList.length !== 1 ? 's' : ''} generated`);
  };

  return (
    <div className="data-preview">
      {/* ── Buyer-list panel overlay ── */}
      {showBuyerList && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'var(--gray-900, #0f172a)',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}>
          {/* Header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            background: 'var(--card-background, #1e293b)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => { setShowBuyerList(false); setPdfProgress(''); }}
                style={{
                  background: 'transparent', border: '1.5px solid rgba(255,255,255,0.2)',
                  color: '#94a3b8', borderRadius: '8px', padding: '6px 14px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                }}
              >
                ← Back
              </button>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
                  Generate Buyer PDFs
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  {buyerList.length} buyer{buyerList.length !== 1 ? 's' : ''} · Bill numbers 1 → {buyerList.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateAllInPanel}
              disabled={pdfLoading}
              style={{
                background: pdfLoading
                  ? '#334155'
                  : 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '8px 20px', fontSize: '13px', fontWeight: 700,
                cursor: pdfLoading ? 'not-allowed' : 'pointer',
                opacity: pdfLoading ? 0.7 : 1,
              }}
            >
              {pdfLoading ? 'Generating…' : '⬇ Generate All'}
            </button>
          </div>

          {/* Progress bar */}
          {pdfProgress && (
            <div style={{
              padding: '0.5rem 1.5rem',
              background: pdfProgress.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '12.5px', fontWeight: 500,
              color: pdfProgress.startsWith('✅') ? '#10b981' : '#93c5fd',
            }}>
              {pdfProgress}
            </div>
          )}

          {/* Buyer list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
            {buyerList.map(({ buyer, billNo, rows }) => {
              const isDone = doneBuyers.has(buyer);
              const isGenerating = generatingBuyer === buyer;
              const buyerRows = buildRows(rows, commissionType, commissionRate, fixedRate);
              const qty = buyerRows.reduce((s, r) => s + r.quantity, 0);
              const comm = buyerRows.reduce((s, r) => s + parseFloat(r.commission), 0);
              return (
                <div key={buyer} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: '10px',
                  background: isDone
                    ? 'rgba(16,185,129,0.08)'
                    : isGenerating
                    ? 'rgba(59,130,246,0.12)'
                    : 'var(--card-background,#1e293b)',
                  border: `1px solid ${
                    isDone ? 'rgba(16,185,129,0.25)'
                    : isGenerating ? 'rgba(59,130,246,0.3)'
                    : 'rgba(255,255,255,0.06)'
                  }`,
                  transition: 'all 0.2s',
                }}>
                  {/* Bill number badge */}
                  <span style={{
                    minWidth: '36px', height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>{billNo}</span>

                  {/* Buyer info */}
                  <div style={{ flex: 1, marginLeft: '0.875rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>{buyer}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                      {buyerRows.length} txn · Qty {qty.toFixed(1)} · Comm ₹{comm.toFixed(0)}
                    </p>
                  </div>

                  {/* Status / Generate button */}
                  {isDone ? (
                    <span style={{ fontSize: '18px' }}>✅</span>
                  ) : (
                    <button
                      onClick={() => generateOneBuyer(buyer, billNo, buyerRows)}
                      disabled={isGenerating || pdfLoading}
                      style={{
                        background: isGenerating ? '#334155' : '#155724',
                        color: '#fff', border: 'none', borderRadius: '7px',
                        padding: '6px 14px', fontSize: '12px', fontWeight: 700,
                        cursor: (isGenerating || pdfLoading) ? 'not-allowed' : 'pointer',
                        opacity: (isGenerating || pdfLoading) ? 0.6 : 1,
                        minWidth: '90px',
                      }}
                    >
                      {isGenerating ? '⏳ …' : '⬇ Generate'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="preview-header">
        <div className="header-title">
          <h3>Buyer Side View</h3>
          <div className="buyer-info">
            <p><strong>Buyer:</strong> {selectedBuyer}</p>
            <p><strong>Shop Location:</strong> {selectedShopLoc}</p>
          </div>
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
                opacity: data.length === 0 ? 0.5 : 1,
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
              color: pdfProgress.startsWith('✅') ? '#155724' : '#555',
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
              <th>#</th>
              <th>Date</th>
              <th>Buyer</th>
              <th>Miller</th>
              <th>Bill No</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Commission</th>
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

export default DataPreviewBuyerSide;