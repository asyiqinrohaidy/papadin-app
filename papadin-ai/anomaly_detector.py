# papadin-ai/anomaly_detector.py
"""
Anomaly Detection - Detects unusual stock patterns
Uses Isolation Forest (unsupervised ML)
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pickle
import os

class StockAnomalyDetector:
    def __init__(self, contamination=0.1):
        self.contamination = contamination
        self.model = IsolationForest(contamination=contamination, random_state=42)
        self.scaler = StandardScaler()
        self.features = ['order', 'baki', 'stockIn', 'usage_rate', 'stock_loss_pct']
    
    def prepare_features(self, stock_data):
        """Engineer features"""
        df = pd.DataFrame(stock_data)
        df['tarikh'] = pd.to_datetime(df['tarikh'])
        for col in ['stockIn', 'baki', 'order']:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        df = df.sort_values(['outlet', 'item', 'tarikh'])
        
        # Calculate features
        df['usage_rate'] = (df['stockIn'] - df['baki']) / (df['stockIn'] + 1)
        df['stock_loss_pct'] = ((df['stockIn'].shift(1) + df['baki'].shift(1) - df['baki'] - df['order']) / (df['stockIn'].shift(1) + 1) * 100).fillna(0)
        
        return df
    
    def train(self, stock_data):
        """Train detector"""
        print("🔍 Training anomaly detector...")
        df = self.prepare_features(stock_data)
        X = self.scaler.fit_transform(df[self.features])
        predictions = self.model.fit_predict(X)
        
        n_anomalies = sum(predictions == -1)
        print(f"✅ Found {n_anomalies} anomalies")
        
        self.save_model()
        return {'success': True, 'anomalies': int(n_anomalies)}
    
    def detect(self, stock_data):
        """Detect anomalies"""
        df = self.prepare_features(stock_data)
        X = self.scaler.transform(df[self.features])
        predictions = self.model.predict(X)
        
        df['is_anomaly'] = predictions == -1
        anomalies = df[df['is_anomaly']][['tarikh', 'outlet', 'item', 'order', 'baki']]
        
        return {'success': True, 'anomalies': anomalies.to_dict('records')}
    
    def save_model(self):
        os.makedirs("models/anomaly", exist_ok=True)
        with open("models/anomaly/detector.pkl", 'wb') as f:
            pickle.dump({'model': self.model, 'scaler': self.scaler}, f)
    
    def load_model(self):
        with open("models/anomaly/detector.pkl", 'rb') as f:
            data = pickle.load(f)
            self.model, self.scaler = data['model'], data['scaler']
