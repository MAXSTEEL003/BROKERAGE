'use client';

import { useState, useEffect } from 'react';
import { isBrowser } from '../lib/utils/browserCheck';

export default function ExcelImport({
  onDataLoaded,
  onSheetSelect,
}: {
  onDataLoaded: (data: any[], columns: string[], sheets: string[]) => void;
  onSheetSelect: (sheetName: string) => void;
}) {
  const [xlsx, setXlsx] = useState<typeof import('xlsx') | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sheetNames, setSheetNames] = useState<string[]>([]);

  useEffect(() => {
    if (isBrowser) {
      import('xlsx').then((module) => setXlsx(module));
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!xlsx) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        // Type assertion: event.target is FileReader
        const target = event.target;
        if (!target) throw new Error('FileReader target is null');
        const data = target.result;
        if (!data) throw new Error('FileReader result is empty');

        // data is ArrayBuffer because we use readAsArrayBuffer
        const workbook = xlsx.read(data, { type: 'array' });

        const sheets = workbook.SheetNames;
        setSheetNames(sheets);

        if (sheets.length > 0) {
          const sheetName = sheets[0];
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = xlsx.utils.sheet_to_json(worksheet);

          // typed as array of objects
          const columns =
            parsedData.length > 0
              ? Object.keys(parsedData[0] as Record<string, unknown>).filter(
                  (col) =>
                    !col.startsWith('_EMPTY') &&
                    col !== 'LH' &&
                    col !== 'DIFF AMOUNT' &&
                    col !== 'NET AMOUNT'
                )
              : [];

          onDataLoaded(parsedData, columns, sheets);
          onSheetSelect(sheetName);
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Failed to parse Excel file');
      } finally {
        setIsLoading(false);
      }
    };

    // Use readAsArrayBuffer for better compatibility with xlsx
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Data Import</h2>
      </div>

      <div className="card-body">
        <div className="file-upload">
          <input
            type="file"
            id="file-upload"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="file-upload-label">
            <span className="file-upload-text">Import Excel File</span>
          </label>
        </div>

        {isLoading && <div>Loading...</div>}

        {fileName && !isLoading && (
          <div className="file-info">
            <p>File: {fileName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
