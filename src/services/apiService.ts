import * as fs from 'fs';
import * as path from 'path';
import { TemplateManager } from '../utils/TemplateManager';

export interface ApiConfigResult {
  success: boolean;
  message: string;
  filePath?: string;
  files?: string[];
}

export interface ApiConfigOptions {
  projectName?: string;
  swagger?: {
    title?: string;
    version?: string;
    description?: string;
  };
}

export class ApiService {

  /**
   * Cria todos os arquivos de configuração da API
   */
  async createApiConfigurations(projectPath: string, options?: ApiConfigOptions): Promise<ApiConfigResult> {
    try {
      const apiPath = path.join(projectPath, 'API');
      const configurationsPath = path.join(apiPath, 'Configurations');

      // Verificar se diretório da API existe
      if (!fs.existsSync(apiPath)) {
        return {
          success: false,
          message: 'Projeto API não encontrado. Execute o scaffold do projeto primeiro.'
        };
      }

      // Garantir que diretório Configurations existe
      if (!fs.existsSync(configurationsPath)) {
        fs.mkdirSync(configurationsPath, { recursive: true });
      }

      const createdFiles: string[] = [];

      // 1. Criar DependencyInjectionConfig
      const diConfigResult = await this.createDependencyInjectionConfig(configurationsPath);
      if (diConfigResult.success && diConfigResult.filePath) {
        createdFiles.push(diConfigResult.filePath);
      }

      // 2. Criar EnvironmentConfig
      const envConfigResult = await this.createEnvironmentConfig(configurationsPath);
      if (envConfigResult.success && envConfigResult.filePath) {
        createdFiles.push(envConfigResult.filePath);
      }

      // 3. Criar SwaggerConfig
      const swaggerConfigResult = await this.createSwaggerConfig(configurationsPath, options?.swagger);
      if (swaggerConfigResult.success && swaggerConfigResult.filePath) {
        createdFiles.push(swaggerConfigResult.filePath);
      }

      // 4. Criar middlewares da API
      const middlewareResult = await this.createApiMiddlewares(projectPath);
      if (middlewareResult.success && middlewareResult.files) {
        createdFiles.push(...middlewareResult.files);
      }

      return {
        success: true,
        message: `${createdFiles.length} arquivos da API criados com sucesso (configurações + middlewares)`,
        files: createdFiles
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar configurações da API:', error);
      return {
        success: false,
        message: `Erro ao criar configurações: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo DependencyInjectionConfig.cs
   */
  private async createDependencyInjectionConfig(configurationsPath: string): Promise<ApiConfigResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/api/configurations/dependencyInjectionConfig.hbs');
      const filePath = path.join(configurationsPath, 'DependencyInjectionConfig.cs');

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template DependencyInjectionConfig não encontrado'
        };
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'DependencyInjectionConfig criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar DependencyInjectionConfig:', error);
      return {
        success: false,
        message: `Erro ao criar DependencyInjectionConfig: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo EnvironmentConfig.cs
   */
  private async createEnvironmentConfig(configurationsPath: string): Promise<ApiConfigResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/api/configurations/environmentConfig.hbs');
      const filePath = path.join(configurationsPath, 'EnvironmentConfig.cs');

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template EnvironmentConfig não encontrado'
        };
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'EnvironmentConfig criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar EnvironmentConfig:', error);
      return {
        success: false,
        message: `Erro ao criar EnvironmentConfig: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo SwaggerConfig.cs
   */
  private async createSwaggerConfig(configurationsPath: string, swaggerOptions?: {
    title?: string;
    version?: string;
    description?: string;
  }): Promise<ApiConfigResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/api/configurations/swaggerConfig.hbs');
      const filePath = path.join(configurationsPath, 'SwaggerConfig.cs');

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template SwaggerConfig não encontrado'
        };
      }

      // Ler template
      let template = fs.readFileSync(templatePath, 'utf-8');

      // Se tiver opções específicas do Swagger, podemos personalizar aqui no futuro
      // Por enquanto, usar template padrão

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'SwaggerConfig criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar SwaggerConfig:', error);
      return {
        success: false,
        message: `Erro ao criar SwaggerConfig: ${error.message}`
      };
    }
  }

  /**
   * Cria um controller específico para uma entidade
   */
  async createEntityController(projectPath: string, entityName: string, entityProperties?: any[]): Promise<ApiConfigResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/api/controllers/entityController.hbs');
      const apiPath = path.join(projectPath, 'API');
      const controllersPath = path.join(apiPath, 'Controllers');
      const filePath = path.join(controllersPath, `${entityName}Controller.cs`);

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template entityController não encontrado'
        };
      }

      // Verificar se diretório Controllers existe
      if (!fs.existsSync(controllersPath)) {
        fs.mkdirSync(controllersPath, { recursive: true });
      }

      // Criar BaseController se não existir
      await this.createBaseController(projectPath);

      // Obter template via TemplateManager
      const template = TemplateManager.getTemplate('api/controller.hbs');

      // Preparar dados para o template
      const templateData = {
        name: entityName,
        title: entityName.toLowerCase(),
        hasCollections: entityProperties && entityProperties.length > 0,
        command: [
          {
            name: entityName,
            isUpdateCommand: false
          },
          {
            name: entityName,
            isUpdateCommand: true
          }
        ]
      };

      // Gerar conteúdo do controller
      const controllerContent = template(templateData);

      // Escrever arquivo
      fs.writeFileSync(filePath, controllerContent);

      return {
        success: true,
        message: `Controller ${entityName} criado com sucesso`,
        filePath
      };

    } catch (error: any) {
      console.error(`❌ Erro ao criar controller ${entityName}:`, error);
      return {
        success: false,
        message: `Erro ao criar controller: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo BaseController.cs na pasta Contract
   */
  private async createBaseController(projectPath: string): Promise<ApiConfigResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/api/controllers/contract/baseController.hbs');
      const apiPath = path.join(projectPath, 'API');
      const contractPath = path.join(apiPath, 'Controllers', 'Contract');
      const filePath = path.join(contractPath, 'BaseController.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'BaseController já existe',
          filePath
        };
      }

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template BaseController não encontrado'
        };
      }

