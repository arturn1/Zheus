import { Response } from 'express';
import { ApiResponse } from '../types/common';

export class ResponseUtils {
  static success<T>(
    res: Response, 
    data: T, 
    message = 'Success', 
    statusCode = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response, 
    message = 'Internal Server Error', 
    statusCode = 500
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        statusCode,
        message
      }
    };
    
    return res.status(statusCode).json(response);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  static badRequest(res: Response, message = 'Bad request'): Response {
    return this.error(res, message, 400);
  }

  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
