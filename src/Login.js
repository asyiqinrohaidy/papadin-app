// src/Login.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function Login({ setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔐 Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ Login successful for:", user.email);

      // 🔍 Check user role in Firestore (optional)
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const role = docSnap.data().role;
          console.log("📋 User role from Firestore:", role);
          localStorage.setItem("userRole", role);
        }
      } catch (firestoreError) {
        console.log("⚠️ Firestore check skipped:", firestoreError);
      }

      // ✅ NO ALERT - App.js will handle navigation automatically via onAuthStateChanged
      
    } catch (err) {
      console.error("❌ Login error:", err);
      
      // User-friendly error messages
      if (err.code === "auth/invalid-email") {
        setError("Alamat emel tidak sah.");
      } else if (err.code === "auth/user-not-found") {
        setError("Akaun tidak dijumpai. Sila daftar dahulu.");
      } else if (err.code === "auth/wrong-password") {
        setError("Emel atau kata laluan salah.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Emel atau kata laluan tidak sah.");
      } else {
        setError("Gagal log masuk. Sila cuba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick test login for development
  const handleTestLogin = () => {
    setEmail("admin@papadin.com");
    setPassword("admin123");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>🍗</span>
        </div>
        
        <h2 style={styles.title}>Papadin Stock System</h2>
        <p style={styles.subtitle}>
          Sila masukkan emel & kata laluan untuk akses sistem.
        </p>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Kata Laluan</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            style={loading ? {...styles.btn, opacity: 0.6} : styles.btn} 
            disabled={loading}
          >
            {loading ? "🔄 Sedang log masuk..." : "🚀 Log Masuk"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>atau</span>
        </div>

        <p style={styles.registerText}>
          Tiada akaun outlet?{" "}
          <span
            onClick={() => setCurrentPage("register")}
            style={styles.registerLink}
          >
            Daftar di sini
          </span>
        </p>

        {/* Test Login Button - Remove in production */}
        <div style={styles.testPanel}>
          <p style={styles.testText}>🧪 Quick Test:</p>
          <button onClick={handleTestLogin} style={styles.testBtn}>
            Fill Test Credentials
          </button>
          <p style={styles.testHint}>
            Email: admin@papadin.com<br/>
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========== STYLES ========== */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Poppins', sans-serif",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    width: "100%",
    maxWidth: "450px",
    animation: "slideIn 0.3s ease-out",
  },
  iconContainer: {
    textAlign: "center",
    marginBottom: "20px",
  },
  icon: {
    fontSize: "60px",
    display: "inline-block",
    animation: "bounce 2s infinite",
  },
  title: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "10px",
    fontSize: "28px",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    fontSize: "14px",
    color: "#7f8c8d",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: "5px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #e0e0e0",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  btn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  errorBox: {
    background: "#ffebee",
    color: "#c62828",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    border: "1px solid #ef5350",
  },
  errorIcon: {
    fontSize: "18px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "25px 0",
  },
  dividerText: {
    padding: "0 10px",
    color: "#95a5a6",
    fontSize: "13px",
    width: "100%",
    textAlign: "center",
  },
  registerText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#7f8c8d",
    marginTop: "10px",
  },
  registerLink: {
    color: "#667eea",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "underline",
  },
  testPanel: {
    marginTop: "30px",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "10px",
    border: "2px dashed #e0e0e0",
  },
  testText: {
    margin: "0 0 10px 0",
    fontSize: "12px",
    fontWeight: "600",
    color: "#7f8c8d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  testBtn: {
    width: "100%",
    background: "#9c27b0",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "10px",
  },
  testHint: {
    fontSize: "11px",
    color: "#95a5a6",
    margin: "10px 0 0 0",
    lineHeight: "1.6",
  },
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  input:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  button:active:not(:disabled) {
    transform: translateY(0);
  }
`;
document.head.appendChild(styleSheet);

export default Login;