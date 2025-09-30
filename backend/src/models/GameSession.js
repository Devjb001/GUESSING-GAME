// backend/models/GameSession.js
const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true },   // uuid or generated code
  name: { type: String, required: true },
  role: { type: String, enum: ["master", "player"], required: true },
  score: { type: Number, default: 0 },
});

const gameSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true }, // e.g. short code
    players: { type: [playerSchema], default: [] },
    started: { type: Boolean, default: false },
    question: { type: String, default: null },
    answer: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameSession", gameSessionSchema);
