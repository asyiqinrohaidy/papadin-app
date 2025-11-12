# 🍗 Papadin Stock Management System

A comprehensive stock management system for restaurant outlets with AI-powered predictions and analytics.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Python](https://img.shields.io/badge/Python-3.9+-yellow)

---

## 📋 Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## ✨ Features

### 🏪 For Outlet Users
- ✅ Add daily stock reports (Ayam, Tepung, Minyak, Ais)
- 📊 View and edit historical stock data
- 🔍 Search stock records by date
- 📈 Visualize stock trends with charts
- 🤖 AI chat assistant for stock queries

### 👨‍💼 For Admin Users
- 📊 Dashboard with comprehensive analytics
- 🏪 Monitor all outlets in real-time
- 📈 Advanced data visualization
- 🧠 Machine Learning predictions for optimal ordering
- ⚠️ Low stock alerts
- 📉 Trend analysis and reporting

### 🤖 AI & ML Features
- 💬 OpenAI GPT-powered chat assistant
- 🧠 Random Forest ML model for stock predictions
- 📊 Confidence scoring for predictions
- 💡 Smart recommendations based on historical data

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           🎨 Frontend (React) - Port 3000          │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │   Outlet     │  │    Admin     │               │
│  │  Dashboard   │  │  Dashboard   │               │
│  └──────────────┘  └──────────────┘               │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Firebase   │ │   Node.js    │ │   Python     │
│     Auth     │ │   Backend    │ │   AI API     │
│              │ │   Port 5001  │ │   Port 5000  │
│  Firestore   │ │              │ │              │
│   Database   │ │   Express    │ │    Flask     │
│              │ │   + CORS     │ │   + OpenAI   │
└──────────────┘ └──────────────┘ │   + ML Model │
                                  └──────────────┘
```

### Components:

1. **Frontend (React)**
   - User authentication
   - Role-based routing (Outlet/Admin)
   - Real-time data visualization
   - AI chat interface

2. **Node.js Backend**
   - RESTful API for CRUD operations
   - Firebase Firestore integration
   - Stock data management

3. **Python AI Backend**
   - OpenAI GPT integration for chat
   - Machine Learning predictions
   - Stock optimization algorithms

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher - [Download](https://nodejs.org/)
- **Python** 3.9 or higher - [Download](https://www.python.org/)
- **npm** or **yarn** package manager
- **Git** - [Download](https://git-scm.com/)

### Required Accounts:
- **Firebase Account** - [Sign up](https://firebase.google.com/)
- **OpenAI API Key** - [Get API Key](https://platform.openai.com/api-keys)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/papadin-system.git
cd papadin-system
```

### 2. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd papadin-frontend

# Install dependencies
npm install

# Required packages (should be in package.json)
npm install react-router-dom firebase recharts
```

### 3. Node.js Backend Setup

```bash
# Navigate to backend directory
cd papadin-backend

# Install dependencies
npm install

# Required packages
npm install express cors dotenv firebase-admin
```

### 4. Python AI Backend Setup

```bash
# Navigate to AI backend directory
cd papadin-ai

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database**
5. Generate service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in `papadin-backend/`

### 2. Environment Variables

#### Python AI Backend (.env)

Create `.env` file in `papadin-ai/`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

#### Node.js Backend

No additional .env needed. Port is configured in `server.js` (default: 5001)

#### Frontend (React)

Update `src/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Security Configuration

**IMPORTANT:** Add these files to `.gitignore`:

```
.env
serviceAccountKey.json
```

---

## 🏃 Running the Application

You need to run **THREE** separate servers:

### Terminal 1: Frontend (React)

```bash
cd papadin-frontend
npm start
# Runs on http://localhost:3000
```

### Terminal 2: Node.js Backend

```bash
cd papadin-backend
node server.js
# Runs on http://localhost:5001
```

### Terminal 3: Python AI Backend

```bash
cd papadin-ai
# Activate virtual environment first
python app.py
# Runs on http://localhost:5000
```

### Verify All Services Running:

- **Frontend**: http://localhost:3000
- **Node.js Backend**: http://localhost:5001
- **Python AI**: http://localhost:5000

---

## 📖 Usage Guide

### First Time Setup

#### 1. Register Outlet Account

1. Go to http://localhost:3000
2. Click "Daftar di sini" (Register)
3. Create outlet account with email and password
4. You'll be automatically logged in

#### 2. Populate Test Data (Optional)

To quickly generate test data for ML training:

```bash
cd papadin-backend
node populate_data.js
```

This creates 30 days of sample stock data.

#### 3. Train ML Model

1. Login as admin or outlet
2. Go to "ML Predictions" tab
3. Click "🧠 Train Model"
4. Wait for training to complete (~10-30 seconds)

### Daily Operations

#### For Outlet Users:

1. **Add Stock Report**
   - Click "Add Report" in sidebar
   - Select date
   - Fill in stock quantities for each item
   - Click "Simpan Laporan"

2. **View Reports**
   - Click "View Reports" in sidebar
   - Use date search to filter
   - Edit or delete records as needed

3. **AI Assistant**
   - Click the 🤖 floating button
   - Ask questions about stock levels
   - Get recommendations

#### For Admin Users:

1. **Monitor All Outlets**
   - Overview tab shows summary stats
   - Low stock alerts
   - Recent activity

2. **Analytics**
   - View charts and trends
   - Compare outlet performance
   - Export reports

3. **ML Predictions**
   - Get AI-powered order recommendations
   - See confidence scores
   - Plan optimal orders

---

## 🔌 API Documentation

### Node.js Backend (Port 5001)

#### Get All Stock Data
```http
GET /get-stock
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_id",
      "tarikh": "2025-01-15",
      "outlet": "outlet@example.com",
      "item": "Ayam",
      "unit": "PCS",
      "stockIn": 50,
      "baki": 15,
      "order": 35,
      "remark": ""
    }
  ]
}
```

#### Add Stock Report
```http
POST /add-stock
Content-Type: application/json

