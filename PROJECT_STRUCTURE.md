# 📁 Project Structure - Papadin System

Complete folder and file organization of the Papadin Stock Management System.

---

## 🌲 Directory Tree

```
papadin-system/
│
├── 📁 papadin-frontend/              # React Frontend Application
│   ├── 📁 public/
│   │   ├── index.html
│   │   ├── logo.svg
│   │   └── favicon.ico
│   │
│   ├── 📁 src/
│   │   ├── 📄 index.js               # Entry point
│   │   ├── 📄 index.css              # Global styles
│   │   ├── 📄 App.js                 # Main app component with routing
│   │   ├── 📄 App.css                # App styles
│   │   │
│   │   ├── 🔐 Authentication
│   │   │   ├── 📄 Login.js           # Login page
│   │   │   └── 📄 Register.js        # Registration page
│   │   │
│   │   ├── 🏪 Outlet Components
│   │   │   ├── 📄 AppOutlet.js       # Outlet dashboard container
│   │   │   ├── 📄 AddStock.js        # Add stock report form
│   │   │   ├── 📄 Dashboard.js       # Outlet main dashboard
│   │   │   └── 📄 ViewStock.js       # View stock records
│   │   │
│   │   ├── 👨‍💼 Admin Components
│   │   │   ├── 📄 AdminDashboard.js  # Admin dashboard (NEW!)
│   │   │   └── 📄 AdminNavbar.js     # Admin navigation (NEW!)
│   │   │
│   │   ├── 🤖 AI Components
│   │   │   ├── 📄 AITest.js          # AI chat interface
│   │   │   ├── 📄 ChatAI.js          # Alternative chat UI
│   │   │   ├── 📄 MLPredictions.js   # ML predictions view
│   │   │   └── 📄 aiService.js       # AI API service
│   │   │
│   │   ├── 🔧 Configuration
│   │   │   ├── 📄 firebase.js        # Firebase configuration
│   │   │   └── 📄 api.js             # API endpoints
│   │   │
│   │   └── 🧪 Testing
│   │       ├── 📄 App.test.js        # App tests
│   │       ├── 📄 setupTests.js      # Test configuration
│   │       └── 📄 reportWebVitals.js # Performance monitoring
│   │
│   ├── 📄 package.json               # Frontend dependencies
│   ├── 📄 package-lock.json
│   └── 📄 .gitignore
│
├── 📁 papadin-backend/               # Node.js Backend (Port 5001)
│   ├── 📄 server.js                  # Main Express server
│   ├── 📄 server-clean.js            # Minimal test server
│   ├── 📄 populate_data.js           # Test data generator
│   ├── 📄 package.json               # Backend dependencies
│   ├── 📄 package-lock.json
│   ├── 🔐 serviceAccountKey.json     # Firebase admin key (DO NOT COMMIT!)
│   └── 📄 .env                       # Environment variables (optional)
│
├── 📁 papadin-ai/                    # Python AI Backend (Port 5000)
│   ├── 📄 app.py                     # Flask server with AI endpoints
│   ├── 📄 ml_model.py                # ML model (Random Forest)
│   ├── 📄 requirements.txt           # Python dependencies (UPDATED!)
│   ├── 📄 .env                       # OpenAI API key
│   │
│   ├── 📁 venv/                      # Python virtual environment
│   │   └── (virtual environment files)
│   │
│   └── 📁 models/                    # Trained ML models
│       ├── stock_predictor.pkl       # Trained model (generated)
│       └── label_encoders.pkl        # Encoders (generated)
│
├── 📁 docs/                          # Documentation (NEW!)
│   ├── 📄 README.md                  # Main documentation
│   ├── 📄 QUICKSTART.md              # Quick setup guide
│   └── 📄 PROJECT_STRUCTURE.md       # This file
│
├── 🚀 Setup Scripts (NEW!)
│   ├── 📄 install.bat                # Windows installation script
│   ├── 📄 install.sh                 # macOS/Linux installation script
│   ├── 📄 start.bat                  # Windows startup script
│   └── 📄 start.sh                   # macOS/Linux startup script
│
├── 🔒 Configuration Files (NEW!)
│   ├── 📄 .env.example               # Environment template
│   ├── 📄 .gitignore                 # Git ignore rules
│   └── 📄 LICENSE                    # Project license
│
└── 📄 README.md                      # Project overview

```

---

## 📦 Component Details

### Frontend Components (React)

#### Authentication
- **Login.js**: User login with Firebase Auth
- **Register.js**: New outlet registration

#### Outlet User Features
- **AppOutlet.js**: Container with sidebar navigation
- **AddStock.js**: Form to add daily stock reports
- **Dashboard.js**: Charts, stats, and AI chat
- **ViewStock.js**: View, edit, delete stock records

#### Admin Features
- **AdminDashboard.js**: 
  - Overview tab with stats cards
  - Analytics tab with charts
  - ML Predictions integration
  - Outlets management
  - Low stock alerts

