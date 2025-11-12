// src/AdminNavbar.js
import React from "react";

function AdminNavbar({ activeTab, setActiveTab, user, handleLogout }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "stock", label: "All Stock", icon: "📦" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "predictions", label: "ML Predictions", icon: "🤖" },
    { id: "receipt", label: "Receipt Scanner", icon: "📸" },
    { id: "anomaly", label: "Anomaly Detection", icon: "🔍" },
    { id: "outlets", label: "Outlets", icon: "🏪" },
  ];

  return (
    <aside style={sidebar}>
      {/* Logo Section */}
      <div style={logoSection}>
        <div style={logoIcon}>🍗</div>
        <div>
          <h2 style={logoTitle}>Papadin</h2>
          <p style={logoSubtitle}>Admin Panel</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={navMenu}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={activeTab === item.id ? activeNavBtn : navBtn}
          >
            <span style={navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div style={userSection}>
        <div style={userInfo}>
          <div style={userAvatar}>👤</div>
          <div>
            <p style={userName}>Admin</p>
            <p style={userEmail}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={logoutBtn}>
          <span style={logoutIcon}>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

/* ========== STYLES ========== */
const sidebar = {
  width: "280px",
  background: "linear-gradient(180deg, #2c3e50 0%, #34495e 100%)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  boxShadow: "4px 0 12px rgba(0,0,0,0.15)",
  position: "sticky",
  top: 0,
  height: "100vh",
  overflowY: "auto",
};

const logoSection = {
  padding: "30px 20px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const logoIcon = {
  fontSize: "48px",
  lineHeight: 1,
};

const logoTitle = {
  margin: "0 0 5px 0",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "0.5px",
};

const logoSubtitle = {
  margin: 0,
  fontSize: "12px",
  opacity: 0.8,
  fontWeight: "400",
};

const navMenu = {
  flex: 1,
  padding: "20px 15px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const navBtn = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 15px",
  background: "rgba(255,255,255,0.05)",
  border: "none",
  borderRadius: "10px",
  color: "white",
  fontSize: "15px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textAlign: "left",
  fontFamily: "Poppins, sans-serif",
};

const activeNavBtn = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 15px",
  background: "white",
  border: "none",
  borderRadius: "10px",
  color: "#2c3e50",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textAlign: "left",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  fontFamily: "Poppins, sans-serif",
};

const navIcon = {
  fontSize: "20px",
  display: "inline-block",
  width: "24px",
  textAlign: "center",
};

const userSection = {
  padding: "20px",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  marginTop: "auto",
};

const userInfo = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "15px",
};

const userAvatar = {
  width: "45px",
  height: "45px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
};

const userName = {
  margin: "0 0 3px 0",
  fontSize: "15px",
  fontWeight: "600",
};

const userEmail = {
  margin: 0,
  fontSize: "11px",
  opacity: 0.8,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "180px",
};

const logoutBtn = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "10px",
  background: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  fontFamily: "Poppins, sans-serif",
};

const logoutIcon = {
  fontSize: "18px",
};

export default AdminNavbar;