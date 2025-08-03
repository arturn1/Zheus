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
 * @desc    Cria um projeto completo .NET Clean Architecture com entidades, comandos, handlers e repositórios
 * @access  Public
 * @body    {
 *   projectOptions: {
 *     name: string,                    // Nome do projeto (obrigatório)
 *     template?: string,               // Template .NET (padrão: "webapi")
 *     framework?: string,              // Framework .NET (padrão: "net8.0")
 *     outputPath?: string,             // Caminho de saída (padrão: cwd)
 *     useCleanArchitecture?: boolean   // Usar estrutura Clean Architecture (padrão: true)
 *   },
 *   entities: [{
 *     name: string,                    // Nome da entidade (ex: "User", "Product")
 *     inheritsFromBase?: boolean,      // Herdar de BaseEntity (padrão: true)
 *     namespace?: string,              // Namespace (padrão: "Domain.Entities")
 *     generateCommands?: boolean,      // Gerar comandos CQRS (padrão: true)
 *     properties: [{
 *       name: string,                  // Nome da propriedade (ex: "Name", "Email")
 *       type: string,                  // Tipo C# (ex: "string", "int", "decimal", "DateTime")
 *       isRequired: boolean,           // Propriedade obrigatória
 *       isNavigationProperty?: boolean, // Propriedade de navegação (padrão: false)
 *       isCollection?: string          // Tipo de coleção ("List", "ICollection", etc.)
 *     }]
 *   }]
 * }
 * @returns {
 *   success: boolean,
 *   data: {
 *     project: { success: boolean, projectPath: string, message: string },
 *     entities: [{ className: string, success: boolean, files: string[], message: string }],
 *     commands: [{ entityName: string, success: boolean, files: string[] }],
 *     handlers: [{ entityName: string, success: boolean, files: string[] }],
 *     repositories: [{ entityName: string, success: boolean, fileName: string }],
 *     ioc: { success: boolean, registrations: number, entities: string[], message: string },
 *     summary: { 
 *       projectCreated: boolean, 
 *       entitiesGenerated: number, 
 *       commandsGenerated: number, 
 *       handlersGenerated: number, 
 *       repositoriesGenerated: number, 
 *       totalFiles: number 
 *     }
 *   },
 *   message: string
 * }
 * @example
 * POST /api/project/scaffold
 * {
 *   "projectOptions": {
 *     "name": "ECommerceAPI",
 *     "template": "webapi",
 *     "framework": "net8.0",
 *     "useCleanArchitecture": true
 *   },
 *   "entities": [
 *     {
 *       "name": "Product",
 *       "inheritsFromBase": true,
 *       "properties": [
 *         { "name": "Name", "type": "string", "isRequired": true },
 *         { "name": "Price", "type": "decimal", "isRequired": true },
 *         { "name": "Stock", "type": "int", "isRequired": false }
 *       ]
 *     },
 *     {
 *       "name": "Category",
 *       "properties": [
 *         { "name": "Title", "type": "string", "isRequired": true },
 *         { "name": "Description", "type": "string", "isRequired": false }
 *       ]
 *     }
 *   ]
 * }
 */
router.post('/scaffold', projectController.scaffoldProject);

/**
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
 * @response ZIP file with project structure
 * @headers Content-Type: application/zip
 *          Content-Disposition: attachment; filename="{projectName}.zip"
 * @example
 * POST /api/project/scaffold-download
 * {
 *   "projectOptions": {
 *     "name": "TaskManagerAPI",
 *     "template": "webapi",
 *     "framework": "net8.0"
 *   },
 *   "entities": [
 *     {
 *       "name": "Task",
 *       "properties": [
 *         { "name": "Title", "type": "string", "isRequired": true },
 *         { "name": "IsCompleted", "type": "bool", "isRequired": true }
 *       ]
 *     }
 *   ]
 * }
 * // Retorna: TaskManagerAPI.zip para download
 */
router.post('/scaffold-download', projectController.scaffoldProjectDownload);

/**
 * @route   POST /api/project/validate-scaffold
 * @desc    Valida configurações do projeto e entidades sem criar arquivos físicos
 * @access  Public
 * @body    {
 *   projectOptions: {
 *     name: string,                    // Nome do projeto (obrigatório)
 *     template?: string,               // Template .NET (padrão: "webapi")
 *     framework?: string,              // Framework .NET (padrão: "net8.0")
 *     outputPath?: string,             // Caminho de saída (padrão: cwd)
 *     useCleanArchitecture?: boolean   // Usar estrutura Clean Architecture (padrão: true)
 *   },
 *   entities: [{
 *     name: string,                    // Nome da entidade (ex: "User", "Product")
 *     inheritsFromBase?: boolean,      // Herdar de BaseEntity (padrão: true)
 *     namespace?: string,              // Namespace (padrão: "Domain.Entities")
 *     generateCommands?: boolean,      // Gerar comandos CQRS (padrão: true)
 *     properties: [{
 *       name: string,                  // Nome da propriedade (ex: "Name", "Email")
 *       type: string,                  // Tipo C# (ex: "string", "int", "decimal", "DateTime")
 *       isRequired: boolean,           // Propriedade obrigatória
 *       isNavigationProperty?: boolean, // Propriedade de navegação (padrão: false)
 *       isCollection?: string          // Tipo de coleção ("List", "ICollection", etc.)
 *     }]
 *   }]
 * }
 * @returns {
 *   success: boolean,
 *   data: {
 *     validation: {
 *       projectOptions: { valid: boolean, errors: string[] },
 *       entities: [{ name: string, valid: boolean, errors: string[] }],
 *       templates: { valid: boolean, loaded: string[], missing: string[] }
 *     },
 *     preview: {
 *       projectStructure: string[],
 *       filesToGenerate: { entities: number, commands: number, handlers: number, repositories: number }
 *     }
 *   },
 *   message: string
 * }
 * @example
 * POST /api/project/validate-scaffold
 * {
 *   "projectOptions": {
 *     "name": "TestAPI",
 *     "template": "webapi"
 *   },
 *   "entities": [
 *     {
 *       "name": "User",
 *       "properties": [
 *         { "name": "Email", "type": "string", "isRequired": true }
 *       ]
 *     }
 *   ]
 * }
 */
router.post('/validate-scaffold', projectController.validateScaffold);

export default router;
