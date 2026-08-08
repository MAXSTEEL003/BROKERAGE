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
  companyPhone?: string;
  companyPAN?: string;
  companyGST?: string;
  buyerListForPanel?: { buyer: string; billNo: number; rows: any[] }[];
  showQRCode?: boolean;
  customQRImage?: string | null;
  showGstInPdf?: boolean;
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

    const quantityNum = parseFloat(String(quantity)) || 0;
    const amountNum = parseFloat(String(amount)) || 0;
    const commissionNum = parseFloat(String(commission)) || 0;

    return {
      idx: idx + 1,
      date: formatDate(row['DATE'] || row['Date'] || ''),
      buyer,
      miller,
      billNo: row['BILL NO'] || row['BILL'] || '',
      quantity: quantityNum.toFixed(2),
      rate,
      amount: amountNum.toFixed(2),
      commission: commissionNum.toFixed(2),
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
  companyPhone?: string;
  companyPAN?: string;
  companyGST?: string;
  showQRCode?: boolean;
  customQRImage?: string | null;
  showGstInPdf?: boolean;
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
    companyPhone,
    companyPAN,
    companyGST,
    showQRCode = true,
    customQRImage,
    showGstInPdf = true,
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
    `Phone: ${params.companyPhone || bank.upi} ; PAN NO: ${params.companyPAN || 'AEBPA6445G'}; GST NO: ${params.companyGST || '29AEBPA6445G2Z0'}`,
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
  const gst18 = totalCommission * 0.18;
  const amountAfterGst = totalCommission + gst18;

  const summaryBody: (string | number)[][] = [
    ['Total', totalQuantity.toFixed(2), totalCommission.toFixed(2)],
  ];
  if (showGstInPdf !== false) {
    summaryBody.push(['18% GST', '-', gst18.toFixed(2)]);
    summaryBody.push(['Total after 18% GST', '-', amountAfterGst.toFixed(2)]);
  }

  autoTable(doc, {
    startY: finalY,
    head: [['Summary', 'Quantity', 'Amount']],
    body: summaryBody,
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
  if (showQRCode !== false) {
    const qrSize = 110; // pt — large enough to scan reliably
    const qrLabelH = 30; // space for "Scan to Pay" + UPI ID text under QR
    const neededH = qrSize + qrLabelH + 10;
    const pageHeight = doc.internal.pageSize.getHeight();

    if (finalY + neededH > pageHeight - 20) {
      doc.addPage();
      finalY = 40;
    }

    try {
      let base64 = customQRImage;
      if (!base64) {
        const res = await fetch('/qr.png.jpeg');
        const blob = await res.blob();
        base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

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
  }

  return doc;
};

// ── Brokerage Due List PDF Builder ──
const buildBrokerageDueListPDF = async (params: {
  companyHeader: string;
  periodOfBilling: string;
  selectedPlace?: string;
  selectedMiller?: string;
  rows: any[];
  commissionType: 'percentage' | 'fixed';
  commissionRate: number;
  fixedRate: number;
  bank: BankDetails;
  companyPhone?: string;
  companyPAN?: string;
  companyGST?: string;
  includeCommissionColumn?: boolean;
  includeCommissionSummary?: boolean;
  includeGST?: boolean;
  includeTotalAfterGST?: boolean;
  showQRCode?: boolean;
}): Promise<jsPDF> => {
  const {
    companyHeader,
    periodOfBilling,
    selectedPlace,
    selectedMiller,
    rows,
    commissionType,
    commissionRate,
    fixedRate,
    bank,
    companyPhone,
    companyPAN,
    companyGST,
    includeCommissionColumn = true,
    includeCommissionSummary = false,
    includeGST = false,
    includeTotalAfterGST = false,
    showQRCode = true,
  } = params;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 25;
  let finalY = 25;

  // ── Company header ──
  doc.setTextColor(0, 0, 220);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyHeader, pageWidth / 2, finalY, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'No. 123, 1st Floor, 4th main Road, Yeshwanthpur, APMC Yard, Bengaluru - 560022',
    pageWidth / 2, finalY + 16, { align: 'center' }
  );
  doc.text(
    `Phone: ${companyPhone || bank.upi} ; PAN NO: ${companyPAN || 'AEBPA6445G'}; GST NO: ${companyGST || '29AEBPA6445G2Z0'}`,
    pageWidth / 2, finalY + 28, { align: 'center' }
  );
  doc.setLineWidth(0.8);
  doc.setDrawColor(150, 150, 150);
  doc.line(25, finalY + 36, pageWidth - 25, finalY + 36);
  finalY += 52;

  // ── Title ──
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 40, 40);
  doc.text('BROKERAGE DUE LIST', pageWidth / 2, finalY, { align: 'center' });
  finalY += 15;

  // Subtitle info
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  let filterStr = `Period: ${periodOfBilling || 'APR 2025 to JULY 2025'}`;
  if (selectedPlace) {
    const placeStr = Array.isArray(selectedPlace) ? selectedPlace.join(', ') : selectedPlace;
    if (placeStr && placeStr !== 'all' && placeStr !== 'All Places' && placeStr !== '') {
      filterStr += `   |   Place: ${placeStr}`;
    }
  }
  if (selectedMiller && selectedMiller !== 'all' && selectedMiller !== '') {
    filterStr += `   |   Miller: ${selectedMiller}`;
  }
  doc.text(filterStr, pageWidth / 2, finalY, { align: 'center' });
  finalY += 16;

  // Group raw rows by Buyer
  const buyerGroupMap: Record<string, { buyer: string; place: string; totalQty: number; totalComm: number }> = {};

  rows.forEach((row) => {
    const buyer = (row['BUYER NAME'] || row['BUYER'] || row.buyer || 'Unknown').toString().trim();
    if (!buyer) return;

    let qty = 0;
    if (typeof row.quantity === 'number') {
      qty = row.quantity;
    } else {
      qty = findQuantityField(row);
    }

    let amt = 0;
    if (typeof row.amount === 'number') {
      amt = row.amount;
    } else {
      amt = findAmountField(row);
    }

    const miller = (row['MILLER NAME'] || row.miller || '').toString();
    const isNidhiAgro = miller.toLowerCase().includes('nidhi agro');

    let comm = 0;
    if (typeof row.commission !== 'undefined' && row.commission !== null && !isNaN(parseFloat(row.commission))) {
      comm = parseFloat(row.commission);
    } else if (isNidhiAgro) {
      comm = amt * 0.01;
    } else if (commissionType === 'percentage') {
      comm = amt * commissionRate;
    } else {
      comm = qty * fixedRate;
    }

    const place = (
      row['SHOP LOC'] || row['SHOP LOCATION'] || row['PLACE'] || row['LOCATION'] || row['CITY'] || row['ROAD'] || ''
    ).toString().trim();

    if (!buyerGroupMap[buyer]) {
      buyerGroupMap[buyer] = {
        buyer,
        place: place || '-',
        totalQty: 0,
        totalComm: 0,
      };
    }

    buyerGroupMap[buyer].totalQty += qty;
    buyerGroupMap[buyer].totalComm += comm;
    if (place && buyerGroupMap[buyer].place === '-') {
      buyerGroupMap[buyer].place = place;
    }
  });

  const buyerList = Object.values(buyerGroupMap).sort((a, b) => a.buyer.localeCompare(b.buyer));

  const totalQtyAll = buyerList.reduce((s, b) => s + b.totalQty, 0);
  const totalCommAll = buyerList.reduce((s, b) => s + b.totalComm, 0);
  const gst18All = totalCommAll * 0.18;
  const grandTotalAll = totalCommAll + gst18All;

  // ── Due List Table (compact layout, narrow borders) ──
  const tableHead = includeCommissionColumn
    ? [['#', 'Buyer Name', 'Place', 'Total Qty (qtl)', 'Total Commission (Rs.)', 'Remarks']]
    : [['#', 'Buyer Name', 'Place', 'Total Qty (qtl)', 'Remarks']];

  const tableBody = buyerList.map((item, idx) =>
    includeCommissionColumn
      ? [idx + 1, item.buyer, item.place, item.totalQty.toFixed(2), item.totalComm.toFixed(2), '']
      : [idx + 1, item.buyer, item.place, item.totalQty.toFixed(2), '']
  );

  const columnStyles = includeCommissionColumn
    ? {
        0: { halign: 'center', cellWidth: 24 },
        1: { halign: 'left', cellWidth: 155 },
        2: { halign: 'center', cellWidth: 80 },
        3: { halign: 'right', cellWidth: 78 },
        4: { halign: 'right', cellWidth: 98 },
        5: { halign: 'left', cellWidth: 110 },
      }
    : {
        0: { halign: 'center', cellWidth: 28 },
        1: { halign: 'left', cellWidth: 195 },
        2: { halign: 'center', cellWidth: 95 },
        3: { halign: 'right', cellWidth: 95 },
        4: { halign: 'left', cellWidth: 132 },
      };

  autoTable(doc, {
    startY: finalY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineWidth: 0.1,
      lineColor: [180, 180, 180],
      textColor: [30, 30, 30],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [180, 40, 40],
      textColor: 255,
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: columnStyles as any,
    margin: { left: marginX, right: marginX, top: 25, bottom: 25 },
  });

  finalY = (doc as any).lastAutoTable.finalY + 10;

  // ── Summary Table (configurable for employee/client copies) ──
  const summaryRows: (string[])[] = [
    ['Total Buyers', buyerList.length.toString()],
    ['Total Quantity', `${totalQtyAll.toFixed(2)} qtl`],
  ];

  if (includeCommissionSummary) {
    summaryRows.push(['Total Commission', `Rs. ${totalCommAll.toFixed(2)}`]);
  }
  if (includeGST) {
    summaryRows.push(['18% GST', `Rs. ${gst18All.toFixed(2)}`]);
  }
  if (includeTotalAfterGST) {
    summaryRows.push(['Total after 18% GST', `Rs. ${grandTotalAll.toFixed(2)}`]);
  }

  autoTable(doc, {
    startY: finalY,
    head: [['Summary', 'Value']],
    body: summaryRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineWidth: 0.1,
      lineColor: [180, 180, 180],
      fontStyle: 'bold',
    },
    headStyles: {
      fillColor: [63, 81, 181],
      textColor: 255,
      halign: 'center',
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 200 },
      1: { halign: 'right', cellWidth: 345 },
    },
    margin: { left: marginX, right: marginX, top: 25, bottom: 25 },
  });

  finalY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Authorized Signatory', pageWidth - marginX, finalY, { align: 'right' });
  finalY += 15;

  if (showQRCode !== false) {
    const qrSize = 90;
    const qrLabelH = 25;
    const pageHeight = doc.internal.pageSize.getHeight();
    if (finalY + qrSize + qrLabelH + 10 > pageHeight - 20) {
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
      const qrX = (pageWidth - qrSize) / 2;
      doc.addImage(base64, 'JPEG', qrX, finalY, qrSize, qrSize);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      doc.text('Scan to Pay', pageWidth / 2, finalY + qrSize + 10, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(bank.upi, pageWidth / 2, finalY + qrSize + 20, { align: 'center' });
    } catch {
      // Skip silently if image unavailable
    }
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
  companyPhone,
  companyPAN,
  companyGST,
  buyerListForPanel,
  showQRCode = true,
  customQRImage,
  showGstInPdf = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Buyer-list panel state
  const [showBuyerList, setShowBuyerList] = useState(false);
  const [showDueListModal, setShowDueListModal] = useState(false);
  const [dueListSelectedPlaces, setDueListSelectedPlaces] = useState<string[]>(['all']);
  const [dueListPlaceSearch, setDueListPlaceSearch] = useState<string>('');
  const [dueListIncludeCommissionColumn, setDueListIncludeCommissionColumn] = useState(true);
  const [dueListIncludeCommissionSummary, setDueListIncludeCommissionSummary] = useState(false);
  const [dueListIncludeGST, setDueListIncludeGST] = useState(false);
  const [dueListIncludeTotalAfterGST, setDueListIncludeTotalAfterGST] = useState(false);
  const [dueListIncludeQRCode, setDueListIncludeQRCode] = useState(true);
  const [generatingBuyer, setGeneratingBuyer] = useState<string | null>(null);
  const [doneBuyers, setDoneBuyers] = useState<Set<string>>(new Set());
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');

  // Unique list of places extracted from current dataset for modal selection
  const placesListForModal = useMemo(() => {
    const places = new Set<string>();
    data.forEach(row => {
      const p = (row['SHOP LOC'] || row['SHOP LOCATION'] || row['PLACE'] || row['LOCATION'] || row['CITY'] || row['ROAD'] || '').toString().trim();
      if (p) places.add(p);
    });
    return Array.from(places).sort();
  }, [data]);

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
    let buyerShopLoc = selectedShopLoc || '';
    if (!buyerShopLoc && data.length > 0) {
      for (const r of data) {
        const loc = r['SHOP LOC'] || r['SHOP LOCATION'] || r['PLACE'] || r['LOCATION'] || r['CITY'] || r['ROAD'] || r['TOWN'] || '';
        if (loc && String(loc).trim()) {
          buyerShopLoc = String(loc).trim();
          break;
        }
      }
    }

    const doc = await buildBuyerPDF({
      companyHeader: companyName,
      billNo: userBillNo,
      billDate: userBillDate,
      periodOfBilling,
      buyerName: selectedBuyer !== 'all' ? selectedBuyer : '',
      shopLoc: buyerShopLoc,
      rows: calculatedRows,
      totalQuantity,
      totalCommission,
      bank: bankDetails ?? DEFAULT_BANK,
      companyPhone: companyPhone,
      companyPAN: companyPAN,
      companyGST: companyGST,
      showQRCode: showQRCode,
      customQRImage: customQRImage,
      showGstInPdf: showGstInPdf,
    });

    const safeBuyer =
      selectedBuyer && selectedBuyer !== 'all'
        ? selectedBuyer.replace(/[^a-z0-9]/gi, '_')
        : 'AllBuyers';

    doc.save(`${safeBuyer}.pdf`);
  };

  // ── Generate a single buyer's PDF ──
  const generateOneBuyer = async (
    buyer: string,
    billNo: number,
    buyerRows: ReturnType<typeof buildRows>,
    rawRows?: any[]
  ) => {
    setGeneratingBuyer(buyer);
    const buyerQty = buyerRows.reduce((s, r) => s + parseFloat(r.quantity), 0);
    const buyerComm = buyerRows.reduce((s, r) => s + parseFloat(r.commission), 0);

    // Extract shop location for THIS specific buyer
    let buyerShopLoc = selectedShopLoc || '';
    const sourceRows = (rawRows && rawRows.length > 0)
      ? rawRows
      : data.filter(r => (r['BUYER NAME'] || r['BUYER'] || '').toString().replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase() === buyer.toLowerCase());

    for (const r of sourceRows) {
      const loc = r['SHOP LOC'] || r['SHOP LOCATION'] || r['PLACE'] || r['LOCATION'] || r['CITY'] || r['ROAD'] || r['TOWN'] || '';
      if (loc && String(loc).trim()) {
        buyerShopLoc = String(loc).trim();
        break;
      }
    }

    const doc = await buildBuyerPDF({
      companyHeader: companyName,
      billNo,
      billDate: userBillDate,
      periodOfBilling,
      buyerName: buyer,
      shopLoc: buyerShopLoc,
      rows: buyerRows,
      totalQuantity: buyerQty,
      totalCommission: buyerComm,
      bank: bankDetails ?? DEFAULT_BANK,
      companyPhone: companyPhone,
      companyPAN: companyPAN,
      companyGST: companyGST,
      showQRCode: showQRCode,
      customQRImage: customQRImage,
      showGstInPdf: showGstInPdf,
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
      await generateOneBuyer(buyer, billNo, buildRows(rows, commissionType, commissionRate, fixedRate), rows);
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
              const qty = buyerRows.reduce((s, r) => s + parseFloat(r.quantity), 0);
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
                      onClick={() => generateOneBuyer(buyer, billNo, buyerRows, rows)}
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
              onClick={() => {
                setDueListSelectedPlaces(selectedShopLoc ? [selectedShopLoc] : ['all']);
                setShowDueListModal(true);
              }}
              disabled={data.length === 0}
              style={{
                background: '#d97706',
                cursor: data.length === 0 ? 'not-allowed' : 'pointer',
                opacity: data.length === 0 ? 0.5 : 1,
              }}
            >
              Brokerage Due List (PDF)
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
          <div className="summary-item"><strong>Total Quantity</strong><span>{Number(totalQuantity).toFixed(2)}</span></div>
          <div className="summary-item"><strong>Total Amount</strong><span>₹{Number(totalAmount).toFixed(2)}</span></div>
          <div className="summary-item"><strong>Total Commission</strong><span>₹{Number(totalCommission).toFixed(2)}</span></div>
          {showGstInPdf !== false && (
            <>
              <div className="summary-item"><strong>18% GST</strong><span>₹{(totalCommission * 0.18).toFixed(2)}</span></div>
              <div className="summary-item"><strong>Total after 18% GST</strong><span>₹{(totalCommission * 1.18).toFixed(2)}</span></div>
            </>
          )}
          <div className="summary-item"><strong>Commission Type</strong><span>{commissionType === 'percentage' ? `${(commissionRate * 100).toFixed(2)}%` : `₹${fixedRate.toFixed(2)} per unit`}</span></div>
        </div>
      </div>
      {/* ── Place Selector Modal for Brokerage Due List ── */}
      {showDueListModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', fontFamily: "'Inter','Segoe UI',sans-serif"
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '420px',
            padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            color: '#1e293b'
          }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              Generate Brokerage Due List
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '13px', color: '#64748b' }}>
              Choose a specific place/location to generate the due list PDF, or select "All Places".
            </p>

            {/* Multi-Place Selection Controls */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>
                  Select Places / Locations ({dueListSelectedPlaces.includes('all') || dueListSelectedPlaces.length === 0 ? 'All Places' : `${dueListSelectedPlaces.length} selected`}):
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setDueListSelectedPlaces(['all'])}
                    style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: '#334155' }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueListSelectedPlaces([])}
                    style={{ background: '#fee2e2', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: '#ef4444' }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {placesListForModal.length > 5 && (
                <input
                  type="text"
                  placeholder="Search place name..."
                  value={dueListPlaceSearch}
                  onChange={e => setDueListPlaceSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', borderRadius: '6px',
                    border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '8px',
                    background: '#f8fafc', color: '#0f172a', outline: 'none'
                  }}
                />
              )}

              <div style={{
                maxHeight: '140px', overflowY: 'auto', border: '1.5px solid #cbd5e1',
                borderRadius: '8px', padding: '8px 10px', background: '#f8fafc',
                display: 'flex', flexDirection: 'column', gap: '6px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 700, color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={dueListSelectedPlaces.includes('all')}
                    onChange={() => {
                      if (dueListSelectedPlaces.includes('all')) {
                        setDueListSelectedPlaces([]);
                      } else {
                        setDueListSelectedPlaces(['all']);
                      }
                    }}
                    style={{ width: '15px', height: '15px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  🌟 All Places (Full Due List)
                </label>

                {placesListForModal
                  .filter(p => p.toLowerCase().includes(dueListPlaceSearch.toLowerCase()))
                  .map(p => {
                    const isChecked = !dueListSelectedPlaces.includes('all') && dueListSelectedPlaces.includes(p);
                    return (
                      <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', fontWeight: isChecked ? 600 : 400, color: '#334155' }}>
                        <input
                          type="checkbox"
                          checked={dueListSelectedPlaces.includes('all') || isChecked}
                          onChange={() => {
                            if (dueListSelectedPlaces.includes('all')) {
                              const allExceptThis = placesListForModal.filter(x => x !== p);
                              setDueListSelectedPlaces(allExceptThis);
                            } else if (dueListSelectedPlaces.includes(p)) {
                              const next = dueListSelectedPlaces.filter(x => x !== p);
                              setDueListSelectedPlaces(next);
                            } else {
                              const next = [...dueListSelectedPlaces, p];
                              if (next.length === placesListForModal.length) {
                                setDueListSelectedPlaces(['all']);
                              } else {
                                setDueListSelectedPlaces(next);
                              }
                            }
                          }}
                          style={{ width: '15px', height: '15px', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        {p}
                      </label>
                    );
                  })}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: '#334155' }}>
                Include in PDF Output (for Employee / Client copies):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={dueListIncludeCommissionColumn}
                    onChange={e => setDueListIncludeCommissionColumn(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Show Total Commission Column in Table
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={dueListIncludeCommissionSummary}
                    onChange={e => setDueListIncludeCommissionSummary(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Show Total Commission in Bottom Summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={dueListIncludeGST}
                    onChange={e => setDueListIncludeGST(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Show 18% GST in Bottom Summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={dueListIncludeTotalAfterGST}
                    onChange={e => setDueListIncludeTotalAfterGST(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Show Total After 18% GST in Bottom Summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={dueListIncludeQRCode}
                    onChange={e => setDueListIncludeQRCode(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Include QR Code (Scan to Pay) in Footer
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowDueListModal(false)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowDueListModal(false);
                  const isAll = dueListSelectedPlaces.includes('all') ||
                                dueListSelectedPlaces.length === 0 ||
                                dueListSelectedPlaces.length === placesListForModal.length;

                  const selectedSet = new Set(dueListSelectedPlaces.map(p => p.toLowerCase()));

                  const filteredRows = isAll
                    ? data
                    : data.filter(row => {
                        const p = (row['SHOP LOC'] || row['SHOP LOCATION'] || row['PLACE'] || row['LOCATION'] || row['CITY'] || row['ROAD'] || '').toString().trim().toLowerCase();
                        return selectedSet.has(p);
                      });

                  const placeLabel = isAll
                    ? 'All Places'
                    : dueListSelectedPlaces.filter(p => p !== 'all').join(', ');

                  const doc = await buildBrokerageDueListPDF({
                    companyHeader: companyName,
                    periodOfBilling,
                    selectedPlace: placeLabel,
                    selectedMiller: selectedMiller !== 'all' ? selectedMiller : undefined,
                    rows: filteredRows,
                    commissionType,
                    commissionRate,
                    fixedRate,
                    bank: bankDetails ?? DEFAULT_BANK,
                    companyPhone,
                    companyPAN,
                    companyGST,
                    includeCommissionColumn: dueListIncludeCommissionColumn,
                    includeCommissionSummary: dueListIncludeCommissionSummary,
                    includeGST: dueListIncludeGST,
                    includeTotalAfterGST: dueListIncludeTotalAfterGST,
                    showQRCode: dueListIncludeQRCode,
                  });
                  const suffix = isAll ? '_All' : `_${dueListSelectedPlaces.filter(p => p !== 'all').slice(0, 3).join('_').replace(/[^a-z0-9]/gi, '_')}`;
                  doc.save(`Brokerage_Due_List${suffix}.pdf`);
                }}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#ffffff',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPreviewBuyerSide;