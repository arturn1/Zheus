import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/', (req: Request, res: Response) => {
  const healthData = {
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };

  res.status(200).json(healthData);
});

// Detailed health check
router.get('/detailed', (req: Request, res: Response) => {
  const healthData = {
    success: true,
    message: 'API health check - detailed',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      pid: process.pid
    }
  };

  res.status(200).json(healthData);
});

export default router;
