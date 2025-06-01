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
        let workbook;
        
        // Try different read options to handle various Excel formats
        try {
          workbook = xlsx.read(data, { type: 'binary' });
        } catch (err) {
          console.log('Binary read failed, trying array buffer:', err);
          try {
            workbook = xlsx.read(data, { type: 'array' });
          } catch (err2) {
            console.log('Array buffer read failed, trying base64:', err2);
            const base64 = btoa(
              new Uint8Array(data)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            workbook = xlsx.read(base64, { type: 'base64' });
          }
        }
        
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Invalid Excel file format or empty workbook');
        }
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          throw new Error('Excel sheet is empty or invalid');
        }
        
        // Try to parse with different options
        let json;
        
        // First try with default options
        try {
          json = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
          
          // If we got data, return it
          if (json && json.length > 0) {
            resolve(json);
            return;
          }
        } catch (err) {
          console.log('Default parsing failed:', err);
        }
        
        // Try with header row
        try {
          json = xlsx.utils.sheet_to_json(worksheet, { 
            header: 'A',
            defval: '',
            raw: false
          });
          
          // If we got data, check if first row looks like headers
          if (json && json.length > 0) {
            const firstRow = json[0];
            const hasHeaderRow = Object.values(firstRow).some(val => 
              typeof val === 'string' && 
              (val.toLowerCase().includes('name') || 
               val.toLowerCase().includes('quantity') || 
               val.toLowerCase().includes('amount'))
            );
            
            if (hasHeaderRow) {
              // Reparse with headers
              json = xlsx.utils.sheet_to_json(worksheet, {
                defval: '',
                raw: false
              });
            }
            
            resolve(json);
            return;
          }
        } catch (err) {
          console.log('Header parsing failed:', err);
        }
        
        // Last resort: manual extraction
        try {
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
          
          resolve(json);
          return;
        } catch (err) {
          console.log('Manual extraction failed:', err);
        }
        
        // If we got here, all parsing methods failed
        throw new Error('Failed to extract data from Excel file');
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Failed to read the Excel file'));
    };
    
    // Try different read methods
    try {
      reader.readAsBinaryString(file);
    } catch (err) {
      console.log('Binary read failed, trying as array buffer:', err);
      try {
        reader.readAsArrayBuffer(file);
      } catch (err2) {
        console.error('All read methods failed:', err2);
        reject(new Error('This file format is not supported'));
      }
    }
  });
}

// Function to export data to Excel
export async function exportToExcel(data, sheetName = 'Sheet1', fileName = 'export.xlsx') {
  if (!isBrowser) return false;
  
  const xlsx = await getXlsx();
  if (!xlsx) return false;
  
  try {
    // Ensure data is in the correct format
    const safeData = data.map(row => {
      const safeRow = {};
      Object.keys(row).forEach(key => {
        // Convert null/undefined to empty string
        safeRow[key] = row[key] === null || row[key] === undefined ? '' : row[key];
      });
      return safeRow;
    });
    
    const worksheet = xlsx.utils.json_to_sheet(safeData);
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

