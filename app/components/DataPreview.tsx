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
  userBillNo: string;     // ✅ New
  userBillDate: string;   // ✅ New
  periodOfBilling: string;
  onPeriodOfBillingChange: (value: string) => void;
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
  selectedBuyer,
  userBillNo,
  userBillDate,
  periodOfBilling,
  onPeriodOfBillingChange
}) => {
  const calculatedRows = useMemo(() => {
    return data.map((row, idx) => {
      const quantity = findQuantityField(row);
      const amount = findAmountField(row);
      const miller = row['MILLER NAME'] || '';
      const buyer = row['BUYER NAME'] || '';
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
        miller,
        buyer,
        billNo: row['BILL NO'] || row['BILL'] || '',
        quantity,
        rate,
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
    doc.setTextColor(0, 0, 255); // RGB for blue
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Tejas Canvassing', pageWidth / 2, finalY, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reset to black for the rest of the document


    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No. 123, 1st Floor, 4th main Road, Yeshwanthpur,APMC Yard,Bengaluru - 560022', pageWidth / 2, finalY + 20, { align: 'center' });
    doc.text('Phone: 9916416995 ; PAN NO: AEBPA6445G', pageWidth / 2, finalY + 35, { align: 'center' });
    finalY += 60;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`BROKERAGE FROM : ${periodOfBilling}`, pageWidth / 2, finalY, { align: 'center' });
    finalY += 15;


    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
// Left-aligned Bill No
    doc.text(`Bill No: ${userBillNo || '-'}`, marginX, finalY);

// Right-aligned Date
    doc.text(`Date: ${userBillDate || '-'}`, pageWidth - marginX, finalY, { align: 'right' });

    finalY += 20;

    // Bill Info Table
    autoTable(doc, {
     startY: finalY,
     head: [['Miller']],
     body: [[selectedMiller || '-']],
     theme: 'grid',
     styles: {
     fontSize: 10,
     halign: 'center' // ✅ Center-align both head and body
  },
     headStyles: {
     fillColor: [255, 193, 7],
     textColor: 0,
     halign: 'center' // ✅ Center-align header
    },
      margin: { left: marginX, right: marginX }
     });

    finalY = (doc as any).lastAutoTable.finalY + 20;

    // Summary Table
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

     doc.setFontSize(11);
     doc.setFont('helvetica', 'bold');
     doc.text('Authorized Signatory', pageWidth - marginX, finalY, { align: 'right' });

    // Data Table
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
  styles: {
    fontSize: 9,
    halign: 'left' // Default alignment for text fields
  },
  theme: 'grid',
  margin: { left: marginX, right: marginX },
  headStyles: {
    fillColor: [0, 123, 255],
    textColor: 255,
    halign: 'center' // ✅ Center-align the header text
  },
  columnStyles: {
    0: { halign: 'center' }, // # (Serial number)
    5: { halign: 'right' },  // Quantity
    6: { halign: 'right' },  // Rate
    7: { halign: 'right' },  // Amount
    8: { halign: 'right' }   // Commission
  }
});

    finalY = (doc as any).lastAutoTable.finalY + 20;

    // Bank Info Table
autoTable(doc, {
  startY: finalY,
  head: [['Acc Name', 'A/C No', 'Bank Name', 'IFSC', 'UPI NO']],
  body: [['TEJAS CANVASSING', '922020031617300', 'Axis Bank', 'UTIB0004052', '9916416995']],
  styles: {
    fontSize: 9,
    halign: 'left' // Default: left-aligned
  },
  headStyles: {
    fillColor: [76, 175, 80],
    textColor: 255,
    halign: 'center' // ✅ Center-align header row
  },
  columnStyles: {
    1: { halign: 'right' },  // A/C No
    3: { halign: 'center' }, // IFSC
    4: { halign: 'right' }   // UPI NO
  },
  theme: 'grid',
  margin: { left: marginX, right: marginX }
});

    const safeMiller = selectedMiller && selectedMiller !== 'all'
      ? selectedMiller.replace(/[^a-z0-9]/gi, '_')
      : 'AllMillers';

    const fileName = `${safeMiller}.pdf`;
    doc.save(fileName);
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
