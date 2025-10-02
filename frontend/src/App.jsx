import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import JoinSession from './components/JoinSession';
import GameSession from './components/GameSession';
import Loader from './components/Loader';
import DebugPage from './DebugPage';

function App() {
  return <DebugPage />;
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState(null);
  const [currentSocketId, setCurrentSocketId] = useState(null);

  useEffect(() => {
    if (!socket) {
      console.log('⏳ Socket not ready yet...');
      return;
    }

    console.log('🔌 Socket available:', socket.id);

    // Check if already connected
    if (socket.connected) {
      console.log('✅ Already connected!');
      setIsConnected(true);
      setCurrentSocketId(socket.id);
    }

    const handleConnect = () => {
      console.log('✅ Connected! Socket ID:', socket.id);
      setIsConnected(true);
      setCurrentSocketId(socket.id);
    };

    const handleDisconnect = () => {
      console.log('⚠️ Disconnected');
      setIsConnected(false);
    };

    const handlePlayerJoined = (data) => {
      console.log('👤 Player joined:', data);
      setSession(data.session);
    };

    const handlePlayerLeft = (data) => {
      console.log('👋 Player left:', data);
      setSession(data.session);
    };

    const handleQuestionSet = (data) => {
      console.log('❓ Question set:', data);
      setSession(data.session);
    };

    const handleGameStarted = (data) => {
      console.log('🎮 Game started:', data);
      setSession(data.session);
    };

    const handleGameEnded = (data) => {
      console.log('🏁 Game ended:', data);
      setSession(data.session);
    };

    const handleNewRoundStarted = (data) => {
      console.log('🔄 New round started:', data);
      setSession(data.session);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('question-set', handleQuestionSet);
    socket.on('game-started', handleGameStarted);
    socket.on('game-ended', handleGameEnded);
    socket.on('new-round-started', handleNewRoundStarted);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('question-set', handleQuestionSet);
      socket.off('game-started', handleGameStarted);
      socket.off('game-ended', handleGameEnded);
      socket.off('new-round-started', handleNewRoundStarted);
    };
  }, [socket]);

  const handleJoinSession = (sessionId, username) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('🚪 Joining session:', sessionId, 'as', username);
      
      socket.emit('join-session', { sessionId, username }, (response) => {
        console.log('📨 Join response:', response);
        if (response.success) {
          setSession(response.session);
          setCurrentSocketId(response.socketId);
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const handleLeaveSession = () => {
    console.log('👋 Leaving session');
    setSession(null);
  };

  // Show loader only if socket is not available
  if (!socket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center">
        <Loader text="Initializing..." />
        <Toaster position="top-center" />
      </div>
    );
  }

  // Show connecting only if socket exists but not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center">
        <Loader text="Connecting to server..." />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <>
      {!session ? (
        <JoinSession onJoinSession={handleJoinSession} />
      ) : (
        <GameSession
          socket={socket}
          session={session}
          currentSocketId={currentSocketId}
          onLeaveSession={handleLeaveSession}
        />
      )}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;