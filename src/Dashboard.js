// src/Dashboard.js
import AITest from "./AITest";
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard({ user }) {
  const [laporan, setLaporan] = useState([]);
  const [newLaporan, setNewLaporan] = useState({
    tarikh: "",
    item: "",
    unit: "",
    stockIn: "",
    baki: "",
    order: "",
    remark: "",
  });
  const [totalAyam, setTotalAyam] = useState(0);
  const [jumlahLaporan, setJumlahLaporan] = useState(0);
  const [averageOrder, setAverageOrder] = useState(0);
  const [showChat, setShowChat] = useState(false); // 🧠 toggle state for chat

  // 🔹 Fetch laporan for this outlet only
  useEffect(() => {
    if (!user?.email) return;
    const fetchData = async () => {
      const stokRef = collection(db, "stokOutlet");
      const q = query(stokRef, where("outlet", "==", user.email), orderBy("tarikh", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLaporan(data);
      calculateStats(data);
    };
    fetchData();
  }, [user]);

  // 📊 Calculate stats
  const calculateStats = (data) => {
    const ayamData = data.filter((lap) => lap.item.toLowerCase().includes("ayam"));
    const totalAyamSum = ayamData.reduce((sum, lap) => sum + Number(lap.baki || 0), 0);
    const totalOrder = ayamData.reduce((sum, lap) => sum + Number(lap.order || 0), 0);
    const totalHari = ayamData.length;

    setJumlahLaporan(data.length);
    setTotalAyam(totalAyamSum);
    setAverageOrder(totalHari > 0 ? Math.round(totalOrder / totalHari) : 0);
  };

  // ➕ Add laporan
  const handleAdd = async () => {
    if (!newLaporan.tarikh || !newLaporan.item)
      return alert("⚠️ Sila isi tarikh dan item.");
    try {
      const stokRef = collection(db, "stokOutlet");
      await addDoc(stokRef, { ...newLaporan, outlet: user.email, createdAt: new Date() });
      alert("✅ Laporan baru ditambah!");
      setNewLaporan({
        tarikh: "",
        item: "",
        unit: "",
        stockIn: "",
        baki: "",
        order: "",
        remark: "",
      });
      const snapshot = await getDocs(query(stokRef, where("outlet", "==", user.email)));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLaporan(data);
      calculateStats(data);
    } catch (err) {
      console.error("❌ Ralat tambah laporan:", err);
    }
  };

  // 🧠 Auto update
  const handleAutoUpdate = async (id, field, value) => {
    try {
      const ref = doc(db, "stokOutlet", id);
      await updateDoc(ref, { [field]: value });
      setLaporan((prev) =>
        prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
      );
      console.log("✅ Updated:", field, value);
    } catch (err) {
      console.error("❌ Ralat update:", err);
    }
  };

  // 🗑️ Delete laporan
  const handleDelete = async (id) => {
    if (!window.confirm("Padam laporan ini?")) return;
    try {
      await deleteDoc(doc(db, "stokOutlet", id));
      setLaporan(laporan.filter((lap) => lap.id !== id));
      alert("🗑️ Laporan dipadam!");
    } catch (err) {
      console.error("❌ Ralat padam:", err);
    }
  };

  // 📈 Chart data (only ayam)
  const chartData = laporan
    .filter((lap) => lap.item.toLowerCase().includes("ayam"))
    .map((lap) => ({
      tarikh: lap.tarikh,
      baki: Number(lap.baki) || 0,
      order: Number(lap.order) || 0,
    }));

  return (
    <div style={page}>
      <h1 style={title}>🐔 Papadin Outlet Dashboard</h1>
      <p style={{ textAlign: "center", color: "#333" }}>
        Log masuk sebagai: <b>{user?.email}</b>
      </p>

      {/* Summary cards */}
      <div style={summaryContainer}>
        <InfoCard title="Jumlah Laporan" value={jumlahLaporan} color="#4caf50" />
        <InfoCard title="Total Ayam (Baki)" value={totalAyam} color="#81c784" />
        <InfoCard title="Purata Order / Hari" value={averageOrder} color="#2e7d32" />
      </div>

      {/* Add new laporan */}
      <div style={addRow}>
        <input type="date" value={newLaporan.tarikh}
          onChange={(e) => setNewLaporan({ ...newLaporan, tarikh: e.target.value })} style={input} />
        <input type="text" placeholder="Item"
          value={newLaporan.item}
          onChange={(e) => setNewLaporan({ ...newLaporan, item: e.target.value })} style={input} />
        <input type="text" placeholder="Unit"
          value={newLaporan.unit}
          onChange={(e) => setNewLaporan({ ...newLaporan, unit: e.target.value })} style={input} />
        <input type="number" placeholder="Stock In"
          value={newLaporan.stockIn}
          onChange={(e) => setNewLaporan({ ...newLaporan, stockIn: e.target.value })} style={input} />
        <input type="number" placeholder="Baki"
          value={newLaporan.baki}
          onChange={(e) => setNewLaporan({ ...newLaporan, baki: e.target.value })} style={input} />
        <input type="number" placeholder="Order"
          value={newLaporan.order}
          onChange={(e) => setNewLaporan({ ...newLaporan, order: e.target.value })} style={input} />
        <input type="text" placeholder="Remark"
          value={newLaporan.remark}
          onChange={(e) => setNewLaporan({ ...newLaporan, remark: e.target.value })} style={input} />
        <button onClick={handleAdd} style={addBtn}>➕ Tambah</button>
      </div>

      {/* Table */}
      <table style={table}>
        <thead>
          <tr>
            <th>Tarikh</th>
            <th>Item</th>
            <th>Unit</th>
            <th>Stock In</th>
            <th>Baki</th>
            <th>Order</th>
            <th>Remark</th>
            <th>Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {laporan.map((lap) => (
            <tr key={lap.id}>
              <td><input value={lap.tarikh} onChange={(e) => handleAutoUpdate(lap.id, "tarikh", e.target.value)} style={editInput} /></td>
              <td><input value={lap.item} onChange={(e) => handleAutoUpdate(lap.id, "item", e.target.value)} style={editInput} /></td>
              <td><input value={lap.unit || ""} onChange={(e) => handleAutoUpdate(lap.id, "unit", e.target.value)} style={editInput} /></td>
              <td><input type="number" value={lap.stockIn} onChange={(e) => handleAutoUpdate(lap.id, "stockIn", e.target.value)} style={editInput} /></td>
              <td><input type="number" value={lap.baki} onChange={(e) => handleAutoUpdate(lap.id, "baki", e.target.value)} style={editInput} /></td>
              <td><input type="number" value={lap.order} onChange={(e) => handleAutoUpdate(lap.id, "order", e.target.value)} style={editInput} /></td>
              <td><input value={lap.remark} onChange={(e) => handleAutoUpdate(lap.id, "remark", e.target.value)} style={editInput} /></td>
              <td><button onClick={() => handleDelete(lap.id)} style={delBtn}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chart */}
      <div style={chartBox}>
        <h2 style={{ textAlign: "center" }}>📈 Trend Stok Ayam</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="tarikh" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="baki" stroke="#4caf50" />
            <Line type="monotone" dataKey="order" stroke="#2e7d32" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🧠 Floating Papadin AI Chat */}
      <div
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          zIndex: 9999,
        }}
      >
        {showChat ? (
          <div
            style={{
              position: "relative",
              width: "350px",
              height: "480px",
              backgroundColor: "#fff",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setShowChat(false)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "#ff5252",
                border: "none",
                borderRadius: "50%",
                color: "white",
                width: "28px",
                height: "28px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <AITest />
          </div>
        ) : (
          <button
            onClick={() => setShowChat(true)}
            style={{
              backgroundColor: "#2e7d32",
              border: "none",
              borderRadius: "50%",
              color: "white",
              width: "60px",
              height: "60px",
              fontSize: "28px",
              cursor: "pointer",
              boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            }}
          >
            🤖
          </button>
        )}
      </div>
    </div>
  );
}

// 💅 Styles
const page = { minHeight: "100vh", background: "linear-gradient(135deg,#e8f5e9,#c8e6c9)", padding: "30px" };
const title = { textAlign: "center", color: "#1b5e20", marginBottom: "20px" };
const summaryContainer = { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px" };
const addRow = { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginTop: "30px" };
const input = { padding: "6px", borderRadius: "6px", border: "1px solid #ccc" };
const addBtn = { background: "#4caf50", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const table = { width: "100%", marginTop: "25px", borderCollapse: "collapse", textAlign: "center" };
const editInput = { padding: "4px", borderRadius: "4px", border: "1px solid #ccc", width: "90%" };
const delBtn = { background: "#e53935", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px" };
const chartBox = { marginTop: "40px", background: "white", borderRadius: "15px", padding: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" };

// Info card
function InfoCard({ title, value, color }) {
  return (
    <div style={{
      background: color,
      color: "white",
      padding: "20px",
      borderRadius: "12px",
      minWidth: "200px",
      textAlign: "center",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    }}>
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}

export default Dashboard;
