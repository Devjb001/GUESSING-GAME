// const GameSession = require("../models/GameSession");

// // Create game 
// const createGame = async (req, res) => {
//   try {
//     const { name } = req.body;
//     const sessionId = Math.random().toString(36).substr(2, 6).toUpperCase();

//     const game = new GameSession({
//       sessionId,
//       players: [{ id: Date.now().toString(), name, role: "master" }],
//     });

//     await game.save();
//     res.json(game);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Join game
// const joinGame = async (req, res) => {
//   try {
//     const { sessionId, name } = req.body;
//     const game = await GameSession.findOne({ sessionId });

//     if (!game) return res.status(404).json({ error: "Session not found" });

//     game.players.push({ id: Date.now().toString(), name, role: "player" });
//     await game.save();

//     res.json(game);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get lobby details
// const getLobby = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const game = await GameSession.findOne({ sessionId });

//     if (!game) return res.status(404).json({ error: "Session not found" });

//     res.json(game);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// module.exports = { createGame, joinGame, getLobby };




// backend/controllers/gameController.js
const { v4: uuidv4 } = require("uuid");
const GameSession = require("../models/GameSession");

// Create game -> returns { sessionId, user }
const createGame = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    // short readable session id e.g. 6 chars uppercase
    const sessionId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const userId = uuidv4();

    const session = new GameSession({
      sessionId,
      players: [{ id: userId, name, role: "master", score: 0 }],
      started: false,
    });

    await session.save();

    return res.json({
      sessionId,
      user: { id: userId, name, role: "master", score: 0 },
    });
  } catch (err) {
    console.error("createGame error:", err);
    return res.status(500).json({ error: "Server error creating game" });
  }
};

// Join game -> returns { sessionId, user }
const joinGame = async (req, res) => {
  try {
    const { name, sessionId } = req.body;
    if (!name || !sessionId)
      return res.status(400).json({ error: "Name and sessionId required" });

    const session = await GameSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.started) return res.status(400).json({ error: "Game already started" });

    const userId = uuidv4();
    const newPlayer = { id: userId, name, role: "player", score: 0 };
    session.players.push(newPlayer);
    await session.save();

    return res.json({
      sessionId,
      user: newPlayer,
    });
  } catch (err) {
    console.error("joinGame error:", err);
    return res.status(500).json({ error: "Server error joining game" });
  }
};

// GET lobby details -> returns full session doc
const getLobby = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await GameSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: "Session not found" });
    return res.json(session);
  } catch (err) {
    console.error("getLobby error:", err);
    return res.status(500).json({ error: "Server error fetching lobby" });
  }
};

module.exports = { createGame, joinGame, getLobby };
