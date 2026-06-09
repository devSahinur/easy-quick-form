import pinoHttp from 'pino-http';
import logger from '../utils/logger';

// HTTP request logger. Each request gets a child logger available as `req.log`,
// with the level chosen from the response status.
const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});

export default httpLogger;
