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
  'PLACE': 'SHOP LOC',
  'SHOP LOC': 'SHOP LOC',
  'BUYER NAMER': 'BUYER', // handle common typo
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
            // Preserve first non-empty SHOP LOC / PLACE encountered; ignore subsequent duplicates
            if (mapped === 'SHOP LOC' && normalizedRow['SHOP LOC']) {
              if (!normalizedRow['SHOP LOC'] && row[key]) {
                normalizedRow['SHOP LOC'] = row[key];
              }
              return; // skip overwriting
            }
            normalizedRow[mapped] = row[key];
          });
          return normalizedRow;
        });

        // Utilities to sanitize strings (collapse whitespace, trim, remove non-breaking spaces)
        const clean = (val: any) =>
          val === undefined || val === null
            ? ''
            : val
                .toString()
                .replace(/\u00A0/g, ' ') // non-breaking space to normal space
                .replace(/\s+/g, ' ') // collapse internal whitespace
                .trim();

        // Extract buyer => shop loc mapping (PLACE also mapped to SHOP LOC)
        const buyerShopLocMap: { [buyer: string]: string } = {};
        normalizedData.forEach(row => {
          const rawBuyer = row['BUYER'] || row['BUYER NAMER'] || row['BUYER NAME'];
          const rawLoc = row['SHOP LOC'];
          const buyer = clean(rawBuyer);
          const shopLoc = clean(rawLoc);
          if (buyer && shopLoc && !buyerShopLocMap[buyer]) {
            buyerShopLocMap[buyer] = shopLoc;
          }
        });

        // Rich debug output
        const entries = Object.entries(buyerShopLocMap);
        console.group('[Buyer->ShopLoc Mapping]');
        console.log('Total buyers with mapping:', entries.length);
        console.log('Sample (first up to 10):', entries.slice(0, 10));
        if (entries.length === 0) {
          console.warn('No buyer -> shop loc pairs detected. Check column headers (expected: BUYER / BUYER NAMER / BUYER NAME and PLACE / SHOP LOC).');
          console.log('First row keys sample:', Object.keys(normalizedData[0] || {}));
        }
        console.groupEnd();

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
      <label className="file-input-wrapper">
        <button
          type="button"
          className="file-input-button btn btn-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          <span>Import Excel</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onClick={e => { (e.target as HTMLInputElement).value = ''; }}
          onChange={handleFileUpload}
        />
      </label>
      <div className="file-drop-text">Supported formats: .xlsx, .xls</div>
      {error && <div className="error-alert">{error}</div>}
    </div>
  );
};

export default ExcelImport;
