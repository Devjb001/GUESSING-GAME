import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      console.log('🔌 SocketService: Creating new connection to', SOCKET_URL);
      
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],  
        withCredentials: true 
      });

      this.socket.on('connect', () => {
        console.log('✅ SocketService: Connected to server:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('⚠️ SocketService: Disconnected from server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ SocketService: Connection error:', error.message);
      });
    } else {
      console.log('🔌 SocketService: Reusing existing connection:', this.socket.id);
    }
    
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 SocketService: Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  emit(event, data, callback) {
    if (this.socket) {
      this.socket.emit(event, data, callback);
    } else {
      console.error('❌ SocketService: Cannot emit, socket not connected');
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.error('❌ SocketService: Cannot listen, socket not connected');
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();