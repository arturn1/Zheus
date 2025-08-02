import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message } = error;

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  const response = {
    success: false,
    error: {
      statusCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  };

  console.error(`Error ${statusCode}: ${message}`);
  
  res.status(statusCode).json(response);
};
