
// const SOCKET_URL = import.meta.env.PROD 
//   ? 'https://guessing-game-yck1.onrender.com' 
//   : 'http://localhost:5000';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export { SOCKET_URL };

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