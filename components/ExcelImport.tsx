import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import '../styles/excel-import.css';

interface ExcelImportProps {
  onDataImport: (data: any[]) => void;
}

const HEADER_MAP: Record<string, string> = {
  'QTY': 'QUANTITY',
  'QTLS': 'QUANTITY',
  'QUINTALS': 'QUANTITY',
  'QUINTAL': 'QUANTITY',
  'qtls': 'QUANTITY',
  'AMT': 'AMOUNT',
  'TOTAL': 'AMOUNT',
  'TOTAL AMOUNT': 'AMOUNT',
  'VALUE': 'AMOUNT',
  'Amount': 'AMOUNT',
  'PLACE': 'PLACE',
  'BRAND': 'BRAND',
  'RATE': 'RATE',
  'DATE': 'DATE'
};

const ExcelImport: React.FC<ExcelImportProps> = ({ onDataImport }) => {
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

        const normalizedData = jsonData.map(row => {
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            const cleaned = key.trim().toUpperCase();
            const mapped = HEADER_MAP[cleaned] || cleaned;
            normalizedRow[mapped] = row[key];
          });
          return normalizedRow;
        });

        setError('');
        onDataImport(normalizedData);
      } catch (err) {
        setError('Failed to parse file.');
        console.error('Excel parsing error:', err);
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
