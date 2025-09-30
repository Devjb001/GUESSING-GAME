import React, { useState } from 'react';
import { Crown, Send, Play, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import './GameMasterPanel.css';

const GameMasterPanel = ({ session, onSetQuestion, onStartGame, onNewRound }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.success('Question set successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to set question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartGame = async () => {
    setIsSubmitting(true);
    try {
      await onStartGame();
      toast.success('Game started!');
    } catch (error) {
      toast.error(error.message || 'Failed to start game');
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

      {!session.hasQuestion ? (
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

          <button
            type="submit"
            disabled={isSubmitting || !question.trim() || !answer.trim()}
            className="master-btn"
          >
            <Send size={20} />
            <span>{isSubmitting ? 'Setting...' : 'Set Question'}</span>
          </button>
        </form>
      ) : (
        <div>
          <div className="master-question-display">
            <p className="master-question-label">Question Set:</p>
            <p className="master-question-text">{session.question}</p>
          </div>

          {session.playerCount >= 2 ? (
            <button
              onClick={handleStartGame}
              disabled={isSubmitting}
              className="master-btn"
            >
              <Play size={20} />
              <span>{isSubmitting ? 'Starting...' : 'Start Game'}</span>
            </button>
          ) : (
            <div className="master-waiting-box">
              <p className="master-waiting-text">Waiting for at least 2 players to start...</p>
              <p className="master-waiting-count">Current players: {session.playerCount}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameMasterPanel;