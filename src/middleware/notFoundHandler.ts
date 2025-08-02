import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  const message = `Route ${req.originalUrl} not found`;
  
  res.status(404).json({
    success: false,
    error: {
      statusCode: 404,
      message
    }
  });
};
