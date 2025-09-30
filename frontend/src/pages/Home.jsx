import React from "react";
// frontend/src/pages/Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import useGameStore from "../store/useGameStore";

export default function Home() {
  const [name, setName] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const navigate = useNavigate();
  const { setUser, setSessionId } = useGameStore();

  const handleCreateGame = async () => {
    if (!name) return alert("Please enter your name");

    try {
      const res = await api.post("/game/create", { name });
      const { sessionId, user } = res.data;
      setUser(user);
      setSessionId(sessionId);
      // navigate to lobby with sessionId
      navigate(`/lobby/${sessionId}`);
    } catch (err) {
      console.error("create game error:", err?.response?.data || err);
      alert("Error creating game: " + (err?.response?.data?.error || err.message));
    }
  };

  const handleJoinGame = async () => {
    if (!name || !sessionCode) return alert("Enter name and session code");

    try {
      const res = await api.post("/game/join", { name, sessionId: sessionCode });
      const { sessionId, user } = res.data;
      setUser(user);
      setSessionId(sessionId);
      navigate(`/lobby/${sessionId}`);
    } catch (err) {
      console.error("join game error:", err?.response?.data || err);
      alert("Error joining game: " + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">🎮 Guessing Game</h1>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />

      <button onClick={handleCreateGame} className="bg-green-600 text-white p-2 rounded">
        ➕ Create Game
      </button>

      <div className="flex gap-2 items-center mt-4">
        <input
          type="text"
          placeholder="Enter Session Code"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button onClick={handleJoinGame} className="bg-blue-600 text-white p-2 rounded">
          🔗 Join
        </button>
      </div>
    </div>
  );
}
