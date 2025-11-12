// src/AnomalyDetection.js
import React, { useState } from 'react';

const ML_BACKEND = 'http://localhost:5000';

function AnomalyDetection() {
  const [training, setTraining] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const trainDetector = async () => {
    setTraining(true);
    setError(null);

    try {
      const response = await fetch(`${ML_BACKEND}/anomaly/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Anomaly detector trained!\n\nFound ${data.details.anomalies} anomalies out of ${data.details.total_records} records`);
        setStats(data.details);
        // Auto-detect after training
        detectAnomalies();
      } else {
        setError(data.error || 'Training failed');
      }
    } catch (err) {
      setError('Failed to train detector. Make sure Python backend is running on port 5000.');
    } finally {
      setTraining(false);
    }
  };

  const detectAnomalies = async () => {
    setDetecting(true);
    setError(null);

    try {
      const response = await fetch(`${ML_BACKEND}/anomaly/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setAnomalies(data.anomalies || []);
      } else {
        setError(data.error || 'Detection failed');
      }
    } catch (err) {
      setError('Failed to detect anomalies. Make sure Python backend is running.');
    } finally {
      setDetecting(false);
    }
  };

  const getSeverityColor = (score) => {
    // More negative = more anomalous
    if (score < -0.3) return '#e74c3c'; // High severity - Red
    if (score < -0.1) return '#f39c12'; // Medium severity - Orange
    return '#95a5a6'; // Low severity - Gray
  };

  const getSeverityLabel = (score) => {
    if (score < -0.3) return '🔴 High Risk';
    if (score < -0.1) return '🟡 Medium Risk';
    return '🟢 Low Risk';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔍 Anomaly Detection</h2>
        <p style={styles.subtitle}>
          Detect unusual patterns that may indicate theft, waste, or data errors
        </p>
      </div>

      {error && <div style={styles.errorBox}>❌ {error}</div>}

      {/* Control Panel */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🎛️ Control Panel</h3>
        <p style={styles.helpText}>
          Train the detector to learn normal patterns from your data, then detect anomalies.
        </p>

        <div style={styles.buttonGroup}>
          <button
            onClick={trainDetector}
            disabled={training}
            style={training ? { ...styles.trainBtn, opacity: 0.6, cursor: 'not-allowed' } : styles.trainBtn}
          >
            {training ? '🔄 Training...' : '🎓 Train Detector'}
          </button>

          <button
            onClick={detectAnomalies}
            disabled={detecting}
            style={detecting ? { ...styles.detectBtn, opacity: 0.6, cursor: 'not-allowed' } : styles.detectBtn}
          >
            {detecting ? '⏳ Detecting...' : '🔍 Detect Anomalies'}
          </button>
        </div>

        {stats && (
          <div style={styles.statsBox}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Records:</span>
              <span style={styles.statValue}>{stats.total_records || 'N/A'}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Anomalies Found:</span>
              <span style={styles.statValue}>{stats.anomalies || 'N/A'}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Anomaly Rate:</span>
              <span style={styles.statValue}>
                {stats.anomaly_rate ? `${stats.anomaly_rate.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Anomalies List */}
      {anomalies.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            ⚠️ Detected Anomalies ({anomalies.length})
          </h3>
          <p style={styles.helpText}>
            These records show unusual patterns compared to normal behavior
          </p>

          <div style={styles.anomalyGrid}>
            {anomalies.map((anomaly, idx) => (
              <div key={idx} style={styles.anomalyCard}>
                <div style={styles.anomalyHeader}>
                  <div>
                    <span style={styles.anomalyItem}>{anomaly.item}</span>
                    <span style={styles.anomalyOutlet}>{anomaly.outlet}</span>
                  </div>
                  <span
                    style={{
                      ...styles.severityBadge,
                      background: getSeverityColor(anomaly.anomaly_score),
                    }}
                  >
                    {getSeverityLabel(anomaly.anomaly_score)}
                  </span>
                </div>

                <div style={styles.anomalyDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Date:</span>
                    <span style={styles.detailValue}>{anomaly.tarikh}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Stock In:</span>
                    <span style={styles.detailValue}>{anomaly.stockIn} units</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Order:</span>
                    <span style={styles.detailValue}>{anomaly.order} units</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Remaining (Baki):</span>
                    <span style={styles.detailValue}>{anomaly.baki} units</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Anomaly Score:</span>
                    <span style={styles.detailValue}>
                      {anomaly.anomaly_score?.toFixed(3) || 'N/A'}
                    </span>
                  </div>
                </div>

                {anomaly.anomaly_type && (
                  <div style={styles.typeTag}>{anomaly.anomaly_type}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Anomalies */}
      {anomalies.length === 0 && !detecting && !error && stats && (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>✅</span>
          <h3>No Anomalies Detected</h3>
          <p>All stock records appear normal. Great job!</p>
        </div>
      )}

      {/* Info Card */}
      <div style={styles.infoCard}>
        <h4 style={styles.infoTitle}>💡 How Anomaly Detection Works</h4>
        <ul style={styles.infoList}>
          <li>
            <strong>Isolation Forest Algorithm:</strong> Unsupervised ML that learns normal patterns
          </li>
          <li>
            <strong>Anomaly Scores:</strong> Lower (more negative) scores indicate higher anomaly severity
          </li>
          <li>
            <strong>Detection Rate:</strong> Typically finds 5-10% anomalies in real-world data
          </li>
          <li>
            <strong>Use Cases:</strong> Catch theft, waste, data errors, and unusual consumption patterns
          </li>
        </ul>

        <div style={styles.examplesBox}>
          <strong>🎯 What It Detects:</strong>
          <ul style={styles.examplesList}>
            <li>🚨 Stock disappearing without corresponding orders</li>
            <li>📉 Sudden unexplained drops in inventory</li>
            <li>📈 Unusual order spikes that don't match patterns</li>
            <li>⚠️ Inconsistent stock levels across time</li>
            <li>🔢 Potential data entry errors</li>
          </ul>
        </div>

        <div style={styles.techBox}>
          <strong>🔧 Technical Details:</strong>
          <ul style={styles.techList}>
            <li>Algorithm: Isolation Forest (scikit-learn)</li>
            <li>Contamination rate: 10% (adjustable)</li>
            <li>Features: stockIn, order, baki, time-based patterns</li>
            <li>Training: Requires 30+ records for accuracy</li>
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
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: { marginBottom: '30px' },
  title: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    color: '#2c3e50',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#7f8c8d',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    color: '#2c3e50',
    fontWeight: '600',
  },
  helpText: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '20px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  trainBtn: {
    flex: 1,
    minWidth: '200px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  detectBtn: {
    flex: 1,
    minWidth: '200px',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statsBox: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2c3e50',
  },
  anomalyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '15px',
  },
  anomalyCard: {
    background: '#fff5f5',
    border: '1px solid #ffcccb',
    borderRadius: '8px',
    padding: '15px',
  },
  anomalyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  anomalyItem: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2c3e50',
    display: 'block',
  },
  anomalyOutlet: {
    fontSize: '12px',
    color: '#7f8c8d',
    display: 'block',
    marginTop: '3px',
  },
  severityBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
  },
  anomalyDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '10px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  detailLabel: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  typeTag: {
    background: '#3498db',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block',
    marginTop: '5px',
  },
  errorBox: {
    background: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ef5350',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#95a5a6',
    background: 'white',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  emptyIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px',
  },
  infoCard: {
    background: '#e8f5e9',
    borderRadius: '12px',
    padding: '20px',
    borderLeft: '4px solid #4caf50',
  },
  infoTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    color: '#2e7d32',
  },
  infoList: {
    margin: '0 0 15px 0',
    paddingLeft: '20px',
    color: '#555',
    lineHeight: '1.8',
  },
  examplesBox: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px',
    marginBottom: '15px',
  },
  examplesList: {
    margin: '10px 0 0 0',
    paddingLeft: '20px',
    color: '#555',
    lineHeight: '1.8',
  },
  techBox: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
  },
  techList: {
    margin: '10px 0 0 0',
    paddingLeft: '20px',
    color: '#555',
    lineHeight: '1.8',
  },
};

export default AnomalyDetection;