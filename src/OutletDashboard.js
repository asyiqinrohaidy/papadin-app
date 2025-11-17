// src/OutletDashboard.js
import React, { useState, useEffect } from "react";

function OutletDashboard({ user, handleLogout }) {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Search state
  const [searchDate, setSearchDate] = useState("");
  const [searchItem, setSearchItem] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    tarikh: new Date().toISOString().split('T')[0],
    item: "Ayam",
    unit: "EKOR",
    stockIn: "",
    order: "",
    baki: "",
  });

  useEffect(() => {
    fetchOutletStock();
  }, [user]);

  useEffect(() => {
    filterData();
  }, [stockData, searchDate, searchItem]);

  const fetchOutletStock = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/get-stock");
      const data = await res.json();

      if (data.success) {
        const myStock = data.data.filter(item => item.outlet === user.email);
        
        // Sort by date in ASCENDING order (oldest first)
        const sortedStock = myStock.sort((a, b) => {
          return new Date(a.tarikh) - new Date(b.tarikh);
        });
        
        setStockData(sortedStock);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...stockData];

    // Filter by date
    if (searchDate) {
      filtered = filtered.filter(item => item.tarikh === searchDate);
    }

    // Filter by item name
    if (searchItem) {
      filtered = filtered.filter(item => 
        item.item.toLowerCase().includes(searchItem.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setSearchDate("");
    setSearchItem("");
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5001/add-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          outlet: user.email
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Stock added successfully!");
        setShowAddModal(false);
        resetForm();
        fetchOutletStock();
      } else {
        alert("❌ Failed to add stock: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error adding stock");
    }
  };

  const handleEditStock = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5001/update-stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Stock updated successfully!");
        setEditingItem(null);
        resetForm();
        fetchOutletStock();
      } else {
        alert("❌ Failed to update stock");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error updating stock");
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/delete-stock/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Stock deleted successfully!");
        fetchOutletStock();
      } else {
        alert("❌ Failed to delete stock");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error deleting stock");
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      tarikh: item.tarikh,
      item: item.item,
      unit: item.unit,
      stockIn: item.stockIn,
      order: item.order,
      baki: item.baki,
    });
  };

  const resetForm = () => {
    setFormData({
      tarikh: new Date().toISOString().split('T')[0],
      item: "Ayam",
      unit: "EKOR",
      stockIn: "",
      order: "",
      baki: "",
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    resetForm();
  };

  // Use filtered data if filters are active, otherwise use all data
  const displayData = searchDate || searchItem ? filteredData : stockData;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏪 Outlet Dashboard</h1>
          <p style={styles.subtitle}>{user.email}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📦</div>
          <div>
            <div style={styles.statLabel}>Total Items</div>
            <div style={styles.statValue}>{stockData.length}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>⚠️</div>
          <div>
            <div style={styles.statLabel}>Low Stock</div>
            <div style={styles.statValue}>
              {stockData.filter(item => item.baki < 10).length}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <div style={styles.statLabel}>Today's Orders</div>
            <div style={styles.statValue}>
              {stockData.filter(item => item.tarikh === new Date().toISOString().split('T')[0]).length}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>📋 My Stock</h2>
          <button 
            onClick={() => setShowAddModal(true)} 
            style={styles.addBtn}
          >
            ➕ Add New Stock
          </button>
        </div>

        {/* Search/Filter Bar */}
        <div style={styles.searchBar}>
          <div style={styles.searchGroup}>
            <label style={styles.searchLabel}>🔍 Search by Date:</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.searchGroup}>
            <label style={styles.searchLabel}>🔍 Search by Item:</label>
            <input
              type="text"
              placeholder="e.g., Ayam, Tepung..."
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {(searchDate || searchItem) && (
            <button onClick={clearFilters} style={styles.clearBtn}>
              ✖️ Clear Filters
            </button>
          )}

          <div style={styles.searchResults}>
            Showing <strong>{displayData.length}</strong> of <strong>{stockData.length}</strong> records
          </div>
        </div>
        
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : displayData.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>
              {searchDate || searchItem ? "🔍" : "📦"}
            </div>
            <p>
              {searchDate || searchItem 
                ? "No records found matching your search criteria." 
                : "No stock data yet. Click 'Add New Stock' to get started!"}
            </p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date ↑</th>
                  <th style={styles.th}>Item</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Stock In</th>
                  <th style={styles.th}>Order</th>
                  <th style={styles.th}>Baki</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((item, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={styles.td}>{item.tarikh}</td>
                    <td style={styles.td}>{item.item}</td>
                    <td style={styles.td}>{item.unit}</td>
                    <td style={styles.td}>{item.stockIn}</td>
                    <td style={styles.td}>{item.order}</td>
                    <td style={styles.td}>{item.baki}</td>
                    <td style={styles.td}>
                      {item.baki < 10 ? (
                        <span style={styles.badgeLow}>Low</span>
                      ) : (
                        <span style={styles.badgeOk}>OK</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => openEditModal(item)}
                        style={styles.editBtn}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteStock(item.id)}
                        style={styles.deleteBtn}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingItem ? "✏️ Edit Stock" : "➕ Add New Stock"}
              </h3>
              <button onClick={closeModal} style={styles.closeBtn}>×</button>
            </div>

            <form onSubmit={editingItem ? handleEditStock : handleAddStock}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    name="tarikh"
                    value={formData.tarikh}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Item</label>
                  <select
                    name="item"
                    value={formData.item}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  >
                    <option value="Ayam">Ayam</option>
                    <option value="Tepung">Tepung</option>
                    <option value="Minyak 5L">Minyak 5L</option>
                    <option value="Ais">Ais</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  >
                    <option value="EKOR">EKOR</option>
                    <option value="BAG">BAG</option>
                    <option value="BTL">BTL</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock In</label>
                  <input
                    type="number"
                    name="stockIn"
                    value={formData.stockIn}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Baki</label>
                  <input
                    type="number"
                    name="baki"
                    value={formData.baki}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  {editingItem ? "Update" : "Add Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer - Professional Version */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <div>
              <h4 style={styles.footerTitle}>Papadin AI</h4>
              <p style={styles.footerSubtitle}>Intelligent Chicken Wholesale Inventory Management</p>
            </div>
          </div>
          
          <div style={styles.footerDivider}></div>
          
          <div style={styles.footerInfo}>
            <p style={styles.footerDeveloper}>
              Developed by <strong>Asyiqin Rohaidy</strong>
            </p>
          </div>
          
          <p style={styles.footerCopyright}>
            © 2025 Papadin AI • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ========== STYLES ========== */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f7fa",
    padding: "20px",
    fontFamily: "'Poppins', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#2c3e50",
  },
  subtitle: {
    margin: "5px 0 0 0",
    fontSize: "14px",
    color: "#7f8c8d",
  },
  logoutBtn: {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  statIcon: {
    fontSize: "40px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#7f8c8d",
    marginBottom: "5px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#2c3e50",
  },
  addBtn: {
    background: "#4caf50",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  searchBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    alignItems: "center",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  searchGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    flex: "1 1 200px",
  },
  searchLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  searchInput: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
  },
  clearBtn: {
    background: "#95a5a6",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    alignSelf: "flex-end",
  },
  searchResults: {
    fontSize: "13px",
    color: "#7f8c8d",
    alignSelf: "flex-end",
    marginLeft: "auto",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #ecf0f1",
    fontSize: "13px",
    fontWeight: "600",
    color: "#7f8c8d",
  },
  tr: {
    borderBottom: "1px solid #ecf0f1",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#2c3e50",
  },
  badgeLow: {
    background: "#ffebee",
    color: "#c62828",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  badgeOk: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  editBtn: {
    background: "#2196f3",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "14px",
  },
  deleteBtn: {
    background: "#f44336",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#95a5a6",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#95a5a6",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "12px",
    padding: "25px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#2c3e50",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "32px",
    cursor: "pointer",
    color: "#95a5a6",
    lineHeight: 1,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
  },
  modalFooter: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    background: "#95a5a6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  submitBtn: {
    background: "#4caf50",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  
  // ========== FOOTER STYLES (Professional Version) ==========
  footer: {
    marginTop: "60px",
    padding: "40px 30px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
  },
  footerBrand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "25px",
  },
  footerLogo: {
    fontSize: "48px",
  },
  footerTitle: {
    margin: "0",
    fontSize: "24px",
    color: "white",
    fontWeight: "700",
  },
  footerSubtitle: {
    margin: "5px 0 0 0",
    fontSize: "13px",
    color: "rgba(255,255,255,0.8)",
  },
  footerDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.2)",
    margin: "25px auto",
    width: "60%",
  },
  footerInfo: {
    textAlign: "center",
    marginBottom: "25px",
  },
  footerDeveloper: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    color: "white",
    fontWeight: "500",
  },
  footerCredentials: {
    margin: "0",
    fontSize: "14px",
    color: "rgba(255,255,255,0.9)",
  },
  footerCopyright: {
    margin: "0",
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
  },
};

export default OutletDashboard;