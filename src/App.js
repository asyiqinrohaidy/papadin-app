// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// Import pages
import Login from "./Login";
import Register from "./Register";
import AppOutlet from "./AppOutlet";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            // If no role found, default to outlet
            setRole("outlet");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole("outlet");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    await auth.signOut();
    setUser(null);
    setRole(null);
  };

  if (loading) {
    return (
      <div style={loadingScreen}>
        <h2>Loading Papadin System...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            user ? 
            <Navigate to="/dashboard" /> : 
            <Login setUser={setUser} setRole={setRole} />
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? 
            <Navigate to="/dashboard" /> : 
            <Register />
          } 
        />

        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              role === "admin" ? (
                <AdminDashboard user={user} handleLogout={handleLogout} />
              ) : (
                <AppOutlet user={user} handleLogout={handleLogout} />
              )
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Default Route */}
        <Route 
          path="/" 
          element={
            user ? 
            <Navigate to="/dashboard" /> : 
            <Navigate to="/login" />
          } 
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

const loadingScreen = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  fontFamily: "Poppins, sans-serif",
  background: "linear-gradient(135deg, #a5d6a7, #81c784)",
};

export default App;