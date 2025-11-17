// src/AdminDashboard.js
import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import ViewStock from "./ViewStock";
import AITest from "./AITest";
import MLPredictions from "./MLPredictions";
import ReceiptScanner from "./ReceiptScanner";
import AnomalyDetection from "./AnomalyDetection";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard({ user, handleLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalOutlets: 0,
    lowStockItems: 0,
    todayOrders: 0,
  });
  const [showAIChat, setShowAIChat] = useState(false);

  // Fetch all stock data
  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/get-stock");
      const data = await res.json();

      if (data.success) {
        setStockData(data.data);
        calculateStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
      alert("Failed to connect to backend. Make sure Node.js server is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const outlets = new Set(data.map((item) => item.outlet));
    const lowStock = data.filter((item) => Number(item.baki) < 10);

    const today = new Date().toISOString().split("T")[0];
    const todayData = data.filter((item) => item.tarikh === today);
    const todayOrdersTotal = todayData.reduce(
      (sum, item) => sum + Number(item.order || 0),
      0
    );

    setStats({
      totalRecords: data.length,
      totalOutlets: outlets.size,
      lowStockItems: lowStock.length,
      todayOrders: todayOrdersTotal,
    });
  };

  // Render different views based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div style={loadingContainer}>
          <div style={spinner}></div>
          <p>Loading dashboard data...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return <OverviewTab stockData={stockData} stats={stats} />;
      case "stock":
        return <ViewStock />;
      case "analytics":
        return <AnalyticsTab stockData={stockData} />;
      case "predictions":
        return <MLPredictions user={user} />;
      case "receipt":
        return <ReceiptScanner />;
      case "anomaly":
        return <AnomalyDetection />;
      case "outlets":
        return <OutletsTab stockData={stockData} />;
      default:
        return <OverviewTab stockData={stockData} stats={stats} />;
    }
  };

  return (
    <div style={container}>
      {/* Sidebar Navigation */}
      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main style={mainContent}>
        {/* Header */}
        <div style={header}>
          <div>
            <h1 style={headerTitle}>Admin Dashboard</h1>
            <p style={headerSubtitle}>
              Manage all outlets and monitor stock levels
            </p>
          </div>
          <button onClick={fetchStockData} style={refreshBtn}>
            🔄 Refresh Data
          </button>
        </div>

        {/* Content Area */}
        <div style={contentArea}>{renderContent()}</div>

        {/* Footer - Professional Version */}
        <footer style={footer}>
          <div style={footerContent}>
            <div style={footerBrand}>
              <div>
                <h4 style={footerTitle}>Papadin AI</h4>
                <p style={footerSubtitle}>Intelligent Chicken Wholesale Inventory Management</p>
              </div>
            </div>
            
            <div style={footerDivider}></div>
            
            <div style={footerInfo}>
              <p style={footerDeveloper}>
                Developed by <strong>Asyiqin Rohaidy</strong>
              </p>
            </div>
            
            <p style={footerCopyright}>
              © 2025 Papadin AI • All Rights Reserved
            </p>
          </div>
        </footer>
      </main>

      {/* Floating AI Chat Button */}
      <div style={floatingChatContainer}>
        {showAIChat ? (
          <div style={chatWindow}>
            <button
              onClick={() => setShowAIChat(false)}
              style={closeChatBtn}
            >
              ×
            </button>
            <AITest user={user} />
          </div>
        ) : (
          <button onClick={() => setShowAIChat(true)} style={chatToggleBtn}>
            🤖
          </button>
        )}
      </div>
    </div>
  );
}

