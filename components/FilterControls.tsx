'use client';

interface Props {
  millers: string[];
  buyers: string[];
  selectedMiller: string;
  selectedBuyer: string;
  commissionRate: number;
  commissionType: 'percentage' | 'fixed';
  fixedRate: number;
  onMillerChange: (value: string) => void;
  onBuyerChange: (value: string) => void;
  onCommissionRateChange: (value: number) => void;
  onCommissionTypeChange: (value: 'percentage' | 'fixed') => void;
  onFixedRateChange: (value: number) => void;
}

const FilterControls: React.FC<Props> = ({
  millers, buyers,
  selectedMiller, selectedBuyer,
  commissionRate, commissionType, fixedRate,
  onMillerChange, onBuyerChange,
  onCommissionRateChange, onCommissionTypeChange, onFixedRateChange,
}) => (
  <div className="filter-controls">
    <label>
      Miller:
      <select value={selectedMiller} onChange={e => onMillerChange(e.target.value)}>
        <option value="all">All</option>
        {millers.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </label>
    <label>
      Buyer:
      <select value={selectedBuyer} onChange={e => onBuyerChange(e.target.value)}>
        <option value="all">All</option>
        {buyers.map(b => <option key={b} value={b}>{b}</option>)}
      </select>
    </label>
    <label>
      Commission Type:
      <select value={commissionType} onChange={e => onCommissionTypeChange(e.target.value as any)}>
        <option value="percentage">Percentage (%)</option>
        <option value="fixed">Fixed per unit</option>
      </select>
    </label>
    {commissionType === 'percentage' ? (
      <label>
        Rate (%):
        <input
          type="number"
          value={commissionRate * 100}
          onChange={e => onCommissionRateChange(Number(e.target.value) / 100)}
        />
      </label>
    ) : (
      <label>
        Fixed Rate:
        <input
          type="number"
          value={fixedRate}
          onChange={e => onFixedRateChange(Number(e.target.value))}
        />
      </label>
    )}
  </div>
);

export default FilterControls;
