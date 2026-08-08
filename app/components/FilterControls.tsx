import React, { useEffect, useRef, useState } from 'react';

interface Props {
  millers: string[];
  buyers: string[];
  places?: string[];
  selectedMiller: string;
  selectedBuyer: string;
  commissionRate: number;
  commissionType: 'fixed' | 'percentage';
  fixedRate: number;
  billNumber: string;
  billDate: string;
  onMillerChange: (value: string) => void;
  onBuyerChange: (value: string) => void;
  onCommissionRateChange: (value: number) => void;
  onCommissionTypeChange: (value: 'fixed' | 'percentage') => void;
  onFixedRateChange: (value: number) => void;
  onBillNumberChange: (value: string) => void;
  onBillDateChange: (value: string) => void;
  periodOfBilling: string;
  onPeriodOfBillingChange: (value: string) => void;
  shopLocation: string;
  onShopLocationChange: (value: string) => void;
  autoMappedShopLocation?: string;
  onDateRangeChange?: (from: Date, to: Date) => void;
}

const FilterControls: React.FC<Props> = ({
  millers,
  buyers,
  places = [],
  selectedMiller,
  selectedBuyer,
  commissionRate,
  commissionType,
  fixedRate,
  billNumber,
  billDate,
  onMillerChange,
  onBuyerChange,
  onCommissionRateChange,
  onCommissionTypeChange,
  onFixedRateChange,
  onBillNumberChange,
  onBillDateChange,
  periodOfBilling,
  onPeriodOfBillingChange,
  shopLocation,
  onShopLocationChange,
  autoMappedShopLocation,
  onDateRangeChange,
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getYears = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const currentYear = new Date().getFullYear();
  const years = getYears(2020, currentYear + 5);

  const [fromMonth, setFromMonth] = useState<string>(() =>
    localStorage.getItem('fromMonth') || 'June'
  );
  const [fromYear, setFromYear] = useState<string>(() =>
    localStorage.getItem('fromYear') || '2025'
  );
  const [toMonth, setToMonth] = useState<string>(() =>
    localStorage.getItem('toMonth') || 'July'
  );
  const [toYear, setToYear] = useState<string>(() =>
    localStorage.getItem('toYear') || '2025'
  );

  const shopLocs = [
'MGB',
'6TH',
'4TH',
'5TH',
'BHADRA',
'KAVERI',
'NAGAWARA',
'CKM',
'NT PET',
'KR PURM',
'BDA',
'MALUR',
'DASANPURA',
'MYSORE',
'VELLORE',
'HOSUR',
'MADANPALLI',
'CHINTAMANI',
'GADCHIROLLI',
'CHANNAPATNA',
'WHITEFIELD',
'BTM LYT',
'MUNIREDDYPALAYA',
'SHIVAMOGA',
'SALEM',
'TUMKUR',
'PALAMANER',
'YPR',
'DODDABALAPUR',
'NELMANGALA',
'MAKALI',
'DHARAMAPURI',
'SUBRAMANYA NAGAR',
'KANAKAPURA',
'CHIKMANGALORE',
'VARTHURU',
'5TH MAIN ROAD',
'SARJAPUR',
'TRICHY',
'PALACODE',
'ARSIKERE',
'HOSADURGA',
'GUDDIYATTAM',
'MUL',
'ULLAL',
'CHANNARAYAPATANA',
'MG COMPLEX',
'MUNIREEDY PALYA',
'DASANAPURA',
'HOSAKOTTE',
'TANJORE'
  ];

  const combinedPlaces = Array.from(new Set([...places, ...shopLocs])).filter(Boolean).sort();

  const monthIndex = (name: string) => [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ].indexOf(name);

  const isMounted = useRef(false);

  useEffect(() => {
    const formatted = `${fromMonth} ${fromYear} to ${toMonth} ${toYear}`;
    onPeriodOfBillingChange(formatted);

    localStorage.setItem('fromMonth', fromMonth);
    localStorage.setItem('fromYear', fromYear);
    localStorage.setItem('toMonth', toMonth);
    localStorage.setItem('toYear', toYear);

    // Only fire date filter AFTER first render (i.e. when user actually changes date selectors)
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const from = new Date(parseInt(fromYear), monthIndex(fromMonth), 1);
    const toDate = new Date(parseInt(toYear), monthIndex(toMonth) + 1, 0, 23, 59, 59);
    onDateRangeChange?.(from, toDate);
  }, [fromMonth, fromYear, toMonth, toYear]);

  return (
    <div className="filter-controls">
      <div className="form-row">
        <label>
          Select Miller:
          <select value={selectedMiller} onChange={e => onMillerChange(e.target.value)}>
            <option value="all">All Millers</option>
            {[...millers].sort().map(miller => (
              <option key={miller} value={miller}>{miller}</option>
            ))}
          </select>
        </label>

        <label>
          Select Buyer:
          <select value={selectedBuyer} onChange={e => onBuyerChange(e.target.value.trim())}>
            <option value="all">All Buyers</option>
            {[...buyers].sort().map(buyer => (
              <option key={buyer} value={buyer}>{buyer}</option>
            ))}
          </select>
        </label>

        <label>
          Filter by Place:
          <select value={shopLocation} onChange={e => onShopLocationChange(e.target.value)}>
            <option value="all">All Places</option>
            {combinedPlaces.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </label>

        <label>
          Commission Type:
          <select
            value={commissionType}
            onChange={e => onCommissionTypeChange(e.target.value as 'fixed' | 'percentage')}
          >
            <option value="fixed">Fixed Rate</option>
            <option value="percentage">Percentage</option>
          </select>
        </label>

        {commissionType === 'fixed' ? (
          <label>
            Fixed Rate:
            <input
              type="number"
              value={fixedRate}
              onChange={e => onFixedRateChange(parseFloat(e.target.value))}
            />
          </label>
        ) : (
          <label>
            Commission Rate:
            <input
              type="number"
              value={commissionRate}
              onChange={e => onCommissionRateChange(parseFloat(e.target.value))}
              step="0.01"
            />
          </label>
        )}

        <label>
          Period From:
          <select value={fromMonth} onChange={e => setFromMonth(e.target.value)}>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select value={fromYear} onChange={e => setFromYear(e.target.value)}>
            {years.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </label>

        <label>
          To:
          <select value={toMonth} onChange={e => setToMonth(e.target.value)}>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select value={toYear} onChange={e => setToYear(e.target.value)}>
            {years.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </label>

        <label>
          Bill No:
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={() => {
                if (!billNumber || billNumber.trim() === '') {
                  onBillNumberChange('0');
                  return;
                }
                const match = billNumber.match(/^(.*?)(\d+)$/);
                if (match) {
                  const prefix = match[1];
                  const numStr = match[2];
                  const num = parseInt(numStr, 10);
                  const nextNum = Math.max(0, num - 1);
                  const paddedNext = String(nextNum).padStart(numStr.length, '0');
                  onBillNumberChange(`${prefix}${paddedNext}`);
                } else {
                  const num = parseInt(billNumber, 10);
                  onBillNumberChange(isNaN(num) ? '0' : String(Math.max(0, num - 1)));
                }
              }}
              style={{
                width: '28px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Decrease bill number"
            >
              -
            </button>
            <input
              type="text"
              value={billNumber}
              onChange={e => onBillNumberChange(e.target.value)}
              style={{ width: '80px', textAlign: 'center', fontWeight: 700 }}
              placeholder="1"
            />
            <button
              type="button"
              onClick={() => {
                if (!billNumber || billNumber.trim() === '') {
                  onBillNumberChange('1');
                  return;
                }
                const match = billNumber.match(/^(.*?)(\d+)$/);
                if (match) {
                  const prefix = match[1];
                  const numStr = match[2];
                  const num = parseInt(numStr, 10);
                  const nextNum = num + 1;
                  const paddedNext = String(nextNum).padStart(numStr.length, '0');
                  onBillNumberChange(`${prefix}${paddedNext}`);
                } else {
                  const num = parseInt(billNumber, 10);
                  onBillNumberChange(isNaN(num) ? '1' : String(num + 1));
                }
              }}
              style={{
                width: '28px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Increase bill number"
            >
              +
            </button>
          </div>
        </label>

        <label>
          Bill Date:
          <input
            type="date"
            value={billDate}
            onChange={e => onBillDateChange(e.target.value)}
          />
        </label>

      </div>
    </div>
  );
};

export default FilterControls;
