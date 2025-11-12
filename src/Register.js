// src/Register.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const auth = getAuth();
    try {
      // 🔐 1️⃣ Daftar akaun outlet di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 🧾 2️⃣ Simpan info pengguna ke Firestore (collection: users)
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        role: "outlet",
        createdAt: new Date(),
      });

      // 📦 3️⃣ Tambah stokOutlet awal untuk outlet baru
      const stokRef = collection(db, "stokOutlet");
      await addDoc(stokRef, {
        tarikh: new Date().toISOString().split("T")[0],
        outlet: email,
        item: "Contoh Item",
        unit: "PCS",
        stockIn: 0,
        baki: 0,
        order: 0,
        remark: "Stok permulaan",
        createdAt: new Date(),
      });

      alert("✅ Akaun outlet berjaya didaftar dan stok permulaan ditambah!");
      navigate("/login"); // 🔁 Redirect ke login selepas berjaya daftar
    } catch (err) {
      console.error("❌ Ralat daftar:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Emel ini sudah digunakan.");
      } else if (err.code === "auth/invalid-email") {
        setError("Alamat emel tidak sah.");
      } else if (err.code === "auth/weak-password") {
        setError("Kata laluan mesti sekurang-kurangnya 6 aksara.");
      } else {
        setError("Gagal mendaftar akaun. Sila cuba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: "50px", textAlign: "center" }}>🐔</div>
        <h2 style={title}>Daftar Akaun Outlet</h2>
        <p style={subtitle}>
          Sila masukkan emel & kata laluan untuk daftar akaun outlet baru.
        </p>

        {error && <p style={errorMsg}>{error}</p>}

        <form onSubmit={handleRegister} style={form}>
          <input
            type="email"
            placeholder="Emel Outlet"
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
            {loading ? "Mendaftar..." : "Daftar Akaun"}
          </button>
        </form>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Sudah ada akaun?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#2d8659", cursor: "pointer", fontWeight: "600" }}
          >
            Log masuk di sini
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

export default Register;
