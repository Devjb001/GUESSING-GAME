import React from "react";
// src/pages/Lobby.jsx
import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useParams } from "react-router-dom";

export default function Lobby({ currentUser }) {
  const { sessionId } = useParams();
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    // join lobby on mount
    socket.emit("join_session", { sessionId, user: currentUser });

    // when new player joins
    socket.on("player_joined", (user) => {
      setPlayers((prev) => [...prev, user]);
    });

    // handle chat messages
    socket.on("chat_message", ({ user, message }) => {
      setMessages((prev) => [...prev, { user, message }]);
    });

    // when game starts
    socket.on("game_started", ({ question }) => {
      alert("Game started! Question: " + question);
      // navigate to game screen here if you want
    });

    // clean up listeners
    return () => {
      socket.off("player_joined");
      socket.off("chat_message");
      socket.off("game_started");
    };
  }, [sessionId, currentUser]);

  // send chat
  const sendMessage = () => {
    if (chatInput.trim()) {
      socket.emit("chat_message", {
        sessionId,
        user: currentUser,
        message: chatInput,
      });
      setChatInput("");
    }
  };

  return (
    <div>
      <h2>Lobby: {sessionId}</h2>
      <h3>Players</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.name} ({p.role})</li>
        ))}
      </ul>

      <h3>Chat</h3>
      <div style={{ border: "1px solid gray", height: "150px", overflowY: "auto" }}>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.user.name}:</b> {m.message}
          </p>
        ))}
      </div>

      <input
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
