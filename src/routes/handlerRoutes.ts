import { Router } from 'express';
import { handlerController } from '../controllers/handlerController';

const router = Router();

/**
 * @route   POST /api/handler/generate
 * @desc    Gera handler para uma entidade
 * @access  Public
 * @body    { projectPath: string, entity: EntityDefinition }
 */
router.post('/generate', handlerController.generateHandler);

/**
 * @route   GET /api/handler/list/:projectPath
 * @desc    Lista handlers existentes no projeto
 * @access  Public
 */
router.get('/list/:projectPath', handlerController.listHandlers);

export default router;
