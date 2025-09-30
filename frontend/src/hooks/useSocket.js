import { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log('🔌 useSocket: Connecting...');
    const newSocket = socketService.connect();
    console.log('🔌 useSocket: Socket object created:', newSocket);
    setSocket(newSocket);

    return () => {
      console.log('🔌 useSocket: Cleanup');
    };
  }, []);

  return socket;
};