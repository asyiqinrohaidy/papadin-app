// src/ChatAI.js
import React, { useState } from "react";

function ChatAI({ user }) {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Hai! Saya Papadin AI! Nak semak stok outlet mana hari ni?" 
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // FIXED: Call Python AI backend on port 5000 (not 5001!)
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      
      if (data.success && data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "Maaf, AI tak dapat respon sekarang." },
        ]);
      }
    } catch (err) {
      console.error("AI connection error:", err);
      setMessages([
        ...newMessages,
        { 
          role: "assistant", 
          content: "Gagal hubung ke server AI (port 5000). Pastikan Python backend berjalan." 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={chatPage}>
      <div style={chatBox}>
        <h2 style={title}>Papadin AI Assistant</h2>

        <div style={messagesBox}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...message,
                background: msg.role === "assistant" ? "#e0f7fa" : "#c8e6c9",
                alignSelf: msg.role === "assistant" ? "flex-start" : "flex-end",
              }}
            >
              {msg.role === "assistant" ? "🤖 " : "👤 "} {msg.content}
            </div>
          ))}
          {loading && <p style={{ fontStyle: "italic" }}>Papadin AI is typing...</p>}
        </div>

        <div style={inputRow}>
          <input
            type="text"
            placeholder="Tulis mesej di sini..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            style={inputBox}
          />
          <button onClick={sendMessage} style={sendBtn} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* Styles */
const chatPage = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #84fab0, #8fd3f4)",
  fontFamily: "Poppins, sans-serif",
};

const chatBox = {
  background: "#fff",
  width: "90%",
  maxWidth: "600px",
  borderRadius: "15px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
};

const title = { 
  textAlign: "center", 
  color: "#00796b" 
};

const messagesBox = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  height: "400px",
  overflowY: "auto",
  marginTop: "10px",
  padding: "10px",
  background: "#fafafa",
  borderRadius: "10px",
};

const message = {
  padding: "10px 15px",
  borderRadius: "12px",
  maxWidth: "80%",
  lineHeight: "1.4",
  wordBreak: "break-word",
};

const inputRow = {
  display: "flex",
  marginTop: "15px",
  gap: "10px",
};

const inputBox = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const sendBtn = {
  background: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "0 20px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default ChatAI;