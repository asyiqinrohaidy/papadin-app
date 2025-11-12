// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByfsmmNvGLgSCd8RTPy-fPNVo3Tt8N_Q4",
  authDomain: "papadin-app.firebaseapp.com",
  projectId: "papadin-app",
  storageBucket: "papadin-app.firebasestorage.app",
  messagingSenderId: "219613387737",
  appId: "1:219613387737:web:1932d945ee4ab4097197c8",
  measurementId: "G-MXSPJPNX89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;