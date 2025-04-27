// Basic NFC Reader Implementation for GOOD ENOUGH Authentication Demo
// To be used in a React component

import React, { useState, useEffect } from 'react';

const NFCReader = () => {
  const [nfcSupported, setNfcSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState(null);
  
  // Check if NFC is supported on load
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setError('NFC not supported on this device or browser. Try using Chrome on Android.');
    }
  }, []);
  
  // Function to start NFC reading
  const startScanning = async () => {
    if (!nfcSupported) return;
    
    setIsReading(true);
    setError(null);
    
    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      
      // Listen for NFC tags
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        console.log(`Serial Number: ${serialNumber}`);
        
        // Process NDEF message
        for (const record of message.records) {
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder(record.encoding);
            const text = textDecoder.decode(record.data);
            
            // Here we would normally make an API call to our authentication service
            // For demo purposes, we'll simulate with a timeout
            setTimeout(() => {
              authenticateProduct(serialNumber, text);
            }, 1000);
          }
        }
      });
      
    } catch (error) {
      console.error(`Error: ${error.message}`);
      setError(`Error scanning: ${error.message}`);
      setIsReading(false);
    }
  };
  
  // Function to authenticate the product (would connect to backend in full implementation)
  const authenticateProduct = (serialNumber, tagData) => {
    // This would be an API call in the real implementation
    // For demo purposes, we're using mock data
    
    // Sample product data matching a specific NFC tag serial number
    const mockProductData = {
      sku: 'CHI-HTee-BLK-L',
      name: 'GOOD ENOUGH Heavy Tee',
      color: 'Black',
      size: 'Large',
      region: 'Chicago',
      authenticated: true,
      productionDate: '2025-07-15',
      capsuleId: 'chi-summer-2025',
      imageUrl: '/assets/images/heavy-tee-black.jpg'
    };
    
    setProductData(mockProductData);
    setIsReading(false);
  };
  
  // Function to reset the reader
  const resetReader = () => {
    setProductData(null);
    setIsReading(false);
    setError(null);
  };
  
  return (
    <div className="nfc-reader-container">
      <h2 className="reader-title">GOOD ENOUGH™ Product Authentication</h2>
      
      {error && (
        <div className="error-message">
          {error}
          {!nfcSupported && (
            <p>Please use the QR Code scanner option instead.</p>
          )}
        </div>
      )}
      
      {!isReading && !productData && !error && (
        <button 
          className="scan-button" 
          onClick={startScanning}
          disabled={!nfcSupported}
        >
          TAP TO SCAN PRODUCT
        </button>
      )}
      
      {isReading && (
        <div className="scanning-indicator">
          <div className="spinner"></div>
          <p>Hold your phone near the NFC tag...</p>
        </div>
      )}
      
      {productData && (
        <div className="product-details">
          <div className={`authentication-badge ${productData.authenticated ? 'authentic' : 'fake'}`}>
            {productData.authenticated ? 'AUTHENTIC' : 'NOT VERIFIED'}
          </div>
          
          <h3>{productData.name}</h3>
          <div className="product-info">
            <p><strong>SKU:</strong> {productData.sku}</p>
            <p><strong>Color:</strong> {productData.color}</p>
            <p><strong>Size:</strong> {productData.size}</p>
            <p><strong>Region:</strong> {productData.region}</p>
            <p><strong>Capsule:</strong> {productData.capsuleId}</p>
            <p><strong>Production Date:</strong> {productData.productionDate}</p>
          </div>
          
          <button className="reset-button" onClick={resetReader}>
            SCAN ANOTHER PRODUCT
          </button>
        </div>
      )}
      
      {!nfcSupported && (
        <button className="qr-button">
          SCAN QR CODE INSTEAD
        </button>
      )}
    </div>
  );
};

export default NFCReader; 