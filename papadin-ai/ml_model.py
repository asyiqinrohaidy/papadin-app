# papadin-ai/ml_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import pickle
import os
from datetime import datetime, timedelta

class StockPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        self.model_path = "models/stock_predictor.pkl"
        self.encoders_path = "models/label_encoders.pkl"
        
    def prepare_data(self, stock_data):
        """
        Convert raw stock data to ML-ready format
        """
        df = pd.DataFrame(stock_data)
        
        # CRITICAL FIX: Convert numeric columns FIRST
        numeric_cols = ['stockIn', 'baki', 'order']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # Convert date to datetime
        df['tarikh'] = pd.to_datetime(df['tarikh'])
        
        # Extract time-based features
        df['day_of_week'] = df['tarikh'].dt.dayofweek  # 0=Monday, 6=Sunday
        df['day_of_month'] = df['tarikh'].dt.day
        df['month'] = df['tarikh'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Encode categorical features
        categorical_cols = ['outlet', 'item', 'unit']
        for col in categorical_cols:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df[col].astype(str))
            else:
                # Handle new values gracefully
                try:
                    df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col].astype(str))
                except ValueError:
                    # New category not seen during training
                    df[f'{col}_encoded'] = 0
        
        return df
    
    def create_features(self, df):
        """
        Create features for prediction
        """
        # Sort by outlet, item, and date
        df = df.sort_values(['outlet', 'item', 'tarikh'])
        
        # Create lag features (previous days' data)
        df['prev_order_1day'] = df.groupby(['outlet', 'item'])['order'].shift(1)
        df['prev_order_3day'] = df.groupby(['outlet', 'item'])['order'].shift(3)
        df['prev_order_7day'] = df.groupby(['outlet', 'item'])['order'].shift(7)
        
        # Rolling averages
        df['avg_order_7day'] = df.groupby(['outlet', 'item'])['order'].transform(
            lambda x: x.rolling(window=7, min_periods=1).mean()
        )
        df['avg_order_30day'] = df.groupby(['outlet', 'item'])['order'].transform(
            lambda x: x.rolling(window=30, min_periods=1).mean()
        )
        
        # Stock level features
        df['prev_baki'] = df.groupby(['outlet', 'item'])['baki'].shift(1)
        df['prev_stockIn'] = df.groupby(['outlet', 'item'])['stockIn'].shift(1)
        
        # Usage rate
        df['usage_rate'] = (df['stockIn'] - df['baki']) / (df['stockIn'] + 1)
        
        # Fill NaN values
        df = df.fillna(0)
        
        return df
    
    def train(self, stock_data):
        """
        Train the prediction model
        """
        print("🔄 Preparing data...")
        df = self.prepare_data(stock_data)
        df = self.create_features(df)
        
        # Select features for training
        self.feature_columns = [
            'outlet_encoded', 'item_encoded', 'unit_encoded',
            'day_of_week', 'day_of_month', 'month', 'is_weekend',
            'prev_order_1day', 'prev_order_3day', 'prev_order_7day',
            'avg_order_7day', 'avg_order_30day',
            'prev_baki', 'prev_stockIn', 'stockIn', 'baki',
            'usage_rate'
        ]
        
        # Remove rows with insufficient history
        df_train = df[df['prev_order_7day'] > 0].copy()
        
        if len(df_train) < 10:
            raise ValueError("Insufficient data for training. Need at least 10 records with history.")
        
        X = df_train[self.feature_columns]
        y = df_train['order']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print(f"📊 Training with {len(X_train)} samples...")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        # Calculate accuracy as percentage
        accuracy = max(0, (1 - mae / y_test.mean()) * 100) if y_test.mean() > 0 else 0
        
        print(f"\n✅ Model trained successfully!")
        print(f"📈 Performance Metrics:")
        print(f"   - Accuracy: {accuracy:.1f}%")
        print(f"   - MAE (Mean Absolute Error): {mae:.2f}")
        print(f"   - RMSE (Root Mean Squared Error): {rmse:.2f}")
        print(f"   - R² Score: {r2:.2f}")
        
        # Save model
        self.save_model()
        
        return {
            'accuracy': round(accuracy, 1),
            'mae': round(mae, 2),
            'rmse': round(rmse, 2),
            'r2': round(r2, 2),
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }
    
    def predict(self, outlet, item, current_data):
        """
        Predict next order quantity
        
        Args:
            outlet: outlet email
            item: item name
            current_data: dict with current stock info
        """
        if self.model is None:
            self.load_model()
        
        # CRITICAL FIX: Convert all numeric values to float
        def safe_float(value, default=0):
            try:
                return float(value)
            except (ValueError, TypeError):
                return default
        
        # Create feature dict with type conversion
        features = {
            'outlet': str(outlet),
            'item': str(item),
            'unit': str(current_data.get('unit', 'PCS')),
            'day_of_week': datetime.now().weekday(),
            'day_of_month': datetime.now().day,
            'month': datetime.now().month,
            'is_weekend': 1 if datetime.now().weekday() >= 5 else 0,
            'prev_order_1day': safe_float(current_data.get('prev_order_1day', 0)),
            'prev_order_3day': safe_float(current_data.get('prev_order_3day', 0)),
            'prev_order_7day': safe_float(current_data.get('prev_order_7day', 0)),
            'avg_order_7day': safe_float(current_data.get('avg_order_7day', 0)),
            'avg_order_30day': safe_float(current_data.get('avg_order_30day', 0)),
            'prev_baki': safe_float(current_data.get('prev_baki', 0)),
            'prev_stockIn': safe_float(current_data.get('prev_stockIn', 0)),
            'stockIn': safe_float(current_data.get('stockIn', 0)),
            'baki': safe_float(current_data.get('baki', 0)),
        }
        
        # Calculate usage rate
        features['usage_rate'] = (features['stockIn'] - features['baki']) / (features['stockIn'] + 1)
        
        # Encode categorical features
        for col in ['outlet', 'item', 'unit']:
            if col in self.label_encoders:
                try:
                    features[f'{col}_encoded'] = self.label_encoders[col].transform([features[col]])[0]
                except:
                    features[f'{col}_encoded'] = 0
            else:
                features[f'{col}_encoded'] = 0
        
        # Create feature vector
        X = pd.DataFrame([features])[self.feature_columns]
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        prediction = max(0, round(prediction))  # Ensure non-negative integer
        
        # Calculate confidence
        confidence = self._calculate_confidence(prediction, features)
        
        return {
            'item': item,
            'prediction': int(prediction),
            'confidence': int(confidence),
            'current_baki': int(features['baki']),
            'recommendation': self._generate_recommendation(prediction, features)
        }
    
    def _calculate_confidence(self, prediction, features):
        """
        Calculate confidence score based on data quality
        """
        confidence = 85  # Base confidence
        
        # Increase confidence if we have good historical data
        if features.get('avg_order_30day', 0) > 0:
            confidence += 10
        elif features.get('avg_order_7day', 0) > 0:
            confidence += 5
        
        # Reduce if prediction is very different from average
        avg = features.get('avg_order_7day', 0)
        if avg > 0:
            deviation = abs(prediction - avg) / avg
            if deviation > 0.5:
                confidence -= 15
            elif deviation > 0.3:
                confidence -= 10
        
        return max(60, min(95, confidence))
    
    def _generate_recommendation(self, prediction, features):
        """
        Generate human-readable recommendation
        """
        current_baki = features.get('baki', 0)
        
        if current_baki < prediction * 0.3:
            return f"⚠️ URGENT: Very low stock! Order {prediction} units immediately."
        elif current_baki < prediction * 0.6:
            return f"⚠️ Low stock. Recommend ordering {prediction} units soon."
        elif current_baki < prediction:
            return f"📦 Stock adequate. Consider ordering {prediction} units."
        elif current_baki > prediction * 2:
            return f"✅ Stock sufficient. Current level covers demand."
        else:
            return f"✅ Stock level good. Predicted order: {prediction} units."
    
    def save_model(self):
        """
        Save trained model and encoders
        """
        os.makedirs("models", exist_ok=True)
        
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'scaler': self.scaler
            }, f)
        
        with open(self.encoders_path, 'wb') as f:
            pickle.dump({
                'encoders': self.label_encoders,
                'feature_columns': self.feature_columns
            }, f)
        
        print(f"💾 Model saved to {self.model_path}")
    
    def load_model(self):
        """
        Load trained model and encoders
        """
        if not os.path.exists(self.model_path):
            raise FileNotFoundError("Model not found. Please train the model first.")
        
        with open(self.model_path, 'rb') as f:
            data = pickle.load(f)
            self.model = data['model']
            self.scaler = data['scaler']
        
        with open(self.encoders_path, 'rb') as f:
            data = pickle.load(f)
            self.label_encoders = data['encoders']
            self.feature_columns = data['feature_columns']
        
        print("✅ Model loaded successfully")


# Example usage and testing
if __name__ == "__main__":
    print("📊 Stock Predictor ML Model")
    print("=" * 50)
    print("\nThis module provides Random Forest predictions.")
    print("Import and use in app.py for predictions.")
    print("\nKey Features:")
    print("  - Random Forest Regressor")
    print("  - Time-series feature engineering")
    print("  - Confidence scoring")
    print("  - Type-safe predictions")