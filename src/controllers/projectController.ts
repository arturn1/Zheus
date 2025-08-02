import { Request, Response } from 'express';
import { asyncHandler, ResponseUtils } from '../utils/responseUtils';
import { ProjectService } from '../services/projectService';
import { EntityService } from '../services/entityService';
import { CommandService } from '../services/commandService';

export class ProjectController {
  private projectService: ProjectService;
  private entityService: EntityService;
  private commandService: CommandService;

  constructor() {
    this.projectService = new ProjectService();
    this.entityService = new EntityService();
    this.commandService = new CommandService();
  }

  /**
   * Cria um novo projeto .NET
   * POST /api/project/create
   */
  public createProject = asyncHandler(async (req: Request, res: Response) => {
    const options = req.body;
    
    if (!options.name) {
      return ResponseUtils.badRequest(res, 'Nome do projeto é obrigatório');
    }
    
    const result = await this.projectService.createProject(options);
    
    if (result.success) {
      return ResponseUtils.success(res, result, 
        `✅ Projeto '${result.projectName}' criado com sucesso`, 201);
    } else {
      return ResponseUtils.error(res, result.message, 400);
    }
  });

  /**
   * Lista templates disponíveis do .NET
   * GET /api/project/templates
   */
  public listTemplates = asyncHandler(async (req: Request, res: Response) => {
    const templates = await this.projectService.listTemplates();
    
    return ResponseUtils.success(res, { 
      templates,
      count: templates.length 
    }, '📋 Templates disponíveis listados com sucesso');
  });

  /**
   * Valida um projeto completo sem criar arquivos
   * POST /api/project/validate-scaffold
   */
  public validateScaffold = asyncHandler(async (req: Request, res: Response) => {
    const { projectOptions, entities } = req.body;
    
    // Validações básicas
    const validationError = this.validateScaffoldRequest(projectOptions, entities);
    if (validationError) {
      return ResponseUtils.badRequest(res, validationError);
    }

    try {
      const validation = await this.performScaffoldValidation(projectOptions, entities);
      
      return ResponseUtils.success(res, validation, 
        `🔍 Validação concluída para projeto '${projectOptions.name}'`);

    } catch (error: any) {
      console.error('❌ Erro durante validação do scaffold:', error);
      return ResponseUtils.error(res, 
        `Erro interno durante a validação: ${error?.message || 'Erro desconhecido'}`, 500);
    }
  });

  /**
   * Cria um projeto completo com entidades e comandos
   * POST /api/project/scaffold
   */
  public scaffoldProject = asyncHandler(async (req: Request, res: Response) => {
    const { projectOptions, entities } = req.body;
    
    // Validações básicas
    const validationError = this.validateScaffoldRequest(projectOptions, entities);
    if (validationError) {
      return ResponseUtils.badRequest(res, validationError);
    }

    try {
      const results = this.initializeScaffoldResults();

      // 1. Criar o projeto
      const projectResult = await this.createProjectStep(projectOptions);
      if (!projectResult.success) {
        return ResponseUtils.error(res, 
          `Falha ao criar projeto: ${projectResult.message}`, 400);
      }

      results.project = projectResult;
      results.summary.projectCreated = true;
      
      const projectPath = projectResult.projectPath || `${process.cwd()}/${projectOptions.name}`;

      // 2. Gerar entidades e comandos
      await this.generateEntitiesAndCommands(projectPath, entities, results);

      // 3. Retornar resultado consolidado
      const message = this.buildSuccessMessage(projectOptions.name, results.summary);
      return ResponseUtils.success(res, results, message, 201);

    } catch (error: any) {
      console.error('❌ Erro durante o scaffold do projeto:', error);
      return ResponseUtils.error(res, 
        `Erro interno durante a criação do projeto: ${error?.message || 'Erro desconhecido'}`, 500);
    }
  });

