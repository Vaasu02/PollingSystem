import http from 'http';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import app from './app';
import { initializeSocket } from './socket/socketHandler';
import { logger } from './utils/logger';

const httpServer = http.createServer(app);

initializeSocket(httpServer);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    httpServer.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
      logger.info(`Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

