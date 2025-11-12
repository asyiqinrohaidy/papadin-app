// papadin-backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Resolve absolute path for serviceAccountKey.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

console.log("Using service account path:", serviceAccountPath);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Papadin backend is alive!", status: "running" });
});

// Firestore test route
app.get("/test-firestore", async (req, res) => {
  console.log("GET /test-firestore triggered");
  try {
    const snapshot = await db.collection("stokOutlet").limit(5).get();

    if (snapshot.empty) {
      return res.json({ message: "No data in stokOutlet collection." });
    }

    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({
      message: "Firestore connected successfully!",
      count: data.length,
      sample: data,
    });
  } catch (error) {
    console.error("Firestore error:", error);
    res.status(500).json({ error: "Failed to connect to Firestore." });
  }
});

// Get all stock data
app.get("/get-stock", async (req, res) => {
  console.log("GET /get-stock triggered");
  try {
    const snapshot = await db.collection("stokOutlet").get();
    if (snapshot.empty) {
      return res.json({ success: true, data: [] });
    }

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stock from Firestore." });
  }
});

// Add new stock record
app.post("/add-stock", async (req, res) => {
  try {
    const { tarikh, outlet, items } = req.body;

    if (!tarikh || !outlet || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: "Incomplete data" });
    }

    const stokCollection = db.collection("stokOutlet");

    for (const item of items) {
      await stokCollection.add({
        tarikh,
        outlet,
        item: item.name,
        unit: item.unit,
        stockIn: Number(item.stockIn) || 0,
        baki: Number(item.baki) || 0,
        order: Number(item.order) || 0,
        remark: item.remark || "",
        createdAt: new Date(),
      });
    }

    res.json({ success: true, message: "Stock report saved successfully!" });
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({ success: false, error: "Failed to save stock report" });
  }
});

// Update an existing stock entry
app.put("/update-stock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tarikh, outlet, item, unit, stockIn, baki, order, remark } = req.body;

    if (!id) return res.status(400).json({ success: false, error: "Missing document ID" });

    const stokRef = db.collection("stokOutlet").doc(id);
    const docSnapshot = await stokRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    await stokRef.update({
      tarikh,
      outlet,
      item,
      unit,
      stockIn: Number(stockIn),
      baki: Number(baki),
      order: Number(order),
      remark,
      updatedAt: new Date(),
    });

    res.json({ success: true, message: "Stock updated successfully!" });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, error: "Failed to update stock" });
  }
});

// Delete a stock record
app.delete("/delete-stock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: "Missing document ID" });

    const stokRef = db.collection("stokOutlet").doc(id);
    const docSnapshot = await stokRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    await stokRef.delete();
    res.json({ success: true, message: "Stock deleted successfully!" });
  } catch (error) {
    console.error("Error deleting stock:", error);
    res.status(500).json({ success: false, error: "Failed to delete stock" });
  }
});

// Start server on port 5001 (avoiding conflict with Python backend)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Papadin backend running on port ${PORT}`);
  console.log(`Test Firestore: http://localhost:${PORT}/test-firestore`);
});