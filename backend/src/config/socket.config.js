export const socketConfig = {
  cors: {
    origin: process.env.CORS_ORIGIN || "https://guessing-game-umber-kappa.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
};

export const gameConfig = {
  minPlayers: 2,
  maxAttempts: 3,
  gameTimer: 60000, 
  winnerPoints: 10
};