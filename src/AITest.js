// src/AITest.js
import React, { useState } from "react";

function AITest({ user }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hai! Saya Papadin AI sebenar! Tanya apa saja pasal stok ayam atau operasi outlet!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Send message to AI backend
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history for OpenAI
      const conversationHistory = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      // Add current user message
      conversationHistory.push({
        role: "user",
        content: input,
      });

      // FIXED: Call Python AI backend on port 5000 (not 5001!)
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Maaf, Papadin tak dapat jawab sekarang." },
        ]);
      }
    } catch (err) {
      console.error("Error connecting to AI:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Ralat sambungan ke Papadin AI Server. Sila semak backend Python di port 5000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={chatContainer}>
      {/* Header */}
      <div style={chatHeader}>
        <h3>Papadin AI Chat</h3>
      </div>

      {/* Chat Messages */}
      <div style={chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...messageStyle,
              alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: m.sender === "user" ? "#4caf50" : "#e8f5e9",
              color: m.sender === "user" ? "white" : "black",
            }}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div
            style={{
              fontStyle: "italic",
              color: "#888",
              marginTop: "5px",
              alignSelf: "flex-start",
            }}
          >
            Papadin sedang taip...
          </div>
        )}
      </div>

      {/* Input */}
      <div style={inputContainer}>
        <input
          type="text"
          placeholder="Tanya Papadin..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={inputStyle}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} style={sendBtn} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

// Styles
const chatContainer = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  fontFamily: "Poppins, sans-serif",
};

const chatHeader = {
  backgroundColor: "#c8e6c9",
  padding: "10px",
  textAlign: "center",
  borderBottom: "2px solid #81c784",
};

const chatBox = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: "10px",
  overflowY: "auto",
  backgroundColor: "white",
};

const messageStyle = {
  margin: "5px",
  padding: "8px 12px",
  borderRadius: "12px",
  maxWidth: "75%",
};

const inputContainer = {
  display: "flex",
  padding: "10px",
  borderTop: "1px solid #ddd",
  backgroundColor: "#f9f9f9",
};

const inputStyle = {
  flex: 1,
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  marginRight: "8px",
};

const sendBtn = {
  backgroundColor: "#2e7d32",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "8px 14px",
  cursor: "pointer",
};

export default AITest;