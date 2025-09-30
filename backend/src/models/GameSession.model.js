import { v4 as uuidv4 } from 'uuid';
import { gameConfig } from '../config/socket.config.js';

export class GameSession {
  constructor(sessionId = null) {
    this.sessionId = sessionId || uuidv4();
    this.players = new Map();
    this.gameMasterId = null;
    this.question = null;
    this.answer = null;
    this.status = 'waiting';
    this.timer = null;
    this.startTime = null;
    this.endTime = null;
    this.winner = null;
    this.createdAt = Date.now();
  }

  addPlayer(player) {
    if (this.status === 'in-progress') {
      return { success: false, message: 'Game is in progress' };
    }

    if (this.players.has(player.socketId)) {
      return { success: false, message: 'Player already in session' };
    }

    // First player becomes game master
    if (this.players.size === 0) {
      player.setGameMaster(true);
      this.gameMasterId = player.socketId;
    }

    this.players.set(player.socketId, player);
    return { success: true, message: 'Player added successfully' };
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (!player) {
      return { success: false, message: 'Player not found' };
    }

    this.players.delete(socketId);

    // If game master leaves, assign to next player
    if (this.gameMasterId === socketId && this.players.size > 0) {
      const nextPlayer = Array.from(this.players.values())[0];
      nextPlayer.setGameMaster(true);
      this.gameMasterId = nextPlayer.socketId;
    }

    // If all players left, session should be deleted
    if (this.players.size === 0) {
      this.gameMasterId = null;
    }

    return { 
      success: true, 
      message: 'Player removed successfully',
      newGameMasterId: this.gameMasterId 
    };
  }

  canStartGame() {
    return (
      this.status === 'waiting' &&
      this.players.size >= gameConfig.minPlayers &&
      this.question &&
      this.answer
    );
  }

  setQuestion(question, answer) {
    if (!question || !answer) {
      return { success: false, message: 'Question and answer are required' };
    }

    if (question.trim().length === 0 || answer.trim().length === 0) {
      return { success: false, message: 'Question and answer cannot be empty' };
    }

    this.question = question.trim();
    this.answer = answer.trim().toLowerCase();
    return { success: true, message: 'Question set successfully' };
  }

  startGame() {
    if (!this.canStartGame()) {
      return { 
        success: false, 
        message: `Need at least ${gameConfig.minPlayers} players and a question to start` 
      };
    }

    this.status = 'in-progress';
    this.startTime = Date.now();
    
    // Reset all players' attempts
    this.players.forEach(player => player.resetAttempts());

    return { success: true, message: 'Game started successfully' };
  }

  checkAnswer(socketId, guess) {
    if (this.status !== 'in-progress') {
      return { 
        success: false, 
        message: 'Game is not in progress',
        isCorrect: false 
      };
    }

    const player = this.players.get(socketId);
    if (!player) {
      return { 
        success: false, 
        message: 'Player not found',
        isCorrect: false 
      };
    }

    if (player.isGameMaster) {
      return { 
        success: false, 
        message: 'Game master cannot guess',
        isCorrect: false 
      };
    }

    if (player.attempts >= gameConfig.maxAttempts) {
      return { 
        success: false, 
        message: 'Maximum attempts reached',
        isCorrect: false 
      };
    }

    if (!guess || guess.trim().length === 0) {
      return { 
        success: false, 
        message: 'Answer cannot be empty',
        isCorrect: false 
      };
    }

    player.incrementAttempts();

    const isCorrect = guess.trim().toLowerCase() === this.answer;

    if (isCorrect) {
      player.hasWon = true;
      player.addScore(gameConfig.winnerPoints);
      this.winner = player;
      this.endGame();
    }

    return { 
      success: true, 
      isCorrect,
      attemptsLeft: gameConfig.maxAttempts - player.attempts,
      message: isCorrect ? 'Correct answer!' : 'Wrong answer'
    };
  }

  endGame() {
    this.status = 'ended';
    this.endTime = Date.now();
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Rotate game master to next player
    this.rotateGameMaster();
  }

  rotateGameMaster() {
    const currentMaster = this.players.get(this.gameMasterId);
    if (currentMaster) {
      currentMaster.setGameMaster(false);
    }

    const playerList = Array.from(this.players.values());
    const currentIndex = playerList.findIndex(p => p.socketId === this.gameMasterId);
    const nextIndex = (currentIndex + 1) % playerList.length;
    const nextMaster = playerList[nextIndex];

    if (nextMaster) {
      nextMaster.setGameMaster(true);
      this.gameMasterId = nextMaster.socketId;
    }
  }

  resetForNewRound() {
    this.question = null;
    this.answer = null;
    this.status = 'waiting';
    this.timer = null;
    this.startTime = null;
    this.endTime = null;
    this.winner = null;
    
    // Reset all players' attempts
    this.players.forEach(player => player.resetAttempts());
  }

  getPlayersArray() {
    return Array.from(this.players.values()).map(player => player.toJSON());
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      players: this.getPlayersArray(),
      gameMasterId: this.gameMasterId,
      status: this.status,
      question: this.question,
      playerCount: this.players.size,
      hasQuestion: !!this.question,
      winner: this.winner ? this.winner.toJSON() : null
    };
  }
}