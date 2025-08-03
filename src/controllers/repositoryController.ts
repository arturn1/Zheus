import { Request, Response } from 'express';
import { asyncHandler, ResponseUtils } from '../utils/responseUtils';
import { RepositoryService } from '../services/repositoryService';

export class RepositoryController {
  private repositoryService: RepositoryService;

  constructor() {
    this.repositoryService = new RepositoryService();
  }

  /**
   * Gera interfaces de repositório base (IRepository e IRepositoryBase)
   * POST /api/repository/generate-base
   */
  public generateBaseRepositories = asyncHandler(async (req: Request, res: Response) => {
    const { domainPath } = req.body;
    
    if (!domainPath) {
      return ResponseUtils.badRequest(res, 'Caminho do Domain é obrigatório');
    }
    
    try {
      await this.repositoryService.generateBaseRepositories(domainPath);
      
      return ResponseUtils.success(res, {
        message: 'Interfaces base de repositório geradas com sucesso',
        files: ['IRepository.cs', 'IRepositoryBase.cs']
      }, '✅ Repositórios base gerados', 201);
    } catch (error: any) {
      return ResponseUtils.error(res, `Erro ao gerar repositórios base: ${error.message}`, 500);
    }
  });

  /**
   * Gera interface de repositório para uma entidade específica
   * POST /api/repository/generate-entity
   */
  public generateEntityRepository = asyncHandler(async (req: Request, res: Response) => {
    const { entityName, domainPath } = req.body;
    
    if (!entityName || !domainPath) {
      return ResponseUtils.badRequest(res, 'Nome da entidade e caminho do Domain são obrigatórios');
    }
    
    try {
      await this.repositoryService.generateEntityRepository(entityName, domainPath);
      
      return ResponseUtils.success(res, {
        message: `Interface de repositório gerada para ${entityName}`,
        entityName,
        fileName: `I${entityName}Repository.cs`
      }, `✅ Repositório I${entityName}Repository gerado`, 201);
    } catch (error: any) {
      return ResponseUtils.error(res, `Erro ao gerar repositório para ${entityName}: ${error.message}`, 500);
    }
  });

  /**
   * Gera interfaces de repositório para múltiplas entidades
   * POST /api/repository/generate-multiple
   */
  public generateMultipleRepositories = asyncHandler(async (req: Request, res: Response) => {
    const { entityNames, domainPath } = req.body;
    
    if (!entityNames || !Array.isArray(entityNames) || !domainPath) {
      return ResponseUtils.badRequest(res, 'Lista de entidades e caminho do Domain são obrigatórios');
    }
    
    try {
      await this.repositoryService.generateRepositories(entityNames, domainPath);
      
      const generatedFiles = entityNames.map(name => `I${name}Repository.cs`);
      
      return ResponseUtils.success(res, {
        message: `Repositórios gerados para ${entityNames.length} entidades`,
        entityNames,
        generatedFiles,
        baseFiles: ['IRepository.cs', 'IRepositoryBase.cs']
      }, `✅ ${entityNames.length} repositórios gerados`, 201);
    } catch (error: any) {
      return ResponseUtils.error(res, `Erro ao gerar repositórios: ${error.message}`, 500);
    }
  });

  /**
   * Lista repositórios gerados no projeto
   * GET /api/repository/list
   */
  public listRepositories = asyncHandler(async (req: Request, res: Response) => {
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

  /**
   * Valida se um repositório específico existe
   * GET /api/repository/validate/:entityName
   */
  public validateRepository = asyncHandler(async (req: Request, res: Response) => {
    const { entityName } = req.params;
    const { domainPath } = req.query;
    
    if (!domainPath || typeof domainPath !== 'string') {
      return ResponseUtils.badRequest(res, 'Caminho do Domain é obrigatório');
    }
    
    try {
      const exists = await this.repositoryService.validateRepositoryExists(entityName, domainPath);
      
      return ResponseUtils.success(res, {
        entityName,
        exists,
        fileName: `I${entityName}Repository.cs`
      }, exists ? '✅ Repositório existe' : '❌ Repositório não encontrado');
    } catch (error: any) {
      return ResponseUtils.error(res, `Erro ao validar repositório: ${error.message}`, 500);
    }
  });
}
