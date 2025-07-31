import React from 'react';

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
}) => {
  return (
    <div className="filter-controls">
      <div className="form-row">
        <label>
          Select Miller:
          <select value={selectedMiller} onChange={e => onMillerChange(e.target.value)}>
           <option value="all">All</option>
           {[...millers].sort().map(miller => (
           <option key={miller} value={miller}>
             {miller}
           </option>
           ))}
          </select>
        </label>

        <label>
          Select Buyer:
          <select value={selectedBuyer} onChange={e => onBuyerChange(e.target.value)}>
            <option value="all">All</option>
            {[...buyers].sort().map(buyer => (
            <option key={buyer} value={buyer}>
              {buyer}
            </option>
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
