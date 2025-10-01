
const getSocketURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  return 'https://guessing-game-yck1.onrender.com';
};

export const SOCKET_URL = getSocketURL();

export const GAME_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in-progress',
  ENDED: 'ended'
};

export const MESSAGE_TYPES = {
  SYSTEM: 'system',
  PLAYER_JOIN: 'player-join',
  PLAYER_LEAVE: 'player-leave',
  GAME_START: 'game-start',
  GUESS: 'guess',
  WIN: 'win',
  TIMEOUT: 'timeout'
};

export const MAX_ATTEMPTS = 3;
export const GAME_TIMER = 60; 