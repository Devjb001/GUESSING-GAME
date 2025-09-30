import React from 'react';
import { Users, Crown, Trophy } from 'lucide-react';
import './PlayersList.css';

const PlayersList = ({ players, currentSocketId }) => {
  return (
    <div className="players-list-container">
      <div className="players-list-header">
        <h2 className="players-list-title">
          <Users size={20} className="players-list-icon" />
          <span>Players ({players.length})</span>
        </h2>
      </div>

      <div className="players-list">
        {players.length === 0 ? (
          <p className="players-list-empty">No players yet</p>
        ) : (
          players.map((player) => (
            <div
              key={player.socketId}
              className={`player-card ${
                player.socketId === currentSocketId ? 'is-current' : 'not-current'
              } ${player.hasWon ? 'has-won' : ''}`}
            >
              <div className="player-card-left">
                <div className={`player-avatar ${player.isGameMaster ? 'game-master' : 'regular'}`}>
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <div className="player-info">
                  <div className="player-name-row">
                    <p className="player-name">{player.username}</p>
                    {player.isGameMaster && (
                      <Crown size={16} className="master-badge" title="Game Master" />
                    )}
                    {player.socketId === currentSocketId && (
                      <span className="current-badge">You</span>
                    )}
                  </div>
                  <p className="player-attempts">
                    {player.attempts > 0 ? `${player.attempts}/3 attempts used` : 'Ready'}
                  </p>
                </div>
              </div>

              <div className="player-card-right">
                <div className="player-score">
                  <div className="player-score-row">
                    <Trophy size={16} className="player-score-icon" />
                    <span className="player-score-value">{player.score}</span>
                  </div>
                  <p className="player-score-label">points</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayersList;