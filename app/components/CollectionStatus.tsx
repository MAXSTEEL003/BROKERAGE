import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { 
  isFirebaseConfigured, 
  subscribeToCollectionEntries, 
  saveCollectionEntriesToFirestore, 
  saveBuyerEntryToFirestore 
} from '../lib/firebase';

interface BankDetails {
  accName: string;
  accNo: string;
  bankName: string;
  ifsc: string;
  upi: string;
}

interface Props {
  data: any[];
  commissionType: 'fixed' | 'percentage';
  commissionRate: number;
  fixedRate: number;
  periodOfBilling: string;
  companyName: string;
  bankDetails?: BankDetails;
  companyPhone?: string;
  companyPAN?: string;
  companyGST?: string;
  places?: string[];
  showGstInPdf?: boolean;
}

const DEFAULT_BANK: BankDetails = {
  accName: 'THEJAS CANVASING',
  accNo: '50200113540016',
  bankName: 'HDFC Bank',
  ifsc: 'HDFC0001047',
  upi: '9916416995',
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

const parseRowDate = (val: any): Date | null => {
  if (typeof val === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + val * 86400000);
  }
  if (!val) return null;
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) return parsed;
  return null;
};

const getRowMonthYear = (row: any): string => {
  const rawDate = row['DATE'] || row['Date'] || row.date;
  const d = parseRowDate(rawDate);
  if (d) {
    return format(d, 'MMM yyyy'); // e.g. "Apr 2025"
  }
  return 'Unknown Month';
};

