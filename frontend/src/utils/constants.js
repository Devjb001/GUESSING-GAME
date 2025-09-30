export const SOCKET_URL = 'http://localhost:5000';

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
export const GAME_TIMER = 60; // seconds