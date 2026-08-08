import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBc3358UvZuMDbvp1dMcayXcACNyjzcAW4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "brokerage-8a128.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "brokerage-8a128",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "brokerage-8a128.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "974128985020",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:974128985020:web:5f512fdba5fb02fa79f1b9",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2SETKFB2Z5"
};

// Check if Firebase config variables are present
export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined' || isFirebaseConfigured()) {
  try {
    if (isFirebaseConfigured()) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      db = getFirestore(app);
    }
  } catch (err) {
    console.warn('Firebase initialization skipped or failed:', err);
  }
}

export { app, db };

export interface CollectionEntriesData {
  paymentStatusMap: Record<string, 'Received' | 'Not Received'>;
  customBillNosMap: Record<string, string>;
  remarksMap: Record<string, string>;
  receivedAmountMap: Record<string, string>;
  paymentModeMap: Record<string, 'CHQEE' | 'CASH'>;
  paidTillMonthMap: Record<string, string>;
}

const COLLECTION_DOC_NAME = 'collection_master_entries';

/**
 * Subscribe to real-time changes of all collection entries in Firestore
 */
export const subscribeToCollectionEntries = (
  onData: (data: CollectionEntriesData) => void,
  onError?: (err: Error) => void
) => {
  if (!db) return () => {};

  const docRef = doc(db, 'collections', COLLECTION_DOC_NAME);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data() as CollectionEntriesData;
        onData({
          paymentStatusMap: val.paymentStatusMap || {},
          customBillNosMap: val.customBillNosMap || {},
          remarksMap: val.remarksMap || {},
          receivedAmountMap: val.receivedAmountMap || {},
          paymentModeMap: val.paymentModeMap || {},
          paidTillMonthMap: val.paidTillMonthMap || {},
        });
      } else {
        onData({
          paymentStatusMap: {},
          customBillNosMap: {},
          remarksMap: {},
          receivedAmountMap: {},
          paymentModeMap: {},
          paidTillMonthMap: {},
        });
      }
    },
    (error) => {
      console.error('Firestore Collection Subscription Error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Save updated maps to Firestore
 */
export const saveCollectionEntriesToFirestore = async (
  data: Partial<CollectionEntriesData>
): Promise<boolean> => {
  if (!db) {
    console.warn('Firestore is not configured. Saving only to LocalStorage.');
    return false;
  }

  try {
    const docRef = doc(db, 'collections', COLLECTION_DOC_NAME);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Failed to save collection entries to Firestore:', err);
    return false;
  }
};

/**
 * Save single buyer entry update to Firestore
 */
export const saveBuyerEntryToFirestore = async (
  buyer: string,
  updates: {
    paymentStatus?: 'Received' | 'Not Received';
    customBillNo?: string;
    remark?: string;
    receivedAmount?: { key: string; val: string };
    paymentMode?: 'CHQEE' | 'CASH';
    paidTillMonth?: string;
  }
): Promise<boolean> => {
  if (!db) return false;

  try {
    const docRef = doc(db, 'collections', COLLECTION_DOC_NAME);
    const updateObj: Record<string, any> = {};

    if (updates.paymentStatus !== undefined) {
      updateObj.paymentStatusMap = { [buyer]: updates.paymentStatus };
    }
    if (updates.customBillNo !== undefined) {
      updateObj.customBillNosMap = { [buyer]: updates.customBillNo };
    }
    if (updates.remark !== undefined) {
      updateObj.remarksMap = { [buyer]: updates.remark };
    }
    if (updates.receivedAmount !== undefined) {
      updateObj.receivedAmountMap = { [updates.receivedAmount.key]: updates.receivedAmount.val };
    }
    if (updates.paymentMode !== undefined) {
      updateObj.paymentModeMap = { [buyer]: updates.paymentMode };
    }
    if (updates.paidTillMonth !== undefined) {
      updateObj.paidTillMonthMap = { [buyer]: updates.paidTillMonth };
    }

    updateObj['updatedAt'] = new Date().toISOString();

    await setDoc(docRef, updateObj, { merge: true });
    return true;
  } catch (err) {
    console.error(`Failed to save buyer entry ${buyer} to Firestore:`, err);
    return false;
  }
};