  /**
   * Valida os parâmetros da requisição de scaffold
   */
  private validateScaffoldRequest(projectOptions: any, entities: any): string | null {
    if (!projectOptions?.name) {
      return 'Nome do projeto é obrigatório';
    }
    
    if (!entities || !Array.isArray(entities) || entities.length === 0) {
      return 'Lista de entidades é obrigatória';
    }

    return null;
  }

  /**
   * Inicializa a estrutura de resultados do scaffold
   */
  private initializeScaffoldResults() {
    return {
      project: {} as any,
      entities: [] as any[],
      commands: [] as any[],
      summary: {
        projectCreated: false,
        entitiesGenerated: 0,
        commandsGenerated: 0,
        totalFiles: 0
      }
    };
  }

  /**
   * Executa a etapa de criação do projeto
   */
  private async createProjectStep(projectOptions: any) {
    console.log(`🚀 Criando projeto: ${projectOptions.name}`);
    return await this.projectService.createProject(projectOptions);
  }

  /**
   * Gera todas as entidades e seus comandos
   */
  private async generateEntitiesAndCommands(projectPath: string, entities: any[], results: any) {
    console.log(`📦 Gerando ${entities.length} entidades...`);
    
    for (const entityDef of entities) {
      try {
        // Gerar entidade
        await this.generateSingleEntity(projectPath, entityDef, results);
        
        // Gerar comandos se solicitado
        if (entityDef.generateCommands !== false && results.entities[results.entities.length - 1].success) {
          await this.generateEntityCommands(projectPath, entityDef, results);
        }

      } catch (entityError: any) {
        console.error(`❌ Erro ao gerar entidade ${entityDef.name}:`, entityError);
        this.addEntityError(entityDef, entityError, results);
      }
    }
  }

  /**
   * Gera uma única entidade
   */
  private async generateSingleEntity(projectPath: string, entityDef: any, results: any) {
    const entityRequest = {
      projectPath: projectPath,
      entity: entityDef
    };
    
    const entityResult = await this.entityService.generateEntity(entityRequest);
    
    results.entities.push({
      className: entityDef.name,
      success: entityResult.success,
      files: entityResult.generatedFiles || [],
      message: entityResult.message
    });
    
    if (entityResult.success) {
      results.summary.entitiesGenerated++;
      results.summary.totalFiles += entityResult.generatedFiles?.length || 0;
    }
  }

  /**
   * Gera comandos para uma entidade
   */
  private async generateEntityCommands(projectPath: string, entityDef: any, results: any) {
    console.log(`⚡ Gerando comandos para entidade: ${entityDef.name}`);
    
    const commandResult = await this.commandService.generateCommandFile(projectPath, entityDef, true);
    
    if (commandResult.success) {
      results.commands.push({
        entityName: entityDef.name,
        commandType: 'Create and Update',
        success: true,
        files: commandResult.filePaths || [],
        message: commandResult.message
      });
      results.summary.commandsGenerated += 2; // Create + Update
      results.summary.totalFiles += commandResult.filePaths?.length || 0;
    } else {
      results.commands.push({
        entityName: entityDef.name,
        commandType: 'Create and Update',
        success: false,
        error: commandResult.error || commandResult.message
      });
    }
  }

  /**
   * Adiciona erro de entidade aos resultados
   */
  private addEntityError(entityDef: any, entityError: any, results: any) {
    results.entities.push({
      className: entityDef.name,
      success: false,
      error: entityError?.message || 'Erro desconhecido'
    });
  }

  /**
   * Constrói mensagem de sucesso final
   */
  private buildSuccessMessage(projectName: string, summary: any): string {
    return `🎉 Projeto '${projectName}' criado com sucesso! ` +
      `Geradas ${summary.entitiesGenerated} entidades e ${summary.commandsGenerated} comandos ` +
      `(${summary.totalFiles} arquivos no total)`;
  }

