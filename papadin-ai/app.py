# papadin-ai/app.py
"""
Advanced Papadin AI Backend with 5 AI/ML Features:
1. LSTM Deep Learning
2. Computer Vision Receipt Scanner
3. Fine-tuned NLP Chatbot (disabled)
4. Anomaly Detection
5. Recommendation Engine
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
import requests

# Import AI modules
from lstm_predictor import LSTMTrainer
from receipt_scanner import ReceiptScanner, AdvancedReceiptProcessor
# COMMENTED OUT - NLP Chatbot (optional feature)
# from finetuned_chatbot import FinetunedChatbot, HybridChatbot
from anomaly_detector import StockAnomalyDetector
from recommendation_engine import OrderRecommendationEngine
from ml_model import StockPredictor  # Original Random Forest model

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

# Initialize AI models
lstm_trainer = LSTMTrainer()
receipt_scanner = ReceiptScanner()
# COMMENTED OUT - NLP Chatbot (optional)
# finetuned_chatbot = FinetunedChatbot()
anomaly_detector = StockAnomalyDetector()
recommendation_engine = OrderRecommendationEngine()
rf_predictor = StockPredictor()  # Original model

NODEJS_BACKEND = "http://localhost:5001"

def get_stock_data():
    """Fetch stock data from Node.js backend"""
    try:
        response = requests.get(f"{NODEJS_BACKEND}/get-stock", timeout=5)
        if response.status_code == 200:
            return response.json().get('data', [])
        return []
    except Exception as e:
        print(f"Error fetching stock: {e}")
        return []

@app.route('/')
def home():
    return jsonify({
        "message": "🚀 Papadin AI Backend - Advanced Edition",
        "status": "online",
        "features": {
            "lstm_deep_learning": "✅",
            "receipt_scanner": "✅",
            "finetuned_nlp": "⚠️ (disabled)",
            "anomaly_detection": "✅",
            "recommendation_engine": "✅",
            "random_forest": "✅",
            "openai_gpt": "✅" if api_key else "❌"
        }
    })

# ========== ML STATUS & TRAINING (REQUIRED FOR FRONTEND) ==========

@app.route('/ml/status', methods=['GET'])
def ml_status():
    """Check if ML model is trained"""
    import os
    model_exists = os.path.exists("models/stock_predictor.pkl")
    return jsonify({
        "model_trained": model_exists,
        "message": "Model ready" if model_exists else "Train model first"
    })

@app.route('/ml/train', methods=['POST'])
def train_model():
    """Train the Random Forest model"""
    try:
        stock_data = get_stock_data()
        
        if len(stock_data) < 30:
            return jsonify({
                "success": False,
                "error": f"Need at least 30 records for training. Got {len(stock_data)}"
            }), 400
        
        metrics = rf_predictor.train(stock_data)
        
        return jsonify({
            "success": True,
            "message": "Model trained successfully!",
            "metrics": metrics
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/ml/predict-all', methods=['POST'])
def predict_all():
    """Get predictions for all items"""
    try:
        data = request.json
        outlet = data.get('outlet')
        
        stock_data = get_stock_data()
        
        # Filter outlet data and convert types
        outlet_data = []
        for item in stock_data:
            if item.get('outlet') == outlet:
                try:
                    item['stockIn'] = float(item.get('stockIn', 0))
                    item['baki'] = float(item.get('baki', 0))
                    item['order'] = float(item.get('order', 0))
                    outlet_data.append(item)
                except (ValueError, TypeError):
                    continue
        
        if not outlet_data:
            return jsonify({"success": False, "error": "No data for outlet"}), 404
        
        # Prepare data
        df = rf_predictor.prepare_data(outlet_data)
        df = rf_predictor.create_features(df)
        
        # Get unique items
        items = df['item'].unique()
        
        predictions = []
        for item_name in items:
            item_df = df[df['item'] == item_name].sort_values('tarikh')
            
            if len(item_df) > 0:
                # SIMPLEST FIX: Convert Series to dict directly
                latest_row = item_df.iloc[-1]
                latest_dict = latest_row.to_dict()  # ✅ This works!
                
                # Ensure all values are float
                for key in ['stockIn', 'baki', 'order', 'prev_order_1day', 
                           'prev_order_3day', 'prev_order_7day', 'avg_order_7day',
                           'avg_order_30day', 'prev_baki', 'prev_stockIn']:
                    if key in latest_dict:
                        latest_dict[key] = float(latest_dict[key])
                    else:
                        latest_dict[key] = 0.0
                
                # Ensure unit is string
                latest_dict['unit'] = str(latest_dict.get('unit', 'PCS'))
                
                # Get prediction
                result = rf_predictor.predict(outlet, item_name, latest_dict)
                predictions.append(result)
        
        return jsonify({
            "success": True,
            "predictions": predictions
        })
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ ERROR in predict_all:")
        print(error_trace)
        return jsonify({
            "success": False, 
            "error": str(e),
            "trace": error_trace
        }), 500

# ========== FEATURE 1: LSTM DEEP LEARNING ==========

@app.route('/ml/train-lstm', methods=['POST'])
def train_lstm():
    """Train LSTM deep learning model"""
    try:
        stock_data = get_stock_data()
        
        if len(stock_data) < 100:
            return jsonify({
                "success": False,
                "error": f"Need at least 100 records for LSTM. Got {len(stock_data)}"
            }), 400
        
        metrics = lstm_trainer.train(stock_data, epochs=50)
        
        return jsonify({
            "success": True,
            "message": "LSTM model trained!",
            "model_type": "Deep Learning - LSTM",
            "metrics": metrics
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/ml/predict-lstm', methods=['POST'])
def predict_lstm():
    """Get LSTM predictions"""
    try:
        data = request.json
        outlet = data.get('outlet')
        
        stock_data = get_stock_data()
        outlet_data = [item for item in stock_data if item.get('outlet') == outlet]
        
        if not outlet_data:
            return jsonify({"success": False, "error": "No data for outlet"}), 404
        
        # Get predictions for each item
        predictions = []
        for item_name in set(item['item'] for item in outlet_data):
            item_data = [d for d in outlet_data if d['item'] == item_name]
            item_data.sort(key=lambda x: x.get('tarikh', ''))
            
            if len(item_data) >= 14:
                recent_df = lstm_trainer.prepare_data(item_data)
                prediction = lstm_trainer.predict(recent_df)
                
                predictions.append({
                    'item': item_name,
                    'predicted_order': int(prediction),
                    'model': 'LSTM Deep Learning',
                    'confidence': 'High'
                })
        
        return jsonify({
            "success": True,
            "predictions": predictions,
            "model": "LSTM"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ========== FEATURE 2: COMPUTER VISION RECEIPT SCANNER ==========

@app.route('/cv/scan-receipt', methods=['POST'])
def scan_receipt():
    """Scan receipt image and extract stock data"""
    try:
        data = request.json
        image_base64 = data.get('image')
        
        if not image_base64:
            return jsonify({"success": False, "error": "No image provided"}), 400
        
        result = receipt_scanner.scan_receipt(image_base64, is_base64=True)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/cv/batch-scan', methods=['POST'])
def batch_scan():
    """Scan multiple receipts"""
    try:
        data = request.json
        images = data.get('images', [])
        
        processor = AdvancedReceiptProcessor()
        results = processor.process_batch(images)
        
        return jsonify({
            "success": True,
            "results": results,
            "total_processed": len(results)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ========== FEATURE 3: FINE-TUNED NLP CHATBOT (DISABLED) ==========
# Endpoints commented out because finetuned_chatbot is not initialized

# ========== FEATURE 4: ANOMALY DETECTION ==========

@app.route('/anomaly/train', methods=['POST'])
def train_anomaly():
    """Train anomaly detection model"""
    try:
        stock_data = get_stock_data()
        result = anomaly_detector.train(stock_data)
        
        return jsonify({
            "success": True,
            "message": "Anomaly detector trained!",
            "details": result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/anomaly/detect', methods=['POST'])
def detect_anomalies():
    """Detect anomalies in stock data"""
    try:
        stock_data = get_stock_data()
        result = anomaly_detector.detect(stock_data)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ========== FEATURE 5: RECOMMENDATION ENGINE ==========

@app.route('/recommend/train', methods=['POST'])
def train_recommendation():
    """Build recommendation engine"""
    try:
        stock_data = get_stock_data()
        result = recommendation_engine.train(stock_data)
        
        return jsonify({
            "success": True,
            "message": "Recommendation engine built!",
            "details": result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/recommend/get', methods=['POST'])
def get_recommendations():
    """Get ordering recommendations"""
    try:
        data = request.json
        outlet = data.get('outlet')
        item = data.get('item')
        current_baki = data.get('current_baki', 0)
        
        if item:
            result = recommendation_engine.get_recommendations(outlet, item, current_baki)
        else:
            result = recommendation_engine.get_all_recommendations(outlet)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ========== COMBINED ENDPOINTS ==========

@app.route('/ml/train-all', methods=['POST'])
def train_all_models():
    """Train all AI models at once"""
    try:
        stock_data = get_stock_data()
        results = {}
        
        # Train Random Forest (always)
        try:
            results['random_forest'] = rf_predictor.train(stock_data)
        except Exception as e:
            results['random_forest'] = {"error": str(e)}
        
        # Train LSTM if enough data
        if len(stock_data) >= 100:
            try:
                results['lstm'] = lstm_trainer.train(stock_data, epochs=30)
            except Exception as e:
                results['lstm'] = {"error": str(e)}
        
        # Train Anomaly Detector
        try:
            results['anomaly'] = anomaly_detector.train(stock_data)
        except Exception as e:
            results['anomaly'] = {"error": str(e)}
        
        # Train Recommendation Engine
        try:
            results['recommendation'] = recommendation_engine.train(stock_data)
        except Exception as e:
            results['recommendation'] = {"error": str(e)}
        
        return jsonify({
            "success": True,
            "message": "All models trained!",
            "results": results
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ========== CHAT ENDPOINT (OpenAI GPT) ==========

@app.route('/chat', methods=['POST'])
def chat():
    """Chat with OpenAI GPT"""
    data = request.json
    messages = data.get('messages', [])
    
    if not client:
        return jsonify({"success": False, "error": "OpenAI not configured"}), 500
    
    try:
        stock_data = get_stock_data()
        
        # Create context from stock data
        context = f"You are Papadin AI, an assistant for restaurant inventory management. Current stock records: {len(stock_data)}"
        
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": context}] + messages,
            temperature=0.7
        )
        
        return jsonify({
            "success": True,
            "reply": completion.choices[0].message.content
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    print("=" * 60)
    print("🚀 Papadin AI Backend - ADVANCED EDITION")
    print("=" * 60)
    print("\n🧠 AI Features Available:")
    print("  1. LSTM Deep Learning - Time-series predictions ✅")
    print("  2. Computer Vision - Receipt OCR scanning ✅")
    print("  3. Fine-tuned NLP - Custom chatbot ⚠️ (disabled)")
    print("  4. Anomaly Detection - Fraud/waste detection ✅")
    print("  5. Recommendation Engine - Smart ordering ✅")
    print("  6. Random Forest - Original ML model ✅")
    print("  7. OpenAI GPT - Advanced chat ✅")
    print("\n" + "=" * 60)
    print("\n📡 Key Endpoints:")
    print("  /ml/status - Check model status")
    print("  /ml/train - Train Random Forest")
    print("  /ml/predict-all - Get predictions")
    print("  /ml/train-all - Train all models")
    print("  /ml/train-lstm - Train LSTM")
    print("  /cv/scan-receipt - Scan receipts")
    print("  /anomaly/detect - Find anomalies")
    print("  /recommend/get - Get recommendations")
    print("\n" + "=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=False)