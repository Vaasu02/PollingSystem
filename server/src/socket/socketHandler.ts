import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';
import { PollSocketHandler } from './pollSocketHandler';

let io: SocketServer;

export const initializeSocket = (httpServer: HTTPServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.socketCorsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const pollHandler = new PollSocketHandler(io);
  pollHandler.setupHandlers();

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

