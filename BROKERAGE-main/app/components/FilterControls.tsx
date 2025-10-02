import React, { useEffect, useState } from 'react';

interface Props {
  millers: string[];
  buyers: string[];
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
}

const FilterControls: React.FC<Props> = ({
  millers,
  buyers,
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
  onShopLocationChange
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
    localStorage.getItem('fromYear') || '2024'
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
  ];

  useEffect(() => {
    const formatted = `${fromMonth} ${fromYear} to ${toMonth} ${toYear}`;
    onPeriodOfBillingChange(formatted);

    localStorage.setItem('fromMonth', fromMonth);
    localStorage.setItem('fromYear', fromYear);
    localStorage.setItem('toMonth', toMonth);
    localStorage.setItem('toYear', toYear);
  }, [fromMonth, fromYear, toMonth, toYear]);

  return (
    <div className="filter-controls">
      <div className="form-row">
        <label>
          Select Miller:
          <select value={selectedMiller} onChange={e => onMillerChange(e.target.value)}>
            <option value="all">All</option>
            {[...millers].sort().map(miller => (
              <option key={miller} value={miller}>{miller}</option>
            ))}
          </select>
        </label>

        <label>
          Select Buyer:
          <select value={selectedBuyer} onChange={e => onBuyerChange(e.target.value)}>
            <option value="all">All</option>
            {[...buyers].sort().map(buyer => (
              <option key={buyer} value={buyer}>{buyer}</option>
            ))}
          </select>
        </label>

        <label>
          SHOP LOC:
          <select value={shopLocation} onChange={e => onShopLocationChange(e.target.value)}>
            <option value="">Select</option>
            {shopLocs.sort().map(loc => (
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
          <input
            type="text"
            value={billNumber}
            onChange={e => onBillNumberChange(e.target.value)}
          />
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
