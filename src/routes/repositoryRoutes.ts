import { Router } from 'express';
import { RepositoryController } from '../controllers/repositoryController';

const router = Router();
const repositoryController = new RepositoryController();

/**
 * @route POST /api/repository/generate
 * @desc Gera repositórios (base + específicos das entidades) - Método unificado
 * @body { domainPath: string, entities?: string[] }
 */
router.post('/generate', repositoryController.generate);

/**
 * @route GET /api/repository/list
 * @desc Lista repositórios gerados no projeto
 * @query { domainPath: string }
 */
router.get('/list', repositoryController.list);

export default router;
