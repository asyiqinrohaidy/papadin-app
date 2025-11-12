# papadin-ai/lstm_predictor.py
"""
LSTM-based Deep Learning Model for Stock Prediction
Uses PyTorch to predict optimal order quantities based on historical patterns
"""

import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle
import os

class LSTMStockPredictor(nn.Module):
    """
    LSTM Neural Network for Time-Series Stock Prediction
    
    Architecture:
    - LSTM Layer 1: 128 units with dropout
    - LSTM Layer 2: 64 units with dropout  
    - Dense Layer: 32 units with ReLU
    - Output: Single value (predicted order)
    """
    
    def __init__(self, input_size, hidden_size_1=128, hidden_size_2=64, dropout=0.3):
        super(LSTMStockPredictor, self).__init__()
        
        self.lstm1 = nn.LSTM(input_size, hidden_size_1, batch_first=True)
        self.lstm2 = nn.LSTM(hidden_size_1, hidden_size_2, batch_first=True)
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
        self.fc1 = nn.Linear(hidden_size_2, 32)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(32, 1)
        
    def forward(self, x):
        lstm1_out, _ = self.lstm1(x)
        lstm1_out = self.dropout1(lstm1_out)
        lstm2_out, _ = self.lstm2(lstm1_out)
        lstm2_out = self.dropout2(lstm2_out)
        last_output = lstm2_out[:, -1, :]
        out = self.fc1(last_output)
        out = self.relu(out)
        out = self.fc2(out)
        return out


