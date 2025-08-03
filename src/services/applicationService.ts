import * as fs from 'fs';
import * as path from 'path';

export interface ApplicationResult {
  success: boolean;
  message: string;
  filePath?: string;
  files?: string[];
}

export class ApplicationService {

  /**
   * Cria todos os arquivos da camada Application
   */
  async createApplicationLayer(projectPath: string): Promise<ApplicationResult> {
    try {
      const applicationPath = path.join(projectPath, 'Application');

      // Verificar se diretório da Application existe
      if (!fs.existsSync(applicationPath)) {
        return {
          success: false,
          message: 'Projeto Application não encontrado. Execute o scaffold do projeto primeiro.'
        };
      }

      const createdFiles: string[] = [];

      // 1. Criar DefaultDictionary
      const dictionaryResult = await this.createDefaultDictionary(applicationPath);
      if (dictionaryResult.success && dictionaryResult.filePath) {
        createdFiles.push(dictionaryResult.filePath);
      }

      // 2. Criar DTOs de Response
      const dtosResult = await this.createResponseDTOs(applicationPath);
      if (dtosResult.success && dtosResult.files) {
        createdFiles.push(...dtosResult.files);
      }

      // 3. Criar Interface HttpClientService
      const interfaceResult = await this.createHttpClientInterface(applicationPath);
      if (interfaceResult.success && interfaceResult.filePath) {
        createdFiles.push(interfaceResult.filePath);
      }

      // 4. Criar Serviço HttpClientService
      const serviceResult = await this.createHttpClientService(applicationPath);
      if (serviceResult.success && serviceResult.filePath) {
        createdFiles.push(serviceResult.filePath);
      }

      return {
        success: true,
        message: `${createdFiles.length} arquivos da Application criados com sucesso`,
        files: createdFiles
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar camada Application:', error);
      return {
        success: false,
        message: `Erro ao criar Application: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo DefaultDictionary.cs
   */
  async createDefaultDictionary(applicationPath: string): Promise<ApplicationResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/application/dictionary/defaultDictionary.hbs');
      const dictionaryPath = path.join(applicationPath, 'Dictionary');
      const filePath = path.join(dictionaryPath, 'DefaultDictionary.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'DefaultDictionary já existe',
          filePath
        };
      }

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template DefaultDictionary não encontrado'
        };
      }

      // Verificar se diretório Dictionary existe
      if (!fs.existsSync(dictionaryPath)) {
        fs.mkdirSync(dictionaryPath, { recursive: true });
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'DefaultDictionary criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar DefaultDictionary:', error);
      return {
        success: false,
        message: `Erro ao criar DefaultDictionary: ${error.message}`
      };
    }
  }

  /**
   * Cria os DTOs de Response
   */
  async createResponseDTOs(applicationPath: string): Promise<ApplicationResult> {
    try {
      const responsePath = path.join(applicationPath, 'DTOs', 'Response');

      // Verificar se diretório Response existe
      if (!fs.existsSync(responsePath)) {
        fs.mkdirSync(responsePath, { recursive: true });
      }

      const createdFiles: string[] = [];

      // 1. Criar ApiResponseModel
      const apiResponseResult = await this.createApiResponseModel(responsePath);
      if (apiResponseResult.success && apiResponseResult.filePath) {
        createdFiles.push(apiResponseResult.filePath);
      }

      // 2. Criar HttpClientResponse
      const httpClientResult = await this.createHttpClientResponse(responsePath);
      if (httpClientResult.success && httpClientResult.filePath) {
        createdFiles.push(httpClientResult.filePath);
      }

      return {
        success: true,
        message: `${createdFiles.length} DTOs de Response criados com sucesso`,
        files: createdFiles
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar DTOs de Response:', error);
      return {
        success: false,
        message: `Erro ao criar Response DTOs: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo ApiResponseModel.cs
   */
  async createApiResponseModel(responsePath: string): Promise<ApplicationResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/application/dtos/response/apiResponseModel.hbs');
      const filePath = path.join(responsePath, 'ApiResponseModel.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'ApiResponseModel já existe',
          filePath
        };
      }

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template ApiResponseModel não encontrado'
        };
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'ApiResponseModel criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar ApiResponseModel:', error);
      return {
        success: false,
        message: `Erro ao criar ApiResponseModel: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo HttpClientResponse.cs
   */
  async createHttpClientResponse(responsePath: string): Promise<ApplicationResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/application/dtos/response/httpClientResponse.hbs');
      const filePath = path.join(responsePath, 'HttpClientResponse.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'HttpClientResponse já existe',
          filePath
        };
      }

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template HttpClientResponse não encontrado'
        };
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'HttpClientResponse criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar HttpClientResponse:', error);
      return {
        success: false,
        message: `Erro ao criar HttpClientResponse: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo IHttpClientService.cs
   */
  async createHttpClientInterface(applicationPath: string): Promise<ApplicationResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/application/interfaces/iHttpClientService.hbs');
      const interfacesPath = path.join(applicationPath, 'Interfaces');
      const filePath = path.join(interfacesPath, 'IHttpClientService.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'IHttpClientService já existe',
          filePath
        };
      }

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template IHttpClientService não encontrado'
        };
      }

      // Verificar se diretório Interfaces existe
      if (!fs.existsSync(interfacesPath)) {
        fs.mkdirSync(interfacesPath, { recursive: true });
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'IHttpClientService criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar IHttpClientService:', error);
      return {
        success: false,
        message: `Erro ao criar IHttpClientService: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo HttpClientService.cs
   */
  async createHttpClientService(applicationPath: string): Promise<ApplicationResult> {
    try {
      const templatePath = path.join(__dirname, '../templates/application/services/httpClientService.hbs');
      const servicesPath = path.join(applicationPath, 'Services');
      const filePath = path.join(servicesPath, 'HttpClientService.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'HttpClientService já existe',
          filePath
        };
      }

      // Verificar se template existe
      if (!fs.existsSync(templatePath)) {
        return {
          success: false,
          message: 'Template HttpClientService não encontrado'
        };
      }

      // Verificar se diretório Services existe
      if (!fs.existsSync(servicesPath)) {
        fs.mkdirSync(servicesPath, { recursive: true });
      }

      // Ler template
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Escrever arquivo
      fs.writeFileSync(filePath, template);

      return {
        success: true,
        message: 'HttpClientService criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar HttpClientService:', error);
      return {
        success: false,
        message: `Erro ao criar HttpClientService: ${error.message}`
      };
    }
  }

  /**
   * Verifica se a camada Application está configurada
   */
  hasApplicationLayer(projectPath: string): boolean {
    try {
      const applicationPath = path.join(projectPath, 'Application');
      
      const requiredFiles = [
        'Dictionary/DefaultDictionary.cs',
        'DTOs/Response/ApiResponseModel.cs',
        'DTOs/Response/HttpClientResponse.cs',
        'Interfaces/IHttpClientService.cs',
        'Services/HttpClientService.cs'
      ];

      return requiredFiles.every(file => 
        fs.existsSync(path.join(applicationPath, file))
      );

    } catch (error) {
      return false;
    }
  }

  /**
   * Lista todos os arquivos da Application
   */
  getApplicationFiles(projectPath: string): string[] {
    try {
      const applicationPath = path.join(projectPath, 'Application');
      
      if (!fs.existsSync(applicationPath)) {
        return [];
      }

      const files: string[] = [];
      
      // Verificar Dictionary
      const dictionaryPath = path.join(applicationPath, 'Dictionary');
      if (fs.existsSync(dictionaryPath)) {
        const dictionaryFiles = fs.readdirSync(dictionaryPath);
        files.push(...dictionaryFiles.map(f => `Dictionary/${f}`));
      }

      // Verificar DTOs/Response
      const responsePath = path.join(applicationPath, 'DTOs', 'Response');
      if (fs.existsSync(responsePath)) {
        const responseFiles = fs.readdirSync(responsePath);
        files.push(...responseFiles.map(f => `DTOs/Response/${f}`));
      }

      // Verificar Interfaces
      const interfacesPath = path.join(applicationPath, 'Interfaces');
      if (fs.existsSync(interfacesPath)) {
        const interfaceFiles = fs.readdirSync(interfacesPath);
        files.push(...interfaceFiles.map(f => `Interfaces/${f}`));
      }

      // Verificar Services
      const servicesPath = path.join(applicationPath, 'Services');
      if (fs.existsSync(servicesPath)) {
        const serviceFiles = fs.readdirSync(servicesPath);
        files.push(...serviceFiles.map(f => `Services/${f}`));
      }

      return files;

    } catch (error) {
      console.error('❌ Erro ao listar arquivos da Application:', error);
      return [];
    }
  }
}
