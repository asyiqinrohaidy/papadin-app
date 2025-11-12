import React, { useState } from "react";

function AddStock({ user }) {
  const [date, setDate] = useState("");
  const [items, setItems] = useState([
    { name: "Ayam", unit: "PCS", stockIn: "", baki: "", order: "", remark: "" },
    { name: "Tepung", unit: "BAG", stockIn: "", baki: "", order: "", remark: "" },
    { name: "Minyak 5L", unit: "BTL", stockIn: "", baki: "", order: "", remark: "" },
    { name: "Ais", unit: "BAG", stockIn: "", baki: "", order: "", remark: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSave = async () => {
    if (!date) return alert("⚠️ Sila pilih tarikh terlebih dahulu.");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/add-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarikh: date,
          outlet: user?.email || "unknown@papadin.com",
          items,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        setItems(items.map(i => ({ ...i, stockIn: "", baki: "", order: "", remark: "" })));
        setDate("");
      } else {
        alert("❌ Ralat: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Gagal hubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={title}>📦 Tambah Laporan Stok Outlet</h2>

        <div style={dateRow}>
          <label style={{ fontWeight: "600" }}>Tarikh:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={dateInput}
          />
        </div>

        <table style={table}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Unit</th>
              <th>Stock In</th>
              <th>Baki</th>
              <th>Order</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.name}</td>
                <td>{item.unit}</td>
                <td><input type="number" value={item.stockIn} onChange={(e) => handleChange(i, "stockIn", e.target.value)} style={input}/></td>
                <td><input type="number" value={item.baki} onChange={(e) => handleChange(i, "baki", e.target.value)} style={input}/></td>
                <td><input type="number" value={item.order} onChange={(e) => handleChange(i, "order", e.target.value)} style={input}/></td>
                <td><input type="text" value={item.remark} onChange={(e) => handleChange(i, "remark", e.target.value)} style={input}/></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={handleSave} disabled={loading} style={saveBtn}>
          {loading ? "⏳ Menyimpan..." : "💾 Simpan Laporan"}
        </button>
      </div>
    </div>
  );
}

/* 🌈 STYLES */
const page = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #d4fc79, #96e6a1)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px 0",
  fontFamily: "Poppins, sans-serif",
};
const card = {
  background: "rgba(255, 255, 255, 0.9)",
  padding: "40px 50px",
  borderRadius: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  width: "90%",
  maxWidth: "950px",
};
const title = { textAlign: "center", color: "#2d8659", marginBottom: "25px" };
const dateRow = { display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" };
const dateInput = { border: "1px solid #ccc", borderRadius: "8px", padding: "8px 10px" };
const table = { width: "100%", borderCollapse: "collapse", textAlign: "center" };
const input = { width: "80%", padding: "6px", border: "1px solid #ccc", borderRadius: "8px" };
const saveBtn = {
  marginTop: "25px",
  background: "linear-gradient(135deg, #42b983, #2ecc71)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  padding: "12px 25px",
  fontWeight: "600",
  fontSize: "16px",
  cursor: "pointer",
  width: "100%",
  boxShadow: "0 6px 15px rgba(0,128,0,0.3)",
};

export default AddStock;
