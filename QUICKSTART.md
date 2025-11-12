# ⚡ Quick Start Guide - Papadin System

Get up and running in 5 minutes!

---

## 🎯 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] Firebase account created
- [ ] OpenAI API key obtained

---

## 🚀 Fast Installation (Copy & Paste)

### Step 1: Frontend Setup
```bash
cd papadin-frontend
npm install
# Wait for installation...
```

### Step 2: Node.js Backend Setup
```bash
cd ../papadin-backend
npm install
# Place your serviceAccountKey.json here
```

### Step 3: Python AI Backend Setup
```bash
cd ../papadin-ai
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

---

## ⚙️ Configuration (2 Minutes)

### 1. Create `.env` in `papadin-ai/`
```env
OPENAI_API_KEY=sk-your-key-here
```

### 2. Add `serviceAccountKey.json` to `papadin-backend/`
- Download from Firebase Console
- Place in `papadin-backend/` folder

### 3. Update Firebase Config in `src/firebase.js`
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

---

## 🏃 Run Everything

Open **3 terminals** and run:

### Terminal 1: Frontend
```bash
cd papadin-frontend
npm start
```
✅ Opens at http://localhost:3000

### Terminal 2: Node.js Backend
```bash
cd papadin-backend
node server.js
```
✅ Runs at http://localhost:5001

### Terminal 3: Python AI
```bash
cd papadin-ai
# Activate venv first!
python app.py
```
✅ Runs at http://localhost:5000

---

## ✅ Test Everything Works

1. **Visit**: http://localhost:3000
2. **Register** a new outlet account
3. **Login** with your credentials
4. **Add** a stock report
5. Click **🤖** to test AI chat
6. Go to **ML Predictions** and train model

---

## 🎉 You're Done!

If all 3 servers are running and you can login, you're ready to use Papadin!

---

## 🐛 Quick Fixes

**Can't connect to backend?**
- Check all 3 terminals are running
- Verify ports: 3000, 5001, 5000

**AI not working?**
- Check `.env` file has OpenAI key
- Verify key is valid at platform.openai.com

**Firebase errors?**
- Check serviceAccountKey.json exists
- Verify Firebase config in code

**ML Model error?**
- Train the model first (ML Predictions tab)
- Or run: `node populate_data.js` to get test data

---

## 📚 Next Steps

- Read full [README.md](README.md) for detailed docs
- Train ML model for predictions
- Explore admin dashboard features
- Customize for your needs

---

**Need help?** Check the troubleshooting section in README.md
