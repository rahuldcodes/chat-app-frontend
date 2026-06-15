import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Connect to the Live Render Backend URL via environment variables
const BACKEND_URL = import.meta.env.VITE_WS_URL || "http://localhost:3001";
const socket = io(BACKEND_URL);

function App() {
  const [username, setUsername] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    // Listening for the 'receive_message' broadcast event from the server
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Cleanup connection listener on unmount
    return () => socket.off("receive_message");
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      sender: username,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Emitting the event message to the central socket server
    socket.emit("send_message", messageData);
    setMessage(""); // Clear input
  };

  const styles = {
    wrapper: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
    card: { backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", width: "380px" },
    chatBox: { height: "300px", border: "1px solid #ddd", borderRadius: "8px", padding: "15px", overflowY: "auto", marginBottom: "15px", backgroundColor: "#f9f9f9" },
    msgLine: { marginBottom: "10px", padding: "8px 12px", borderRadius: "8px", maxWidth: "80%" },
    form: { display: "flex", gap: "8px" },
    input: { flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", outline: "none" },
    btn: { backgroundColor: "#3498db", color: "white", border: "none", padding: "10px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }
  };

  if (!isLogged) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={{ textAlign: "center", color: "#2c3e50" }}>💬 Join Global Chat</h2>
          <input 
            type="text" 
            placeholder="Enter your chat alias..." 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ ...styles.input, width: "94%", marginBottom: "15px", display: "block" }}
          />
          <button 
            onClick={() => username.trim() && setIsLogged(true)} 
            style={{ ...styles.btn, width: "100%" }}
          >
            Enter Chatroom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h3 style={{ margin: "0 0 5px 0", color: "#2c3e50" }}>💬 Real-Time Chat</h3>
        <p style={{ margin: "0 0 15px 0", fontSize: "12px", color: "#7f8c8d" }}>User Alias: <b>{username}</b></p>
        
        <div style={styles.chatBox}>
          {messageList.map((msg, i) => (
            <div 
              key={i} 
              style={{ 
                ...styles.msgLine, 
                backgroundColor: msg.sender === username ? "#dcf8c6" : "#fff",
                marginLeft: msg.sender === username ? "auto" : "0",
                border: "1px solid #eee"
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "bold", color: "#555", display: "block" }}>{msg.sender}</span>
              <span style={{ fontSize: "14px" }}>{msg.text}</span>
              <span style={{ fontSize: "9px", color: "#999", display: "block", textAlign: "right" }}>{msg.time}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} style={styles.form}>
          <input 
            type="text" 
            placeholder="Type a real-time message..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.btn}>Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
