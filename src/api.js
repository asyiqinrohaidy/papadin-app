// src/api.js
const API_URL = "http://localhost:5001";

export async function testFirestore() {
  try {
    const res = await fetch(`${API_URL}/test-firestore`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("❌ Firestore test error:", error);
    return { error: "Cannot connect to backend" };
  }
}

export async function sendChat(messages) {
  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("❌ Chat error:", error);
    return { error: "Gagal sambung ke Papadin AI" };
  }
}
