import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleSocketConnection } from './src/controllers/socketContoller.js';

const app = express();
const httpServer = createServer(app);


const allowedOrigins = [
  'http://localhost:5174',
   'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5174',
  'https://guessing-game-one-theta.vercel.app',  
  
];


if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(...process.env.CORS_ORIGIN.split(','));
}

console.log('📋 Allowed origins:', allowedOrigins);


const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
    
      if (!origin) {
        return callback(null, true);
      }
      
 
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(' Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Guessing Game Backend Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    allowedOrigins: allowedOrigins
  });
});

// Socket connection
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  try {
    handleSocketConnection(io, socket);
  } catch (error) {
    console.error('❌ Socket error:', error);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    status: 'error',
    message: 'Internal server error' 
  });
});


httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🔒 CORS: ${allowedOrigins.length} allowed origins`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM signal received: closing server');
  httpServer.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});