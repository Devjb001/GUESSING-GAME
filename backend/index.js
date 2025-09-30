import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { socketConfig } from './src/config/socket.config.js';
import { handleSocketConnection } from './src/controllers/socketContoller.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, socketConfig);

const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());


app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Guessing Game API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});


io.on('connection', (socket) => {
  handleSocketConnection(io, socket);
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


httpServer.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Socket.io is ready for connections`);
});


process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});