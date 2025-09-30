export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Username cannot be empty' };
  }

  if (trimmed.length < 2) {
    return { valid: false, message: 'Username must be at least 2 characters' };
  }

  if (trimmed.length > 20) {
    return { valid: false, message: 'Username cannot exceed 20 characters' };
  }

  // Allow alphanumeric, spaces, and common special characters
  const validPattern = /^[a-zA-Z0-9\s_-]+$/;
  if (!validPattern.test(trimmed)) {
    return { 
      valid: false, 
      message: 'Username can only contain letters, numbers, spaces, underscores, and hyphens' 
    };
  }

  return { valid: true, username: trimmed };
};

export const validateSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') {
    return { valid: false, message: 'Session ID is required' };
  }

  const trimmed = sessionId.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Session ID cannot be empty' };
  }

  return { valid: true, sessionId: trimmed };
};

export const validateQuestion = (question) => {
  if (!question || typeof question !== 'string') {
    return { valid: false, message: 'Question is required' };
  }

  const trimmed = question.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Question cannot be empty' };
  }

  if (trimmed.length < 5) {
    return { valid: false, message: 'Question must be at least 5 characters' };
  }

  if (trimmed.length > 200) {
    return { valid: false, message: 'Question cannot exceed 200 characters' };
  }

  return { valid: true, question: trimmed };
};

export const validateAnswer = (answer) => {
  if (!answer || typeof answer !== 'string') {
    return { valid: false, message: 'Answer is required' };
  }

  const trimmed = answer.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Answer cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, message: 'Answer cannot exceed 100 characters' };
  }

  return { valid: true, answer: trimmed };
};

export const validateGuess = (guess) => {
  if (!guess || typeof guess !== 'string') {
    return { valid: false, message: 'Guess is required' };
  }

  const trimmed = guess.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Guess cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, message: 'Guess cannot exceed 100 characters' };
  }

  return { valid: true, guess: trimmed };
};