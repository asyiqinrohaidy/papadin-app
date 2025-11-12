# ✅ Setup Checklist - Papadin System

Use this checklist to ensure everything is configured correctly before running the system.

---

## 📋 Pre-Installation Checklist

### System Requirements
- [ ] **Node.js 18+** installed
  ```bash
  node --version
  # Should show v18.x.x or higher
  ```

- [ ] **Python 3.9+** installed
  ```bash
  python --version  # or python3 --version
  # Should show Python 3.9.x or higher
  ```

- [ ] **npm** package manager available
  ```bash
  npm --version
  ```

- [ ] **Git** installed (optional, for cloning)
  ```bash
  git --version
  ```

### Accounts & Keys
- [ ] **Firebase account** created at [firebase.google.com](https://firebase.google.com)
- [ ] **Firebase project** created
- [ ] **OpenAI account** created at [platform.openai.com](https://platform.openai.com)
- [ ] **OpenAI API key** generated
- [ ] **API key has credits** (check at platform.openai.com/usage)

---

## 📁 File Structure Checklist

### Root Directory
- [ ] `papadin-frontend/` folder exists
- [ ] `papadin-backend/` folder exists
- [ ] `papadin-ai/` folder exists
- [ ] `README.md` file present
- [ ] `.gitignore` file present

### Configuration Files
- [ ] `papadin-backend/serviceAccountKey.json` added
- [ ] `papadin-ai/.env` file created
- [ ] `papadin-ai/.env` contains `OPENAI_API_KEY=...`

---

## 🔧 Installation Checklist

### Frontend Installation
- [ ] Navigated to `papadin-frontend/`
- [ ] Ran `npm install`
- [ ] No error messages in installation
- [ ] `node_modules/` folder created
- [ ] `package-lock.json` updated

### Backend Installation
- [ ] Navigated to `papadin-backend/`
- [ ] Ran `npm install`
- [ ] No error messages in installation
- [ ] `node_modules/` folder created
- [ ] `serviceAccountKey.json` file present in this folder

### Python AI Installation
- [ ] Navigated to `papadin-ai/`
- [ ] Created virtual environment: `python -m venv venv`
- [ ] Activated venv:
  - Windows: `venv\Scripts\activate`
  - macOS/Linux: `source venv/bin/activate`
- [ ] Ran `pip install -r requirements.txt`
- [ ] No error messages in installation
- [ ] All packages installed successfully

---

## ⚙️ Configuration Checklist

### Firebase Configuration

#### Firebase Console Setup
- [ ] Logged into [Firebase Console](https://console.firebase.google.com)
- [ ] Selected/Created project
- [ ] **Authentication** enabled
- [ ] **Email/Password** sign-in method enabled
- [ ] **Firestore Database** created
- [ ] Database started in **test mode** or with custom rules

#### Service Account Key
- [ ] Went to Project Settings → Service Accounts
- [ ] Clicked "Generate New Private Key"
- [ ] Downloaded JSON file
- [ ] Renamed to `serviceAccountKey.json`
- [ ] Placed in `papadin-backend/` folder
- [ ] File is in `.gitignore`

#### Frontend Firebase Config
- [ ] Opened `src/firebase.js`
- [ ] Copied config from Firebase Console (Project Settings → General)
- [ ] Updated all fields:
  - [ ] `apiKey`
  - [ ] `authDomain`
  - [ ] `projectId`
  - [ ] `storageBucket`
  - [ ] `messagingSenderId`
  - [ ] `appId`

### OpenAI Configuration
- [ ] Created `.env` file in `papadin-ai/`
- [ ] Added line: `OPENAI_API_KEY=sk-your-actual-key-here`
- [ ] Verified API key is valid
- [ ] Checked API has available credits

### Port Configuration
- [ ] Port 3000 is available (Frontend)
- [ ] Port 5001 is available (Node.js Backend)
- [ ] Port 5000 is available (Python AI)
- [ ] No conflicts with other services

---

## 🚀 First Run Checklist

### Start All Services

#### Terminal 1: Frontend
```bash
cd papadin-frontend
npm start
```
- [ ] Server started without errors
- [ ] Browser opened automatically to `http://localhost:3000`
- [ ] Login page visible

#### Terminal 2: Node.js Backend
```bash
cd papadin-backend
node server.js
```
- [ ] Server started on port 5001
- [ ] No Firebase connection errors
- [ ] Message: "Papadin backend running on port 5001"

#### Terminal 3: Python AI Backend
```bash
cd papadin-ai
# Activate venv first!
python app.py
```
- [ ] Server started on port 5000
- [ ] No OpenAI API errors
- [ ] Endpoints listed in console

### Verify Services Running

#### Test Node.js Backend
```bash
# In browser or curl:
http://localhost:5001/test-firestore
```
- [ ] Returns JSON response
- [ ] Shows Firestore connection successful
- [ ] No error messages

#### Test Python AI Backend
```bash
# In browser or curl:
http://localhost:5000/
```
- [ ] Returns JSON response
- [ ] Shows "Papadin AI backend running"
- [ ] `api_configured: true`

#### Test Frontend
- [ ] Can access `http://localhost:3000`
- [ ] Login page displays correctly
- [ ] No console errors (F12)
- [ ] Register link works

---

## 👤 User Account Checklist

### Create Test Outlet Account
- [ ] Clicked "Daftar di sini" (Register)
- [ ] Entered email (e.g., `outlet1@test.com`)
- [ ] Entered password (min 6 characters)
- [ ] Registration successful
- [ ] Redirected to login page
- [ ] Can login with new credentials

### First Login
- [ ] Logged in successfully
- [ ] Redirected to dashboard
- [ ] Can see "Add Report" button
- [ ] Sidebar navigation visible

---

## 📊 Data & Features Checklist

### Add Stock Report
- [ ] Clicked "Add Report"
- [ ] Selected date
- [ ] Filled in at least one item (e.g., Ayam)
- [ ] Clicked "Simpan Laporan" (Save)
- [ ] Success message appeared
- [ ] Form cleared after save

### View Stock Reports
- [ ] Clicked "View Reports"
- [ ] Can see the report just added
- [ ] Date search works
- [ ] Edit button works
- [ ] Delete button works (after confirmation)

### Test AI Chat
- [ ] Clicked 🤖 floating button
- [ ] Chat window opened
- [ ] Can type message
- [ ] Sent test message
- [ ] Received AI response
- [ ] No error messages

---

## 🧠 ML Model Checklist

### Generate Test Data (Optional)
```bash
cd papadin-backend
node populate_data.js
```
- [ ] Script ran successfully
- [ ] Created 30 days of data
- [ ] Can see data in dashboard

### Train ML Model
- [ ] Navigated to "ML Predictions" (if in admin view)
- [ ] Clicked "Train Model"
- [ ] Training completed (10-30 seconds)
- [ ] Success message with metrics
- [ ] Model file created: `papadin-ai/models/stock_predictor.pkl`

### Get Predictions
- [ ] Clicked "Get Predictions"
- [ ] Predictions displayed for all items
- [ ] Confidence scores shown
- [ ] Recommendations displayed
- [ ] No errors

---

## 🔒 Security Checklist

### Sensitive Files Protected
- [ ] `.env` file in `.gitignore`
- [ ] `serviceAccountKey.json` in `.gitignore`
- [ ] `/models/*.pkl` in `.gitignore`
- [ ] `node_modules/` in `.gitignore`
- [ ] `venv/` in `.gitignore`

### API Keys Secure
- [ ] OpenAI key not in any code files
- [ ] OpenAI key only in `.env`
- [ ] Firebase keys not committed to Git
- [ ] No hardcoded passwords

---

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Can register new user
- [ ] Can login
- [ ] Can logout
- [ ] Can add stock report
- [ ] Can view reports
- [ ] Can edit reports
- [ ] Can delete reports
- [ ] Can search by date
- [ ] AI chat responds
- [ ] No console errors

### Backend Tests
- [ ] GET `/get-stock` returns data
- [ ] POST `/add-stock` creates records
- [ ] PUT `/update-stock/:id` updates records
- [ ] DELETE `/delete-stock/:id` removes records
- [ ] All responses are JSON
- [ ] No 500 errors

### AI Backend Tests
- [ ] POST `/chat` returns AI responses
- [ ] POST `/ml/train` trains model
- [ ] POST `/ml/predict-all` returns predictions
- [ ] GET `/ml/status` shows model status
- [ ] GET `/health` returns healthy status

---

## 📱 Admin Features Checklist (If Admin Account)

### Admin Dashboard
- [ ] Can access admin dashboard
- [ ] Overview tab shows stats cards
- [ ] Can see all outlets' data
- [ ] Low stock alerts visible
- [ ] Recent activity shows

### Analytics Tab
- [ ] Charts display correctly
- [ ] Bar chart shows orders by item
- [ ] Pie chart shows outlet distribution
- [ ] Line chart shows trends
- [ ] All data visualizes properly

### Outlets Tab
- [ ] All outlets listed
- [ ] Stats show for each outlet
- [ ] Can view outlet details

### ML Predictions Tab
- [ ] Can train model
- [ ] Can get predictions
- [ ] Predictions show for all items
- [ ] Confidence scores visible
- [ ] Recommendations clear

---

## ✅ Final Verification

### All Services Running
- [ ] Frontend: `http://localhost:3000` ✅
- [ ] Backend: `http://localhost:5001` ✅
- [ ] AI: `http://localhost:5000` ✅

### Core Features Working
- [ ] User authentication ✅
- [ ] Stock CRUD operations ✅
- [ ] AI chat assistant ✅
- [ ] ML predictions ✅
- [ ] Data visualization ✅

### Documentation
- [ ] Read README.md
- [ ] Reviewed PROJECT_STRUCTURE.md
- [ ] Understand API endpoints
- [ ] Know how to troubleshoot

---

## 🎉 Success Criteria

You're ready to use Papadin if:
- ✅ All 3 servers run without errors
- ✅ Can register and login
- ✅ Can add and view stock reports
- ✅ AI chat responds correctly
- ✅ ML model can train and predict
- ✅ No critical console errors

---

## 🆘 If Something Fails

### Common Issues

**Can't connect to backend**
→ Check all terminals are running
→ Verify ports 3000, 5001, 5000 are free

**Firebase errors**
→ Check `serviceAccountKey.json` exists
→ Verify Firebase config in `firebase.js`

**AI not working**
→ Check `.env` has correct OpenAI key
→ Verify key has credits

**ML model errors**
→ Need at least 30 stock records
→ Run `populate_data.js` to generate test data
→ Train model before predictions

**Port conflicts**
→ Change ports in respective config files
→ Update fetch URLs in frontend

---

## 📞 Getting Help

If you're stuck:
1. Check the error message in terminal/console
2. Review [README.md](README.md) troubleshooting section
3. Verify this checklist completely
4. Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for file locations
5. Create an issue on GitHub with error details

---

**Happy Coding! 🚀**
