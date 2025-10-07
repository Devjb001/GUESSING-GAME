import React, { useState, useEffect } from 'react';
import { Crown, Send, RotateCcw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { GAME_TIMER } from '../utils/constants';
import './GameMasterPanel.css';

const GameMasterPanel = ({ session, onSetQuestion, onNewRound }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
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

  const handleSetQuestion = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSetQuestion(question, answer);
      setQuestion('');
      setAnswer('');
      toast.success('Game started!');
    } catch (error) {
      toast.error(error.message || 'Failed to set question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRound = async () => {
    setIsSubmitting(true);
    try {
      await onNewRound();
      toast.success('New round started!');
    } catch (error) {
      toast.error(error.message || 'Failed to start new round');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session.status === 'ended') {
    return (
      <div className="game-master-panel">
        <div className="game-master-header">
          <Crown size={24} />
          <h2 className="game-master-title">Game Master Panel</h2>
        </div>

        <div className="master-status-box">
          <p className="master-status-title">Round Ended!</p>
          <p className="master-status-subtitle">Start a new round when ready</p>
        </div>

        <button
          onClick={handleNewRound}
          disabled={isSubmitting}
          className="master-btn"
          style={{ marginTop: '20px' }}
        >
          <RotateCcw size={20} />
          <span>{isSubmitting ? 'Starting...' : 'Start New Round'}</span>
        </button>
      </div>
    );
  }

  if (session.status === 'in-progress') {
    return (
      <div className="game-master-panel">
        <div className="game-master-header">
          <Crown size={24} />
          <h2 className="game-master-title">Game Master Panel</h2>
        </div>

        {/* Timer Display */}
        <div className="master-timer-display">
          <Clock size={32} />
          <span className="master-timer-value">{timeLeft}s</span>
        </div>

        <div className="master-status-box">
          <p className="master-status-title">Game in Progress</p>
          <p className="master-status-subtitle">Players are guessing the answer...</p>
          <div className="master-answer-display">
            <p className="master-answer-label">Correct Answer:</p>
            <p className="master-answer-value">{session.answer || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-master-panel">
      <div className="game-master-header">
        <Crown size={24} />
        <h2 className="game-master-title">Game Master Panel</h2>
      </div>

      <form onSubmit={handleSetQuestion} className="master-form">
        <div className="master-form-group">
          <label className="master-form-label">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's the capital of France?"
            className="master-form-input"
            maxLength={200}
            disabled={isSubmitting}
          />
          <p className="master-char-count">{question.length}/200 characters</p>
        </div>

        <div className="master-form-group">
          <label className="master-form-label">Answer</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Paris"
            className="master-form-input"
            maxLength={100}
            disabled={isSubmitting}
          />
          <p className="master-char-count">{answer.length}/100 characters</p>
        </div>

        {session.playerCount >= 2 ? (
          <button
            type="submit"
            disabled={isSubmitting || !question.trim() || !answer.trim()}
            className="master-btn"
          >
            <Send size={20} />
            <span>{isSubmitting ? 'Starting Game...' : 'Set Question & Start Game'}</span>
          </button>
        ) : (
          <div className="master-waiting-box">
            <p className="master-waiting-text">Need at least 2 players to start</p>
            <p className="master-waiting-count">Current players: {session.playerCount}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default GameMasterPanel;
