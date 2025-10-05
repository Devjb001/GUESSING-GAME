import React, { useState } from 'react';
import { Gamepad2, Users, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './JoinSession.css';

const JoinSession = ({ onJoinSession }) => {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter your username');
      return;
    }

    if (!sessionId.trim()) {
      toast.error('Please enter a session ID');
      return;
    }

    setIsJoining(true);
    try {
      await onJoinSession(sessionId.trim(), username.trim());
    } catch (error) {
      toast.error(error.message || 'Failed to join session');
      setIsJoining(false);
    }
  };

  const generateRandomSessionId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionId(randomId);
    toast.success('Session ID generated!');
  };

  return (
    <div className="join-container">
      <div className="join-content">
        {/* Header */}
        <div className="join-header">
          <div className="join-icon-wrapper">
            <Gamepad2 size={32} color="white" />
          </div>
          <h1 className="join-title">Guessing Game</h1>
          <p className="join-subtitle">Join or create a game session</p>
        </div>

        {/* Form Card */}
        <div className="join-card">
          <form onSubmit={handleJoin} className="join-form">
            {/* Username Field */}
            <div className="form-group">
              <label className="form-label">Your Username</label>
              <div className="input-wrapper">
                <Users size={20} className="input-icon" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="form-input"
                  maxLength={20}
                  disabled={isJoining}
                />
              </div>
              <p className="char-count">{username.length}/20 characters</p>
            </div>

            {/* Session ID Field */}
            <div className="form-group">
              <div className="label-row">
                <label className="form-label">Session ID</label>
                <button
                  type="button"
                  onClick={generateRandomSessionId}
                  className="generate-btn"
                  disabled={isJoining}
                >
                  Generate ID
                </button>
              </div>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                placeholder="Enter or generate session ID"
                className="form-input uppercase-input no-icon"
                maxLength={20}
                disabled={isJoining}
              />
              <p className="char-count">Share this ID with friends to play together</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isJoining || !username.trim() || !sessionId.trim()}
              className="submit-btn"
            >
              <span>{isJoining ? 'Joining...' : 'Join Session'}</span>
              {!isJoining && <ArrowRight size={20} />}
            </button>
          </form>

          {/* Info Box */}
          <div className="info-box">
            <p className="info-text">
              <span className="info-text-bold">How to play:</span> Join a session, wait for the game master to set a question, and be the first to guess correctly to win 10 points!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="join-footer">
          <p className="footer-text">Made with ❤️ for fun and learning</p>
        </div>
      </div>
    </div>
  );
};

export default JoinSession;