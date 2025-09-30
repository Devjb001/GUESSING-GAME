export class Player {
  constructor(socketId, username) {
    this.socketId = socketId;
    this.username = username;
    this.score = 0;
    this.attempts = 0;
    this.isGameMaster = false;
    this.hasWon = false;
    this.joinedAt = Date.now();
  }

  resetAttempts() {
    this.attempts = 0;
    this.hasWon = false;
  }

  incrementAttempts() {
    this.attempts++;
  }

  addScore(points) {
    this.score += points;
  }

  setGameMaster(isMaster) {
    this.isGameMaster = isMaster;
  }

  toJSON() {
    return {
      socketId: this.socketId,
      username: this.username,
      score: this.score,
      attempts: this.attempts,
      isGameMaster: this.isGameMaster,
      hasWon: this.hasWon
    };
  }
}