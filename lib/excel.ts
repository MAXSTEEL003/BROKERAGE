import { read, WorkBook } from 'xlsx';

export function handleFileUpload(file: File) {
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    const result = e.target?.result;
    if (!result) {
      console.error('FileReader result is null');
      return;
    }

    try {
      // 'result' can be ArrayBuffer or string depending on readAsArrayBuffer or readAsBinaryString
      // Here, assuming readAsArrayBuffer is used
      const data = new Uint8Array(result as ArrayBuffer);
      const workbook: WorkBook = read(data, { type: 'array' });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Now you can process the worksheet as needed
      console.log('Worksheet:', worksheet);
    } catch (error) {
      console.error('Error reading Excel file:', error);
    }
  };

  reader.onerror = (error) => {
    console.error('File reading error:', error);
  };

  reader.readAsArrayBuffer(file);
}
