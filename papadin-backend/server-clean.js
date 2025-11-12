// papadin-backend/server-clean.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Dapatkan path semasa
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Baca Firebase key (pastikan file ada)
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
console.log("📁 Using service account path:", serviceAccountPath);

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ File serviceAccountKey.json tidak dijumpai!");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ✅ Root route (test basic connection)
app.get("/", (req, res) => {
  console.log("📡 GET / triggered");
  res.send("🔥 Papadin backend is alive!");
});

// ✅ Firestore test route
app.get("/test-firestore", async (req, res) => {
  console.log("📡 GET /test-firestore triggered");
  try {
    const snapshot = await db.collection("stokOutlet").limit(5).get();
    if (snapshot.empty) {
      return res.json({ message: "❌ Tiada data dalam stokOutlet." });
    }
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({
      message: "✅ Firestore berjaya dihubungkan!",
      count: data.length,
      sample: data,
    });
  } catch (err) {
    console.error("🔥 Firestore error:", err);
    res.status(500).json({ error: "Gagal hubung Firestore." });
  }
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Papadin backend running on port ${PORT}`);
});
