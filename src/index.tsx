'use client'

import { useState, useEffect } from 'react'
import { isBrowser } from './utils/browserCheck'
import ExcelImport from '../app/components/ExcelImport'
import DataPreview from '../app/components/DataPreview'
import FilterControls from '../app/components/FilterControls'
import '../app/styles/calculator.css'

export default function Home() {
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [selectedMiller, setSelectedMiller] = useState<string>('all')
  const [selectedBuyer, setSelectedBuyer] = useState<string>('all')
  const [commissionRate, setCommissionRate] = useState<number>(0.01) // 1% default
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage')
  const [fixedRate, setFixedRate] = useState<number>(10) // Default fixed rate
  const [uniqueMillers, setUniqueMillers] = useState<string[]>(['all'])
  const [uniqueBuyers, setUniqueBuyers] = useState<string[]>(['all'])
  const [filteredBuyers, setFilteredBuyers] = useState<string[]>(['all'])
  const [calculationPerformed, setCalculationPerformed] = useState<boolean>(false)
  const [totalCommission, setTotalCommission] = useState<number>(0)
  const [totalQuantity, setTotalQuantity] = useState<number>(0)
  const [totalAmount, setTotalAmount] = useState<number>(0)

  // Extract unique millers and buyers when data changes
  useEffect(() => {
    if (data.length > 0) {
      // Extract unique miller names
      const millers = ['all', ...new Set(data.map(row => row['MILLER NAME']))].filter(Boolean)
      setUniqueMillers(millers)
      
      // Extract unique buyer names
      const buyers = ['all', ...new Set(data.map(row => row['BUYER NAMER']))].filter(Boolean)
      setUniqueBuyers(buyers)
      setFilteredBuyers(buyers)
    }
  }, [data])

  // Update filtered buyers when selected miller changes
  useEffect(() => {
    if (selectedMiller === 'all') {
      setFilteredBuyers(uniqueBuyers)
    } else {
      // Filter buyers that have transactions with the selected miller
      const relatedBuyers = ['all']
      data.forEach(row => {
        if (row['MILLER NAME'] === selectedMiller && !relatedBuyers.includes(row['BUYER NAMER'])) {
          relatedBuyers.push(row['BUYER NAMER'])
        }
      })
      setFilteredBuyers(relatedBuyers)
      
      // Reset selected buyer if it's not in the filtered list
      if (selectedBuyer !== 'all' && !relatedBuyers.includes(selectedBuyer)) {
        setSelectedBuyer('all')
      }
    }
  }, [selectedMiller, data, uniqueBuyers])

  const handleDataLoaded = (newData: any[], newColumns: string[], newSheetNames: string[]) => {
    setData(newData)
    setColumns(newColumns)
    setSheetNames(newSheetNames)
    setCalculationPerformed(false)
  }

  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheet(sheetName)
  }

  const handleMillerChange = (miller: string) => {
    setSelectedMiller(miller)
    setCalculationPerformed(false)
  }

  const handleBuyerChange = (buyer: string) => {
    setSelectedBuyer(buyer)
    setCalculationPerformed(false)
  }

  const handleCommissionTypeChange = (type: 'percentage' | 'fixed') => {
    setCommissionType(type)
    setCalculationPerformed(false)
  }

  const handleCommissionRateChange = (rate: number) => {
    setCommissionRate(rate)
    setCalculationPerformed(false)
  }

  const handleFixedRateChange = (rate: number) => {
    setFixedRate(rate)
    setCalculationPerformed(false)
  }

  const handleCalculate = () => {
    // Filter data based on selected miller and buyer
    const filteredData = data.filter(row => 
      (selectedMiller === 'all' || row['MILLER NAME'] === selectedMiller) && 
      (selectedBuyer === 'all' || row['BUYER NAMER'] === selectedBuyer)
    )
    
    // Calculate totals
    let commission = 0
    let quantity = 0
    let amount = 0
    
    filteredData.forEach(row => {
      const qty = parseFloat(row['qtls']) || 0
      const rowAmount = parseFloat(row['Amount']) || 0
      
      // Determine commission rate for this row
      let rowCommissionRate = commissionRate
      if (row['MILLER NAME'] === 'NIDHI AGROS') {
        rowCommissionRate = 0.01 // 1% for Nidhi Agros
      }
      
      // Calculate commission based on type
      if (commissionType === 'percentage') {
        commission += rowAmount * rowCommissionRate
        amount += rowAmount
      } else {
        commission += qty * fixedRate
      }
      
      quantity += qty
    })
    
    setTotalCommission(commission)
    setTotalQuantity(quantity)
    setTotalAmount(amount)
    setCalculationPerformed(true)
  }

  return (
    <main className="main-container">
      <header className="header">
        <h1>TEJAS CANVASSING BROKERAGE CALCULATOR</h1>
        <p className="subtitle">Enterprise solution for miller-buyer transaction analysis</p>
      </header>
      
      <div className="content-container">
        <ExcelImport 
          onDataLoaded={handleDataLoaded}
          onSheetSelect={handleSheetSelect}
        />
        
        {data.length > 0 && (
          <>
            <div className="grid-layout">
              <div>
                <FilterControls
                  uniqueMillers={uniqueMillers}
                  filteredBuyers={filteredBuyers}
                  selectedMiller={selectedMiller}
                  selectedBuyer={selectedBuyer}
                  commissionType={commissionType}
                  commissionRate={commissionRate}
                  fixedRate={fixedRate}
                  onMillerChange={handleMillerChange}
                  onBuyerChange={handleBuyerChange}
                  onCommissionTypeChange={handleCommissionTypeChange}
                  onCommissionRateChange={handleCommissionRateChange}
                  onFixedRateChange={handleFixedRateChange}
                  onCalculate={handleCalculate}
                />
                
                {calculationPerformed && (
                  <div className="results-card">
                    <h2>Calculation Results</h2>
                    <div className="result-item">
                      <span className="result-label">Total Commission:</span>
                      <span className="result-value">₹{totalCommission.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="result-details">
                      <div className="result-detail-item">
                        <span className="detail-label">Total Quantity:</span>
                        <span className="detail-value">{totalQuantity.toLocaleString('en-IN', { maximumFractionDigits: 2 })} qtls</span>
                      </div>
                      
                      {commissionType === 'percentage' && (
                        <div className="result-detail-item">
                          <span className="detail-label">Total Amount:</span>
                          <span className="detail-value">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="data-preview-container">
                <DataPreview 
                  data={data}
                  selectedMiller={selectedMiller}
                  selectedBuyer={selectedBuyer}
                  commissionRate={commissionRate}
                  commissionType={commissionType}
                  fixedRate={fixedRate}
                />
              </div>
            </div>
          </>
        )}
      </div>
      
      <footer className="footer">
        <p>© {new Date().getFullYear()} TEJAS CANVASSING. All rights reserved.</p>
      </footer>
    </main>
  )
}
