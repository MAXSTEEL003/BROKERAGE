// This file contains browser-only xlsx utilities

// Safely check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to dynamically load xlsx
export async function getXlsx() {
  if (isBrowser) {
    try {
      return await import('xlsx');
    } catch (error) {
      console.error('Error loading xlsx:', error);
      return null;
    }
  }
  return null;
}

// Function to read an Excel file
export async function readExcelFile(file) {
  if (!isBrowser) return null;
  
  const xlsx = await getXlsx();
  if (!xlsx) return null;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

// Function to export data to Excel
export async function exportToExcel(data, sheetName = 'Sheet1', fileName = 'export.xlsx') {
  if (!isBrowser) return false;
  
  const xlsx = await getXlsx();
  if (!xlsx) return false;
  
  try {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    xlsx.writeFile(workbook, fileName);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
}

export default {
  getXlsx,
  readExcelFile,
  exportToExcel
};