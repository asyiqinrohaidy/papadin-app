import React, { useEffect, useState } from "react";

function ViewStock() {
  const [stock, setStock] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch stock data from backend
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch("http://localhost:5001/get-stock");
        const data = await res.json();
        if (data.success) setStock(data.data);
      } catch (err) {
        console.error("❌ Error fetching stock:", err);
        alert("Gagal memuat data stok dari server.");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  // 📝 Edit stock
  const handleEdit = (item) => setSelected({ ...item });

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5001/update-stock/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setStock((prev) =>
          prev.map((s) => (s.id === selected.id ? selected : s))
        );
        setSelected(null);
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      alert("❌ Server error semasa kemaskini.");
    }
  };

  // 🗑 Delete stock
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Anda pasti ingin padam rekod ini?")) return;
    try {
      const res = await fetch(`http://localhost:5001/delete-stock/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setStock((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      alert("❌ Gagal hubung ke server.");
    }
  };

  if (loading) return <p>⏳ Loading stok...</p>;

  return (
    <div style={page}>
      <h2 style={title}>📊 Admin Stok Papadin FC</h2>

      <table style={table}>
        <thead>
          <tr style={thead}>
            <th>Item</th>
            <th>Baki</th>
            <th>Order</th>
            <th>Remark</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stock.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                Tiada data stok ditemui.
              </td>
            </tr>
          ) : (
            stock.map((item) => (
              <tr key={item.id} style={row}>
                <td>{item.item}</td>
                <td>{item.baki}</td>
                <td>{item.order}</td>
                <td>{item.remark}</td>
                <td>
                  <button onClick={() => handleEdit(item)} style={editBtn}>
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={deleteBtn}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✏️ Edit Modal */}
      {selected && (
        <div style={modal}>
          <div style={modalBox}>
            <h3>Edit {selected.item}</h3>
            <label>Baki:</label>
            <input
              type="number"
              value={selected.baki}
              onChange={(e) => setSelected({ ...selected, baki: e.target.value })}
            />
            <label>Order:</label>
            <input
              type="number"
              value={selected.order}
              onChange={(e) => setSelected({ ...selected, order: e.target.value })}
            />
            <label>Remark:</label>
            <input
              type="text"
              value={selected.remark}
              onChange={(e) =>
                setSelected({ ...selected, remark: e.target.value })
              }
            />
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <button onClick={handleSave} style={saveBtn}>
                💾 Save
              </button>
              <button onClick={() => setSelected(null)} style={cancelBtn}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🎨 Styles */
const page = {
  padding: "40px",
  fontFamily: "Poppins, sans-serif",
  background: "linear-gradient(135deg, #d4fc79, #96e6a1)",
  minHeight: "100vh",
};

const title = { textAlign: "center", color: "#256d1b", marginBottom: "25px" };

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
};

const thead = {
  backgroundColor: "#fef3c7",
  color: "#333",
  fontWeight: "bold",
};

const row = { textAlign: "center", borderBottom: "1px solid #ddd" };

const editBtn = {
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "5px 10px",
  marginRight: "5px",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#e53935",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "5px 10px",
  cursor: "pointer",
};

const modal = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox = {
  background: "#fff",
  padding: "25px",
  borderRadius: "15px",
  width: "300px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const saveBtn = {
  background: "#4caf50",
  color: "white",
  border: "none",
  padding: "8px 15px",
  borderRadius: "8px",
  marginRight: "8px",
  cursor: "pointer",
};

const cancelBtn = {
  background: "#ccc",
  border: "none",
  padding: "8px 15px",
  borderRadius: "8px",
  cursor: "pointer",
};

export default ViewStock;