class LSTMTrainer:
    def __init__(self, sequence_length=14):
        self.sequence_length = sequence_length
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.scaler_X = StandardScaler()
        self.scaler_y = StandardScaler()
        self.feature_columns = []
        print(f"🖥️  Using device: {self.device}")
        
    def prepare_data(self, stock_data):
        """Engineer features from raw stock data"""
        df = pd.DataFrame(stock_data)
        df['tarikh'] = pd.to_datetime(df['tarikh'])
        
        for col in ['stockIn', 'baki', 'order']:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        df = df.sort_values(['outlet', 'item', 'tarikh'])
        
        # Feature engineering
        features = []
        for (outlet, item), group in df.groupby(['outlet', 'item']):
            group = group.copy()
            group['day_of_week'] = group['tarikh'].dt.dayofweek
            group['is_weekend'] = (group['day_of_week'] >= 5).astype(int)
            
            # Lag features
            for lag in [1, 3, 7]:
                group[f'order_lag_{lag}'] = group['order'].shift(lag)
                group[f'baki_lag_{lag}'] = group['baki'].shift(lag)
            
            # Rolling stats
            for window in [3, 7]:
                group[f'order_mean_{window}'] = group['order'].rolling(window, min_periods=1).mean()
                group[f'baki_mean_{window}'] = group['baki'].rolling(window, min_periods=1).mean()
            
            features.append(group)
        
        df_featured = pd.concat(features, ignore_index=True).fillna(0)
        
        self.feature_columns = [
            'stockIn', 'baki', 'day_of_week', 'is_weekend',
            'order_lag_1', 'order_lag_3', 'order_lag_7',
            'baki_lag_1', 'baki_lag_3', 'baki_lag_7',
            'order_mean_3', 'order_mean_7',
            'baki_mean_3', 'baki_mean_7'
        ]
        
        return df_featured
    
    def create_sequences(self, data):
        """Convert to sequences for LSTM"""
        sequences, targets = [], []
        
        for (outlet, item), group in data.groupby(['outlet', 'item']):
            group = group.sort_values('tarikh')
            if len(group) < self.sequence_length + 1:
                continue
            
            for i in range(len(group) - self.sequence_length):
                seq = group.iloc[i:i+self.sequence_length][self.feature_columns].values
                target = group.iloc[i+self.sequence_length]['order']
                sequences.append(seq)
                targets.append(target)
        
        return np.array(sequences), np.array(targets)
    
    def train(self, stock_data, epochs=50, batch_size=32, learning_rate=0.001):
        """Train the LSTM model"""
        print("🚀 Starting LSTM training...")
        
        df = self.prepare_data(stock_data)
        X_seq, y = self.create_sequences(df)
        
        if len(X_seq) < 50:
            raise ValueError(f"Need at least 50 sequences, got {len(X_seq)}")
        
        print(f"📊 Created {len(X_seq)} sequences")
        
        # Split and scale
        X_train, X_test, y_train, y_test = train_test_split(
            X_seq, y, test_size=0.2, random_state=42, shuffle=False
        )
        
        X_train_flat = X_train.reshape(-1, X_train.shape[-1])
        X_test_flat = X_test.reshape(-1, X_test.shape[-1])
        
        X_train_scaled = self.scaler_X.fit_transform(X_train_flat).reshape(X_train.shape)
        X_test_scaled = self.scaler_X.transform(X_test_flat).reshape(X_test.shape)
        
        y_train_scaled = self.scaler_y.fit_transform(y_train.reshape(-1, 1)).flatten()
        y_test_scaled = self.scaler_y.transform(y_test.reshape(-1, 1)).flatten()
        
        # To tensors
        X_train_t = torch.FloatTensor(X_train_scaled).to(self.device)
        y_train_t = torch.FloatTensor(y_train_scaled).to(self.device)
        X_test_t = torch.FloatTensor(X_test_scaled).to(self.device)
        y_test_t = torch.FloatTensor(y_test_scaled).to(self.device)
        
        # Initialize model
        self.model = LSTMStockPredictor(input_size=X_train.shape[2]).to(self.device)
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        
        # Training loop
        print(f"\n🏋️  Training for {epochs} epochs...")
        for epoch in range(epochs):
            self.model.train()
            for i in range(0, len(X_train_t), batch_size):
                batch_X = X_train_t[i:i+batch_size]
                batch_y = y_train_t[i:i+batch_size]
                
                outputs = self.model(batch_X).squeeze()
                loss = criterion(outputs, batch_y)
                
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
            
            if (epoch + 1) % 10 == 0:
                self.model.eval()
                with torch.no_grad():
                    test_pred = self.model(X_test_t).squeeze()
                    test_loss = criterion(test_pred, y_test_t).item()
                print(f"Epoch [{epoch+1}/{epochs}] - Test Loss: {test_loss:.4f}")
        
        # Final metrics
        self.model.eval()
        with torch.no_grad():
            test_pred_scaled = self.model(X_test_t).squeeze().cpu().numpy()
            test_pred = self.scaler_y.inverse_transform(test_pred_scaled.reshape(-1, 1)).flatten()
        
        mae = np.mean(np.abs(y_test - test_pred))
        rmse = np.sqrt(np.mean((y_test - test_pred) ** 2))
        r2 = 1 - (np.sum((y_test - test_pred) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2))
        
        print(f"\n✅ Training Complete!")
        print(f"📈 MAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.4f}")
        
        self.save_model()
        
        return {'mae': float(mae), 'rmse': float(rmse), 'r2': float(r2),
                'train_samples': len(X_train), 'test_samples': len(X_test)}
    
    def predict(self, recent_data):
        """Predict next order quantity"""
        if self.model is None:
            self.load_model()
        
        self.model.eval()
        sequence = recent_data[self.feature_columns].values[-self.sequence_length:]
        sequence_scaled = self.scaler_X.transform(sequence.reshape(-1, sequence.shape[-1])).reshape(1, *sequence.shape)
        sequence_tensor = torch.FloatTensor(sequence_scaled).to(self.device)
        
        with torch.no_grad():
            pred_scaled = self.model(sequence_tensor).squeeze().cpu().numpy()
            prediction = self.scaler_y.inverse_transform([[pred_scaled]])[0][0]
        
        return max(0, round(prediction))
    
    def save_model(self):
        os.makedirs("models/lstm", exist_ok=True)
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'feature_columns': self.feature_columns,
            'sequence_length': self.sequence_length,
            'input_size': self.model.lstm1.input_size
        }, "models/lstm/lstm_model.pth")
        
        with open("models/lstm/scalers.pkl", 'wb') as f:
            pickle.dump({'scaler_X': self.scaler_X, 'scaler_y': self.scaler_y}, f)
        
        print("💾 LSTM model saved!")
    
    def load_model(self):
        checkpoint = torch.load("models/lstm/lstm_model.pth", map_location=self.device)
        self.feature_columns = checkpoint['feature_columns']
        self.sequence_length = checkpoint['sequence_length']
        self.model = LSTMStockPredictor(checkpoint['input_size']).to(self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()
        
        with open("models/lstm/scalers.pkl", 'rb') as f:
            scalers = pickle.load(f)
            self.scaler_X = scalers['scaler_X']
            self.scaler_y = scalers['scaler_y']
        
        print("✅ LSTM model loaded!")
