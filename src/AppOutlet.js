// src/AppOutlet.js
import React, { useState } from "react";
import AddStock from "./AddStock";

function AppOutlet({ user, handleLogout }) {
  const [tab, setTab] = useState("add");

  return (
    <div style={container}>
      {/* SIDEBAR */}
      <aside style={sidebar}>
        <div style={logoBox}>
          <h2 style={{ margin: "5px 0", fontSize: "24px" }}>Papadin</h2>
          <p style={{ fontSize: "12px", margin: "5px 0" }}>Outlet System</p>
        </div>

        <nav style={menu}>
          <button
            onClick={() => setTab("add")}
            style={tab === "add" ? activeBtn : navBtn}
          >
            Add Report
          </button>
          <button
            onClick={() => setTab("view")}
            style={tab === "view" ? activeBtn : navBtn}
          >
            View Reports
          </button>
        </nav>

        <div style={bottomBox}>
          <p style={{ fontSize: "13px", marginBottom: "10px" }}>
            Logged in as: <br />
            <b>{user.email}</b>
          </p>
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={main}>
        {tab === "add" && <AddStock user={user} />}
        {tab === "view" && <ViewStockOutlet user={user} />}
      </main>
    </div>
  );
}

// Outlet-specific ViewStock component with Edit and Search
function ViewStockOutlet({ user }) {
  const [stock, setStock] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editingId, setEditingId] = React.useState(null);
  const [editData, setEditData] = React.useState({});
  const [searchDate, setSearchDate] = React.useState("");

  React.useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await fetch("http://localhost:5001/get-stock");
      const data = await res.json();
      if (data.success) {
        // Filter to show only this outlet's data and sort by date (oldest first)
        const filtered = data.data
          .filter((item) => item.outlet === user.email)
          .sort((a, b) => new Date(a.tarikh) - new Date(b.tarikh));
        setStock(filtered);
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
      alert("Failed to connect to server. Make sure Node.js backend is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditData({
      tarikh: item.tarikh,
      item: item.item,
      unit: item.unit,
      stockIn: item.stockIn,
      baki: item.baki,
      order: item.order,
      remark: item.remark,
    });
  };

  // Save edited data
  const handleSave = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/update-stock/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editData,
          outlet: user.email,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        // Update local state
        setStock((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...editData } : s))
        );
        setEditingId(null);
        setEditData({});
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update.");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  // Delete record
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await fetch(`http://localhost:5001/delete-stock/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setStock((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to connect to server.");
    }
  };

  // Filter by search date
  const filteredStock = searchDate
    ? stock.filter((item) => item.tarikh === searchDate)
    : stock;

  if (loading) {
    return (
      <div style={viewPage}>
        <p style={{ textAlign: "center", marginTop: "50px" }}>
          Loading stock data...
        </p>
      </div>
    );
  }

  return (
    <div style={viewPage}>
      <h2 style={viewTitle}>My Stock Reports</h2>

      {/* Search Bar */}
      <div style={searchContainer}>
        <label style={{ fontWeight: "600", marginRight: "10px" }}>
          Search by Date:
        </label>
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          style={searchInput}
        />
        {searchDate && (
          <button
            onClick={() => setSearchDate("")}
            style={clearBtn}
          >
            Clear
          </button>
        )}
      </div>

      {filteredStock.length === 0 ? (
        <div style={emptyState}>
          <p style={{ fontSize: "18px", color: "#666" }}>
            {searchDate ? "No reports found for this date." : "No stock reports yet."}
          </p>
          <p style={{ fontSize: "14px", color: "#999" }}>
            {!searchDate && 'Click "Add Report" to create your first stock report!'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={viewTable}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Item</th>
                <th style={th}>Unit</th>
                <th style={th}>Stock In</th>
                <th style={th}>Balance</th>
                <th style={th}>Order</th>
                <th style={th}>Remark</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => (
                <tr key={item.id} style={tr}>
                  {editingId === item.id ? (
                    // EDIT MODE
                    <>
                      <td style={td}>
                        <input
                          type="date"
                          value={editData.tarikh}
                          onChange={(e) =>
                            setEditData({ ...editData, tarikh: e.target.value })
                          }
                          style={editInput}
                        />
                      </td>
                      <td style={td}>
                        <input
                          type="text"
                          value={editData.item}
                          onChange={(e) =>
                            setEditData({ ...editData, item: e.target.value })
                          }
                          style={editInput}
                        />
                      </td>
                      <td style={td}>
                        <input
                          type="text"
                          value={editData.unit}
                          onChange={(e) =>
                            setEditData({ ...editData, unit: e.target.value })
                          }
                          style={editInput}
                        />
                      </td>
                      <td style={td}>
                        <input
                          type="number"
                          value={editData.stockIn}
                          onChange={(e) =>
                            setEditData({ ...editData, stockIn: e.target.value })
                          }
                          style={editInput}
                        />
                      </td>
                      <td style={td}>
                        <input
                          type="number"
                          value={editData.baki}
                          onChange={(e) =>
                            setEditData({ ...editData, baki: e.target.value })
                          }
                          style={editInput}
                        />
                      </td>
                      <td style={td}>
                        <input
                          type="number"
                          value={editData.order}
                          onChange={(e) =>
                            setEditData({ ...editData, order: e.target.value })
                          }
                          style={editInput}
                        />
                      </td>
                      <td style={td}>
                        <input
                          type="text"
                          value={editData.remark}
                          onChange={(e) =>
                            setEditData({ ...editData, remark: e.target.value })
                          }
                          style={editInput}
                        />
                      </td>
                      <td style={td}>
                        <button
                          onClick={() => handleSave(item.id)}
                          style={saveBtn}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          style={cancelBtn}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    // VIEW MODE
                    <>
                      <td style={td}>{item.tarikh}</td>
                      <td style={td}>{item.item}</td>
                      <td style={td}>{item.unit}</td>
                      <td style={td}>{item.stockIn || 0}</td>
                      <td style={td}>{item.baki || 0}</td>
                      <td style={td}>{item.order || 0}</td>
                      <td style={td}>{item.remark || "-"}</td>
                      <td style={td}>
                        <button
                          onClick={() => handleEdit(item)}
                          style={editBtn}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={deleteBtn}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* Styles */
const container = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Poppins, sans-serif",
  background: "linear-gradient(135deg, #e8f5e9, #ffffff)",
};

const sidebar = {
  width: "240px",
  background: "linear-gradient(180deg, #2d8659, #1b5e20)",
  color: "white",
  padding: "30px 20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "3px 0 15px rgba(0,0,0,0.2)",
};

const logoBox = {
  textAlign: "center",
  marginBottom: "40px",
  paddingBottom: "20px",
  borderBottom: "1px solid rgba(255,255,255,0.2)",
};

const menu = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const navBtn = {
  background: "rgba(255,255,255,0.1)",
  border: "none",
  borderRadius: "10px",
  color: "white",
  padding: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "500",
  transition: "all 0.25s ease",
  textAlign: "left",
};

const activeBtn = {
  ...navBtn,
  background: "white",
  color: "#2d8659",
  fontWeight: "700",
  boxShadow: "0 5px 10px rgba(255,255,255,0.3)",
};

const main = {
  flex: 1,
  overflowY: "auto",
};

const bottomBox = {
  marginTop: "auto",
  textAlign: "center",
  fontSize: "14px",
  paddingTop: "20px",
  borderTop: "1px solid rgba(255,255,255,0.2)",
};

const logoutBtn = {
  background: "#e53935",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  marginTop: "10px",
  width: "100%",
  transition: "background 0.2s",
};

const viewPage = {
  padding: "40px",
  minHeight: "100vh",
};

const viewTitle = {
  textAlign: "center",
  color: "#2d8659",
  marginBottom: "30px",
  fontSize: "28px",
};

const searchContainer = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "30px",
  padding: "20px",
  background: "white",
  borderRadius: "10px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
};

const searchInput = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  marginRight: "10px",
};

const clearBtn = {
  background: "#ff9800",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};

const emptyState = {
  textAlign: "center",
  marginTop: "100px",
  padding: "40px",
  background: "white",
  borderRadius: "15px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
};

const viewTable = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
};

const th = {
  background: "#4caf50",
  color: "white",
  padding: "12px",
  textAlign: "center",
  fontWeight: "600",
  fontSize: "14px",
};

const tr = {
  borderBottom: "1px solid #e0e0e0",
};

const td = {
  padding: "12px",
  textAlign: "center",
  fontSize: "14px",
};

const editInput = {
  width: "90%",
  padding: "4px 8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "13px",
};

const editBtn = {
  background: "#2196f3",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  marginRight: "5px",
};

const deleteBtn = {
  background: "#e53935",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
};

const saveBtn = {
  background: "#4caf50",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  marginRight: "5px",
};

const cancelBtn = {
  background: "#9e9e9e",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
};

export default AppOutlet;