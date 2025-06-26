// lib/utils/browserCheck.ts

export const isBrowser = typeof window !== 'undefined';

export const loadXlsx = async () => {
  if (typeof window !== 'undefined') {
    return await import('xlsx');
  }
  return null;
};
