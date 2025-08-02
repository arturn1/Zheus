import { Router } from 'express';
import { CommandController } from '../controllers/commandController';

const router = Router();
const commandController = new CommandController();

/**
 * @route   POST /api/command/generate
 * @desc    Gera um novo comando no projeto .NET
 * @access  Public
 */
router.post('/generate', commandController.generateCommand);

/**
 * @route   GET /api/command/list/:projectPath
 * @desc    Lista comandos existentes no projeto
 * @access  Public
 */
router.get('/list/:projectPath', commandController.listCommands);

export default router;
