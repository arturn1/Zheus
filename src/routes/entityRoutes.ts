import { Router } from 'express';
import { entityController } from '../controllers/entityController';

const router = Router();

/**
 * @route   POST /api/entity/generate
 * @desc    Gera uma nova entidade no projeto .NET
 * @access  Public
 * @body    { projectPath: string, entity: EntityDefinition }
 */
router.post('/generate', entityController.generateEntity);

/**
 * @route   GET /api/entity/list/:projectPath
 * @desc    Lista entidades existentes no projeto
 * @access  Public
 */
router.get('/list/:projectPath', entityController.listEntities);

export default router;
