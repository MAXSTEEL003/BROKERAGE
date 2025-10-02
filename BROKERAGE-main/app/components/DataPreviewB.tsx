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
  selectedShopLoc: string; // ✅ New
  userBillNo: string;
  userBillDate: string;
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
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const calculatedRows = useMemo(() => {
    return data.map((row, idx) => {
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
  }, [data, commissionRate, commissionType, fixedRate]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return calculatedRows.slice(start, start + rowsPerPage);
  }, [calculatedRows, currentPage]);

  const totalPages = Math.ceil(calculatedRows.length / rowsPerPage);

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 40;
    let finalY = 40;

doc.setTextColor(0, 0, 255);
doc.setFontSize(25);
doc.setFont('helvetica', 'bold');
doc.text('Tejas Canvassing', pageWidth / 2, finalY, { align: 'center' });

doc.setTextColor(0, 0, 0);
doc.setFontSize(10);
doc.setFont('helvetica', 'bold');

// Add more spacing between lines
doc.text(
  'No. 123, 1st Floor, 4th main Road, Yeshwanthpur,APMC Yard,Bengaluru - 560022',
  pageWidth / 2,
  finalY + 25,
  { align: 'center' }
);

doc.text(
  'Phone: 9916416995 ; PAN NO: AEBPA6445G',
  pageWidth / 2,
  finalY + 45,
  { align: 'center' }
);

doc.setLineWidth(1.5); // Thickness of the line
doc.line(40, finalY + 60, pageWidth - 40, finalY + 60); // (x1, y1, x2, y2)

finalY += 90;

doc.setFontSize(15);
doc.setFont('helvetica', 'bold');

const brokerageText = `Brokerage  From : ${periodOfBilling}`;
doc.text(brokerageText, pageWidth / 2, finalY, { align: 'center' });

finalY += 35;


    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Bill No: ${userBillNo || '-'}`, marginX, finalY);
    doc.text(`Date: ${userBillDate ? formatDate(userBillDate) : '-'}`, pageWidth - marginX, finalY, { align: 'right' });
    finalY += 20;

    autoTable(doc, {
      startY: finalY,
      head: [['TO', 'ROAD']],
      body: [[selectedBuyer || '-', selectedShopLoc || '-']],
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center'
      },
      headStyles: {
        fillColor: [255, 193, 7],
        textColor: 0,
        halign: 'center'
      },
      margin: { left: marginX, right: marginX }
    });

    finalY = (doc as any).lastAutoTable.finalY + 20;


// First Table
autoTable(doc, {
  startY: finalY,
  head: [['#', 'Date', 'Miller', 'Bill No', 'Quantity', 'Rate', 'Amount']],
  body: calculatedRows.map(row => [
    row.idx,
    row.date,
    row.miller,
    row.billNo,
    row.quantity,
    row.rate,
    row.commission // 👈 Make sure this is amount, not commission
  ]),
  styles: {
    fontSize: 9,
    halign: 'left'
  },
  theme: 'grid',
  margin: { left: marginX, right: marginX },
  headStyles: {
    fillColor: [0, 123, 255],
    textColor: 255,
    halign: 'center'
  },
  columnStyles: {
    0: { halign: 'center' },
    3: { halign: 'center' },
    4: { halign: 'center' },
    5: { halign: 'center' },
    6: { halign: 'center' }
  }
});

// Second Row (aligned under "Quantity" and "Amount")
finalY = (doc as any).lastAutoTable.finalY + 20;

autoTable(doc, {
  startY: finalY,
  head: [['Summary','Quantity','Amount']],
  body: [
    ['Total', totalQuantity.toFixed(2), totalCommission.toFixed(2)]
  ],
  columnStyles: {
    0: { halign: 'center' },
    1: { halign: 'center' }, // Quantity column
    2: { halign: 'center' }  // Amount column
  },
  styles: {
    fontSize: 10,
    fontStyle: 'bold'
  },
  theme: 'grid',
  margin: { left: marginX, right: marginX },
  headStyles:{
    halign: 'center'
  }
});


    finalY = (doc as any).lastAutoTable.finalY + 20;
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
    0: { halign: 'center' },  // A/C No
    1: { halign: 'center' }, // IFSC
    2: { halign: 'center' },
    3: { halign: 'center' } ,
    4: { halign: 'center' }  
  },
  theme: 'grid',
  margin: { left: marginX, right: marginX }
});

    finalY = (doc as any).lastAutoTable.finalY + 40;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Authorized Signatory', pageWidth - marginX, finalY, { align: 'right' });

    const safeBuyer = selectedBuyer && selectedBuyer !== 'all'
      ? selectedBuyer.replace(/[^a-z0-9]/gi, '_')
      : 'AllBuyers';

    const fileName = `${safeBuyer}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="data-preview">
      <div className="preview-header">
        <div className="header-title">
          <h3>Buyer Side View</h3>
          <div className="buyer-info">
            <p><strong>Buyer:</strong> {selectedBuyer}</p>
            <p><strong>Shop Location:</strong> {selectedShopLoc}</p>
          </div>
          <button className="export-button" onClick={exportToPDF}>Export to PDF</button>
        </div>
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