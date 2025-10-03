'use client';

import React, { useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import '../styles/DataPreview.css';


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
  selectedBuyer
}) => {
  const calculatedRows = useMemo(() => {
    return data.map((row, idx) => {
      const quantity = findQuantityField(row);
      const amount = findAmountField(row);
      const miller = row['MILLER NAME'] || '';
      const buyer = row['BUYER NAME'] || '';

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
        miller,
        buyer,
        billNo: row['BILL NO'] || row['BILL'] || '',
        quantity,
        rate: commissionType === 'percentage' ? `${(commissionRate * 100).toFixed(2)}%` : `₹${fixedRate}`,
        amount,
        commission: commission.toFixed(2)
      };
    });
  }, [data, commissionRate, commissionType, fixedRate]);

  const exportToPDF = () => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let finalY = 40;

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Tejas Canvassing Services - Miller Side Report', pageWidth / 2, finalY, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('No. 12, 1st Floor, Market Road, Yeshwanthpur, Bengaluru - 560022', pageWidth / 2, finalY + 20, { align: 'center' });
  doc.text('Phone: +91-9876543210', pageWidth / 2, finalY + 35, { align: 'center' });
  finalY += 60;

  // Summary
  autoTable(doc, {
    startY: finalY,
    head: [['Summary', 'Value']],
    body: [
      ['Total Transactions', totalTransactions.toString()],
      ['Total Quantity (Quintals)', totalQuantity.toFixed(2)],
      ['Total Amount', totalAmount.toFixed(2)],
      ['Total Commission', totalCommission.toFixed(2)]
    ],
    headStyles: { fillColor: [63, 81, 181], textColor: 255 },
    theme: 'grid',
    styles: { fontSize: 10 },
    margin: { left: marginX, right: marginX }
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // Transactions
  autoTable(doc, {
    startY: finalY,
    head: [['#', 'Date', 'Miller', 'Buyer', 'Bill No', 'Quantity', 'Rate', 'Amount', 'Commission']],
    body: calculatedRows.map(row => [
      row.idx,
      row.date,
      row.miller,
      row.buyer,
      row.billNo,
      row.quantity,
      row.rate,
      row.amount,
      row.commission
    ]),
    styles: { fontSize: 9 },
    theme: 'striped',
    margin: { left: marginX, right: marginX },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 }
  });

  finalY = (doc as any).lastAutoTable.finalY + 20;

  // Bank Details
  autoTable(doc, {
    startY: finalY,
    head: [['Bank Name', 'Branch', 'IFSC Code', 'Account No', 'UPI']],
    body: [['Canara Bank', 'Yeshwanthpur', 'CNRB0001234', '1234567890', 'tejas@upi']],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [76, 175, 80], textColor: 255 },
    theme: 'striped',
    margin: { left: marginX, right: marginX }
  });

  doc.save('Miller_Side_Report.pdf');
};

  return (
    <div className="data-preview">
      <div className="preview-header">
        <div className="header-title">
          <h3>Miller Side View</h3>
          <button className="export-button" onClick={exportToPDF}>Export to PDF</button>
        </div>
      </div>

      <div className="preview-table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Miller</th>
              <th>Buyer</th>
              <th>Bill No</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Commission</th>
            </tr>
          </thead>
          <tbody>
            {calculatedRows.map(row => (
              <tr key={row.idx}>
                <td>{row.idx}</td>
                <td>{row.date}</td>
                <td>{row.miller}</td>
                <td>{row.buyer}</td>
                <td>{row.billNo}</td>
                <td>{row.quantity}</td>
                <td>{row.rate}</td>
                <td>{row.amount}</td>
                <td>{row.commission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="preview-summary">
        <div className="summary-grid">
          <div className="summary-item"><strong>Total Transactions</strong><span>{totalTransactions}</span></div>
          <div className="summary-item"><strong>Total Quantity</strong><span>{totalQuantity}</span></div>
          <div className="summary-item"><strong>Total Amount</strong><span>₹{totalAmount.toLocaleString()}</span></div>
          <div className="summary-item"><strong>Total Commission</strong><span>₹{totalCommission.toLocaleString()}</span></div>
          <div className="summary-item"><strong>Commission Type</strong><span>{commissionType === 'percentage' ? `${(commissionRate * 100).toFixed(2)}%` : `₹${fixedRate} per unit`}</span></div>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;
