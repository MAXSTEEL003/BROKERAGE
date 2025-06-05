'use client';

import { useState } from 'react';
import { processFile } from '../lib/excel';

interface ExcelImportProps {
  onDataLoaded: (data: any[], columns: string[], sheets: string[]) => void;
  onSheetSelect: (sheetName: string) => void;
}

export default function ExcelImport({ onDataLoaded, onSheetSelect }: ExcelImportProps) {
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      const result = await processFile(file);
      
      if (Array.isArray(result) && result.length > 0) {
        const columns = Object.keys(result[0]).filter(
          (col) =>
            !col.startsWith('_EMPTY') &&
            col !== 'LH' &&
            col !== 'DIFF AMOUNT' &&
            col !== 'NET AMOUNT'
        );

        // Assuming we only have one sheet for simplicity
        const sheets = ['Sheet1'];
        onDataLoaded(result, columns, sheets);
        onSheetSelect(sheets[0]);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert('Failed to process Excel file. Please try again.');
    } finally {
      setIsLoading(false);
    }
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