import { Request, Response } from 'express';
import { asyncHandler, ResponseUtils } from '../utils/responseUtils';
import { RepositoryService } from '../services/repositoryService';

export class RepositoryController {
  private repositoryService: RepositoryService;

  constructor() {
    this.repositoryService = new RepositoryService();
  }

  /**
   * Gera repositórios (base + específicos das entidades) - Método unificado
   * POST /api/repository/generate
   */
  public generate = asyncHandler(async (req: Request, res: Response) => {
    const { domainPath, entities } = req.body;
    
    if (!domainPath) {
      return ResponseUtils.badRequest(res, 'Caminho do Domain é obrigatório');
    }
    
    try {
      const result = await this.repositoryService.generateAllRepositories(domainPath, entities);
      
      return ResponseUtils.success(res, {
        message: `${result.totalFiles} repositórios gerados com sucesso`,
        baseFiles: result.baseFiles,
        entityFiles: result.entityFiles,
        totalFiles: result.totalFiles,
        entitiesProcessed: entities?.length || 0
      }, `✅ ${result.totalFiles} repositórios gerados`, 201);
    } catch (error: any) {
      return ResponseUtils.error(res, `Erro ao gerar repositórios: ${error.message}`, 500);
    }
  });

  /**
   * Lista repositórios gerados no projeto
   * GET /api/repository/list
   */
  public list = asyncHandler(async (req: Request, res: Response) => {
    const { domainPath } = req.query;
    
    if (!domainPath || typeof domainPath !== 'string') {
      return ResponseUtils.badRequest(res, 'Caminho do Domain é obrigatório');
    }
    
    try {
      const repositories = await this.repositoryService.listGeneratedRepositories(domainPath);
      
      return ResponseUtils.success(res, {
        repositories,
        count: repositories.length
      }, `📋 ${repositories.length} repositórios encontrados`);
    } catch (error: any) {
      return ResponseUtils.error(res, `Erro ao listar repositórios: ${error.message}`, 500);
    }
  });
}
