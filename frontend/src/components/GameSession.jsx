import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import PlayersList from './PlayersList';
import GameMasterPanel from './GameMasterPanel';
import PlayerPanel from './PlayerPanel';
import ChatMessage from './ChatMessage';
import './GameSession.css';

const GameSession = ({ socket, session, currentSocketId, onLeaveSession }) => {
  const [messages, setMessages] = useState([]);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('player-joined', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'player-join',
          text: data.message,
          timestamp: Date.now()
        }
      ]);
    });

    socket.on('player-left', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'player-leave',
          text: data.message,
          timestamp: Date.now()
        }
      ]);
    });

    socket.on('question-set', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'system',
          text: data.message,
          timestamp: Date.now()
        }
      ]);
    });

    socket.on('game-started', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'game-start',
          text: data.message,
          timestamp: Date.now()
        }
      ]);
    });

    socket.on('guess-submitted', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'guess',
          text: data.isCorrect 
            ? `${data.username} guessed correctly! 🎉`
            : `${data.username} guessed wrong. ${data.attemptsLeft} attempt(s) left.`,
          username: data.username,
          isCorrect: data.isCorrect,
          timestamp: Date.now()
        }
      ]);
    });

    socket.on('game-ended', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: data.reason === 'timeout' ? 'timeout' : 'win',
          text: data.message,
          timestamp: Date.now()
        }
      ]);
    });

    socket.on('new-round-started', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'system',
          text: data.message,
          timestamp: Date.now()
        }
      ]);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('question-set');
      socket.off('game-started');
      socket.off('guess-submitted');
      socket.off('game-ended');
      socket.off('new-round-started');
    };
  }, [socket]);

  const handleSetQuestion = (question, answer) => {
    return new Promise((resolve, reject) => {
      socket.emit('set-question', { sessionId: session.sessionId, question, answer }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const handleStartGame = () => {
    return new Promise((resolve, reject) => {
      socket.emit('start-game', { sessionId: session.sessionId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const handleSubmitGuess = (guess) => {
    return new Promise((resolve, reject) => {
      socket.emit('submit-guess', { sessionId: session.sessionId, guess }, (response) => {
        if (response.success) {
          if (response.isCorrect) {
            toast.success('Correct! You won! 🎉');
          } else {
            toast.error(response.message);
          }
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const handleNewRound = () => {
    return new Promise((resolve, reject) => {
      socket.emit('new-round', { sessionId: session.sessionId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave the session?')) {
      socket.emit('leave-session', { sessionId: session.sessionId }, (response) => {
        if (response.success) {
          onLeaveSession();
          toast.success('Left session successfully');
        } else {
          toast.error(response.message || 'Failed to leave session');
        }
      });
    }
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(session.sessionId);
    setCopied(true);
    toast.success('Session ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPlayer = session.players.find((p) => p.socketId === currentSocketId);
  const isGameMaster = currentPlayer?.isGameMaster;

  return (
    <div className="game-session-container">
      <div className="game-session-content">
        {/* Header */}
        <div className="game-session-header">
          <div className="game-session-header-content">
            <div className="game-session-header-left">
              <h1 className="game-session-title">Guessing Game</h1>
              <div className="game-session-id-row">
                <span className="game-session-id-label">Session ID:</span>
                <code className="game-session-id-code">{session.sessionId}</code>
                <button
                  onClick={copySessionId}
                  className="game-session-copy-btn"
                  title="Copy Session ID"
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} color="#64748b" />}
                </button>
              </div>
            </div>
            <button onClick={handleLeave} className="game-session-leave-btn">
              <LogOut size={20} />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="game-session-grid">
          {/* Players List */}
          <PlayersList players={session.players} currentSocketId={currentSocketId} />

          {/* Game Panel */}
          {isGameMaster ? (
            <GameMasterPanel
              session={session}
              onSetQuestion={handleSetQuestion}
              onStartGame={handleStartGame}
              onNewRound={handleNewRound}
            />
          ) : (
            <PlayerPanel
              session={session}
              currentPlayer={currentPlayer}
              onSubmitGuess={handleSubmitGuess}
            />
          )}

          {/* Activity Feed */}
          <div className="activity-feed-container">
            <h2 className="activity-feed-title">Activity Feed</h2>
            <div className="activity-feed-messages">
              {messages.length === 0 ? (
                <div className="activity-feed-empty">
                  <p className="activity-feed-empty-text">No activity yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSession;