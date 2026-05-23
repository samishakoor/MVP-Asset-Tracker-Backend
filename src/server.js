import app from './app.js';
import { PORT } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from './constants/index.js';
import logger from './utils/logger.js';

const port = PORT || 3000;

async function startServer() {
  try {
    await connectDatabase();
    logger.info({ message: SUCCESS_MESSAGE.DB_CONNECTION_SUCCESS });
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ message: `${ERROR_MESSAGE.DB_CONNECTION_ERROR}: ${error.message}` });
    }
    logger.error({ message: ERROR_MESSAGE.UNEXPECTED_ERROR });
    process.exit(1);
  }

  const server = app.listen(port, () => {
    logger.info({ message: `🚀 Server is running on port ${port}` });
  });

  process.on('SIGTERM', () => {
    logger.info({ message: 'SIGTERM signal received: closing HTTP server' });
    server.close(() => {
      logger.info({ message: 'HTTP server closed' });
    });
  });

  process.on('SIGINT', () => {
    logger.info({ message: 'SIGINT signal received: closing HTTP server' });
    server.close(() => {
      logger.info({ message: 'HTTP server closed' });
      process.exit(0);
    });
  });
}

startServer();