- **AdminNavbar.js**: Sidebar navigation for admin

#### AI Components
- **AITest.js**: Chat interface with conversation history
- **ChatAI.js**: Alternative chat UI design
- **MLPredictions.js**: ML model predictions display
- **aiService.js**: API service functions

### Backend Components

#### Node.js Backend (Express)
- **server.js**: Full REST API server
  - GET /get-stock - Retrieve all stock data
  - POST /add-stock - Add new stock records
  - PUT /update-stock/:id - Update existing record
  - DELETE /delete-stock/:id - Delete record
  - GET /test-firestore - Test Firestore connection

- **populate_data.js**: Generates 30 days of test data

#### Python AI Backend (Flask)
- **app.py**: AI server with endpoints
  - POST /chat - Chat with GPT
  - POST /ml/train - Train ML model
  - POST /ml/predict-all - Get predictions
  - GET /ml/status - Check model status
  - GET /health - Health check

- **ml_model.py**: Random Forest model
  - Feature engineering
  - Model training
  - Predictions with confidence scores
  - Recommendations generation

---

## 🗄️ Database Structure (Firestore)

### Collections

#### `users`
```javascript
{
  uid: string,           // Firebase Auth UID
  email: string,         // User email
  role: string,          // "outlet" | "admin"
  createdAt: Timestamp   // Account creation date
}
```

#### `stokOutlet`
```javascript
{
  tarikh: string,        // Date (YYYY-MM-DD)
  outlet: string,        // Outlet email
  item: string,          // Item name (Ayam, Tepung, etc.)
  unit: string,          // Unit (PCS, BAG, BTL)
  stockIn: number,       // Stock received
  baki: number,          // Remaining stock
  order: number,         // Order quantity
  remark: string,        // Optional notes
  createdAt: Timestamp,  // Record creation
  updatedAt: Timestamp   // Last update (optional)
}
```

---

## 🔌 API Ports

| Service | Port | URL |
|---------|------|-----|
| React Frontend | 3000 | http://localhost:3000 |
| Node.js Backend | 5001 | http://localhost:5001 |
| Python AI Backend | 5000 | http://localhost:5000 |

---

## 📝 Configuration Files

### Frontend
- **package.json**: React dependencies
- **firebase.js**: Firebase configuration
- **api.js**: API endpoint definitions

### Backend (Node.js)
- **package.json**: Express dependencies
- **serviceAccountKey.json**: Firebase Admin credentials

### AI Backend (Python)
- **requirements.txt**: Python packages
- **.env**: OpenAI API key

---

## 🔐 Sensitive Files (Never Commit!)

```
.env
serviceAccountKey.json
/models/*.pkl
/venv/
node_modules/
```

These are protected by `.gitignore`

---

## 🚀 Build & Run

### Development
```bash
# Frontend
cd papadin-frontend && npm start

# Backend
cd papadin-backend && node server.js

# AI Backend
cd papadin-ai && source venv/bin/activate && python app.py
```

### Production Build
```bash
# Frontend
cd papadin-frontend
npm run build
# Creates /build folder
```

---

## 📊 Dependencies Summary

### Frontend (React)
- react, react-dom, react-router-dom
- firebase
- recharts (charts)

### Backend (Node.js)
- express
- cors
- firebase-admin
- dotenv

### AI Backend (Python)
- Flask + flask-cors
- openai
- pandas, numpy
- scikit-learn
- requests

---

## 🔄 Data Flow

```
User Action (Frontend)
      ↓
Firebase Auth (Login/Register)
      ↓
React Router (Role-based routing)
      ↓
Dashboard (Outlet/Admin)
      ↓
API Call (fetch)
      ↓
Node.js Backend (Port 5001)
      ↓
Firestore Database
      ↓
Response back to Frontend

For AI Features:
Frontend → Python AI (Port 5000) → OpenAI API → Response
Frontend → Python AI → ML Model → Predictions
```

---

## 🎨 Styling

- **CSS Framework**: Custom inline styles with Poppins font
- **Color Scheme**:
  - Primary: #4caf50 (Green)
  - Secondary: #2196f3 (Blue)
  - Warning: #ff9800 (Orange)
  - Danger: #e74c3c (Red)
  - Admin: #2c3e50 (Dark Blue-Grey)

---

## 🧪 Testing

### Frontend Tests
```bash
cd papadin-frontend
npm test
```

### Backend Test
```bash
# Node.js
node server.js
# Visit: http://localhost:5001/test-firestore

# Python
python app.py
# Visit: http://localhost:5000/health
```

---

## 📈 Future Structure Additions

Planned additions:
- `/tests` - Unit and integration tests
- `/docs/api` - API documentation
- `/scripts` - Utility scripts
- `/config` - Shared configurations
- `/mobile` - React Native mobile app

---

**Last Updated**: 2025-01-15
