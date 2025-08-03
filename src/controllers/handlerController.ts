import { Request, Response } from 'express';
import { asyncHandler, ResponseUtils } from '../utils/responseUtils';
import { HandlerService } from '../services/handlerService';

export class HandlerController {
  private handlerService: HandlerService;

  constructor() {
    this.handlerService = new HandlerService();
  }

  /**
   * Gera handler para uma entidade
   * POST /api/handler/generate
   */
  public generateHandler = asyncHandler(async (req: Request, res: Response) => {
    const { projectPath, entity } = req.body;
    
    if (!projectPath) {
      return ResponseUtils.badRequest(res, 'Caminho do projeto é obrigatório');
    }
    
    if (!entity) {
      return ResponseUtils.badRequest(res, 'Definição da entidade é obrigatória');
    }

    try {
      const result = await this.handlerService.generateHandlerFile(projectPath, entity);
      
      if (result.success) {
        return ResponseUtils.success(res, result, 
          `✅ Handler para '${entity.name}' gerado com sucesso`, 201);
      } else {
        return ResponseUtils.error(res, result.message, 400);
      }
    } catch (error: any) {
      console.error('❌ Erro ao gerar handler:', error);
      return ResponseUtils.error(res, 
        'Erro interno ao gerar handler', 500);
    }
  });

  /**
   * Lista handlers existentes no projeto
   * GET /api/handler/list/:projectPath
   */
  public listHandlers = asyncHandler(async (req: Request, res: Response) => {
    const projectPath = req.params.projectPath;
    
    if (!projectPath) {
      return ResponseUtils.badRequest(res, 'Caminho do projeto é obrigatório');
    }

    try {
      const handlers = await this.handlerService.listHandlers(decodeURIComponent(projectPath));
      
      return ResponseUtils.success(res, { 
        handlers,
        count: handlers.length 
      }, '📋 Handlers listados com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao listar handlers:', error);
      return ResponseUtils.error(res, 
        'Erro interno ao listar handlers', 500);
    }
  });
}

// Instância única do controller
export const handlerController = new HandlerController();