  /**
   * Executa validação completa do scaffold sem criar arquivos
   */
  private async performScaffoldValidation(projectOptions: any, entities: any[]) {
    const validation = {
      project: {
        valid: true,
        name: projectOptions.name,
        template: projectOptions.template || 'webapi',
        framework: projectOptions.framework || 'net8.0',
        outputPath: projectOptions.outputPath || process.cwd(),
        conflicts: [] as string[],
        warnings: [] as string[]
      },
      entities: [] as any[],
      commands: [] as any[],
      templates: {
        valid: true,
        tested: [] as string[],
        missing: [] as string[]
      },
      summary: {
        totalEntities: entities.length,
        totalCommands: entities.filter(e => e.generateCommands !== false).length * 2,
        estimatedFiles: 0,
        estimatedSize: '0KB'
      },
      readyToScaffold: true
    };

    try {
      // 1. Validar template e estrutura do projeto
      await this.validateProjectTemplate(projectOptions, validation);

      // 2. Validar templates de entidades e comandos
      await this.validateTemplates(validation);

      // 3. Validar cada entidade
      for (const entityDef of entities) {
        await this.validateSingleEntity(entityDef, validation);
      }

      // 4. Calcular estimativas
      this.calculateEstimates(validation);

      // 5. Determinar se está pronto para scaffold
      validation.readyToScaffold = validation.project.valid && 
                                   validation.templates.valid && 
                                   validation.entities.every(e => e.valid);

    } catch (error: any) {
      validation.readyToScaffold = false;
      validation.project.warnings.push(`Erro durante validação: ${error.message}`);
    }

    return validation;
  }

  /**
   * Valida template e configurações do projeto
   */
  private async validateProjectTemplate(projectOptions: any, validation: any) {
    try {
      // Verificar se template existe
      const templates = await this.projectService.listTemplates();
      const templateExists = templates.includes(projectOptions.template || 'webapi');
      
      if (!templateExists) {
        validation.project.valid = false;
        validation.project.warnings.push(`Template '${projectOptions.template}' não encontrado`);
      }

      // Verificar conflitos de diretório
      const targetPath = `${projectOptions.outputPath || process.cwd()}/${projectOptions.name}`;
      const fs = require('fs');
      if (fs.existsSync(targetPath)) {
        validation.project.conflicts.push(`Diretório '${targetPath}' já existe`);
        if (!projectOptions.force) {
          validation.project.warnings.push('Use force: true para sobrescrever');
        }
      }

      // Verificar permissões de escrita
      const outputDir = projectOptions.outputPath || process.cwd();
      try {
        fs.accessSync(outputDir, fs.constants.W_OK);
      } catch {
        validation.project.valid = false;
        validation.project.warnings.push(`Sem permissão de escrita em '${outputDir}'`);
      }

    } catch (error: any) {
      validation.project.valid = false;
      validation.project.warnings.push(`Erro ao validar projeto: ${error.message}`);
    }
  }

  /**
   * Valida se todos os templates necessários existem
   */
  private async validateTemplates(validation: any) {
    const requiredTemplates = [
      'entity.hbs',
      'baseEntity.hbs',
      'command.hbs',
      'updateCommand.hbs',
      'iCommand.hbs',
      'commandResult.hbs',
      'iCommandResult.hbs',
      'validatable.hbs',
      'validatableTypes.hbs'
    ];

    const path = require('path');
    const fs = require('fs');

    for (const template of requiredTemplates) {
      const templatePath = this.getTemplatePath(template);
      
      if (fs.existsSync(templatePath)) {
        validation.templates.tested.push(template);
      } else {
        validation.templates.valid = false;
        validation.templates.missing.push(template);
      }
    }
  }

