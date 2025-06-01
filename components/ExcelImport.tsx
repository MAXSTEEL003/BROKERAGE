import dynamic from 'next/dynamic';
import { useState } from 'react';
import { isBrowser } from '../lib/utils/browserCheck';

// Dynamically import browser-dependent libraries
const ExcelProcessor = dynamic(() => import('../lib/excel'), { 
  ssr: false 
});

export default function ExcelImport() {
  const [file, setFile] = useState(null);
  
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  
  const handleImport = async () => {
    if (!file || !isBrowser) return;
    
    // Now it's safe to use the dynamically imported module
    const data = await ExcelProcessor.processFile(file);
    // Process data...
  };
  
  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleImport}>Import Excel</button>
    </div>
  );
}