      // Verificar se diretório Contract existe
      if (!fs.existsSync(contractPath)) {
        fs.mkdirSync(contractPath, { recursive: true });
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'BaseController criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar BaseController:', error);
      return {
        success: false,
        message: `Erro ao criar BaseController: ${error.message}`
      };
    }
  }

  /**
   * Cria os middlewares da API (CancellationToken e ErrorHandling)
   */
  private async createApiMiddlewares(projectPath: string): Promise<ApiConfigResult> {
    try {
      const apiPath = path.join(projectPath, 'API');
      const middlewarePath = path.join(apiPath, 'Middleware');

      // Verificar se diretório da API existe
      if (!fs.existsSync(apiPath)) {
        return {
          success: false,
          message: 'Projeto API não encontrado. Execute o scaffold do projeto primeiro.'
        };
      }

      // Garantir que diretório Middleware existe
      if (!fs.existsSync(middlewarePath)) {
        fs.mkdirSync(middlewarePath, { recursive: true });
      }

      const createdFiles: string[] = [];

      // 1. Criar CancellationTokenMiddleware
      const cancellationResult = await this.createCancellationTokenMiddleware(middlewarePath);
      if (cancellationResult.success && cancellationResult.filePath) {
        createdFiles.push(cancellationResult.filePath);
      }

      // 2. Criar ErrorHandlingMiddleware
      const errorHandlingResult = await this.createErrorHandlingMiddleware(middlewarePath);
      if (errorHandlingResult.success && errorHandlingResult.filePath) {
        createdFiles.push(errorHandlingResult.filePath);
      }

      return {
        success: true,
        message: `${createdFiles.length} middlewares criados com sucesso`,
        files: createdFiles
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar middlewares da API:', error);
      return {
        success: false,
        message: `Erro ao criar middlewares: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo CancellationTokenMiddleware.cs
   */
  private async createCancellationTokenMiddleware(middlewarePath: string): Promise<ApiConfigResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/api/middleware/cancellationTokenMiddleware.hbs');
      const filePath = path.join(middlewarePath, 'CancellationTokenMiddleware.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'CancellationTokenMiddleware já existe',
          filePath
        };
      }

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template CancellationTokenMiddleware não encontrado'
        };
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'CancellationTokenMiddleware criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar CancellationTokenMiddleware:', error);
      return {
        success: false,
        message: `Erro ao criar CancellationTokenMiddleware: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo ErrorHandlingMiddleware.cs
   */
  private async createErrorHandlingMiddleware(middlewarePath: string): Promise<ApiConfigResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/api/middleware/errorHandlingMiddleware.hbs');
      const filePath = path.join(middlewarePath, 'ErrorHandlingMiddleware.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'ErrorHandlingMiddleware já existe',
          filePath
        };
      }

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template ErrorHandlingMiddleware não encontrado'
        };
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'ErrorHandlingMiddleware criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar ErrorHandlingMiddleware:', error);
      return {
        success: false,
        message: `Erro ao criar ErrorHandlingMiddleware: ${error.message}`
      };
    }
  }
}
