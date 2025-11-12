// src/MLPredictions.js
import React, { useState, useEffect } from "react";

const ML_BACKEND = "http://localhost:5000";
const NODEJS_BACKEND = "http://localhost:5001";

function MLPredictions({ user }) {
  const [modelStatus, setModelStatus] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // NEW: Outlet selection
  const [availableOutlets, setAvailableOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(user.email);
  const [loadingOutlets, setLoadingOutlets] = useState(true);

  useEffect(() => {
    checkModelStatus();
    fetchAvailableOutlets();
  }, []);

  const fetchAvailableOutlets = async () => {
    setLoadingOutlets(true);
    try {
      const response = await fetch(`${NODEJS_BACKEND}/get-stock`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        // Extract unique outlets
        const outlets = [...new Set(data.data.map(item => item.outlet))];
        setAvailableOutlets(outlets);
        
        // Set first outlet as default if admin has no data
        if (outlets.length > 0 && !outlets.includes(user.email)) {
          setSelectedOutlet(outlets[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch outlets:", err);
    } finally {
      setLoadingOutlets(false);
    }
  };

  const checkModelStatus = async () => {
    try {
      const response = await fetch(`${ML_BACKEND}/ml/status`);
      const data = await response.json();
      setModelStatus(data);
      setError(null);
    } catch (err) {
      console.error("Failed to connect to ML backend:", err);
      setError("Failed to connect to ML backend");
    }
  };

  const trainModel = async () => {
    setIsTraining(true);
    setError(null);
    
    try {
      const response = await fetch(`${ML_BACKEND}/ml/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("✅ Model trained successfully!\n\n" + 
              `Accuracy: ${data.metrics?.accuracy || 'N/A'}%\n` +
              `Training samples: ${data.metrics?.training_samples || 'N/A'}`);
        checkModelStatus();
      } else {
        setError(data.error || "Training failed");
      }
    } catch (err) {
      console.error("Training error:", err);
      setError("Failed to train model. Check console for details.");
    } finally {
      setIsTraining(false);
    }
  };

  const getPredictions = async () => {
    if (!selectedOutlet) {
      setError("Please select an outlet");
      return;
    }

    setLoading(true);
    setError(null);
    setPredictions([]);
    
    try {
      const response = await fetch(`${ML_BACKEND}/ml/predict-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outlet: selectedOutlet }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPredictions(data.predictions || []);
        if (data.predictions.length === 0) {
          setError("No predictions available for this outlet");
        }
      } else {
        setError(data.error || "Prediction failed");
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Failed to get predictions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={header}>
        <h2 style={title}>🧠 AI Stock Predictions</h2>
        <p style={subtitle}>
          Machine Learning powered predictions for optimal stock ordering
        </p>
      </div>

      {error && (
        <div style={errorBox}>
          ❌ {error}
        </div>
      )}

      {/* Outlet Selector */}
      <div style={card}>
        <h3 style={cardTitle}>📍 Select Outlet</h3>
        {loadingOutlets ? (
          <p style={statusText}>Loading outlets...</p>
        ) : availableOutlets.length === 0 ? (
          <div style={warningBox}>
            ⚠️ No stock data found. Add stock records first.
          </div>
        ) : (
          <div>
            <select 
              value={selectedOutlet} 
              onChange={(e) => setSelectedOutlet(e.target.value)}
              style={outletSelect}
            >
              {availableOutlets.map((outlet) => (
                <option key={outlet} value={outlet}>
                  {outlet}
                </option>
              ))}
            </select>
            <p style={helperText}>
              {availableOutlets.length} outlet(s) available
            </p>
          </div>
        )}
      </div>

      {/* Model Status */}
      <div style={card}>
        <h3 style={cardTitle}>🤖 Model Status</h3>
        {modelStatus ? (
          <div>
            <p style={statusText}>
              {modelStatus.model_trained 
                ? "✅ Model is trained and ready" 
                : "⚠️ Model not trained yet - Train to get predictions"}
            </p>
          </div>
        ) : (
          <p style={statusText}>Loading status...</p>
        )}

        <div style={buttonGroup}>
          <button
            onClick={trainModel}
            disabled={isTraining}
            style={isTraining ? {...trainButton, opacity: 0.6, cursor: 'not-allowed'} : trainButton}
          >
            {isTraining ? "🔄 Training..." : "🎓 Train Model"}
          </button>

          <button
            onClick={getPredictions}
            disabled={loading || !modelStatus?.model_trained || !selectedOutlet}
            style={loading || !modelStatus?.model_trained || !selectedOutlet 
              ? {...predictButton, opacity: 0.6, cursor: 'not-allowed'} 
              : predictButton}
          >
            {loading ? "⏳ Loading..." : "📊 Get Predictions"}
          </button>
        </div>
      </div>

      {/* Predictions Results */}
      {predictions.length > 0 && (
        <div style={card}>
          <h3 style={cardTitle}>📈 Predictions for {selectedOutlet}</h3>
          <div style={tableContainer}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Item</th>
                  <th style={th}>Current Baki</th>
                  <th style={th}>Predicted Order</th>
                  <th style={th}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, idx) => (
                  <tr key={idx} style={tr}>
                    <td style={td}>
                      <strong>{pred.item}</strong>
                    </td>
                    <td style={td}>
                      <span style={bakiBadge}>
                        {pred.current_baki} units
                      </span>
                    </td>
                    <td style={td}>
                      <span style={predictionBadge}>
                        📦 {pred.prediction} units
                      </span>
                    </td>
                    <td style={td}>
                      <span style={confidenceBadge}>
                        {pred.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={summaryBox}>
            <p>
              💡 <strong>Tip:</strong> These predictions are based on historical patterns. 
              Review and adjust based on your business needs.
            </p>
          </div>
        </div>
      )}

      {/* No Predictions Yet */}
      {predictions.length === 0 && !loading && !error && modelStatus?.model_trained && (
        <div style={emptyState}>
          <span style={emptyIcon}>📊</span>
          <h3>Ready to Predict</h3>
          <p>Select an outlet above and click "Get Predictions"</p>
        </div>
      )}

      {/* Not Trained State */}
      {!modelStatus?.model_trained && !loading && (
        <div style={emptyState}>
          <span style={emptyIcon}>🎓</span>
          <h3>Model Not Trained</h3>
          <p>Train the model first to enable predictions</p>
        </div>
      )}
    </div>
  );
}

/* ========== STYLES ========== */
const container = {
  padding: "20px",
};

const header = {
  marginBottom: "30px",
};

const title = {
  margin: "0 0 10px 0",
  fontSize: "28px",
  color: "#2c3e50",
};

const subtitle = {
  margin: 0,
  fontSize: "14px",
  color: "#7f8c8d",
};

const errorBox = {
  background: "#ffebee",
  color: "#c62828",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "20px",
  border: "1px solid #ef5350",
  fontWeight: "500",
};

const warningBox = {
  background: "#fff3cd",
  color: "#856404",
  padding: "15px",
  borderRadius: "8px",
  border: "1px solid #ffc107",
};

const card = {
  background: "white",
  borderRadius: "12px",
  padding: "25px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const cardTitle = {
  margin: "0 0 20px 0",
  fontSize: "18px",
  color: "#2c3e50",
  fontWeight: "600",
};

const outletSelect = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "15px",
  border: "2px solid #e0e0e0",
  borderRadius: "8px",
  backgroundColor: "white",
  cursor: "pointer",
  fontFamily: "Poppins, sans-serif",
  color: "#2c3e50",
  transition: "all 0.2s",
  outline: "none",
};

const helperText = {
  margin: "10px 0 0 0",
  fontSize: "13px",
  color: "#7f8c8d",
};

const statusText = {
  fontSize: "14px",
  color: "#7f8c8d",
  marginBottom: "20px",
};

const buttonGroup = {
  display: "flex",
  gap: "15px",
  flexWrap: "wrap",
};

const trainButton = {
  flex: 1,
  minWidth: "200px",
  background: "#667eea",
  color: "white",
  border: "none",
  padding: "14px 24px",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
};

const predictButton = {
  flex: 1,
  minWidth: "200px",
  background: "#4caf50",
  color: "white",
  border: "none",
  padding: "14px 24px",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
};

const tableContainer = {
  overflowX: "auto",
  marginBottom: "20px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: "14px 12px",
  textAlign: "left",
  borderBottom: "2px solid #ecf0f1",
  fontSize: "13px",
  fontWeight: "600",
  color: "#7f8c8d",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tr = {
  borderBottom: "1px solid #ecf0f1",
  transition: "background 0.2s",
};

const td = {
  padding: "16px 12px",
  fontSize: "14px",
  color: "#2c3e50",
};

const bakiBadge = {
  background: "#e3f2fd",
  color: "#1976d2",
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "600",
};

const predictionBadge = {
  background: "#e8f5e9",
  color: "#2e7d32",
  padding: "8px 16px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "700",
};

const confidenceBadge = {
  background: "#fff3e0",
  color: "#e65100",
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "600",
};

const summaryBox = {
  background: "#f0f7ff",
  padding: "15px",
  borderRadius: "8px",
  borderLeft: "4px solid #2196f3",
};

const emptyState = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#95a5a6",
};

const emptyIcon = {
  fontSize: "64px",
  display: "block",
  marginBottom: "20px",
};

export default MLPredictions;