import { Router } from 'express';
import { projectController } from '../controllers/projectController';

const router = Router();

/**
 * 🚀 ROTA PÚBLICA: Scaffold Download
 * 
 * @route   POST /api/project/scaffold-download
 * @desc    Cria um projeto completo .NET Clean Architecture e retorna como arquivo ZIP para download
 * @access  Public
 * @body    {
 *   projectOptions: {
 *     name: string,                    // Nome do projeto (obrigatório) - também será o nome do arquivo ZIP
 *     template?: string,               // Template .NET (padrão: "webapi")
 *     framework?: string,              // Framework .NET (padrão: "net8.0")
 *     useCleanArchitecture?: boolean   // Usar estrutura Clean Architecture (padrão: true)
 *   },
 *   entities: [{
 *     name: string,                    // Nome da entidade (obrigatório)
 *     properties: [{                   // Propriedades da entidade
 *       name: string,                  // Nome da propriedade
 *       type: string,                  // Tipo C# da propriedade (string, int, bool, etc.)
 *       isRequired: boolean,           // Se a propriedade é obrigatória
 *       isCollection?: boolean,        // Se é uma coleção (List<T>)
 *       isNavigationProperty?: boolean // Se é propriedade de navegação EF
 *     }],
 *     generateCommands?: boolean       // Se deve gerar comandos CQRS (padrão: true)
 *   }]
 * }
 * 
 * @example
 * POST /api/project/scaffold-download
 * Content-Type: application/json
 * 
 * {
 *   "projectOptions": {
 *     "name": "MyCleanAPI",
 *     "template": "webapi",
 *     "framework": "net8.0"
 *   },
 *   "entities": [
 *     {
 *       "name": "Product",
 *       "properties": [
 *         { "name": "Name", "type": "string", "isRequired": true },
 *         { "name": "Price", "type": "decimal", "isRequired": true },
 *         { "name": "Stock", "type": "int", "isRequired": false }
 *       ]
 *     }
 *   ]
 * }
 * 
 * @response
 * Content-Type: application/zip
 * Content-Disposition: attachment; filename="MyCleanAPI.zip"
 * 
 * [Binary ZIP file with complete .NET Clean Architecture project]
 */
router.post('/scaffold-download', projectController.scaffoldProjectDownload);

// 🔒 ROTAS PRIVADAS/DESENVOLVIMENTO
// As rotas abaixo estão desabilitadas para deploy de produção
// Para habilitar durante desenvolvimento, descomente as linhas abaixo:

/*
// Criar projeto básico .NET
router.post('/create', projectController.createProject);

// Listar templates .NET disponíveis
router.get('/templates', projectController.listTemplates);

// Scaffold completo (sem download, retorna JSON)
router.post('/scaffold', projectController.scaffoldProject);

// Validar scaffold request
router.post('/validate-scaffold', projectController.validateScaffoldRequest);
*/

export default router;
