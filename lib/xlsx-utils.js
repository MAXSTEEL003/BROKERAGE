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
        
        // Try different read options to handle various Excel formats
        let workbook;
        try {
          workbook = xlsx.read(data, { type: 'binary' });
        } catch (err) {
          console.log('Binary read failed, trying array buffer:', err);
          workbook = xlsx.read(data, { type: 'array' });
        }
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Try to parse with different options
        let json;
        try {
          // First try with headers
          json = xlsx.utils.sheet_to_json(worksheet, { 
            header: 'A',
            defval: '',
            raw: false
          });
          
          // If the first row looks like headers, reparse with them
          if (json.length > 0) {
            const firstRow = json[0];
            const hasHeaderRow = Object.values(firstRow).some(val => 
              typeof val === 'string' && 
              (val.toLowerCase().includes('name') || 
               val.toLowerCase().includes('quantity') || 
               val.toLowerCase().includes('amount'))
            );
            
            if (hasHeaderRow) {
              json = xlsx.utils.sheet_to_json(worksheet, {
                defval: '',
                raw: false
              });
            }
          }
        } catch (err) {
          console.log('Standard parsing failed, trying raw parse:', err);
          json = xlsx.utils.sheet_to_json(worksheet);
        }
        
        // If we still don't have data, try one more approach
        if (!json || json.length === 0) {
          const range = xlsx.utils.decode_range(worksheet['!ref']);
          json = [];
          
          // Create headers based on column letters
          const headers = [];
          for (let C = range.s.c; C <= range.e.c; ++C) {
            headers.push(xlsx.utils.encode_col(C));
          }
          
          // Get data from each row
          for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const row = {};
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cell_address = {c: C, r: R};
              const cell_ref = xlsx.utils.encode_cell(cell_address);
              const cell = worksheet[cell_ref];
              row[headers[C - range.s.c]] = cell ? cell.v : '';
            }
            json.push(row);
          }
        }
        
        resolve(json);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    // Try different read methods
    try {
      reader.readAsBinaryString(file);
    } catch (err) {
      console.log('Binary read failed, trying as array buffer:', err);
      reader.readAsArrayBuffer(file);
    }
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