export const CollectionStatus: React.FC<Props> = ({
  data,
  commissionType,
  commissionRate,
  fixedRate,
  periodOfBilling,
  companyName = 'Tejas Canvassing',
  bankDetails,
  companyPhone,
  companyPAN,
  companyGST,
  places = [],
  showGstInPdf = true,
}) => {
  // Local state persisted in localStorage
  const [paymentStatusMap, setPaymentStatusMap] = useState<Record<string, 'Received' | 'Not Received'>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('collection_paymentStatusMap');
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return {};
  });

  const [customBillNosMap, setCustomBillNosMap] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('collection_customBillNosMap');
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return {};
  });

  const [remarksMap, setRemarksMap] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('collection_remarksMap');
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return {};
  });

  const [receivedAmountMap, setReceivedAmountMap] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('collection_receivedAmountMap');
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return {};
  });

  const [paymentModeMap, setPaymentModeMap] = useState<Record<string, 'CHQEE' | 'CASH'>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('collection_paymentModeMap');
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return {};
  });

  const [paidTillMonthMap, setPaidTillMonthMap] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('collection_paidTillMonthMap');
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return {};
  });

  // Helper methods to safely read from localStorage
  const getStoredJSON = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const getStoredString = (key: string, defaultValue: string): string => {
    if (typeof window === 'undefined') return defaultValue;
    return localStorage.getItem(key) ?? defaultValue;
  };

  const getStoredBool = (key: string, defaultValue: boolean): boolean => {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    return item !== null ? item === 'true' : defaultValue;
  };

  // Filter controls with localStorage persistence
  const [selectedMonths, setSelectedMonths] = useState<string[]>(() => getStoredJSON('collection_selectedMonths', ['all']));
  const [gstViewFilter, setGstViewFilter] = useState<'All' | 'With GST' | 'Without GST'>(() => getStoredString('collection_gstViewFilter', 'All') as any);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'All' | 'Not Received' | 'Received' | 'Partial'>(() => getStoredString('collection_filterPaymentStatus', 'All') as any);
  const [unpaidPaidTillFilter, setUnpaidPaidTillFilter] = useState<string>(() => getStoredString('collection_unpaidPaidTillFilter', 'all'));
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>(() => getStoredJSON('collection_selectedPlaces', ['all']));
  const [buyerSearch, setBuyerSearch] = useState<string>(() => getStoredString('collection_buyerSearch', ''));

  // PDF Generation Modal State with localStorage persistence
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfSelectedPlaces, setPdfSelectedPlaces] = useState<string[]>(['all']);
  const [pdfPlaceSearch, setPdfPlaceSearch] = useState<string>('');
  const [pdfPaymentFilter, setPdfPaymentFilter] = useState<'All' | 'Not Received' | 'Received' | 'Partial'>(() => getStoredString('collection_pdfPaymentFilter', 'All') as any);
  const [pdfMonthFilter, setPdfMonthFilter] = useState<string>(() => getStoredString('collection_pdfMonthFilter', 'all'));
  const [pdfGstFilter, setPdfGstFilter] = useState<'All' | 'With GST' | 'Without GST'>(() => getStoredString('collection_pdfGstFilter', 'All') as any);
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>(() => getStoredString('collection_pdfOrientation', 'portrait') as any);

  const [pdfIncludeCommCol, setPdfIncludeCommCol] = useState(() => getStoredBool('collection_pdfIncludeCommCol', true));
  const [pdfIncludeGstCol, setPdfIncludeGstCol] = useState(() => getStoredBool('collection_pdfIncludeGstCol', true));
  const [pdfIncludeReceivedCol, setPdfIncludeReceivedCol] = useState(() => getStoredBool('collection_pdfIncludeReceivedCol', true));
  const [pdfIncludeBalanceCol, setPdfIncludeBalanceCol] = useState(() => getStoredBool('collection_pdfIncludeBalanceCol', true));
  const [pdfIncludePaidTillCol, setPdfIncludePaidTillCol] = useState(() => getStoredBool('collection_pdfIncludePaidTillCol', true));
  const [pdfIncludeBillNosCol, setPdfIncludeBillNosCol] = useState(() => getStoredBool('collection_pdfIncludeBillNosCol', true));
  const [pdfIncludeStatusCol, setPdfIncludeStatusCol] = useState(() => getStoredBool('collection_pdfIncludeStatusCol', true));
  const [pdfIncludeRemarksCol, setPdfIncludeRemarksCol] = useState(() => getStoredBool('collection_pdfIncludeRemarksCol', true));
  const [pdfIncludeQRCode, setPdfIncludeQRCode] = useState(() => getStoredBool('collection_pdfIncludeQRCode', true));

  // Persist state updates to localStorage
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_paymentStatusMap', JSON.stringify(paymentStatusMap)); }, [paymentStatusMap]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_customBillNosMap', JSON.stringify(customBillNosMap)); }, [customBillNosMap]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_remarksMap', JSON.stringify(remarksMap)); }, [remarksMap]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_receivedAmountMap', JSON.stringify(receivedAmountMap)); }, [receivedAmountMap]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_paymentModeMap', JSON.stringify(paymentModeMap)); }, [paymentModeMap]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_paidTillMonthMap', JSON.stringify(paidTillMonthMap)); }, [paidTillMonthMap]);

  // Firebase Cloud Synchronization State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'local_only' | 'error'>('local_only');
  const [syncErrorMessage, setSyncErrorMessage] = useState<string>('');

  const showSyncErrorHelp = () => {
    alert(
      `⚠️ Firebase Cloud Sync Error:\n${syncErrorMessage || 'Permission denied or Database not created.'}\n\n` +
      `Fix in 2 Steps:\n` +
      `1. Go to Firebase Console -> Firestore Database:\n   https://console.firebase.google.com/u/0/project/brokerage-8a128/firestore\n   Click "Create database" if it is not enabled yet.\n\n` +
      `2. In the Rules tab, paste:\n` +
      `   rules_version = '2';\n` +
      `   service cloud.firestore {\n` +
      `     match /databases/{database}/documents {\n` +
      `       match /collections/{docId} {\n` +
      `         allow read, write: if true;\n` +
      `       }\n` +
      `     }\n` +
      `   }\n` +
      `   and click "Publish".`
    );
  };

  const isRemoteUpdateRef = useRef(false);
  const lastSavedPayloadRef = useRef<string>('');

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setSyncStatus('local_only');
      return;
    }

    setSyncStatus('syncing');
    const unsubscribe = subscribeToCollectionEntries(
      (data) => {
        isRemoteUpdateRef.current = true;
        
        if (data.paymentStatusMap) {
          setPaymentStatusMap(prev => {
            const merged = { ...prev, ...data.paymentStatusMap };
            return JSON.stringify(prev) === JSON.stringify(merged) ? prev : merged;
          });
        }
        if (data.customBillNosMap) {
          setCustomBillNosMap(prev => {
            const merged = { ...prev, ...data.customBillNosMap };
            return JSON.stringify(prev) === JSON.stringify(merged) ? prev : merged;
          });
        }
        if (data.remarksMap) {
          setRemarksMap(prev => {
            const merged = { ...prev, ...data.remarksMap };
            return JSON.stringify(prev) === JSON.stringify(merged) ? prev : merged;
          });
        }
        if (data.receivedAmountMap) {
          setReceivedAmountMap(prev => {
            const merged = { ...prev, ...data.receivedAmountMap };
            return JSON.stringify(prev) === JSON.stringify(merged) ? prev : merged;
          });
        }
        if (data.paymentModeMap) {
          setPaymentModeMap(prev => {
            const merged = { ...prev, ...data.paymentModeMap };
            return JSON.stringify(prev) === JSON.stringify(merged) ? prev : merged;
          });
        }
        if (data.paidTillMonthMap) {
          setPaidTillMonthMap(prev => {
            const merged = { ...prev, ...data.paidTillMonthMap };
            return JSON.stringify(prev) === JSON.stringify(merged) ? prev : merged;
          });
        }
        setSyncStatus('synced');
        setSyncErrorMessage('');
      },
      (err) => {
        console.error('Firebase sync error:', err);
        setSyncStatus('error');
        setSyncErrorMessage(err?.message || 'Firestore Database not created or rules missing');
      }
    );

    return () => unsubscribe();
  }, []);

  // ⚡ AUTOMATIC REAL-TIME CLOUD AUTO-SYNC (Debounced Background Save)
  const isInitialSyncMount = useRef(true);

  useEffect(() => {
    if (isInitialSyncMount.current) {
      isInitialSyncMount.current = false;
      return;
    }

    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    if (!isFirebaseConfigured()) return;

    const currentPayloadStr = JSON.stringify({
      paymentStatusMap,
      customBillNosMap,
      remarksMap,
      receivedAmountMap,
      paymentModeMap,
      paidTillMonthMap,
    });

    if (lastSavedPayloadRef.current === currentPayloadStr) {
      return;
    }

    const timer = setTimeout(async () => {
      lastSavedPayloadRef.current = currentPayloadStr;
      const success = await saveCollectionEntriesToFirestore({
        paymentStatusMap,
        customBillNosMap,
        remarksMap,
        receivedAmountMap,
        paymentModeMap,
        paidTillMonthMap,
      });
      if (success) {
        setSyncStatus('synced');
        setSyncErrorMessage('');
      } else {
        setSyncStatus('error');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [paymentStatusMap, customBillNosMap, remarksMap, receivedAmountMap, paymentModeMap, paidTillMonthMap]);

  const handleSyncAllToFirestore = async () => {
    if (!isFirebaseConfigured()) {
      alert('Firebase credentials not set in .env.local. Add NEXT_PUBLIC_FIREBASE_* variables to enable Cloud Firestore sync.');
      return;
    }
    setSyncStatus('syncing');
    const success = await saveCollectionEntriesToFirestore({
      paymentStatusMap,
      customBillNosMap,
      remarksMap,
      receivedAmountMap,
      paymentModeMap,
      paidTillMonthMap,
    });
    if (success) {
      setSyncStatus('synced');
    } else {
      setSyncStatus('error');
    }
  };

  // Persist filter and option selections
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_selectedMonths', JSON.stringify(selectedMonths)); }, [selectedMonths]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_gstViewFilter', gstViewFilter); }, [gstViewFilter]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_filterPaymentStatus', filterPaymentStatus); }, [filterPaymentStatus]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_unpaidPaidTillFilter', unpaidPaidTillFilter); }, [unpaidPaidTillFilter]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_selectedPlaces', JSON.stringify(selectedPlaces)); }, [selectedPlaces]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_buyerSearch', buyerSearch); }, [buyerSearch]);

  // Persist PDF options
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfOrientation', pdfOrientation); }, [pdfOrientation]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfMonthFilter', pdfMonthFilter); }, [pdfMonthFilter]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfGstFilter', pdfGstFilter); }, [pdfGstFilter]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfPaymentFilter', pdfPaymentFilter); }, [pdfPaymentFilter]);

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfIncludeCommCol', String(pdfIncludeCommCol)); }, [pdfIncludeCommCol]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfIncludeGstCol', String(pdfIncludeGstCol)); }, [pdfIncludeGstCol]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfIncludeReceivedCol', String(pdfIncludeReceivedCol)); }, [pdfIncludeReceivedCol]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfIncludeBalanceCol', String(pdfIncludeBalanceCol)); }, [pdfIncludeBalanceCol]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfIncludePaidTillCol', String(pdfIncludePaidTillCol)); }, [pdfIncludePaidTillCol]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfIncludeBillNosCol', String(pdfIncludeBillNosCol)); }, [pdfIncludeBillNosCol]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfIncludeStatusCol', String(pdfIncludeStatusCol)); }, [pdfIncludeStatusCol]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfIncludeRemarksCol', String(pdfIncludeRemarksCol)); }, [pdfIncludeRemarksCol]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('collection_pdfIncludeQRCode', String(pdfIncludeQRCode)); }, [pdfIncludeQRCode]);

  // ⚡ PERFORMANCE OPTIMIZATION 1: Pre-calculate & memoize parsed metadata for all raw rows once
  const parsedRows = useMemo(() => {
    return data.map(row => {
      const buyerRaw = (row['BUYER NAME'] || row['BUYER'] || row.buyer || '').toString();
      const buyerClean = buyerRaw.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
      const placeClean = (row['SHOP LOC'] || row['SHOP LOCATION'] || row['PLACE'] || row['LOCATION'] || row['CITY'] || row['ROAD'] || '').toString().trim() || '-';
      const billNo = (row['BILL NO'] || row['BILL'] || row.billNo || '').toString().trim();
      const qty = typeof row.quantity === 'number' ? row.quantity : findQuantityField(row);
      const amt = typeof row.amount === 'number' ? row.amount : findAmountField(row);
      const miller = (row['MILLER NAME'] || row.miller || '').toString();
      const isNidhiAgro = miller.toLowerCase().includes('nidhi agro');
      const monthStr = getRowMonthYear(row);

      return {
        row,
        buyerClean,
        placeClean,
        billNo,
        qty,
        amt,
        miller,
        isNidhiAgro,
        monthStr,
        rawCommission: row.commission,
      };
    });
  }, [data]);

  // Extract all unique months from dataset sorted chronologically
  const availableMonthsList = useMemo(() => {
    const monthsMap = new Map<string, Date>();
    parsedRows.forEach(item => {
      if (item.monthStr && item.monthStr !== 'Unknown Month' && !monthsMap.has(item.monthStr)) {
        const rawDate = item.row['DATE'] || item.row['Date'] || item.row.date;
        const d = parseRowDate(rawDate) || new Date();
        monthsMap.set(item.monthStr, d);
      }
    });
    return Array.from(monthsMap.entries())
      .sort((a, b) => a[1].getTime() - b[1].getTime())
      .map(entry => entry[0]);
  }, [parsedRows]);

  // ⚡ PERFORMANCE OPTIMIZATION 2: Convert selected months to Set for O(1) lookups
  const selectedMonthsSet = useMemo(() => new Set(selectedMonths), [selectedMonths]);
  const isAllMonths = useMemo(
    () => selectedMonthsSet.has('all') || selectedMonths.length === 0 || selectedMonths.length === availableMonthsList.length,
    [selectedMonthsSet, selectedMonths.length, availableMonthsList.length]
  );

  // Aggregate buyer rows based on selected tick-box Months filter
  const aggregatedBuyers = useMemo(() => {
    const grouped: Record<string, {
      buyer: string;
      place: string;
      totalQty: number;
      baseComm: number;
      autoBillNosSet: Set<string>;
    }> = {};

    parsedRows.forEach(item => {
      // Fast O(1) month filter lookup
      if (!isAllMonths && !selectedMonthsSet.has(item.monthStr)) return;

      if (!item.buyerClean) return;

      let comm = 0;
      if (typeof item.rawCommission !== 'undefined' && item.rawCommission !== null && !isNaN(parseFloat(item.rawCommission))) {
        comm = parseFloat(item.rawCommission);
      } else if (item.isNidhiAgro) {
        comm = item.amt * 0.01;
      } else if (commissionType === 'percentage') {
        comm = item.amt * commissionRate;
      } else {
        comm = item.qty * fixedRate;
      }

      if (!grouped[item.buyerClean]) {
        grouped[item.buyerClean] = {
          buyer: item.buyerClean,
          place: item.placeClean,
          totalQty: 0,
          baseComm: 0,
          autoBillNosSet: new Set(),
        };
      }

      grouped[item.buyerClean].totalQty += item.qty;
      grouped[item.buyerClean].baseComm += comm;
      if (item.placeClean && item.placeClean !== '-' && grouped[item.buyerClean].place === '-') {
        grouped[item.buyerClean].place = item.placeClean;
      }
      if (item.billNo) {
        grouped[item.buyerClean].autoBillNosSet.add(item.billNo);
      }
    });

    const activeMonthTag = selectedMonths.length === 1 && !selectedMonthsSet.has('all') ? selectedMonths[0] : 'all';

    return Object.values(grouped)
      .sort((a, b) => a.buyer.localeCompare(b.buyer))
      .map((item, idx) => {
        const slNo = (idx + 1).toString();
        const autoBills = Array.from(item.autoBillNosSet).sort((x, y) => {
          const nx = parseInt(x, 10);
          const ny = parseInt(y, 10);
          if (!isNaN(nx) && !isNaN(ny)) return nx - ny;
          return x.localeCompare(y);
        }).join(', ');

        const defaultBillNo = slNo;
        const paymentMode = paymentModeMap[item.buyer] || 'CASH';
        const isGst = paymentMode === 'CHQEE';
        const gstAmt = isGst ? item.baseComm * 0.18 : 0;
        const totalPayable = item.baseComm + gstAmt;

        const recvKey = activeMonthTag !== 'all' ? `${item.buyer}_${activeMonthTag}` : item.buyer;
        const rawRecvStr = receivedAmountMap[recvKey] ?? receivedAmountMap[item.buyer] ?? '';
        const receivedAmt = parseFloat(rawRecvStr) || 0;
        const balanceDue = Math.max(0, totalPayable - receivedAmt);

        let tallyStatus: 'Tallied' | 'Partial' | 'Unpaid' = 'Unpaid';
        if (receivedAmt >= totalPayable - 0.01 && totalPayable > 0) {
          tallyStatus = 'Tallied';
        } else if (receivedAmt > 0) {
          tallyStatus = 'Partial';
        }

        const customBills = customBillNosMap[item.buyer] !== undefined ? customBillNosMap[item.buyer] : defaultBillNo;
        const remarks = remarksMap[item.buyer] || '';
        const status = paymentStatusMap[item.buyer] || (tallyStatus === 'Tallied' ? 'Received' : 'Not Received');
        const paidTillMonth = paidTillMonthMap[item.buyer] || (tallyStatus === 'Tallied' ? 'Fully Paid' : 'None');

        return {
          buyer: item.buyer,
          place: item.place,
          totalQty: item.totalQty,
          baseComm: item.baseComm,
          paymentMode,
          isGst,
          gstAmt,
          totalPayable,
          receivedAmtStr: rawRecvStr,
          receivedAmt,
          balanceDue,
          tallyStatus,
          paidTillMonth,
          autoBillNos: autoBills,
          billNos: customBills,
          paymentStatus: status,
          remarks,
        };
      });
  }, [parsedRows, commissionType, commissionRate, fixedRate, isAllMonths, selectedMonthsSet, selectedMonths, paymentStatusMap, customBillNosMap, remarksMap, receivedAmountMap, paymentModeMap, paidTillMonthMap]);

  // Unique list of places
  const allPlacesList = useMemo(() => {
    const set = new Set<string>();
    aggregatedBuyers.forEach(b => {
      if (b.place && b.place !== '-') set.add(b.place);
    });
    return Array.from(set).sort();
  }, [aggregatedBuyers]);

  // ⚡ PERFORMANCE OPTIMIZATION 3: Place lookups using Set
  const selectedPlacesSet = useMemo(() => new Set(selectedPlaces.map(p => p.toLowerCase())), [selectedPlaces]);
  const isAllPlaces = useMemo(
    () => selectedPlaces.includes('all') || selectedPlaces.length === 0 || selectedPlaces.length === allPlacesList.length,
    [selectedPlaces, allPlacesList.length]
  );

  // Filtered buyers for display
  const filteredBuyers = useMemo(() => {
    const query = buyerSearch.trim().toLowerCase();

    return aggregatedBuyers.filter(b => {
      if (filterPaymentStatus === 'Received' && b.tallyStatus !== 'Tallied' && b.paymentStatus !== 'Received') return false;
      if (filterPaymentStatus === 'Not Received' && (b.tallyStatus === 'Tallied' || b.paymentStatus === 'Received')) return false;
      if (filterPaymentStatus === 'Partial' && b.tallyStatus !== 'Partial') return false;

      if (unpaidPaidTillFilter !== 'all') {
        if (unpaidPaidTillFilter === 'none') {
          if (b.paidTillMonth !== 'None' && b.paidTillMonth !== 'Unpaid') return false;
        } else if (b.paidTillMonth !== unpaidPaidTillFilter) {
          return false;
        }
      }

      if (gstViewFilter === 'With GST' && b.paymentMode !== 'CHQEE') return false;
      if (gstViewFilter === 'Without GST' && b.paymentMode !== 'CASH') return false;

      if (!isAllPlaces && !selectedPlacesSet.has(b.place.toLowerCase())) return false;

      if (query) {
        const matchName = b.buyer.toLowerCase().includes(query);
        const matchPlace = b.place.toLowerCase().includes(query);
        const matchBills = b.billNos.toLowerCase().includes(query);
        if (!matchName && !matchPlace && !matchBills) return false;
      }

      return true;
    });
  }, [aggregatedBuyers, filterPaymentStatus, unpaidPaidTillFilter, gstViewFilter, isAllPlaces, selectedPlacesSet, buyerSearch]);

  // Summary Totals
  const summaryTotals = useMemo(() => {
    let totalQty = 0;
    let totalBaseComm = 0;
    let totalGstAmt = 0;
    let totalPayable = 0;
    let totalReceivedAmt = 0;
    let totalBalanceDue = 0;
    let talliedCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;
    let cashCount = 0;
    let chqCount = 0;

    filteredBuyers.forEach(b => {
      totalQty += b.totalQty;
      totalBaseComm += b.baseComm;
      totalGstAmt += b.gstAmt;
      totalPayable += b.totalPayable;
      totalReceivedAmt += b.receivedAmt;
      totalBalanceDue += b.balanceDue;

      if (b.paymentMode === 'CASH') cashCount++;
      else chqCount++;

      if (b.tallyStatus === 'Tallied' || b.paymentStatus === 'Received') {
        talliedCount++;
      } else if (b.tallyStatus === 'Partial') {
        partialCount++;
      } else {
        unpaidCount++;
      }
    });

    return {
      totalBuyers: filteredBuyers.length,
      totalQty,
      totalBaseComm,
      totalGstAmt,
      totalPayable,
      totalReceivedAmt,
      totalBalanceDue,
      talliedCount,
      partialCount,
      unpaidCount,
      cashCount,
      chqCount,
    };
  }, [filteredBuyers]);

  // ⚡ PERFORMANCE OPTIMIZATION 4: useCallback for handlers to stabilize table inputs
  const togglePaymentMode = useCallback((buyer: string, currentMode?: string) => {
    setPaymentModeMap(prev => {
      const activeMode = prev[buyer] || currentMode || 'CASH';
      const nextMode = activeMode === 'CHQEE' ? 'CASH' : 'CHQEE';
      saveBuyerEntryToFirestore(buyer, { paymentMode: nextMode });
      return { ...prev, [buyer]: nextMode };
    });
  }, []);

  const handleReceivedAmtChange = useCallback((buyer: string, val: string) => {
    const activeMonthTag = selectedMonths.length === 1 && !selectedMonths.includes('all') ? selectedMonths[0] : 'all';
    const recvKey = activeMonthTag !== 'all' ? `${buyer}_${activeMonthTag}` : buyer;
    setReceivedAmountMap(prev => ({ ...prev, [recvKey]: val }));
    saveBuyerEntryToFirestore(buyer, { receivedAmount: { key: recvKey, val } });
  }, [selectedMonths]);

  const handlePaidTillMonthChange = useCallback((buyer: string, val: string) => {
    setPaidTillMonthMap(prev => ({ ...prev, [buyer]: val }));

    const activeMonthTag = selectedMonths.length === 1 && !selectedMonths.includes('all') ? selectedMonths[0] : 'all';
    const recvKey = activeMonthTag !== 'all' ? `${buyer}_${activeMonthTag}` : buyer;

    let newRecvVal = '0';
    if (val !== 'None') {
      let targetMonthsSet = new Set<string>();
      if (val === 'Fully Paid') {
        targetMonthsSet = new Set(availableMonthsList);
      } else {
        const idx = availableMonthsList.indexOf(val);
        if (idx !== -1) {
          targetMonthsSet = new Set(availableMonthsList.slice(0, idx + 1));
        } else {
          targetMonthsSet.add(val);
        }
      }

      const isGst = (paymentModeMap[buyer] || 'CASH') === 'CHQEE';
      let cumBaseComm = 0;

      parsedRows.forEach(item => {
        if (item.buyerClean !== buyer) return;
        if (targetMonthsSet.size > 0 && item.monthStr && !targetMonthsSet.has(item.monthStr)) return;

        let comm = 0;
        if (typeof item.rawCommission !== 'undefined' && item.rawCommission !== null && !isNaN(parseFloat(item.rawCommission))) {
          comm = parseFloat(item.rawCommission);
        } else if (item.isNidhiAgro) {
          comm = item.amt * 0.01;
        } else if (commissionType === 'percentage') {
          comm = item.amt * commissionRate;
        } else {
          comm = item.qty * fixedRate;
        }
        cumBaseComm += comm;
      });

      const cumGst = isGst ? cumBaseComm * 0.18 : 0;
      newRecvVal = (cumBaseComm + cumGst).toFixed(2);
    }

    setReceivedAmountMap(prev => ({ ...prev, [recvKey]: newRecvVal }));
    saveBuyerEntryToFirestore(buyer, { paidTillMonth: val, receivedAmount: { key: recvKey, val: newRecvVal } });
  }, [availableMonthsList, parsedRows, paymentModeMap, commissionType, commissionRate, fixedRate, selectedMonths]);

  const togglePaymentStatus = useCallback((buyer: string, currentStatus?: string) => {
    setPaymentStatusMap(prev => {
      const activeStatus = prev[buyer] || currentStatus || 'Not Received';
      const nextStatus = activeStatus === 'Received' ? 'Not Received' : 'Received';
      saveBuyerEntryToFirestore(buyer, { paymentStatus: nextStatus });
      return { ...prev, [buyer]: nextStatus };
    });
  }, []);

  const handleBillNosChange = useCallback((buyer: string, val: string) => {
    setCustomBillNosMap(prev => ({ ...prev, [buyer]: val }));
    saveBuyerEntryToFirestore(buyer, { customBillNo: val });
  }, []);

  const handleRemarksChange = useCallback((buyer: string, val: string) => {
    setRemarksMap(prev => ({ ...prev, [buyer]: val }));
    saveBuyerEntryToFirestore(buyer, { remark: val });
  }, []);

  // PDF Generation
  const generateCollectionDueListPDF = async () => {
    setShowPdfModal(false);

    const isPdfAllPlaces = pdfSelectedPlaces.includes('all') || pdfSelectedPlaces.length === 0;
    const pdfSelectedPlacesSet = new Set(pdfSelectedPlaces.map(p => p.toLowerCase()));

    const pdfRows = aggregatedBuyers.filter(b => {
      if (pdfPaymentFilter === 'Received' && b.tallyStatus !== 'Tallied' && b.paymentStatus !== 'Received') return false;
      if (pdfPaymentFilter === 'Not Received' && (b.tallyStatus === 'Tallied' || b.paymentStatus === 'Received')) return false;
      if (pdfPaymentFilter === 'Partial' && b.tallyStatus !== 'Partial') return false;

      if (pdfGstFilter === 'With GST' && b.paymentMode !== 'CHQEE') return false;
      if (pdfGstFilter === 'Without GST' && b.paymentMode !== 'CASH') return false;

      if (!isPdfAllPlaces && !pdfSelectedPlacesSet.has(b.place.toLowerCase())) return false;
      return true;
    });

    const doc = new jsPDF({ orientation: pdfOrientation, unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;
    let finalY = 20;

    // Helper for Indian number formatting
    const fmtNum = (val: number): string => {
      if (isNaN(val) || val === undefined || val === null) return '0.00';
      return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const fmtCurr = (val: number): string => {
      if (isNaN(val) || val === undefined || val === null) return '₹0.00';
      return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // ── Company Header ──
    doc.setTextColor(0, 0, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text((companyName || 'THEJAS CANVASING').toUpperCase(), pageWidth / 2, finalY, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'No. 123, 1st Floor, 4th main Road, Yeshwanthpur, APMC Yard, Bengaluru - 560022',
      pageWidth / 2, finalY + 22, { align: 'center' }
    );
    doc.text(
      `Phone: ${companyPhone || (bankDetails?.upi ?? DEFAULT_BANK.upi)} ; PAN NO: ${companyPAN || 'AEBPA6445G'}; GST NO: ${companyGST || '29AEBPA6445G2Z0'}`,
      pageWidth / 2, finalY + 40, { align: 'center' }
    );
    doc.setLineWidth(1.5);
    doc.setDrawColor(0, 0, 255);
    doc.line(20, finalY + 52, pageWidth - 20, finalY + 52);
    finalY += 72;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28); // Vibrant Red title
    doc.text('COLLECTION STATUS & BROKERAGE DUE LIST', pageWidth / 2, finalY, { align: 'center' });
    finalY += 16;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);

    const monthLabel = pdfMonthFilter === 'all' ? (periodOfBilling || 'All Months') : pdfMonthFilter;
    const placeLabel = isPdfAllPlaces ? 'All Places' : pdfSelectedPlaces.filter(p => p !== 'all').join(', ');
    const gstLabel = pdfGstFilter === 'With GST' ? 'GST Only' : pdfGstFilter === 'Without GST' ? 'NO GST Only' : 'All (GST + NO GST)';
    const filterStr = `Period: ${monthLabel}   |   Places: ${placeLabel}   |   Mode: ${gstLabel}   |   Status: ${pdfPaymentFilter.toUpperCase()}`;
    doc.text(filterStr, pageWidth / 2, finalY, { align: 'center' });
    finalY += 15;

    const shouldIncludeGstCol = pdfIncludeGstCol && (showGstInPdf !== false);

    const tableHeadRow = ['#', 'Buyer Name', 'Place'];
    if (pdfIncludeBillNosCol) tableHeadRow.push('Bill Nos');
    tableHeadRow.push('Qty (qtl)');
    tableHeadRow.push('Mode');
    if (pdfIncludeCommCol) tableHeadRow.push('Base Comm (₹)');
    if (shouldIncludeGstCol) tableHeadRow.push('18% GST (₹)');
    tableHeadRow.push('Payable (₹)');
    if (pdfIncludeReceivedCol) tableHeadRow.push('Received (₹)');
    if (pdfIncludeBalanceCol) tableHeadRow.push('Balance Due (₹)');
    if (pdfIncludePaidTillCol) tableHeadRow.push('Paid Till');
    if (pdfIncludeStatusCol) tableHeadRow.push('Status');
    if (pdfIncludeRemarksCol) tableHeadRow.push('Remarks');

    const tableBody = pdfRows.map((item, idx) => {
      const rowArr: (string | number)[] = [idx + 1, item.buyer, item.place];
      if (pdfIncludeBillNosCol) rowArr.push(item.billNos || '-');
      rowArr.push(fmtNum(item.totalQty));
      rowArr.push(item.paymentMode === 'CHQEE' ? 'GST' : 'NO GST');
      if (pdfIncludeCommCol) rowArr.push(fmtNum(item.baseComm));
      if (shouldIncludeGstCol) rowArr.push(fmtNum(item.gstAmt));
      rowArr.push(fmtNum(item.totalPayable));
      if (pdfIncludeReceivedCol) rowArr.push(item.receivedAmt ? fmtNum(item.receivedAmt) : '-');
      if (pdfIncludeBalanceCol) rowArr.push(fmtNum(item.balanceDue));
      if (pdfIncludePaidTillCol) rowArr.push(item.paidTillMonth || '-');
      if (pdfIncludeStatusCol) rowArr.push(item.tallyStatus === 'Tallied' ? 'Tallied' : item.tallyStatus === 'Partial' ? 'Partial' : 'Pending');
      if (pdfIncludeRemarksCol) rowArr.push(item.remarks || '');
      return rowArr;
    });

    const totalQtyAll = pdfRows.reduce((s, b) => s + b.totalQty, 0);
    const totalBaseCommAll = pdfRows.reduce((s, b) => s + b.baseComm, 0);
    const totalGstAll = pdfRows.reduce((s, b) => s + b.gstAmt, 0);
    const totalPayableAll = pdfRows.reduce((s, b) => s + b.totalPayable, 0);
    const totalReceivedAll = pdfRows.reduce((s, b) => s + b.receivedAmt, 0);
    const totalBalanceAll = pdfRows.reduce((s, b) => s + b.balanceDue, 0);

    const columnStyles: Record<number, any> = {};
    tableHeadRow.forEach((colName, index) => {
      if (colName === '#') {
        columnStyles[index] = { halign: 'center', cellWidth: 18 };
      } else if (colName === 'Buyer Name') {
        columnStyles[index] = { halign: 'left', fontStyle: 'bold' };
      } else if (colName === 'Place') {
        columnStyles[index] = { halign: 'left' };
      } else if (colName === 'Mode' || colName === 'Paid Till' || colName === 'Status') {
        columnStyles[index] = { halign: 'center' };
      } else if (colName.includes('Qty') || colName.includes('Comm') || colName.includes('GST') || colName.includes('Payable') || colName.includes('Received') || colName.includes('Balance')) {
        columnStyles[index] = { halign: 'right' };
      } else {
        columnStyles[index] = { halign: 'left' };
      }
    });

    autoTable(doc, {
      startY: finalY,
      head: [tableHeadRow],
      body: tableBody,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8.2,
        cellPadding: 4,
        lineWidth: 0.3,
        lineColor: [203, 213, 225],
        halign: 'left',
        valign: 'middle',
        minCellHeight: 16,
      },
      headStyles: {
        fillColor: [30, 41, 59], // Sleek Dark Slate column headings
        textColor: [255, 255, 255],
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold',
        fontSize: 9,
        lineWidth: 0.4,
        lineColor: [51, 65, 85],
        cellPadding: 5.5,
      },
      columnStyles: columnStyles,
      margin: { left: marginX, right: marginX, top: 20, bottom: 20 },
    });

    finalY = (doc as any).lastAutoTable.finalY + 14;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Authorized Signatory', pageWidth - marginX, finalY, { align: 'right' });
    finalY += 14;

    // Add dynamic page numbers footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Page ${i} of ${totalPages}  |  Generated by ${companyName}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileSuffix = pdfMonthFilter === 'all' ? 'All_Months' : pdfMonthFilter.replace(/\s+/g, '_');
    doc.save(`Collection_Due_List_${fileSuffix}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#f8fafc' }}>
      {/* ⚡ OPTIMIZED HEADER CARD */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '14px',
        padding: '1.15rem 1.25rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #d97706)'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>📋</span>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Collection Status & Brokerage Due List
              </h2>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Optimized collection tracking: tick-box months, received amount tallying, GST view breakdown, and paid-till month filtering.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Cloud Sync Status Indicator */}
            <button
              type="button"
              onClick={() => {
                if (syncStatus === 'error') {
                  showSyncErrorHelp();
                } else {
                  handleSyncAllToFirestore();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 13px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: syncStatus === 'synced'
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : syncStatus === 'syncing'
                  ? '1px solid rgba(59, 130, 246, 0.4)'
                  : syncStatus === 'error'
                  ? '1px solid rgba(239, 68, 68, 0.5)'
                  : '1px solid rgba(148, 163, 184, 0.3)',
                background: syncStatus === 'synced'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : syncStatus === 'syncing'
                  ? 'rgba(59, 130, 246, 0.15)'
                  : syncStatus === 'error'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(148, 163, 184, 0.1)',
                color: syncStatus === 'synced'
                  ? '#34d399'
                  : syncStatus === 'syncing'
                  ? '#60a5fa'
                  : syncStatus === 'error'
                  ? '#f87171'
                  : '#cbd5e1',
                transition: 'all 0.2s',
              }}
              title={syncStatus === 'error' ? 'Click to fix Firebase setup' : 'Click to sync all data to Firebase'}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: syncStatus === 'synced' ? '#10b981' : syncStatus === 'syncing' ? '#3b82f6' : syncStatus === 'error' ? '#ef4444' : '#94a3b8',
                boxShadow: syncStatus === 'synced' ? '0 0 6px #10b981' : syncStatus === 'syncing' ? '0 0 6px #3b82f6' : syncStatus === 'error' ? '0 0 6px #ef4444' : 'none'
              }} />
              {syncStatus === 'synced' && '☁️ Cloud Synced'}
              {syncStatus === 'syncing' && '⏳ Syncing...'}
              {syncStatus === 'local_only' && '💾 Local Only'}
              {syncStatus === 'error' && '⚠️ Firebase Sync Error'}
            </button>

            <button
              type="button"
              onClick={handleSyncAllToFirestore}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '9px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              title="Push all Collection Status data to Firebase Cloud"
            >
              <span>🔄</span> Sync to Firebase
            </button>

            <button
              onClick={() => setShowPdfModal(true)}
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <span>📄</span> Generate PDF Due List
            </button>
          </div>
        </div>

        {/* ⚡ OPTIMIZED COMPACT FILTERS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          background: 'rgba(15, 23, 42, 0.65)',
          padding: '0.85rem',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Month Tick-Box Multi-Select */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#38bdf8' }}>
                📅 Months ({isAllMonths ? 'All' : `${selectedMonths.length}`}):
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedMonths(['all'])}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  All
                </button>
                <span style={{ color: '#475569' }}>|</span>
                <button
                  type="button"
                  onClick={() => setSelectedMonths([])}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div style={{
              background: '#0f172a',
              borderRadius: '8px',
              padding: '6px 10px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 12px',
              alignItems: 'center'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', cursor: 'pointer', color: '#f1f5f9', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={selectedMonthsSet.has('all')}
                  onChange={() => setSelectedMonths(selectedMonthsSet.has('all') ? [] : ['all'])}
                  style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
                />
                🌟 All Months
              </label>
              {availableMonthsList.map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={isAllMonths || selectedMonthsSet.has(m)}
                    onChange={() => {
                      if (isAllMonths) {
                        setSelectedMonths(availableMonthsList.filter(x => x !== m));
                      } else if (selectedMonthsSet.has(m)) {
                        const next = selectedMonths.filter(x => x !== m);
                        setSelectedMonths(next.length === 0 ? ['all'] : next);
                      } else {
                        const next = [...selectedMonths, m];
                        setSelectedMonths(next.length === availableMonthsList.length ? ['all'] : next);
                      }
                    }}
                    style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          {/* GST View Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#c084fc', marginBottom: '5px' }}>
              ⚖️ GST View Mode
            </label>
            <div style={{ display: 'flex', gap: '3px', background: '#0f172a', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {(['All', 'With GST', 'Without GST'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setGstViewFilter(mode)}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: gstViewFilter === mode
                      ? (mode === 'With GST' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : mode === 'Without GST' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #2563eb)')
                      : 'transparent',
                    color: gstViewFilter === mode ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.2s'
                  }}
                >
                  {mode === 'With GST' ? 'GST' : mode === 'Without GST' ? 'NO GST' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Tally Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#fbbf24', marginBottom: '5px' }}>
              📊 Payment Tally Filter
            </label>
            <div style={{ display: 'flex', gap: '3px', background: '#0f172a', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {(['All', 'Not Received', 'Partial', 'Received'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => {
                    setFilterPaymentStatus(st);
                    if (st !== 'Not Received' && st !== 'Partial') {
                      setUnpaidPaidTillFilter('all');
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 3px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: filterPaymentStatus === st
                      ? (st === 'Received' ? 'linear-gradient(135deg, #10b981, #059669)' : st === 'Partial' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : st === 'Not Received' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)')
                      : 'transparent',
                    color: filterPaymentStatus === st ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.2s'
                  }}
                >
                  {st === 'Not Received' ? 'Unpaid' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Paid-Till Month Filter for Unpaid / Partial Buyers */}
          {(filterPaymentStatus === 'Not Received' || filterPaymentStatus === 'Partial' || filterPaymentStatus === 'All') && (
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#ef4444', marginBottom: '5px' }}>
                ⏳ Unpaid Paid-Till Filter
              </label>
              <select
                value={unpaidPaidTillFilter}
                onChange={e => setUnpaidPaidTillFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: '#0f172a',
                  color: '#fca5a5',
                  fontSize: '12px',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">🌟 All Statuses</option>
                <option value="none">Unpaid (None)</option>
                {availableMonthsList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          {/* Place Filter Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#38bdf8', marginBottom: '5px' }}>
              📍 Place Filter
            </label>
            <select
              value={selectedPlaces.includes('all') ? 'all' : selectedPlaces[0] || 'all'}
              onChange={e => {
                const val = e.target.value;
                setSelectedPlaces(val === 'all' ? ['all'] : [val]);
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">🌟 All Places ({allPlacesList.length})</option>
              {allPlacesList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', marginBottom: '5px' }}>
              🔍 Search Buyer / Bill
            </label>
            <input
              type="text"
              placeholder="Search buyer or bill #..."
              value={buyerSearch}
              onChange={e => setBuyerSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* Reset Bill Nos Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setCustomBillNosMap({});
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('collection_customBillNosMap');
                }
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Reset all Bill Nos back to sequential 1, 2, 3..."
            >
              🔄 Reset Bill Nos to Sl No
            </button>
          </div>
        </div>
      </div>

      {/* ⚡ OPTIMIZED TABLE CONTAINER WITH DENSE ROW PADDING */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
              <tr style={{
                background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                color: '#f8fafc',
                borderBottom: '2px solid rgba(59, 130, 246, 0.4)',
                textAlign: 'left',
                textTransform: 'uppercase',
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                <th style={{ padding: '11px 6px', width: '32px', textAlign: 'center', color: '#94a3b8' }}>#</th>
                <th style={{ padding: '11px 10px', minWidth: '125px', color: '#ffffff' }}>Buyer Name</th>
                <th style={{ padding: '11px 8px', width: '70px', maxWidth: '75px', color: '#38bdf8' }}>Place</th>
                <th style={{ padding: '11px 8px', textAlign: 'center', minWidth: '85px', color: '#ffffff' }}>Qty (qtl)</th>
                <th style={{ padding: '11px 8px', width: '110px', textAlign: 'center', color: '#c084fc' }}>Mode</th>
                <th style={{ padding: '11px 10px', textAlign: 'right', minWidth: '85px', color: '#cbd5e1' }}>Base Comm</th>
                <th style={{ padding: '11px 10px', textAlign: 'right', minWidth: '85px', color: '#c084fc' }}>18% GST</th>
                <th style={{ padding: '11px 10px', textAlign: 'right', minWidth: '95px', color: '#fbbf24', fontWeight: 800 }}>Total Payable</th>
                <th style={{
                  padding: '11px 10px',
                  minWidth: '125px',
                  textAlign: 'right',
                  background: 'rgba(59, 130, 246, 0.25)',
                  color: '#60a5fa',
                  fontWeight: 800,
                  borderLeft: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRight: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  💵 Received Amt
                </th>
                <th style={{ padding: '11px 10px', textAlign: 'right', color: '#f87171', fontWeight: 800, minWidth: '95px' }}>Balance Due</th>
                <th style={{ padding: '11px 8px', minWidth: '115px', color: '#fbbf24', textAlign: 'center' }}>📅 Paid Till</th>
                <th style={{ padding: '11px 6px', width: '55px', maxWidth: '60px', textAlign: 'center', color: '#cbd5e1' }}>Bill No</th>
                <th style={{ padding: '11px 8px', width: '100px', textAlign: 'center', color: '#34d399' }}>Status</th>
                <th style={{ padding: '11px 10px', minWidth: '130px', color: '#38bdf8' }}>📝 Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🔍</div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#94a3b8' }}>No buyer collection records match current filters.</div>
                  </td>
                </tr>
              ) : (
                filteredBuyers.map((b, idx) => {
                  const isTallied = b.tallyStatus === 'Tallied';
                  const isPartial = b.tallyStatus === 'Partial';
                  return (
                    <tr
                      key={b.buyer}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: isTallied
                          ? 'rgba(16, 185, 129, 0.04)'
                          : isPartial
                          ? 'rgba(245, 158, 11, 0.04)'
                          : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '8px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#f1f5f9' }}>
                        {b.buyer}
                      </td>
                      <td style={{ padding: '8px 4px', color: '#cbd5e1', maxWidth: '65px' }}>
                        <span
                          style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'inline-block',
                            maxWidth: '60px'
                          }}
                          title={b.place}
                        >
                          {b.place}
                        </span>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>
                        {b.totalQty.toFixed(2)}
                      </td>

                      {/* Payment Mode Selector Pill */}
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => togglePaymentMode(b.buyer, b.paymentMode)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '16px',
                            border: b.paymentMode === 'CHQEE' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: b.paymentMode === 'CHQEE' ? 'rgba(139, 92, 246, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                            color: b.paymentMode === 'CHQEE' ? '#c084fc' : '#34d399',
                            transition: 'all 0.15s',
                          }}
                        >
                          {b.paymentMode === 'CHQEE' ? 'GST' : 'NO GST'}
                        </button>
                      </td>

                      <td style={{ padding: '8px', textAlign: 'right', color: '#cbd5e1', fontWeight: 600 }}>
                        ₹{b.baseComm.toFixed(2)}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', color: b.isGst ? '#c084fc' : '#64748b', fontWeight: b.isGst ? 700 : 400 }}>
                        ₹{b.gstAmt.toFixed(2)}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800, color: '#fbbf24' }}>
                        ₹{b.totalPayable.toFixed(2)}
                      </td>

                      {/* Received Amount Input */}
                      <td style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.08)' }}>
                        <input
                          type="number"
                          step="any"
                          inputMode="decimal"
                          value={b.receivedAmtStr}
                          placeholder="0.00"
                          onChange={e => handleReceivedAmtChange(b.buyer, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '5px 8px',
                            borderRadius: '7px',
                            border: '1.5px solid rgba(59, 130, 246, 0.45)',
                            background: '#0f172a',
                            color: '#60a5fa',
                            fontSize: '13px',
                            fontWeight: 800,
                            textAlign: 'right',
                            outline: 'none',
                            appearance: 'none',
                            MozAppearance: 'textfield',
                            WebkitAppearance: 'none'
                          }}
                        />
                      </td>

                      {/* Balance Due */}
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800, color: b.balanceDue > 0 ? '#f87171' : '#34d399' }}>
                        ₹{b.balanceDue.toFixed(2)}
                      </td>

                      {/* Paid Till Month Dropdown */}
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <select
                          value={b.paidTillMonth}
                          onChange={e => handlePaidTillMonthChange(b.buyer, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '5px 6px',
                            borderRadius: '6px',
                            border: '1px solid rgba(251, 191, 36, 0.4)',
                            background: '#0f172a',
                            color: b.paidTillMonth === 'Fully Paid' ? '#34d399' : b.paidTillMonth === 'None' ? '#f87171' : '#fbbf24',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="None">None</option>
                          <option value="Fully Paid">Fully Paid</option>
                          {availableMonthsList.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </td>

                      {/* Bill Nos */}
                      <td style={{ padding: '8px 4px', width: '48px', maxWidth: '55px', textAlign: 'center' }}>
                        <input
                          type="text"
                          maxLength={6}
                          value={b.billNos}
                          placeholder="#"
                          onChange={e => handleBillNosChange(b.buyer, e.target.value)}
                          style={{
                            width: '100%',
                            maxWidth: '48px',
                            padding: '5px 4px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: '#0f172a',
                            color: '#f8fafc',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            textAlign: 'center',
                            outline: 'none',
                          }}
                        />
                      </td>

                      {/* Status Button */}
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          onClick={() => togglePaymentStatus(b.buyer, b.paymentStatus)}
                          style={{
                            width: '100%',
                            padding: '5px 8px',
                            borderRadius: '16px',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: 'pointer',
                            background: isTallied || b.paymentStatus === 'Received'
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : isPartial
                              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                              : 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: '#ffffff',
                            boxShadow: isTallied ? '0 2px 8px rgba(16,185,129,0.3)' : '0 2px 8px rgba(239,68,68,0.3)',
                            transition: 'all 0.15s',
                          }}
                        >
                          {isTallied || b.paymentStatus === 'Received' ? '✓ Tallied' : isPartial ? '⏳ Partial' : '✕ Unpaid'}
                        </button>
                      </td>

                      {/* Remarks */}
                      <td style={{ padding: '6px' }}>
                        <input
                          type="text"
                          value={b.remarks}
                          placeholder="Add note..."
                          onChange={e => handleRemarksChange(b.buyer, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            background: '#0f172a',
                            color: '#38bdf8',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            outline: 'none',
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.85rem'
      }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.85rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Total Buyers</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>{summaryTotals.totalBuyers}</span>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '0.85rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Total Quantity</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>{summaryTotals.totalQty.toFixed(2)} <span style={{ fontSize: '0.8rem' }}>qtl</span></span>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.85rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Base Commission</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e2e8f0' }}>₹{summaryTotals.totalBaseComm.toFixed(2)}</span>
        </div>

        <div style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.35)', padding: '0.85rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 600, display: 'block', marginBottom: '3px' }}>18% GST ({summaryTotals.chqCount} GST)</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c084fc' }}>₹{summaryTotals.totalGstAmt.toFixed(2)}</span>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.85rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Total Payable</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>₹{summaryTotals.totalPayable.toFixed(2)}</span>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.18)', border: '1.5px solid rgba(59, 130, 246, 0.5)', padding: '0.85rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, display: 'block', marginBottom: '3px' }}>Total Received</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#60a5fa' }}>₹{summaryTotals.totalReceivedAmt.toFixed(2)}</span>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.18)', border: '1.5px solid rgba(239, 68, 68, 0.45)', padding: '0.85rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 700, display: 'block', marginBottom: '3px' }}>Balance Due</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171' }}>₹{summaryTotals.totalBalanceDue.toFixed(2)}</span>
        </div>
      </div>

      {/* PDF Modal */}
      {showPdfModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', fontFamily: "'Inter','Segoe UI',sans-serif"
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '490px',
            padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            color: '#1e293b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.3rem' }}>📄</span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Collection Due List PDF Options
              </h3>
            </div>
            <p style={{ margin: '0 0 1.25rem', fontSize: '12.5px', color: '#64748b' }}>
              Customize month filter, GST modes, and columns for your PDF export.
            </p>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '12px', marginBottom: '5px', color: '#334155' }}>
                Month Filter for PDF:
              </label>
              <select
                value={pdfMonthFilter}
                onChange={e => setPdfMonthFilter(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px', borderRadius: '7px',
                  border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#f8fafc',
                  color: '#0f172a', fontWeight: 600, outline: 'none'
                }}
              >
                <option value="all">All Months</option>
                {availableMonthsList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Place Filter for PDF */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '12px', marginBottom: '5px', color: '#334155' }}>
                📍 Place Filter for PDF:
              </label>
              <select
                value={pdfSelectedPlaces.includes('all') ? 'all' : pdfSelectedPlaces[0] || 'all'}
                onChange={e => {
                  const val = e.target.value;
                  setPdfSelectedPlaces(val === 'all' ? ['all'] : [val]);
                }}
                style={{
                  width: '100%', padding: '7px 10px', borderRadius: '7px',
                  border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#f8fafc',
                  color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="all">🌟 All Places ({allPlacesList.length})</option>
                {allPlacesList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '12px', marginBottom: '5px', color: '#334155' }}>
                GST Mode Filter for PDF:
              </label>
              <div style={{ display: 'flex', gap: '5px', background: '#f1f5f9', padding: '3px', borderRadius: '7px' }}>
                {(['All', 'With GST', 'Without GST'] as const).map(st => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setPdfGstFilter(st)}
                    style={{
                      flex: 1, padding: '6px 8px', borderRadius: '5px', border: 'none',
                      fontSize: '11.5px', fontWeight: 700, cursor: 'pointer',
                      background: pdfGstFilter === st ? '#2563eb' : 'transparent',
                      color: pdfGstFilter === st ? '#ffffff' : '#64748b',
                    }}
                  >
                    {st === 'With GST' ? 'GST Only' : st === 'Without GST' ? 'NO GST Only' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '12px', marginBottom: '5px', color: '#334155' }}>
                Payment Status Filter for PDF:
              </label>
              <div style={{ display: 'flex', gap: '5px', background: '#f1f5f9', padding: '3px', borderRadius: '7px' }}>
                {(['All', 'Not Received', 'Partial', 'Received'] as const).map(st => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setPdfPaymentFilter(st)}
                    style={{
                      flex: 1, padding: '6px 8px', borderRadius: '5px', border: 'none',
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      background: pdfPaymentFilter === st ? '#2563eb' : 'transparent',
                      color: pdfPaymentFilter === st ? '#ffffff' : '#64748b',
                    }}
                  >
                    {st === 'Not Received' ? 'Unpaid' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Orientation Selector */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '12px', marginBottom: '5px', color: '#334155' }}>
                PDF Page Orientation:
              </label>
              <div style={{ display: 'flex', gap: '5px', background: '#f1f5f9', padding: '3px', borderRadius: '7px' }}>
                {(['portrait', 'landscape'] as const).map(orient => (
                  <button
                    type="button"
                    key={orient}
                    onClick={() => setPdfOrientation(orient)}
                    style={{
                      flex: 1, padding: '6px 8px', borderRadius: '5px', border: 'none',
                      fontSize: '11.5px', fontWeight: 700, cursor: 'pointer',
                      background: pdfOrientation === orient ? '#2563eb' : 'transparent',
                      color: pdfOrientation === orient ? '#ffffff' : '#64748b',
                      textTransform: 'capitalize'
                    }}
                  >
                    📄 {orient} {orient === 'portrait' ? '(Default)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Column Toggles Grid */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '12px', marginBottom: '6px', color: '#334155' }}>
                Include PDF Columns (ON / OFF):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={pdfIncludeBalanceCol}
                    onChange={e => setPdfIncludeBalanceCol(e.target.checked)}
                    style={{ accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Balance Due Column
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={pdfIncludePaidTillCol}
                    onChange={e => setPdfIncludePaidTillCol(e.target.checked)}
                    style={{ accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Paid Till Month Column
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={pdfIncludeBillNosCol}
                    onChange={e => setPdfIncludeBillNosCol(e.target.checked)}
                    style={{ accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Bill Nos Column
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={pdfIncludeStatusCol}
                    onChange={e => setPdfIncludeStatusCol(e.target.checked)}
                    style={{ accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Tally Status Column
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={pdfIncludeRemarksCol}
                    onChange={e => setPdfIncludeRemarksCol(e.target.checked)}
                    style={{ accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Remarks Column
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={pdfIncludeReceivedCol}
                    onChange={e => setPdfIncludeReceivedCol(e.target.checked)}
                    style={{ accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Received Amt Column
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={pdfIncludeGstCol}
                    onChange={e => setPdfIncludeGstCol(e.target.checked)}
                    style={{ accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  18% GST Column
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={pdfIncludeCommCol}
                    onChange={e => setPdfIncludeCommCol(e.target.checked)}
                    style={{ accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  Base Comm Column
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                style={{
                  padding: '8px 16px', borderRadius: '7px', border: '1px solid #cbd5e1',
                  background: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={generateCollectionDueListPDF}
                style={{
                  padding: '8px 20px', borderRadius: '7px', border: 'none',
                  background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#ffffff',
                  fontWeight: 800, fontSize: '12.5px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(217,119,6,0.35)'
                }}
              >
                ⬇ Download Due List PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