{
  "tarikh": "2025-01-15",
  "outlet": "outlet@example.com",
  "items": [
    {
      "name": "Ayam",
      "unit": "PCS",
      "stockIn": 50,
      "baki": 15,
      "order": 35,
      "remark": ""
    }
  ]
}
```

#### Update Stock
```http
PUT /update-stock/:id
Content-Type: application/json

{
  "tarikh": "2025-01-15",
  "item": "Ayam",
  "stockIn": 50,
  "baki": 20,
  "order": 30
}
```

#### Delete Stock
```http
DELETE /delete-stock/:id
```

### Python AI Backend (Port 5000)

#### Chat with AI
```http
POST /chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Berapa baki ayam hari ini?"}
  ]
}
```

Response:
```json
{
  "success": true,
  "reply": "Berdasarkan data terkini...",
  "stock_data_included": true
}
```

#### Train ML Model
```http
POST /ml/train
```

Response:
```json
{
  "success": true,
  "message": "Model trained successfully!",
  "metrics": {
    "mae": 3.45,
    "rmse": 4.67,
    "r2": 0.85,
    "train_samples": 240
  }
}
```

#### Get Predictions for All Items
```http
POST /ml/predict-all
Content-Type: application/json

{
  "outlet": "outlet@example.com"
}
```

Response:
```json
{
  "success": true,
  "predictions": [
    {
      "item": "Ayam",
      "unit": "PCS",
      "current_baki": 15,
      "predicted_order": 42,
      "confidence": 87,
      "recommendation": "✅ Stock level good..."
    }
  ]
}
```

#### Check ML Model Status
```http
GET /ml/status
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to connect to backend"

**Solution:**
- Ensure Node.js backend is running on port 5001
- Check terminal for errors
- Verify `serviceAccountKey.json` exists

#### 2. "AI backend error"

**Solution:**
- Check Python server is running on port 5000
- Verify `OPENAI_API_KEY` in `.env` file
- Check OpenAI API quota/balance

#### 3. "Model not trained yet"

**Solution:**
- Train the model first: POST to `/ml/train`
- Ensure you have at least 30 stock records
- Use `populate_data.js` to generate test data

#### 4. "CORS Error"

**Solution:**
- Check CORS is enabled in both backends
- Verify fetch URLs use correct ports
- Clear browser cache

#### 5. Firebase Authentication Errors

**Solution:**
- Check Firebase config in `src/firebase.js`
- Ensure Email/Password auth is enabled in Firebase Console
- Check Firebase quota limits

### Port Conflicts

If ports are already in use:

**Change React port:**
```bash
PORT=3001 npm start
```

**Change Node.js port:**
Edit `server.js`:
```javascript
const PORT = 5002; // Change from 5001
```

**Change Python port:**
Edit `app.py`:
```python
app.run(host='0.0.0.0', port=5002, debug=True)
```

### Logs and Debugging

**View Node.js logs:**
```bash
# Terminal running node server.js will show logs
```

**View Python logs:**
```bash
# Terminal running python app.py will show logs
```

**View React logs:**
```bash
# Browser console (F12)
```

---

## 📊 Database Structure

### Firestore Collections

#### `users` Collection
```javascript
{
  uid: "user_id",
  email: "outlet@example.com",
  role: "outlet" | "admin",
  createdAt: Timestamp
}
```

#### `stokOutlet` Collection
```javascript
{
  tarikh: "2025-01-15",
  outlet: "outlet@example.com",
  item: "Ayam",
  unit: "PCS",
  stockIn: 50,
  baki: 15,
  order: 35,
  remark: "Optional note",
  createdAt: Timestamp,
  updatedAt: Timestamp // optional
}
```

---

## 🔐 Security Best Practices

1. **Never commit sensitive files:**
   - `.env`
   - `serviceAccountKey.json`
   - API keys

2. **Use environment variables for all secrets**

3. **Enable Firebase Security Rules:**

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stokOutlet/{document} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

4. **Regularly rotate API keys**

5. **Use HTTPS in production**

---

## 🚀 Deployment

### Frontend (React)

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Upload build folder to Netlify
```

### Backend (Node.js)

**Heroku:**
```bash
heroku create papadin-backend
git push heroku main
```

**Railway:**
```bash
# Connect GitHub repo to Railway
```

### Python AI Backend

**Render:**
```bash
# Create new Web Service
# Connect GitHub repo
```

**Railway:**
```bash
# Deploy Python app
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@papadin.com

---

## 🙏 Acknowledgments

- OpenAI for GPT API
- Firebase for backend services
- React team for the framework
- All contributors

---

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] SMS alerts for low stock
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] PDF report generation
- [ ] Inventory forecasting
- [ ] Supplier management

---

**Made with ❤️ by the Papadin Team**
