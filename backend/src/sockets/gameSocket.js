// sockets/gameSocket.js
const GameSession = require("../models/GameSession");

function setupGameSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Player joins a session lobby
    socket.on("join_session", async ({ sessionId, user }) => {
      socket.join(sessionId);
      io.to(sessionId).emit("player_joined", user);
      console.log(`${user.name} joined session ${sessionId}`);
    });

    // Handle chat messages
    socket.on("chat_message", ({ sessionId, user, message }) => {
      io.to(sessionId).emit("chat_message", { user, message });
    });

    // Master starts game
    socket.on("start_game", async ({ sessionId, question, answer }) => {
      try {
        const session = await GameSession.findOne({ sessionId });
        if (!session) return;

        session.started = true;
        session.question = question;
        session.answer = answer;
        await session.save();

        io.to(sessionId).emit("game_started", {
          question,
          message: "Game has started!",
        });
      } catch (err) {
        console.error("start_game error:", err);
      }
    });

    // Player makes a guess
    socket.on("guess", async ({ sessionId, userId, guess }) => {
      try {
        const session = await GameSession.findOne({ sessionId });
        if (!session || !session.started) return;

        if (guess.toLowerCase() === session.answer.toLowerCase()) {
          // winner!
          const winner = session.players.find((p) => p.id === userId);
          if (winner) {
            winner.score += 10;
            await session.save();

            io.to(sessionId).emit("game_over", {
              winner,
              answer: session.answer,
            });
          }
        } else {
          socket.emit("guess_result", { correct: false, guess });
        }
      } catch (err) {
        console.error("guess error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupGameSocket;
