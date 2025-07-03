'use client';

import { useState, useEffect, useMemo } from 'react';
import ExcelImport from './components/ExcelImport';
import FilterControls from './components/FilterControls';
import DataPreview from './components/DataPreview';
import DataPreviewBuyerSide from './components/DataPreviewB';
import './styles/calculator.css';
import './styles/DataPreview.css';
import './styles/excel-import.css';
import './styles/DataPreviewB.css';

export default function Home() {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [millers, setMillers] = useState<string[]>([]);
  const [buyers, setBuyers] = useState<string[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<string[]>([]);
  const [selectedMiller, setSelectedMiller] = useState('all');
  const [selectedBuyer, setSelectedBuyer] = useState('all');
  const [commissionRate, setCommissionRate] = useState(0.02);
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [fixedRate, setFixedRate] = useState(10);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculationSide, setCalculationSide] = useState<'miller' | 'buyer'>('miller');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDataImport = async (data: any[]) => {
    try {
      setLoading(true);
      if (!Array.isArray(data)) {
        setError('Invalid data format');
        return;
      }

      const normalized = data.map(row => ({
        ...row,
        'BUYER NAME': row['BUYER NAMER'] || row['BUYER NAME'],
      }));

      setExcelData(normalized);

      const uniqueMillers = Array.from(new Set(data.map(row => row['MILLER NAME'] || ''))).filter(Boolean);
      const uniqueBuyers = Array.from(new Set(data.map(row => row['BUYER NAME'] || ''))).filter(Boolean);

      setMillers(uniqueMillers);
      setBuyers(uniqueBuyers);
      setFilteredBuyers(uniqueBuyers);
      setError('');
    } catch (err) {
      console.error('Import Error:', err);
      setError('Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMillerChange = (miller: string) => {
    setSelectedMiller(miller);
    setSelectedBuyer('all');
  };

  const getFilteredData = () => {
    return excelData.filter(row => {
      const millerMatch = selectedMiller === 'all' || row['MILLER NAME'] === selectedMiller;
      const buyerMatch = selectedBuyer === 'all' || row['BUYER NAME'] === selectedBuyer;
      return millerMatch && buyerMatch;
    });
  };

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

  const calculateTotalQuantity = (data: any[]) => {
    return data.reduce((total, row) => total + findQuantityField(row), 0);
  };

  const calculateTotalAmount = (data: any[]) => {
    return data.reduce((total, row) => total + findAmountField(row), 0);
  };

  const calculateTotalCommission = (data: any[]) => {
    return data.reduce((total, row) => {
      const qty = findQuantityField(row);
      const amt = findAmountField(row);
      const miller = (row['MILLER NAME'] || '').toLowerCase();
      let commission = 0;

      if (miller.includes('nidhi agro')) {
        commission = amt * 0.01;
      } else if (commissionType === 'percentage') {
        commission = amt * commissionRate;
      } else {
        commission = qty * fixedRate;
      }

      return total + commission;
    }, 0);
  };

  useEffect(() => {
    let filteredMillers: string[] = [];
    let filteredBuyers: string[] = [];

    if (calculationSide === 'miller') {
      filteredMillers =
        selectedBuyer === 'all'
          ? Array.from(new Set(excelData.map(row => row['MILLER NAME']).filter(Boolean)))
          : Array.from(
              new Set(
                excelData
                  .filter(row => row['BUYER NAME'] === selectedBuyer)
                  .map(row => row['MILLER NAME'])
                  .filter(Boolean)
              )
            );

      filteredBuyers =
        selectedMiller === 'all'
          ? Array.from(new Set(excelData.map(row => row['BUYER NAME']).filter(Boolean)))
          : Array.from(
              new Set(
                excelData
                  .filter(row => row['MILLER NAME'] === selectedMiller)
                  .map(row => row['BUYER NAME'])
                  .filter(Boolean)
              )
            );
    } else {
      filteredBuyers =
        selectedMiller === 'all'
          ? Array.from(new Set(excelData.map(row => row['BUYER NAME']).filter(Boolean)))
          : Array.from(
              new Set(
                excelData
                  .filter(row => row['MILLER NAME'] === selectedMiller)
                  .map(row => row['BUYER NAME'])
                  .filter(Boolean)
              )
            );

      filteredMillers =
        selectedBuyer === 'all'
          ? Array.from(new Set(excelData.map(row => row['MILLER NAME']).filter(Boolean)))
          : Array.from(
              new Set(
                excelData
                  .filter(row => row['BUYER NAME'] === selectedBuyer)
                  .map(row => row['MILLER NAME'])
                  .filter(Boolean)
              )
            );
    }

    setMillers(filteredMillers);
    setFilteredBuyers(filteredBuyers);

    if (selectedMiller !== 'all' && !filteredMillers.includes(selectedMiller)) {
      setSelectedMiller('all');
    }
    if (selectedBuyer !== 'all' && !filteredBuyers.includes(selectedBuyer)) {
      setSelectedBuyer('all');
    }
  }, [selectedMiller, selectedBuyer, excelData, calculationSide]);

  const filteredData = useMemo(() => getFilteredData(), [excelData, selectedMiller, selectedBuyer]);
  const totalQuantity = useMemo(() => calculateTotalQuantity(filteredData), [filteredData]);
  const totalAmount = useMemo(() => calculateTotalAmount(filteredData), [filteredData]);
  const totalCommission = useMemo(
    () => calculateTotalCommission(filteredData),
    [filteredData, commissionRate, commissionType, fixedRate]
  );

  return (
    <main className="container">
      <header className="header">
        <h1>TEJAS ANALYTICS PLATFORM</h1>
        <p>Enterprise solution for miller-buyer transaction analysis</p>
      </header>

      {isClient ? (
        <>
          <div className="card">
            <h2>Import Your Data</h2>
            <ExcelImport onDataImport={handleDataImport} />
            {loading && <div className="loading">Importing data, please wait...</div>}
            <div className="toggle-buttons">
              <button
                onClick={() => setCalculationSide('miller')}
                className={calculationSide === 'miller' ? 'active' : ''}
              >
                Miller Side
              </button>
              <button
                onClick={() => setCalculationSide('buyer')}
                className={calculationSide === 'buyer' ? 'active' : ''}
              >
                Buyer Side
              </button>
            </div>
          </div>

          {error && <div className="error-alert">{error}</div>}

          {excelData.length > 0 && (
            <>
              <FilterControls
                millers={millers}
                buyers={filteredBuyers}
                selectedMiller={selectedMiller}
                selectedBuyer={selectedBuyer}
                commissionRate={commissionRate}
                commissionType={commissionType}
                fixedRate={fixedRate}
                onMillerChange={handleMillerChange}
                onBuyerChange={setSelectedBuyer}
                onCommissionRateChange={setCommissionRate}
                onCommissionTypeChange={setCommissionType}
                onFixedRateChange={setFixedRate}
              />

              <div className="summary">
                <p>
                  <strong>Total Quantity:</strong> {totalQuantity}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}
                </p>
                <p>
                  <strong>Total Commission:</strong> ₹{totalCommission.toLocaleString()}
                </p>
              </div>

              <div className="preview-wrapper">
                {calculationSide === 'miller' ? (
                  <DataPreview
                    data={filteredData}
                    commissionRate={commissionRate}
                    commissionType={commissionType}
                    fixedRate={fixedRate}
                    totalTransactions={filteredData.length}
                    totalQuantity={totalQuantity}
                    totalAmount={totalAmount}
                    totalCommission={totalCommission}
                    selectedMiller={selectedMiller}
                    selectedBuyer={selectedBuyer}
                  />
                ) : (
                  <DataPreviewBuyerSide
                    data={filteredData}
                    commissionRate={commissionRate}
                    commissionType={commissionType}
                    fixedRate={fixedRate}
                    totalTransactions={filteredData.length}
                    totalQuantity={totalQuantity}
                    totalAmount={totalAmount}
                    totalCommission={totalCommission}
                    selectedMiller={selectedMiller}
                    selectedBuyer={selectedBuyer}
                  />
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
}
