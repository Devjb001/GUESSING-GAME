import React from 'react';
import { AlertCircle, CheckCircle, XCircle, User, Crown, LogIn, LogOut } from 'lucide-react';
import './ChatMessage.css';

const ChatMessage = ({ message }) => {
  const getIcon = () => {
    const iconProps = { size: 16 };
    switch (message.type) {
      case 'system':
        return <AlertCircle {...iconProps} />;
      case 'player-join':
        return <LogIn {...iconProps} />;
      case 'player-leave':
        return <LogOut {...iconProps} />;
      case 'game-start':
        return <Crown {...iconProps} />;
      case 'guess':
        return message.isCorrect ? <CheckCircle {...iconProps} /> : <XCircle {...iconProps} />;
      case 'win':
        return <Crown {...iconProps} />;
      case 'timeout':
        return <AlertCircle {...iconProps} />;
      default:
        return <User {...iconProps} />;
    }
  };

  const getMessageClass = () => {
    switch (message.type) {
      case 'system':
        return 'system';
      case 'player-join':
        return 'player-join';
      case 'player-leave':
        return 'player-leave';
      case 'game-start':
        return 'game-start';
      case 'guess':
        return message.isCorrect ? 'guess-correct' : 'guess-wrong';
      case 'win':
        return 'win';
      case 'timeout':
        return 'timeout';
      default:
        return 'system';
    }
  };

  return (
    <div className={`chat-message ${getMessageClass()}`}>
      <div className="chat-message-icon">
        {getIcon()}
      </div>
      <div className="chat-message-content">
        <p className="chat-message-text">{message.text}</p>
        {message.username && (
          <p className="chat-message-username">{message.username}</p>
        )}
      </div>
      <span className="chat-message-time">
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </span>
    </div>
  );
};

export default ChatMessage;