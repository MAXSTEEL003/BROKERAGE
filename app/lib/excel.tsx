// This file will only be imported on the client side
import React from 'react';
import { read, utils } from 'xlsx';

// Create a utility function
export const processFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Create a React component that doesn't render anything but exposes the utility
const ExcelComponent = () => {
  return null; // This component doesn't render anything
};

// Attach the utility as a static method
ExcelComponent.processFile = processFile;

export default ExcelComponent;