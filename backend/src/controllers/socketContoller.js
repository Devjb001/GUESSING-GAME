import { gameSessionManager } from '../services/GameSessionManager.js';
import { gameConfig } from '../config/socket.config.js';
import {
  validateUsername,
  validateSessionId,
  validateQuestion,
  validateAnswer,
  validateGuess
} from '../utils/validation.js';

export const handleSocketConnection = (io, socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle creating/joining a game session
  socket.on('join-session', ({ sessionId, username }, callback) => {
    try {
      // Validate inputs
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.valid) {
        return callback({ 
          success: false, 
          message: usernameValidation.message 
        });
      }

      const sessionValidation = validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return callback({ 
          success: false, 
          message: sessionValidation.message 
        });
      }

      // Add player to session
      const result = gameSessionManager.addPlayerToSession(
        sessionValidation.sessionId,
        socket.id,
        usernameValidation.username
      );

      if (result.success) {
        // Join socket room
        socket.join(sessionValidation.sessionId);

        // Notify all players in the session
        io.to(sessionValidation.sessionId).emit('player-joined', {
          session: result.session,
          message: `${usernameValidation.username} joined the game`
        });

        // Send success response to the joining player
        callback({
          success: true,
          session: result.session,
          socketId: socket.id
        });
      } else {
        callback(result);
      }
    } catch (error) {
      console.error('Error in join-session:', error);
      callback({ 
        success: false, 
        message: 'An error occurred while joining the session' 
      });
    }
  });

  // Handle setting question by game master
  socket.on('set-question', ({ sessionId, question, answer }, callback) => {
    try {
      // Validate inputs
      const sessionValidation = validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return callback({ 
          success: false, 
          message: sessionValidation.message 
        });
      }

      const questionValidation = validateQuestion(question);
      if (!questionValidation.valid) {
        return callback({ 
          success: false, 
          message: questionValidation.message 
        });
      }

      const answerValidation = validateAnswer(answer);
      if (!answerValidation.valid) {
        return callback({ 
          success: false, 
          message: answerValidation.message 
        });
      }

      // Set question
      const result = gameSessionManager.setQuestion(
        sessionValidation.sessionId,
        socket.id,
        questionValidation.question,
        answerValidation.answer
      );

      if (result.success) {
        const session = gameSessionManager.getSession(sessionValidation.sessionId);

        // Notify all players that question is set
        io.to(sessionValidation.sessionId).emit('question-set', {
          session: session.toJSON(),
          message: 'Question has been set by the game master'
        });

        callback({ success: true, message: result.message });
      } else {
        callback(result);
      }
    } catch (error) {
      console.error('Error in set-question:', error);
      callback({ 
        success: false, 
        message: 'An error occurred while setting the question' 
      });
    }
  });

  // Handle starting the game
  socket.on('start-game', ({ sessionId }, callback) => {
    try {
      // Validate input
      const sessionValidation = validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return callback({ 
          success: false, 
          message: sessionValidation.message 
        });
      }

      // Start game
      const result = gameSessionManager.startGame(
        sessionValidation.sessionId,
        socket.id
      );

      if (result.success) {
        const session = gameSessionManager.getSession(sessionValidation.sessionId);

        // Notify all players that game started
        io.to(sessionValidation.sessionId).emit('game-started', {
          session: session.toJSON(),
          question: session.question,
          timer: gameConfig.gameTimer,
          message: 'Game has started! Start guessing!'
        });

        // Set timer for game timeout
        session.timer = setTimeout(() => {
          const timeoutResult = gameSessionManager.endGameByTimeout(sessionValidation.sessionId);
          
          if (timeoutResult.success) {
            const endedSession = gameSessionManager.getSession(sessionValidation.sessionId);
            
            io.to(sessionValidation.sessionId).emit('game-ended', {
              session: endedSession.toJSON(),
              reason: 'timeout',
              answer: endedSession.answer,
              winner: null,
              message: 'Time is up! No one guessed the correct answer.'
            });
          }
        }, gameConfig.gameTimer);

        callback({ success: true, message: result.message });
      } else {
        callback(result);
      }
    } catch (error) {
      console.error('Error in start-game:', error);
      callback({ 
        success: false, 
        message: 'An error occurred while starting the game' 
      });
    }
  });

  // Handle submitting an answer/guess
  socket.on('submit-guess', ({ sessionId, guess }, callback) => {
    try {
      // Validate inputs
      const sessionValidation = validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return callback({ 
          success: false, 
          message: sessionValidation.message 
        });
      }

      const guessValidation = validateGuess(guess);
      if (!guessValidation.valid) {
        return callback({ 
          success: false, 
          message: guessValidation.message 
        });
      }

      // Submit answer
      const result = gameSessionManager.submitAnswer(
        socket.id,
        guessValidation.guess
      );

      if (result.success) {
        const session = gameSessionManager.getPlayerSession(socket.id);
        const player = session.players.get(socket.id);

        // Broadcast guess attempt to all players
        io.to(sessionValidation.sessionId).emit('guess-submitted', {
          username: player.username,
          attemptsLeft: result.attemptsLeft,
          isCorrect: result.isCorrect
        });

        if (result.isCorrect) {
          // Player won! End game and notify everyone
          io.to(sessionValidation.sessionId).emit('game-ended', {
            session: session.toJSON(),
            reason: 'correct-answer',
            answer: session.answer,
            winner: session.winner.toJSON(),
            message: `${player.username} won the game!`
          });

          callback({ 
            success: true, 
            isCorrect: true, 
            message: 'Congratulations! You won!' 
          });
        } else {
          callback({ 
            success: true, 
            isCorrect: false, 
            attemptsLeft: result.attemptsLeft,
            message: result.attemptsLeft > 0 
              ? `Wrong answer! ${result.attemptsLeft} attempt(s) remaining.`
              : 'Wrong answer! No attempts remaining.'
          });
        }
      } else {
        callback(result);
      }
    } catch (error) {
      console.error('Error in submit-guess:', error);
      callback({ 
        success: false, 
        message: 'An error occurred while submitting your guess' 
      });
    }
  });

  // Handle starting a new round
  socket.on('new-round', ({ sessionId }, callback) => {
    try {
      // Validate input
      const sessionValidation = validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return callback({ 
          success: false, 
          message: sessionValidation.message 
        });
      }

      const session = gameSessionManager.getSession(sessionValidation.sessionId);
      
      if (!session) {
        return callback({ 
          success: false, 
          message: 'Session not found' 
        });
      }

      // Check if requester is the game master
      if (session.gameMasterId !== socket.id) {
        return callback({ 
          success: false, 
          message: 'Only game master can start a new round' 
        });
      }

      const result = gameSessionManager.resetSession(sessionValidation.sessionId);

      if (result.success) {
        // Notify all players
        io.to(sessionValidation.sessionId).emit('new-round-started', {
          session: result.session,
          message: 'New round started! Waiting for game master to set a question.'
        });

        callback({ success: true, message: result.message });
      } else {
        callback(result);
      }
    } catch (error) {
      console.error('Error in new-round:', error);
      callback({ 
        success: false, 
        message: 'An error occurred while starting a new round' 
      });
    }
  });

  // Handle leaving session
  socket.on('leave-session', ({ sessionId }, callback) => {
    try {
      // Validate input
      const sessionValidation = validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return callback({ 
          success: false, 
          message: sessionValidation.message 
        });
      }

      const session = gameSessionManager.getPlayerSession(socket.id);
      
      if (!session) {
        return callback({ 
          success: false, 
          message: 'You are not in any session' 
        });
      }

      const player = session.players.get(socket.id);
      const username = player ? player.username : 'A player';

      const result = gameSessionManager.removePlayerFromSession(socket.id);

      if (result.success) {
        // Leave socket room
        socket.leave(sessionValidation.sessionId);

        if (!result.sessionDeleted) {
          // Notify remaining players
          io.to(sessionValidation.sessionId).emit('player-left', {
            session: result.session,
            newGameMasterId: result.newGameMasterId,
            message: `${username} left the game`
          });
        }

        callback({ success: true, message: 'You left the session' });
      } else {
        callback(result);
      }
    } catch (error) {
      console.error('Error in leave-session:', error);
      callback({ 
        success: false, 
        message: 'An error occurred while leaving the session' 
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    try {
      console.log(`User disconnected: ${socket.id}`);

      const session = gameSessionManager.getPlayerSession(socket.id);
      
      if (session) {
        const player = session.players.get(socket.id);
        const username = player ? player.username : 'A player';
        const sessionId = session.sessionId;

        const result = gameSessionManager.removePlayerFromSession(socket.id);

        if (result.success && !result.sessionDeleted) {
          // Notify remaining players
          io.to(sessionId).emit('player-left', {
            session: result.session,
            newGameMasterId: result.newGameMasterId,
            message: `${username} disconnected`
          });
        }
      }
    } catch (error) {
      console.error('Error in disconnect:', error);
    }
  });
};