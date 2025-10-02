// components/ExcelImport.tsx
import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import '../styles/excel-import.css';

interface ExcelImportProps {
  onDataImport: (data: any[]) => void;
  onMappingExtracted: (map: { [buyer: string]: string }) => void;
}

const HEADER_MAP: Record<string, string> = {
  'QTY': 'QUANTITY',
  'QTLS': 'QUANTITY',
  'QUINTALS': 'QUANTITY',
  'QUINTAL': 'QUANTITY',
  'AMT': 'AMOUNT',
  'TOTAL': 'AMOUNT',
  'TOTAL AMOUNT': 'AMOUNT',
  'VALUE': 'AMOUNT',
  'RATE': 'RATE',
  'DATE': 'DATE',
  'PLACE': 'PLACE',
  'SHOP LOC': 'SHOP LOC',
  'BUYER': 'BUYER',
  'BUYER NAME': 'BUYER'
};

const ExcelImport: React.FC<ExcelImportProps> = ({ onDataImport, onMappingExtracted }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        // Normalize headers
        const normalizedData = jsonData.map(row => {
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            const cleaned = key.trim().toUpperCase();
            const mapped = HEADER_MAP[cleaned] || cleaned;
            normalizedRow[mapped] = row[key];
          });
          return normalizedRow;
        });

        // Extract buyer => shop loc mapping
        const buyerShopLocMap: { [buyer: string]: string } = {};
        normalizedData.forEach(row => {
          const buyer = row['BUYER']?.trim();
          const shopLoc = row['SHOP LOC']?.trim();
          if (buyer && shopLoc && !buyerShopLocMap[buyer]) {
            buyerShopLocMap[buyer] = shopLoc;
            console.log('Mapped:', buyer, '->', shopLoc);
          }
        });

        setError('');
        onDataImport(normalizedData);
        onMappingExtracted(buyerShopLocMap);
      } catch (err) {
        setError('Failed to parse Excel file.');
        console.error(err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="excel-import">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
      />
      {error && <div className="error-alert">{error}</div>}
    </div>
  );
};

export default ExcelImport;
