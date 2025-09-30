import { GameSession } from '../models/GameSession.model.js';
import { Player } from '../models/Player.model.js';

class GameSessionManager {
  constructor() {
    this.sessions = new Map(); 
    this.playerSessions = new Map(); 
  }

  createSession(sessionId = null) {
    const session = new GameSession(sessionId);
    this.sessions.set(session.sessionId, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Clear all player mappings
      session.players.forEach((player) => {
        this.playerSessions.delete(player.socketId);
      });
      
      // Clear any active timer
      if (session.timer) {
        clearTimeout(session.timer);
      }
      
      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  getPlayerSession(socketId) {
    const sessionId = this.playerSessions.get(socketId);
    if (sessionId) {
      return this.sessions.get(sessionId);
    }
    return null;
  }

  addPlayerToSession(sessionId, socketId, username) {
    // Validate inputs
    if (!sessionId || !socketId || !username) {
      return { 
        success: false, 
        message: 'Session ID, Socket ID, and username are required' 
      };
    }

    if (username.trim().length === 0) {
      return { 
        success: false, 
        message: 'Username cannot be empty' 
      };
    }

    if (username.trim().length > 20) {
      return { 
        success: false, 
        message: 'Username cannot exceed 20 characters' 
      };
    }

    // Check if player is already in another session
    if (this.playerSessions.has(socketId)) {
      return { 
        success: false, 
        message: 'You are already in a game session' 
      };
    }

    let session = this.getSession(sessionId);
    
    // Create session if it doesn't exist
    if (!session) {
      session = this.createSession(sessionId);
    }

    // Check if username is already taken in this session
    const existingPlayer = Array.from(session.players.values()).find(
      p => p.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (existingPlayer) {
      return { 
        success: false, 
        message: 'Username already taken in this session' 
      };
    }

    const player = new Player(socketId, username.trim());
    const result = session.addPlayer(player);

    if (result.success) {
      this.playerSessions.set(socketId, sessionId);
    }

    return {
      ...result,
      session: result.success ? session.toJSON() : null
    };
  }

  removePlayerFromSession(socketId) {
    const sessionId = this.playerSessions.get(socketId);
    if (!sessionId) {
      return { success: false, message: 'Player not in any session' };
    }

    const session = this.getSession(sessionId);
    if (!session) {
      this.playerSessions.delete(socketId);
      return { success: false, message: 'Session not found' };
    }

    const result = session.removePlayer(socketId);
    this.playerSessions.delete(socketId);

    // Delete session if empty
    if (session.players.size === 0) {
      this.deleteSession(sessionId);
      return {
        ...result,
        sessionDeleted: true
      };
    }

    return {
      ...result,
      session: session.toJSON(),
      sessionDeleted: false
    };
  }

  setQuestion(sessionId, gameMasterId, question, answer) {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return { success: false, message: 'Session not found' };
    }

    if (session.gameMasterId !== gameMasterId) {
      return { success: false, message: 'Only game master can set questions' };
    }

    if (session.status !== 'waiting') {
      return { success: false, message: 'Cannot set question while game is in progress' };
    }

    return session.setQuestion(question, answer);
  }

  startGame(sessionId, gameMasterId) {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return { success: false, message: 'Session not found' };
    }

    if (session.gameMasterId !== gameMasterId) {
      return { success: false, message: 'Only game master can start the game' };
    }

    return session.startGame();
  }

  submitAnswer(socketId, guess) {
    const session = this.getPlayerSession(socketId);
    
    if (!session) {
      return { 
        success: false, 
        message: 'You are not in any game session',
        isCorrect: false 
      };
    }

    return session.checkAnswer(socketId, guess);
  }

  endGameByTimeout(sessionId) {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return { success: false, message: 'Session not found' };
    }

    if (session.status !== 'in-progress') {
      return { success: false, message: 'Game is not in progress' };
    }

    session.endGame();
    
    return { 
      success: true, 
      message: 'Game ended by timeout',
      session: session.toJSON()
    };
  }

  resetSession(sessionId) {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return { success: false, message: 'Session not found' };
    }

    if (session.status !== 'ended') {
      return { success: false, message: 'Can only reset ended games' };
    }

    session.resetForNewRound();
    
    return { 
      success: true, 
      message: 'Session reset for new round',
      session: session.toJSON()
    };
  }

  getAllSessions() {
    return Array.from(this.sessions.values()).map(session => session.toJSON());
  }
}


export const gameSessionManager = new GameSessionManager();