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
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('fixed');
  const [fixedRate, setFixedRate] = useState(11); // default fixed rate updated to 11
  const [calculationSide, setCalculationSide] = useState<'miller' | 'buyer' | null>(null);
  const [userBillNo, setUserBillNo] = useState('');
  const [userBillDate, setUserBillDate] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [periodOfBilling, setPeriodOfBilling] = useState('APR 2025 to JULY 2025');
  const [buyerShopLocMap, setBuyerShopLocMap] = useState<{ [key: string]: string }>({});
  const [selectedShopLocation, setSelectedShopLocation] = useState('');
  // Track if user explicitly chose a buyer to suppress auto-selection overrides
  const [buyerManuallyChosen, setBuyerManuallyChosen] = useState(false);

  // Helper to normalize buyer names consistently across dataset & selection
  const normalizeBuyer = (val: string) =>
    (val || '')
      .toString()
      .replace(/\u00A0/g, ' ') // NBSP -> space
      .replace(/\s+/g, ' ') // collapse whitespace
      .trim()
      .toLowerCase();

  const handlePeriodOfBillingChange = (value: string) => {
    setPeriodOfBilling(value);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDataImport = async (data: any[]) => {
    try {
      setLoading(true);
      // Reset selections & previous mappings for a clean import cycle
      setSelectedBuyer('all');
      setSelectedShopLocation('');
      setBuyerShopLocMap({});

      // Ensure a consistent 'BUYER NAME' field is present even if Excel header was 'BUYER'
      const normalized = data.map(row => {
        const rawBuyer = row['BUYER NAMER'] || row['BUYER NAME'] || row['BUYER'] || '';
        const cleanedDisplay = rawBuyer
          .toString()
          .replace(/\u00A0/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return {
          ...row,
          'BUYER NAME': cleanedDisplay,
          '__BUYER_NORM__': normalizeBuyer(cleanedDisplay)
        };
      });

      const clean = (val: any) =>
        val === undefined || val === null
          ? ''
          : val
              .toString()
              .replace(/\u00A0/g, ' ') // non-breaking space
              .replace(/\s+/g, ' ') // collapse whitespace
              .trim();

      const shopLocMap: Record<string, string> = {};
      normalized.forEach((row: any) => {
        const buyerRaw = row['BUYER NAME'];
        const buyer = clean(buyerRaw);
        const shopLoc = clean(row['SHOP LOC']);
        if (buyer && shopLoc && !shopLocMap[buyer]) {
          shopLocMap[buyer] = shopLoc;
        }
      });

      setBuyerShopLocMap(shopLocMap); // Overwrite with consistent-casing mapping
      console.log('[page.tsx] Stored buyerShopLocMap size:', Object.keys(shopLocMap).length);
  // If only one buyer present, optionally auto-select (left commented)
  // if (uniqueBuyers.length === 1) setSelectedBuyer(uniqueBuyers[0]);
      setExcelData(normalized);

      const uniqueMillers = Array.from(new Set(normalized.map(row => row['MILLER NAME'] || ''))).filter(Boolean);
      const uniqueBuyers = Array.from(
        new Set(
          normalized
            .map(row => (row['BUYER NAME'] || '').toString().replace(/\u00A0/g,' ').replace(/\s+/g,' ').trim())
            .filter(Boolean)
        )
      );

      setMillers(uniqueMillers);
      setBuyers(uniqueBuyers);
      setFilteredBuyers(uniqueBuyers);
      // Auto-select if there's only one buyer
      if (uniqueBuyers.length === 1) {
        setSelectedBuyer(uniqueBuyers[0]);
      }
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
    setBuyerManuallyChosen(false);
  };

  const handleBuyerChange = (buyer: string) => {
    setSelectedBuyer(buyer);
    setBuyerManuallyChosen(buyer !== 'all');
  };

  const getFilteredData = () => {
    return excelData.filter(row => {
      const millerMatch = selectedMiller === 'all' || row['MILLER NAME'] === selectedMiller;
      const buyerMatch = selectedBuyer === 'all' || normalizeBuyer(row['BUYER NAME']) === normalizeBuyer(selectedBuyer);
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

  const calculateTotalQuantity = (data: any[]) =>
    data.reduce((total, row) => total + findQuantityField(row), 0);

  const calculateTotalAmount = (data: any[]) =>
    data.reduce((total, row) => total + findAmountField(row), 0);

  const calculateTotalCommission = (data: any[]) =>
    data.reduce((total, row) => {
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

  useEffect(() => {
    let nextMillers: string[] = [];
    let nextBuyers: string[] = [];

    if (!excelData.length) {
      setMillers([]);
      setFilteredBuyers([]);
      return;
    }

    const allMillers = Array.from(new Set(excelData.map(r => r['MILLER NAME']).filter(Boolean)));
  const allBuyers = Array.from(new Set(excelData.map(r => r['BUYER NAME']).filter(Boolean)));

    if (calculationSide === 'miller') {
      nextMillers = selectedBuyer === 'all'
        ? allMillers
        : Array.from(new Set(excelData.filter(r => r['BUYER NAME'] === selectedBuyer).map(r => r['MILLER NAME']).filter(Boolean)));

      nextBuyers = selectedMiller === 'all'
        ? allBuyers
        : Array.from(new Set(excelData.filter(r => r['MILLER NAME'] === selectedMiller).map(r => r['BUYER NAME']).filter(Boolean)));
    } else if (calculationSide === 'buyer') {
      nextBuyers = selectedMiller === 'all'
        ? allBuyers
        : Array.from(new Set(excelData.filter(r => r['MILLER NAME'] === selectedMiller).map(r => r['BUYER NAME']).filter(Boolean)));

      nextMillers = selectedBuyer === 'all'
        ? allMillers
        : Array.from(new Set(excelData.filter(r => r['BUYER NAME'] === selectedBuyer).map(r => r['MILLER NAME']).filter(Boolean)));
    } else {
      nextMillers = allMillers;
      nextBuyers = allBuyers;
    }

    // If user manually selected a buyer, ensure it stays in the list even if filtering would drop it
    if (buyerManuallyChosen && selectedBuyer !== 'all' && !nextBuyers.includes(selectedBuyer)) {
      nextBuyers = [...nextBuyers, selectedBuyer];
    }

    setMillers(nextMillers);
    setFilteredBuyers(nextBuyers);

    // Correct miller selection
    if (selectedMiller !== 'all' && !nextMillers.includes(selectedMiller)) {
      if (nextMillers.length === 1) {
        setSelectedMiller(nextMillers[0]);
        console.log('[AutoSelect] Single miller after reset:', nextMillers[0]);
      } else {
        setSelectedMiller('all');
      }
    }

    // Buyer auto-selection logic (only when not manually chosen)
    if (!buyerManuallyChosen) {
      if (selectedBuyer === 'all' && nextBuyers.length === 1) {
        setSelectedBuyer(nextBuyers[0]);
        console.log('[AutoSelect] Single buyer (was all):', nextBuyers[0]);
        return;
      }
      if (selectedBuyer !== 'all' && !nextBuyers.includes(selectedBuyer)) {
        if (nextBuyers.length === 1) {
          setSelectedBuyer(nextBuyers[0]);
          console.log('[AutoSelect] Corrected buyer to single option:', nextBuyers[0]);
        } else if (nextBuyers.length > 0) {
          setSelectedBuyer(nextBuyers[0]);
          console.log('[AutoSelect] Defaulted buyer to first option:', nextBuyers[0]);
        } else {
          setSelectedBuyer('all');
        }
      }
    } else {
      // If manually chosen buyer truly disappears from entire dataset, reset.
      const selNorm = normalizeBuyer(selectedBuyer);
      const stillExists = excelData.some(r => normalizeBuyer(r['BUYER NAME']) === selNorm);
      if (!stillExists) {
        console.log('[AutoSelect] Manually selected buyer removed from data, resetting to all');
        setSelectedBuyer('all');
        setBuyerManuallyChosen(false);
      }
    }
  }, [selectedMiller, selectedBuyer, excelData, calculationSide, buyerManuallyChosen]);

  const filteredData = useMemo(() => getFilteredData(), [excelData, selectedMiller, selectedBuyer]);
  useEffect(() => {
    console.log('[FilterDebug] SelectedBuyer:', selectedBuyer, 'SelectedMiller:', selectedMiller, 'Filtered rows:', filteredData.length);
  }, [filteredData, selectedBuyer, selectedMiller]);

  // When buyer changes, auto-select its mapped shop location (if available)
  useEffect(() => {
    const key = selectedBuyer?.trim();
    if (key && key !== 'all') {
      let loc = buyerShopLocMap[key];
      if (!loc) {
        // Case-insensitive fallback
        const foundKey = Object.keys(buyerShopLocMap).find(k => k.toLowerCase() === key.toLowerCase());
        if (foundKey) loc = buyerShopLocMap[foundKey];
      }
      console.log('[Buyer selection effect] buyer:', key, 'resolved location:', loc);
      if (loc && loc !== selectedShopLocation) {
        setSelectedShopLocation(loc);
      }
    }
  }, [selectedBuyer, buyerShopLocMap]);

  // When user manually changes shop location, optionally (future) could filter buyers; placeholder for extensibility.
  const totalQuantity = useMemo(() => calculateTotalQuantity(filteredData), [filteredData]);
  const totalAmount = useMemo(() => calculateTotalAmount(filteredData), [filteredData]);
  const totalCommission = useMemo(() => calculateTotalCommission(filteredData), [filteredData, commissionRate, commissionType, fixedRate]);

  return (
    <main className="container">
      <header className="header">
        <h1>TEJAS CANVASSING</h1>
        <p>Brokerage Commission Calculator</p>
      </header>

      {isClient ? (
        <>
          <div className="card">
            <h2>Import Your Data</h2>
            <ExcelImport
              onDataImport={handleDataImport}
              onMappingExtracted={setBuyerShopLocMap}
            />
            {loading && <div className="loading">Importing data, please wait...</div>}
            <div className="toggle-buttons">
              <button onClick={() => setCalculationSide('miller')} className={calculationSide === 'miller' ? 'active' : ''}>Miller Side</button>
              <button onClick={() => setCalculationSide('buyer')} className={calculationSide === 'buyer' ? 'active' : ''}>Buyer Side</button>
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
                  onBuyerChange={handleBuyerChange}
                  onCommissionRateChange={setCommissionRate}
                  onCommissionTypeChange={setCommissionType}
                  onFixedRateChange={setFixedRate}
                  onBillNumberChange={setUserBillNo}
                  onBillDateChange={setUserBillDate}
                  billNumber={userBillNo}
                  billDate={userBillDate}
                  periodOfBilling={periodOfBilling}
                  onPeriodOfBillingChange={handlePeriodOfBillingChange}
                  shopLocation={selectedShopLocation}
                  onShopLocationChange={setSelectedShopLocation}
                  autoMappedShopLocation={selectedBuyer !== 'all' ? buyerShopLocMap[selectedBuyer.trim()] : undefined}
                />

                <div className="summary">
                  <p><strong>Total Quantity:</strong> {totalQuantity}</p>
                  <p><strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}</p>
                  <p><strong>Total Commission:</strong> ₹{totalCommission.toLocaleString()}</p>
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
                      userBillNo={userBillNo}
                      userBillDate={userBillDate}
                      periodOfBilling={periodOfBilling}
                      onPeriodOfBillingChange={setPeriodOfBilling}
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
                        userBillNo={userBillNo}
                        userBillDate={userBillDate}
                        periodOfBilling={periodOfBilling}
                        selectedShopLoc={selectedShopLocation}
                        onPeriodOfBillingChange={setPeriodOfBilling}                  
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
}
