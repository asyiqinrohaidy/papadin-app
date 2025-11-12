const BASE_URL = "http://127.0.0.1:5000";

export async function getAIResponse(inputText) {
  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: inputText }),
    });

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("❌ Error connecting to AI backend:", error);
    return "⚠️ Failed to connect to Papadin AI.";
  }
}
