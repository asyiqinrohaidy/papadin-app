// src/ReceiptScanner.js
import React, { useState } from 'react';

const ML_BACKEND = 'http://localhost:5000';

function ReceiptScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanReceipt = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setScanning(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        // Send to backend
        const response = await fetch(`${ML_BACKEND}/cv/scan-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });

        const data = await response.json();

        if (data.success) {
          setResult(data);
        } else {
          setError(data.error || 'Scan failed');
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError('Failed to scan receipt. Check if Python backend is running on port 5000.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📸 Receipt Scanner</h2>
      <p style={styles.subtitle}>Upload a receipt image to automatically extract stock data</p>

      {/* Upload Area */}
      <div style={styles.uploadCard}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={styles.fileInput}
          id="receipt-upload"
        />
        <label htmlFor="receipt-upload" style={styles.uploadLabel}>
          {preview ? (
            <img src={preview} alt="Receipt" style={styles.previewImage} />
          ) : (
            <div style={styles.uploadPlaceholder}>
              <span style={{ fontSize: '64px' }}>📷</span>
              <p>Click to upload receipt image</p>
              <p style={{ fontSize: '12px', color: '#7f8c8d' }}>
                Supports JPG, PNG (max 5MB)
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Scan Button */}
      {selectedFile && (
        <button
          onClick={scanReceipt}
          disabled={scanning}
          style={scanning ? { ...styles.scanButton, opacity: 0.6 } : styles.scanButton}
        >
          {scanning ? '🔄 Scanning...' : '🔍 Scan Receipt'}
        </button>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          ❌ {error}
        </div>
      )}

      {/* Results */}
      {result && result.success && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>✅ Scan Complete!</h3>
          <p style={styles.resultSubtitle}>Found {result.items_found} item(s)</p>

          {result.items && result.items.length > 0 ? (
            <div style={styles.itemsList}>
              {result.items.map((item, idx) => (
                <div key={idx} style={styles.itemCard}>
                  <div style={styles.itemHeader}>
                    <span style={styles.itemName}>{item.item}</span>
                    <span style={styles.confidenceBadge}>
                      {Math.round(item.confidence * 100)}% confident
                    </span>
                  </div>
                  <div style={styles.itemDetails}>
                    <span>Quantity: <strong>{item.quantity}</strong></span>
                  </div>
                  <div style={styles.itemRaw}>
                    Raw text: "{item.raw_text}"
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.noItemsBox}>
              ⚠️ No items detected. Try a clearer image.
            </div>
          )}

          {/* Raw Text */}
          {result.raw_text && (
            <details style={styles.rawTextDetails}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                📄 View Raw OCR Text
              </summary>
              <pre style={styles.rawTextPre}>{result.raw_text}</pre>
            </details>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={styles.instructionsCard}>
        <h4 style={styles.instructionsTitle}>💡 Tips for Best Results:</h4>
        <ul style={styles.instructionsList}>
          <li>Take photo in good lighting</li>
          <li>Ensure receipt is flat and readable</li>
          <li>Include item names and quantities clearly</li>
          <li>Avoid blurry or angled photos</li>
        </ul>
        
        <div style={styles.techInfo}>
          <strong>🔧 Technical Requirements:</strong>
          <ul style={styles.techList}>
            <li>Python backend must be running on port 5000</li>
            <li>Tesseract OCR must be installed</li>
            <li>OpenCV for image preprocessing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ========== STYLES ========== */
const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '30px',
  },
  uploadCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    display: 'block',
    cursor: 'pointer',
    textAlign: 'center',
  },
  uploadPlaceholder: {
    padding: '60px 20px',
    border: '2px dashed #bdc3c7',
    borderRadius: '8px',
    color: '#7f8c8d',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '8px',
    border: '2px solid #4caf50',
  },
  scanButton: {
    width: '100%',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  errorBox: {
    background: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ef5350',
  },
  resultCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  resultTitle: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    color: '#2c3e50',
  },
  resultSubtitle: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#7f8c8d',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  itemCard: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  itemName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2c3e50',
  },
  confidenceBadge: {
    background: '#4caf50',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  itemDetails: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
  },
  itemRaw: {
    fontSize: '12px',
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  noItemsBox: {
    background: '#fff3cd',
    color: '#856404',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ffc107',
    textAlign: 'center',
  },
  rawTextDetails: {
    marginTop: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  rawTextPre: {
    marginTop: '10px',
    padding: '10px',
    background: '#2c3e50',
    color: '#ecf0f1',
    borderRadius: '4px',
    fontSize: '12px',
    overflowX: 'auto',
  },
  instructionsCard: {
    background: '#e3f2fd',
    borderRadius: '12px',
    padding: '20px',
    borderLeft: '4px solid #2196f3',
  },
  instructionsTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    color: '#1976d2',
  },
  instructionsList: {
    margin: '0 0 20px 0',
    paddingLeft: '20px',
    color: '#555',
    lineHeight: '1.8',
  },
  techInfo: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px',
  },
  techList: {
    margin: '10px 0 0 0',
    paddingLeft: '20px',
    color: '#555',
    lineHeight: '1.8',
  },
};

export default ReceiptScanner;