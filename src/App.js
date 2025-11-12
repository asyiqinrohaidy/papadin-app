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
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
      
      if (currentUser) {
        // Get user role from Firestore
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const role = docSnap.data().role;
            console.log("User role:", role);
            setUserRole(role);
          } else {
            // If no Firestore document, check if it's admin email
            if (currentUser.email === "admin@papadin.com") {
              setUserRole("admin");
            } else {
              setUserRole("outlet");
            }
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          // Fallback: check email
          if (currentUser.email === "admin@papadin.com") {
            setUserRole("admin");
          } else {
            setUserRole("outlet");
          }
        }
        
        setCurrentPage("dashboard");
      } else {
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
      alert("✅ Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      alert("❌ Logout failed: " + error.message);
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

  // Not logged in - show Login or Register
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

  // Logged in - show dashboard based on role
  return (
    <div className="App">
      {userRole === "admin" ? (
        <AdminDashboard user={user} handleLogout={handleLogout} />
      ) : (
        <OutletDashboard user={user} handleLogout={handleLogout} />
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

