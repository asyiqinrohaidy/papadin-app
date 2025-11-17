// src/App.js
import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";
import OutletDashboard from "./OutletDashboard";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication state and role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("════════════════════════════════════");
      console.log("🔐 Auth State Changed");
      console.log("User:", currentUser?.email);
      
      if (currentUser) {
        setUser(currentUser);
        
        // IMPORTANT: Check admin FIRST by email
        let role = "outlet"; // Default
        
        // Method 1: Hardcoded admin emails (MOST RELIABLE)
        const adminEmails = [
          "admin@papadin.com",
          "admin@example.com"
        ];
        
        if (adminEmails.includes(currentUser.email)) {
          role = "admin";
          console.log("✅ Admin detected by EMAIL:", currentUser.email);
        } else {
          // Method 2: Check Firestore for other users
          try {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const firestoreRole = docSnap.data().role;
              role = firestoreRole || "outlet";
              console.log("✅ Role from Firestore:", role);
            } else {
              console.log("⚠️ No Firestore document, using default: outlet");
            }
          } catch (error) {
            console.error("❌ Firestore error:", error);
          }
        }
        
        console.log("🎭 FINAL ROLE:", role);
        console.log("════════════════════════════════════");
        
        setUserRole(role);
        setCurrentPage("dashboard");
      } else {
        console.log("❌ No user logged in");
        console.log("════════════════════════════════════");
        setUser(null);
        setUserRole(null);
        setCurrentPage("login");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      setCurrentPage("login");
      console.log("✅ Logged out successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="App">
        {currentPage === "login" && (
          <Login setCurrentPage={setCurrentPage} />
        )}
        {currentPage === "register" && (
          <Register setCurrentPage={setCurrentPage} />
        )}
      </div>
    );
  }

  // Logged in - CRITICAL: Check role before rendering
  console.log("🎯 About to render dashboard");
  console.log("📧 User email:", user.email);
  console.log("🎭 User role:", userRole);
  console.log("🖥️ Will show:", userRole === "admin" ? "ADMIN Dashboard" : "OUTLET Dashboard");
  
  return (
    <div className="App">
      {userRole === "admin" ? (
        <>
          {console.log("✅ Rendering ADMIN Dashboard")}
          <AdminDashboard user={user} handleLogout={handleLogout} />
        </>
      ) : (
        <>
          {console.log("✅ Rendering OUTLET Dashboard")}
          <OutletDashboard user={user} handleLogout={handleLogout} />
        </>
      )}
    </div>
  );
}

/* ========== STYLES ========== */
const styles = {
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Poppins', sans-serif",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid rgba(255,255,255,0.3)",
    borderTop: "5px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "20px",
    color: "white",
    fontSize: "18px",
    fontWeight: "500",
  },
};

// Add spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default App;