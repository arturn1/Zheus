import { Router } from 'express';
import { RepositoryController } from '../controllers/repositoryController';

const router = Router();
const repositoryController = new RepositoryController();

/**
 * @route POST /api/repository/generate-base
 * @desc Gera interfaces de repositório base (IRepository e IRepositoryBase)
 * @body { domainPath: string }
 */
router.post('/generate-base', repositoryController.generateBaseRepositories);

/**
 * @route POST /api/repository/generate-entity
 * @desc Gera interface de repositório para uma entidade específica
 * @body { entityName: string, domainPath: string }
 */
router.post('/generate-entity', repositoryController.generateEntityRepository);

/**
 * @route POST /api/repository/generate-multiple
 * @desc Gera interfaces de repositório para múltiplas entidades
 * @body { entityNames: string[], domainPath: string }
 */
router.post('/generate-multiple', repositoryController.generateMultipleRepositories);

/**
 * @route GET /api/repository/list
 * @desc Lista repositórios gerados no projeto
 * @query { domainPath: string }
 */
router.get('/list', repositoryController.listRepositories);

/**
 * @route GET /api/repository/validate/:entityName
 * @desc Valida se um repositório específico existe
 * @params { entityName: string }
 * @query { domainPath: string }
 */
router.get('/validate/:entityName', repositoryController.validateRepository);

export default router;