  /**
   * Valida uma única entidade
   */
  private async validateSingleEntity(entityDef: any, validation: any) {
    const entityValidation = {
      name: entityDef.name,
      valid: true,
      warnings: [] as string[],
      properties: {
        total: entityDef.properties?.length || 0,
        required: 0,
        collections: 0,
        navigationProperties: 0
      },
      commands: {
        willGenerate: entityDef.generateCommands !== false,
        createCommand: true,
        updateCommand: true
      },
      estimatedFiles: 1 // entidade base
    };

    try {
      // Validar nome da entidade
      if (!entityDef.name || typeof entityDef.name !== 'string') {
        entityValidation.valid = false;
        entityValidation.warnings.push('Nome da entidade é obrigatório');
      } else if (!/^[A-Z][a-zA-Z0-9]*$/.test(entityDef.name)) {
        entityValidation.warnings.push('Nome da entidade deve começar com maiúscula e conter apenas letras/números');
      }

      // Validar propriedades
      if (entityDef.properties && Array.isArray(entityDef.properties)) {
        for (const prop of entityDef.properties) {
          if (!prop.name || !prop.type) {
            entityValidation.valid = false;
            entityValidation.warnings.push(`Propriedade inválida: ${JSON.stringify(prop)}`);
          }

          if (prop.isRequired) entityValidation.properties.required++;
          if (prop.isCollection) entityValidation.properties.collections++;
          if (prop.isNavigationProperty) entityValidation.properties.navigationProperties++;
        }
      } else {
        entityValidation.warnings.push('Entidade sem propriedades definidas');
      }

      // Estimar arquivos que serão criados
      if (entityDef.generateCommands !== false) {
        entityValidation.estimatedFiles += 2; // Create + Update commands
      }

      // Testar geração de código (sem salvar)
      try {
        // Simular geração de entidade - apenas validar estrutura
        if (!entityDef.properties || entityDef.properties.length === 0) {
          entityValidation.warnings.push('Entidade sem propriedades pode gerar código vazio');
        }
        
        if (entityDef.generateCommands !== false) {
          // Validar que as propriedades são adequadas para comandos
          const hasRequiredProps = entityDef.properties?.some((p: any) => p.isRequired);
          if (!hasRequiredProps) {
            entityValidation.warnings.push('Nenhuma propriedade obrigatória encontrada para comandos');
          }
          
          entityValidation.commands.createCommand = true;
          entityValidation.commands.updateCommand = true;
        }
      } catch (codeError: any) {
        entityValidation.valid = false;
        entityValidation.warnings.push(`Erro ao validar estrutura: ${codeError.message}`);
      }

    } catch (error: any) {
      entityValidation.valid = false;
      entityValidation.warnings.push(`Erro ao validar entidade: ${error.message}`);
    }

    validation.entities.push(entityValidation);
  }

  /**
   * Calcula estimativas de arquivos e tamanho
   */
  private calculateEstimates(validation: any) {
    let totalFiles = 1; // projeto base
    let estimatedSize = 50; // KB base do projeto

    // Adicionar arquivos base do projeto
    totalFiles += 10; // arquivos de configuração, Program.cs, etc.

    // Calcular por entidade
    for (const entity of validation.entities) {
      totalFiles += entity.estimatedFiles;
      estimatedSize += entity.properties.total * 2; // ~2KB por propriedade
    }

    validation.summary.estimatedFiles = totalFiles;
    validation.summary.estimatedSize = `~${estimatedSize}KB`;
  }

  /**
   * Retorna caminho do template baseado no nome
   */
  private getTemplatePath(templateName: string): string {
    const path = require('path');
    
    if (templateName.includes('Command') || templateName.includes('command')) {
      return path.join(__dirname, '../templates/domain/commands', templateName);
    } else if (templateName.includes('Entity') || templateName.includes('entity') || templateName.includes('base')) {
      return path.join(__dirname, '../templates/domain/entities', templateName);
    } else {
      return path.join(__dirname, '../templates/domain/validation', templateName);
    }
  }
}

// Instância única do controller
export const projectController = new ProjectController();
