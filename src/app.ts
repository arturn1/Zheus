import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import dotNetRoutes from './routes/dotNetRoutes';
import projectRoutes from './routes/projectRoutes';
import entityRoutes from './routes/entityRoutes';
import commandRoutes from './routes/commandRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import healthRoutes from './routes/healthRoutes';

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  private port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));
    
    // Logging middleware
    this.app.use(morgan('combined'));
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Health check routes
    this.app.use('/api/health', healthRoutes);
    
    // .NET management routes
    this.app.use('/api/dotnet', dotNetRoutes);
    
    // Project management routes
    this.app.use('/api/project', projectRoutes);
    
        // Entity routes
    this.app.use('/api/entity', entityRoutes);

    // Command routes  
    this.app.use('/api/command', commandRoutes);

    // Future API versioning
    // this.app.use('/api/v1', apiRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on port ${this.port}`);
      console.log(`📱 Health check: http://localhost:${this.port}/api/health`);
    });
  }
}

export default App;