// ========== OVERVIEW TAB ==========
function OverviewTab({ stockData, stats }) {
  // Get recent activity
  const recentActivity = stockData
    .sort((a, b) => new Date(b.tarikh) - new Date(a.tarikh))
    .slice(0, 10);

  // Get low stock alerts
  const lowStockAlerts = stockData
    .filter((item) => Number(item.baki) < 10)
    .slice(0, 5);

  return (
    <div>
      {/* Stats Cards */}
      <div style={statsGrid}>
        <StatsCard
          title="Total Records"
          value={stats.totalRecords}
          icon="📊"
          color="#4caf50"
        />
        <StatsCard
          title="Active Outlets"
          value={stats.totalOutlets}
          icon="🏪"
          color="#2196f3"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon="⚠️"
          color="#ff9800"
        />
        <StatsCard
          title="Today's Orders"
          value={stats.todayOrders}
          icon="📦"
          color="#9c27b0"
        />
      </div>

      {/* Two Column Layout */}
      <div style={twoColumnGrid}>
        {/* Recent Activity */}
        <div style={card}>
          <h3 style={cardTitle}>📋 Recent Activity</h3>
          <div style={tableContainer}>
            {recentActivity.length === 0 ? (
              <p style={emptyText}>No recent activity</p>
            ) : (
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Date</th>
                    <th style={th}>Outlet</th>
                    <th style={th}>Item</th>
                    <th style={th}>Baki</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item, idx) => (
                    <tr key={idx} style={tr}>
                      <td style={td}>{item.tarikh}</td>
                      <td style={td}>{item.outlet?.split("@")[0]}</td>
                      <td style={td}>{item.item}</td>
                      <td style={td}>{item.baki}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={card}>
          <h3 style={cardTitle}>⚠️ Low Stock Alerts</h3>
          <div style={alertsContainer}>
            {lowStockAlerts.length === 0 ? (
              <p style={emptyText}>✅ All stock levels are good!</p>
            ) : (
              lowStockAlerts.map((item, idx) => (
                <div key={idx} style={alertItem}>
                  <div>
                    <strong>{item.item}</strong>
                    <p style={alertSubtext}>{item.outlet?.split("@")[0]}</p>
                  </div>
                  <div style={alertBadge}>{item.baki} {item.unit}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== ANALYTICS TAB ==========
function AnalyticsTab({ stockData }) {
  // Prepare chart data
  const itemData = {};
  const outletData = {};

  stockData.forEach((item) => {
    // Group by item
    if (!itemData[item.item]) {
      itemData[item.item] = { total: 0, count: 0 };
    }
    itemData[item.item].total += Number(item.order || 0);
    itemData[item.item].count += 1;

    // Group by outlet
    if (!outletData[item.outlet]) {
      outletData[item.outlet] = { total: 0, count: 0 };
    }
    outletData[item.outlet].total += Number(item.order || 0);
    outletData[item.outlet].count += 1;
  });

  const itemChartData = Object.keys(itemData).map((key) => ({
    name: key,
    orders: itemData[key].total,
    average: Math.round(itemData[key].total / itemData[key].count),
  }));

  const outletChartData = Object.keys(outletData).map((key) => ({
    name: key.split("@")[0],
    orders: outletData[key].total,
  }));

  const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#9c27b0", "#f44336"];

  return (
    <div>
      <h2 style={sectionTitle}>📈 Analytics & Reports</h2>

      {/* Charts Grid */}
      <div style={chartsGrid}>
        {/* Bar Chart - Orders by Item */}
        <div style={chartCard}>
          <h3 style={chartTitle}>Orders by Item</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={itemChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Orders by Outlet */}
        <div style={chartCard}>
          <h3 style={chartTitle}>Orders Distribution by Outlet</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outletChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="orders"
              >
                {outletChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Trend */}
        <div style={{ ...chartCard, gridColumn: "1 / -1" }}>
          <h3 style={chartTitle}>Order Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={stockData
                .sort((a, b) => new Date(a.tarikh) - new Date(b.tarikh))
                .slice(-30)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tarikh" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="order"
                stroke="#4caf50"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="baki"
                stroke="#2196f3"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ========== OUTLETS TAB ==========
function OutletsTab({ stockData }) {
  const outlets = {};

  stockData.forEach((item) => {
    if (!outlets[item.outlet]) {
      outlets[item.outlet] = {
        email: item.outlet,
        totalRecords: 0,
        totalOrders: 0,
        lastUpdate: item.tarikh,
        items: new Set(),
      };
    }
    outlets[item.outlet].totalRecords += 1;
    outlets[item.outlet].totalOrders += Number(item.order || 0);
    outlets[item.outlet].items.add(item.item);

    if (new Date(item.tarikh) > new Date(outlets[item.outlet].lastUpdate)) {
      outlets[item.outlet].lastUpdate = item.tarikh;
    }
  });

  const outletsList = Object.values(outlets).map((outlet) => ({
    ...outlet,
    itemsCount: outlet.items.size,
  }));

  return (
    <div>
      <h2 style={sectionTitle}>🏪 Outlets Management</h2>

      <div style={outletsGrid}>
        {outletsList.map((outlet, idx) => (
          <div key={idx} style={outletCard}>
            <div style={outletHeader}>
              <div style={outletIcon}>🏪</div>
              <div>
                <h3 style={outletName}>{outlet.email.split("@")[0]}</h3>
                <p style={outletEmail}>{outlet.email}</p>
              </div>
            </div>

            <div style={outletStats}>
              <div style={outletStat}>
                <span style={outletStatLabel}>Total Records</span>
                <span style={outletStatValue}>{outlet.totalRecords}</span>
              </div>
              <div style={outletStat}>
                <span style={outletStatLabel}>Total Orders</span>
                <span style={outletStatValue}>{outlet.totalOrders}</span>
              </div>
              <div style={outletStat}>
                <span style={outletStatLabel}>Items Tracked</span>
                <span style={outletStatValue}>{outlet.itemsCount}</span>
              </div>
              <div style={outletStat}>
                <span style={outletStatLabel}>Last Update</span>
                <span style={outletStatValue}>{outlet.lastUpdate}</span>
              </div>
            </div>

            <button style={viewDetailsBtn}>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== STATS CARD COMPONENT ==========
function StatsCard({ title, value, icon, color }) {
  return (
    <div style={{ ...statsCard, borderTop: `4px solid ${color}` }}>
      <div style={statsCardHeader}>
        <span style={statsCardIcon}>{icon}</span>
        <h3 style={statsCardTitle}>{title}</h3>
      </div>
      <p style={statsCardValue}>{value}</p>
    </div>
  );
}

/* ========== STYLES ========== */
const container = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Poppins, sans-serif",
  background: "#f5f7fa",
};

const mainContent = {
  flex: 1,
  padding: "30px",
  overflowY: "auto",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
};

const headerTitle = {
  margin: "0 0 5px 0",
  fontSize: "32px",
  color: "#2c3e50",
};

const headerSubtitle = {
  margin: 0,
  fontSize: "14px",
  color: "#7f8c8d",
};

const refreshBtn = {
  background: "#4caf50",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
};

const contentArea = {
  minHeight: "calc(100vh - 150px)",
};

const loadingContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "400px",
};

const spinner = {
  width: "50px",
  height: "50px",
  border: "5px solid #f3f3f3",
  borderTop: "5px solid #4caf50",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  marginBottom: "20px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const statsCard = {
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const statsCardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "15px",
};

const statsCardIcon = {
  fontSize: "32px",
};

const statsCardTitle = {
  margin: 0,
  fontSize: "14px",
  color: "#7f8c8d",
  fontWeight: "500",
};

const statsCardValue = {
  margin: 0,
  fontSize: "36px",
  fontWeight: "700",
  color: "#2c3e50",
};

const twoColumnGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const card = {
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const cardTitle = {
  margin: "0 0 20px 0",
  fontSize: "18px",
  color: "#2c3e50",
};

const tableContainer = {
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "2px solid #ecf0f1",
  fontSize: "13px",
  fontWeight: "600",
  color: "#7f8c8d",
};

const tr = {
  borderBottom: "1px solid #ecf0f1",
};

const td = {
  padding: "12px",
  fontSize: "14px",
  color: "#2c3e50",
};

const emptyText = {
  textAlign: "center",
  color: "#95a5a6",
  padding: "20px",
};

const alertsContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const alertItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  background: "#fff3cd",
  borderRadius: "8px",
  border: "1px solid #ffc107",
};

const alertSubtext = {
  margin: "5px 0 0 0",
  fontSize: "12px",
  color: "#7f8c8d",
};

const alertBadge = {
  background: "#ff9800",
  color: "white",
  padding: "5px 12px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "600",
};

const sectionTitle = {
  marginBottom: "20px",
  fontSize: "24px",
  color: "#2c3e50",
};

const chartsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: "20px",
};

const chartCard = {
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const chartTitle = {
  margin: "0 0 20px 0",
  fontSize: "16px",
  color: "#2c3e50",
  fontWeight: "600",
};

const outletsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
};

const outletCard = {
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const outletHeader = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  marginBottom: "20px",
};

const outletIcon = {
  fontSize: "40px",
};

const outletName = {
  margin: "0 0 5px 0",
  fontSize: "18px",
  color: "#2c3e50",
};

const outletEmail = {
  margin: 0,
  fontSize: "12px",
  color: "#7f8c8d",
};

const outletStats = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  marginBottom: "20px",
};

const outletStat = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const outletStatLabel = {
  fontSize: "11px",
  color: "#95a5a6",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const outletStatValue = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#2c3e50",
};

const viewDetailsBtn = {
  width: "100%",
  background: "#4caf50",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

const floatingChatContainer = {
  position: "fixed",
  bottom: "30px",
  right: "30px",
  zIndex: 1000,
};

const chatWindow = {
  position: "relative",
  width: "380px",
  height: "500px",
  background: "white",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  overflow: "hidden",
};

const closeChatBtn = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "#ff5252",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "32px",
  height: "32px",
  fontSize: "20px",
  cursor: "pointer",
  zIndex: 10,
  fontWeight: "bold",
};

const chatToggleBtn = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  fontSize: "28px",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
};

// ========== FOOTER STYLES (Professional Version) ==========
const footer = {
  marginTop: "60px",
  padding: "40px 30px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const footerContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  textAlign: "center",
};

const footerBrand = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "15px",
  marginBottom: "25px",
};

const footerLogo = {
  fontSize: "48px",
};

const footerTitle = {
  margin: "0",
  fontSize: "24px",
  color: "white",
  fontWeight: "700",
};

const footerSubtitle = {
  margin: "5px 0 0 0",
  fontSize: "13px",
  color: "rgba(255,255,255,0.8)",
};

const footerDivider = {
  height: "1px",
  background: "rgba(255,255,255,0.2)",
  margin: "25px auto",
  width: "60%",
};

const footerInfo = {
  textAlign: "center",
  marginBottom: "25px",
};

const footerDeveloper = {
  margin: "0 0 8px 0",
  fontSize: "16px",
  color: "white",
  fontWeight: "500",
};

const footerCredentials = {
  margin: "0",
  fontSize: "14px",
  color: "rgba(255,255,255,0.9)",
};

const footerCopyright = {
  margin: "0",
  fontSize: "12px",
  color: "rgba(255,255,255,0.6)",
};

export default AdminDashboard;