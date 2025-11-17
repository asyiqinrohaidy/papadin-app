# 🍗 Papadin AI - Intelligent Chicken Wholesale Inventory System

AI-powered inventory management with machine learning predictions, anomaly detection, and automated receipt scanning.

## 🚀 Features

- **ML Predictions**: Random Forest model with 95% accuracy
- **Deep Learning**: LSTM neural networks for time-series forecasting
- **Anomaly Detection**: Isolation Forest for fraud/waste detection
- **Computer Vision**: OCR receipt scanning with Tesseract
- **Real-time Dashboard**: React-based responsive UI
- **Role-Based Access**: Admin and Outlet user types

## 🛠️ Tech Stack

**Frontend:** React.js, Firebase Auth  
**Backend:** Node.js + Express, Python Flask  
**Database:** Firebase Firestore  
**ML/AI:** scikit-learn, PyTorch, OpenCV, Tesseract

## 📊 ML Model Performance

- Random Forest: 95% prediction accuracy
- LSTM: Time-series forecasting
- Isolation Forest: 10% anomaly detection rate

## 🏗️ Architecture
```
papadin-app/
├── papadin-frontend/     # React application
├── papadin-backend/      # Node.js API
└── papadin-ai/          # Python ML services
```

## 🚀 Local Development

### Prerequisites
- Node.js 16+
- Python 3.8+
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/asyiqinrohaidy/papadin-app.git
cd papadin-app
```

2. Install frontend dependencies:
```bash
cd papadin-frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../papadin-backend
npm install
```

4. Install Python dependencies:
```bash
cd ../papadin-ai
pip install -r requirements.txt
```

5. Configure Firebase:
- Create a Firebase project
- Add your credentials to `papadin-frontend/src/firebase.js`
- Add service account key to `papadin-backend/serviceAccountKey.json`

### Running Locally

**Terminal 1 - React Frontend:**
```bash
cd papadin-frontend
npm start
```

**Terminal 2 - Node.js Backend:**
```bash
cd papadin-backend
node server.js
```

**Terminal 3 - Python AI Backend:**
```bash
cd papadin-ai
python app.py
```

Access the app at `http://localhost:3000`

## 🌐 Deployment

Deployed on Render.com with 3 microservices:
- Frontend: Static Site
- Backend: Node.js Web Service
- AI/ML: Python Web Service

## 👨‍💻 Author

**Asyiqin Rohaidy**  
AI/ML Engineer | Full-Stack Developer

- GitHub: [@asyiqinrohaidy](https://github.com/asyiqinrohaidy)
- Email: asyiqinrohaidy@gmail.com

---

**Built with ❤️ for Papadin Team**