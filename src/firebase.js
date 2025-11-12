// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyByfsmmNvGLgSCd8RTPy-fPNVo3Tt8N_Q4",
  authDomain: "papadin-app.firebaseapp.com",
  projectId: "papadin-app",
  storageBucket: "papadin-app.firebasestorage.app",
  messagingSenderId: "219613387737",
  appId: "1:219613387737:web:1932d945ee4ab4097197c8",
  measurementId: "G-MXSPJPNX89"
};

// 💡 Elak reinitialize — guna getApps() untuk semak sama ada dah ada instance Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔥 Export instance supaya boleh digunakan di seluruh app
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;
