// src/Login.js
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

function Login({ setUser, setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const auth = getAuth();
    try {
      // 🔐 Log masuk guna Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser(user);

      // 🔍 Semak role dalam Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        setRole(role);

        // ✅ Redirect ikut role
        if (role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        // ❗ Jika tiada data Firestore, assume outlet
        setRole("outlet");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      if (err.code === "auth/invalid-email") {
        setError("Alamat emel tidak sah.");
      } else if (err.code === "auth/user-not-found") {
        setError("Akaun tidak dijumpai. Sila daftar dahulu.");
      } else if (err.code === "auth/wrong-password") {
        setError("Emel atau kata laluan tidak sah.");
      } else {
        setError("Gagal log masuk. Sila cuba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: "50px", textAlign: "center" }}>🐔</div>
        <h2 style={title}>Log Masuk Sistem Stok Ayam</h2>
        <p style={subtitle}>
          Sila masukkan emel & kata laluan untuk akses sistem.
        </p>

        {error && <p style={errorMsg}>{error}</p>}

        <form onSubmit={handleLogin} style={form}>
          <input
            type="email"
            placeholder="Emel"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            required
          />
          <input
            type="password"
            placeholder="Kata Laluan"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            required
          />
          <button type="submit" style={btn} disabled={loading}>
            {loading ? "Sedang log masuk..." : "Log Masuk"}
          </button>
        </form>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Tiada akaun outlet?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "#2d8659", cursor: "pointer", fontWeight: "600" }}
          >
            Daftar di sini
          </span>
        </p>
      </div>
    </div>
  );
}

/* 🎨 Styles */
const page = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #a5d6a7, #81c784)",
  fontFamily: "Poppins, sans-serif",
};

const card = {
  background: "white",
  borderRadius: "20px",
  padding: "40px 50px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  width: "400px",
  maxWidth: "90%",
};

const title = {
  textAlign: "center",
  color: "#2d8659",
  marginBottom: "5px",
};

const subtitle = {
  textAlign: "center",
  fontSize: "14px",
  color: "#555",
  marginBottom: "20px",
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const input = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  outline: "none",
};

const btn = {
  background: "#4caf50",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
};

const errorMsg = {
  color: "red",
  textAlign: "center",
  marginBottom: "10px",
  fontSize: "13px",
};

export default Login;
