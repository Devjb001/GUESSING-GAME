import React, { useState, useEffect } from 'react';
import { Send, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { GAME_TIMER, MAX_ATTEMPTS } from '../utils/constants';
import './PlayerPanel.css';

const PlayerPanel = ({ session, currentPlayer, onSubmitGuess }) => {
  const [guess, setGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_TIMER);

  useEffect(() => {
    if (session.status === 'in-progress') {
      setTimeLeft(GAME_TIMER);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session.status]);

  const handleSubmitGuess = async (e) => {
    e.preventDefault();
    
    if (!guess.trim()) {
      toast.error('Please enter your guess');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitGuess(guess);
      setGuess('');
    } catch (error) {
      toast.error(error.message || 'Failed to submit guess');
    } finally {
      setIsSubmitting(false);
    }
  };

  const attemptsLeft = MAX_ATTEMPTS - (currentPlayer?.attempts || 0);
  const canGuess = session.status === 'in-progress' && attemptsLeft > 0 && !currentPlayer?.hasWon;

  // WAITING STATE - Show question and allow typing
  if (session.status === 'waiting') {
    return (
      <div className="player-panel">
        <h2 className="player-panel-title">Player Panel</h2>
        
        {session.hasQuestion ? (
          // Question is set, show it and allow typing
          <div>
            <div className="player-question-box">
              <p className="player-question-label">Question:</p>
              <p className="player-question-text">{session.question}</p>
            </div>

            {/* Allow player to type answer while waiting */}
            <form onSubmit={(e) => e.preventDefault()} className="player-guess-form">
              <div className="player-form-group">
                <label className="player-form-label">Prepare Your Answer</label>
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Type your answer here..."
                  className="player-form-input"
                  maxLength={100}
                />
                <p className="player-char-count">{guess.length}/100 characters</p>
              </div>

              <div className="player-status-box" style={{ marginTop: '16px' }}>
                <Clock size={48} className="player-status-icon" />
                <p className="player-status-title">Get Ready!</p>
                <p className="player-status-subtitle">
                  Game will start automatically...
                </p>
              </div>
            </form>
          </div>
        ) : (
          // No question yet
          <div className="player-status-box">
            <Clock size={48} className="player-status-icon" />
            <p className="player-status-title">Waiting for game to start...</p>
            <p className="player-status-subtitle">
              The game master is setting up the question
            </p>
          </div>
        )}
      </div>
    );
  }

  // GAME ENDED STATE
  if (session.status === 'ended') {
    return (
      <div className="player-panel">
        <h2 className="player-panel-title">Player Panel</h2>
        <div className="player-status-box">
          <p className="player-status-title">Round Ended!</p>
          {session.winner ? (
            <div>
              <p className="player-status-subtitle">
                🎉 {session.winner.username} won this round!
              </p>
              <div className="player-answer-display">
                <p className="player-answer-label">The answer was:</p>
                <p className="player-answer-value">{session.answer || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="player-status-subtitle">
                Time's up! No one guessed the answer.
              </p>
              <div className="player-answer-display">
                <p className="player-answer-label">The answer was:</p>
                <p className="player-answer-value">{session.answer || 'N/A'}</p>
              </div>
            </div>
          )}
          <p className="player-status-subtitle" style={{ marginTop: '16px', fontSize: '12px' }}>
            Waiting for next round...
          </p>
        </div>
      </div>
    );
  }

  // GAME IN PROGRESS STATE
  return (
    <div className="player-panel">
      <div className="player-panel-header">
        <h2 className="player-panel-title">Player Panel</h2>
        <div className="player-timer-box">
          <Clock size={20} />
          <span className="player-timer-value">{timeLeft}s</span>
        </div>
      </div>

      <div className="player-question-box">
        <p className="player-question-label">Question:</p>
        <p className="player-question-text">{session.question}</p>
      </div>

      <div className="player-attempts-box">
        <div className="player-attempts-row">
          <span className="player-attempts-label">Attempts Remaining:</span>
          <span className="player-attempts-value">{attemptsLeft}/{MAX_ATTEMPTS}</span>
        </div>
      </div>

      {currentPlayer?.hasWon ? (
        <div className="player-win-box">
          <p className="player-win-emoji">🎉</p>
          <p className="player-win-title">You Won!</p>
          <p className="player-win-points">+10 points</p>
        </div>
      ) : attemptsLeft === 0 ? (
        <div className="player-noattempts-box">
          <AlertCircle size={48} className="player-noattempts-icon" />
          <p className="player-noattempts-title">No Attempts Left</p>
          <p className="player-noattempts-text">Wait for the round to end</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitGuess} className="player-guess-form">
          <div className="player-form-group">
            <label className="player-form-label">Your Guess</label>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your answer here..."
              className="player-form-input"
              maxLength={100}
              disabled={isSubmitting || !canGuess}
            />
            <p className="player-char-count">{guess.length}/100 characters</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !canGuess || !guess.trim()}
            className="player-submit-btn"
          >
            <Send size={20} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Guess'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default PlayerPanel;