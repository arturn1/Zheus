import { Router } from 'express';
import { dotNetController } from '../controllers/dotNetController';

const router = Router();

/**
 * @route   GET /api/dotnet/status
 * @desc    Verifica se o .NET está instalado
 * @access  Public
 */
router.get('/status', dotNetController.checkStatus);

/**
 * @route   POST /api/dotnet/install
 * @desc    Instala a versão LTS do .NET (apenas se não estiver instalado)
 * @access  Public
 * @body    { version?: string, channel?: 'LTS' | 'Current' | 'Preview', architecture?: string }
 */
router.post('/install', dotNetController.installDotNet);

/**
 * @route   POST /api/dotnet/reinstall
 * @desc    Força a reinstalação do .NET
 * @access  Public
 * @body    { version?: string, channel?: 'LTS' | 'Current' | 'Preview', architecture?: string }
 */
router.post('/reinstall', dotNetController.reinstallDotNet);

/**
 * @route   GET /api/dotnet/info
 * @desc    Obtém informações detalhadas sobre a instalação do .NET
 * @access  Public
 */
router.get('/info', dotNetController.getDotNetInfo);

/**
 * @route   GET /api/dotnet/compatibility
 * @desc    Verifica a compatibilidade do sistema com .NET
 * @access  Public
 */
router.get('/compatibility', dotNetController.checkCompatibility);

export default router;
