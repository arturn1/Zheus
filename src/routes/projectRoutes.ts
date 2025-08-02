import { Router } from 'express';
import { projectController } from '../controllers/projectController';

const router = Router();

/**
 * @route   POST /api/project/create
 * @desc    Cria um novo projeto .NET
 * @access  Public
 * @body    { name: string, template?: string, framework?: string, language?: string, outputPath?: string, force?: boolean }
 */
router.post('/create', projectController.createProject);

/**
 * @route   GET /api/project/templates
 * @desc    Lista todos os templates disponíveis do .NET
 * @access  Public
 */
router.get('/templates', projectController.listTemplates);

/**
 * @route   POST /api/project/scaffold
 * @desc    Cria um projeto completo com entidades e comandos
 * @access  Public
 * @body    { projectOptions: ProjectOptions, entities: EntityDefinition[] }
 */
router.post('/scaffold', projectController.scaffoldProject);

/**
 * @route   POST /api/project/validate-scaffold
 * @desc    Valida um projeto completo sem criar arquivos
 * @access  Public
 * @body    { projectOptions: ProjectOptions, entities: EntityDefinition[] }
 */
router.post('/validate-scaffold', projectController.validateScaffold);

export default router;
