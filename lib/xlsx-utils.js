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
  if (!isBrowser) {
    throw new Error('Excel processing is only available in browser environments');
  }
  
  const xlsx = await getXlsx();
  if (!xlsx) {
    throw new Error('Failed to load Excel processing library');
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: 'array' });
        const sheets = workbook.SheetNames;
        
        resolve({ workbook, sheets });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

// Function to export data to Excel
export async function exportToExcel(data, sheetName = 'Sheet1', fileName = 'export.xlsx') {
  if (!isBrowser) return false;
  
  try {
    const xlsx = await getXlsx();
    if (!xlsx) return false;
    
    // Convert data to worksheet
    const worksheet = xlsx.utils.json_to_sheet(data);
    
    // Create workbook and add the worksheet
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file and trigger download
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

