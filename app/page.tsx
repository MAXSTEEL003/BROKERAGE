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
  const [fixedRate, setFixedRate] = useState(11);
  const [calculationSide, setCalculationSide] = useState<'miller' | 'buyer'>('buyer');
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
  // Company name — editable, persisted to localStorage
  const [companyName, setCompanyName] = useState('Thejas Canvasing');

  // Bank details — editable, persisted to localStorage
  const [bankDetails, setBankDetails] = useState({
    accName: 'THEJAS CANVASING',
    accNo: '50200113540016',
    bankName: 'HDFC Bank',
    ifsc: 'HDFC0001047',
    upi: '9916416995',
  });

  // Additional company details for PDF header: phone, PAN, GST
  const [companyPhone, setCompanyPhone] = useState('9916416995');
  const [companyPAN, setCompanyPAN] = useState('AEBPA6445G');
  const [companyGST, setCompanyGST] = useState('29AEBPA6445G2Z0');

  // Date range filter — driven by FilterControls month/year selects
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const handleDateRangeChange = (from: Date, to: Date) => {
    setFromDate(from);
    setToDate(to);
  };

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
    const storedName = localStorage.getItem('companyName');
    if (storedName) setCompanyName(storedName);
    const storedBank = localStorage.getItem('bankDetails');
    if (storedBank) {
      try { setBankDetails(JSON.parse(storedBank)); } catch { }
    }
    const storedPhone = localStorage.getItem('companyPhone');
    if (storedPhone) setCompanyPhone(storedPhone);
    const storedPAN = localStorage.getItem('companyPAN');
    if (storedPAN) setCompanyPAN(storedPAN);
    const storedGST = localStorage.getItem('companyGST');
    if (storedGST) setCompanyGST(storedGST);
  }, []);

  useEffect(() => {
    if (isClient) localStorage.setItem('companyName', companyName);
  }, [companyName, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem('bankDetails', JSON.stringify(bankDetails));
  }, [bankDetails, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem('companyPhone', companyPhone);
  }, [companyPhone, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem('companyPAN', companyPAN);
  }, [companyPAN, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem('companyGST', companyGST);
  }, [companyGST, isClient]);

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
      // If only one buyer present, optionally auto-select (left commented)
      // if (uniqueBuyers.length === 1) setSelectedBuyer(uniqueBuyers[0]);
      setExcelData(normalized);

      const uniqueMillers = Array.from(new Set(normalized.map(row => row['MILLER NAME'] || ''))).filter(Boolean);
      const uniqueBuyers = Array.from(
        new Set(
          normalized
            .map(row => (row['BUYER NAME'] || '').toString().replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim())
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

      // Date range filter
      let dateMatch = true;
      if (fromDate || toDate) {
        const rawDate = row['DATE'] || row['Date'];
        let rowDate: Date | null = null;
        if (typeof rawDate === 'number') {
          rowDate = new Date(new Date(1899, 11, 30).getTime() + rawDate * 86400000);
        } else if (rawDate) {
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) rowDate = parsed;
        }
        if (rowDate) {
          if (fromDate && rowDate < fromDate) dateMatch = false;
          if (toDate && rowDate > toDate) dateMatch = false;
        }
      }

      return millerMatch && buyerMatch && dateMatch;
    });
  };

  // All buyers (miller+date filtered, NO buyer filter) — used by the Generate All Buyer PDFs panel
  const getAllBuyerData = () => {
    return excelData.filter(row => {
      const millerMatch = selectedMiller === 'all' || row['MILLER NAME'] === selectedMiller;
      let dateMatch = true;
      if (fromDate || toDate) {
        const rawDate = row['DATE'] || row['Date'];
        let rowDate: Date | null = null;
        if (typeof rawDate === 'number') {
          rowDate = new Date(new Date(1899, 11, 30).getTime() + rawDate * 86400000);
        } else if (rawDate) {
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) rowDate = parsed;
        }
        if (rowDate) {
          if (fromDate && rowDate < fromDate) dateMatch = false;
          if (toDate && rowDate > toDate) dateMatch = false;
        }
      }
      return millerMatch && dateMatch;
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
      } else {
        setSelectedMiller('all');
      }
    }

    // Buyer auto-selection logic (only when not manually chosen)
    if (!buyerManuallyChosen) {
      if (selectedBuyer === 'all' && nextBuyers.length === 1) {
        setSelectedBuyer(nextBuyers[0]);
        return;
      }
      if (selectedBuyer !== 'all' && !nextBuyers.includes(selectedBuyer)) {
        if (nextBuyers.length === 1) {
          setSelectedBuyer(nextBuyers[0]);
        } else if (nextBuyers.length > 0) {
          setSelectedBuyer(nextBuyers[0]);
        } else {
          setSelectedBuyer('all');
        }
      }
    } else {
      // If manually chosen buyer truly disappears from entire dataset, reset.
      const selNorm = normalizeBuyer(selectedBuyer);
      const stillExists = excelData.some(r => normalizeBuyer(r['BUYER NAME']) === selNorm);
      if (!stillExists) {
        setSelectedBuyer('all');
        setBuyerManuallyChosen(false);
      }
    }
  }, [selectedMiller, selectedBuyer, excelData, calculationSide, buyerManuallyChosen]);

  const filteredData = useMemo(() => getFilteredData(), [excelData, selectedMiller, selectedBuyer, fromDate, toDate]);

  // Pre-built buyer list for the Generate All panel — miller+date filtered (same period as the preview)
  const buyerListForPanel = useMemo(() => {
    const source = getAllBuyerData();
    const grouped: Record<string, any[]> = {};
    source.forEach(row => {
      const buyer = (row['BUYER NAME'] || row['BUYER'] || '').toString().trim();
      if (!buyer) return;
      if (!grouped[buyer]) grouped[buyer] = [];
      grouped[buyer].push(row);
    });
    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map((buyer, idx) => ({ buyer, billNo: idx + 1, rows: grouped[buyer] }));
  }, [excelData, selectedMiller, fromDate, toDate]);

  // Pre-built miller list for the Generate All Miller PDFs panel
  const millerListForPanel = useMemo(() => {
    const source = getAllBuyerData(); // same filter: miller+date, no buyer filter
    const grouped: Record<string, any[]> = {};
    source.forEach(row => {
      const miller = (row['MILLER NAME'] || '').toString().trim();
      if (!miller) return;
      if (!grouped[miller]) grouped[miller] = [];
      grouped[miller].push(row);
    });
    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map((miller, idx) => ({ miller, billNo: idx + 1, rows: grouped[miller] }));
  }, [excelData, selectedMiller, fromDate, toDate]);
  useEffect(() => {
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
                  onDateRangeChange={handleDateRangeChange}
                />

                <div className="summary">
                  <p><strong>Total Quantity:</strong> {totalQuantity}</p>
                  <p><strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}</p>
                  <p><strong>Total Commission:</strong> ₹{totalCommission.toLocaleString()}</p>
                </div>

                {/* ── PDF Settings (company name + bank details) ── */}
                <div className="pdf-settings">
                  <p className="pdf-settings__title">PDF Settings</p>

                  {/* Company name */}
                  <div className="pdf-settings__row">
                    <label htmlFor="companyNameInput" className="pdf-settings__label">Company Name</label>
                    <input
                      id="companyNameInput"
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="pdf-settings__input"
                    />
                  </div>

                  {/* Bank details */}
                  <p className="pdf-settings__subtitle">Bank Details</p>
                  <div className="pdf-settings__bank-grid">
                    {(['accName', 'accNo', 'bankName', 'ifsc', 'upi'] as const).map(field => (
                      <div key={field} className="pdf-settings__bank-field">
                        <label className="pdf-settings__bank-label">
                          {field === 'accName' ? 'Acc Name' : field === 'accNo' ? 'A/C No' : field === 'bankName' ? 'Bank' : field === 'ifsc' ? 'IFSC' : 'UPI'}
                        </label>
                        <input
                          type="text"
                          value={bankDetails[field]}
                          onChange={e => setBankDetails(prev => ({ ...prev, [field]: e.target.value }))}
                          className="pdf-settings__input"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Additional company details: Phone / PAN / GST */}
                  <p className="pdf-settings__subtitle">Company Details (for PDF header)</p>
                  <div className="pdf-settings__bank-grid">
                    <div className="pdf-settings__bank-field">
                      <label className="pdf-settings__bank-label">Phone</label>
                      <input
                        type="text"
                        value={companyPhone}
                        onChange={e => setCompanyPhone(e.target.value)}
                        className="pdf-settings__input"
                      />
                    </div>
                    <div className="pdf-settings__bank-field">
                      <label className="pdf-settings__bank-label">PAN No</label>
                      <input
                        type="text"
                        value={companyPAN}
                        onChange={e => setCompanyPAN(e.target.value)}
                        className="pdf-settings__input"
                      />
                    </div>
                    <div className="pdf-settings__bank-field">
                      <label className="pdf-settings__bank-label">GST No</label>
                      <input
                        type="text"
                        value={companyGST}
                        onChange={e => setCompanyGST(e.target.value)}
                        className="pdf-settings__input"
                      />
                    </div>
                  </div>
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
                      companyName={companyName}
                      bankDetails={bankDetails}
                      companyPhone={companyPhone}
                      companyPAN={companyPAN}
                      companyGST={companyGST}
                      millerListForPanel={millerListForPanel}
                      userBillNo={userBillNo}
                      userBillDate={userBillDate}
                      periodOfBilling={periodOfBilling}
                      onPeriodOfBillingChange={setPeriodOfBilling}
                    />
                  ) : (
                    <DataPreviewBuyerSide
                      data={filteredData}
                      buyerListForPanel={buyerListForPanel}
                      commissionRate={commissionRate}
                      commissionType={commissionType}
                      fixedRate={fixedRate}
                      totalTransactions={filteredData.length}
                      totalQuantity={totalQuantity}
                      totalAmount={totalAmount}
                      totalCommission={totalCommission}
                      selectedMiller={selectedMiller}
                      selectedBuyer={selectedBuyer}
                      companyName={companyName}
                      bankDetails={bankDetails}
                      companyPhone={companyPhone}
                      companyPAN={companyPAN}
                      companyGST={companyGST}
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

