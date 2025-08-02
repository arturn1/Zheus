import { Request, Response } from 'express';
import { asyncHandler, ResponseUtils } from '../utils/responseUtils';
import { EntityService } from '../services/entityService';

export class EntityController {
  private entityService: EntityService;

  constructor() {
    this.entityService = new EntityService();
  }

  /**
   * Gera uma nova entidade no projeto .NET
   * POST /api/entity/generate
   */
  public generateEntity = asyncHandler(async (req: Request, res: Response) => {
    const request = req.body;
    
    if (!request.projectPath) {
      return ResponseUtils.badRequest(res, 'Caminho do projeto é obrigatório');
    }

    if (!request.entity || !request.entity.name) {
      return ResponseUtils.badRequest(res, 'Definição da entidade é obrigatória');
    }
    
    const result = await this.entityService.generateEntity(request);
    
    if (result.success) {
      return ResponseUtils.success(res, result, 
        `✅ Entidade '${request.entity.name}' gerada com sucesso`, 201);
    } else {
      return ResponseUtils.error(res, result.message, 400);
    }
  });

  /**
   * Lista entidades existentes no projeto
   * GET /api/entity/list/:projectPath
   */
  public listEntities = asyncHandler(async (req: Request, res: Response) => {
    const { projectPath } = req.params;
    
    if (!projectPath) {
      return ResponseUtils.badRequest(res, 'Caminho do projeto é obrigatório');
    }

    const entities = await this.entityService.listEntities(decodeURIComponent(projectPath));
    
    return ResponseUtils.success(res, { 
      entities,
      count: entities.length 
    }, '📋 Entidades listadas com sucesso');
  });
}

// Instância única do controller
export const entityController = new EntityController();
