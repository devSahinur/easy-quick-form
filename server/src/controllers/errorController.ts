import { type ErrorRequestHandler } from 'express';
import logger from '../utils/logger';

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  _next,
) => {
  const { message, data, errors, isOperational } = err;
  err.statusCode = isOperational ? err.statusCode || 500 : 500;
  err.status = isOperational ? err.status || 'error' : 'error';

  logger.error(
    {
      method: req.method,
      url: req.url,
      statusCode: err.statusCode,
      // Only attach the stack for unexpected (non-operational) errors.
      err: isOperational ? undefined : err,
    },
    message,
  );

  res.status(err.statusCode).json({
    status: err.status,
    message: isOperational ? message : 'Something went wrong!',
    data,
    errors,
  });
};
