import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    // Verificar .NET SDK
    let dotnetVersion = 'Not available';
    try {
      const { stdout } = await execAsync('dotnet --version');
      dotnetVersion = stdout.trim();
    } catch (error) {
      console.warn('⚠️ .NET SDK não encontrado');
    }

    const healthData = {
      success: true,
      message: 'API is running successfully',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      platform: process.platform,
      nodeVersion: process.version,
      dotnetVersion,
      railway: !!process.env.RAILWAY_ENVIRONMENT,
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error
    });
  }
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
