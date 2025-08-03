import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { EntityDefinition, EntityProperty } from '../types/entity';

export class HandlerService {

  constructor() {
    // Templates são carregados dinamicamente a cada uso
  }

  /**
   * Carrega o template de handler
   */
  private loadHandlerTemplate(): HandlebarsTemplateDelegate {
    const templatePath = path.join(__dirname, '../templates/domain/handlers/handler.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  /**
   * Carrega o template de contract (interface IHandler)
   */
  private loadContractTemplate(): HandlebarsTemplateDelegate {
    const templatePath = path.join(__dirname, '../templates/domain/handlers/iHandler.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  /**
   * Gera handler para uma entidade
   */
  async generateHandlerFile(projectPath: string, definition: EntityDefinition): Promise<{ success: boolean; message: string; filePaths?: string[]; error?: string }> {
    try {
      // Validar projeto
      const domainPath = path.join(projectPath, 'Domain');
      if (!fs.existsSync(domainPath)) {
        return {
          success: false,
          message: 'Projeto Domain não encontrado. Certifique-se de que é um projeto Clean Architecture.',
          error: 'Domain project not found'
        };
      }

      // Criar estrutura de pastas
      const handlersPath = path.join(domainPath, 'Handlers');
      const contractsPath = path.join(handlersPath, 'Contracts');
      
      if (!fs.existsSync(handlersPath)) {
        fs.mkdirSync(handlersPath, { recursive: true });
      }
      
      if (!fs.existsSync(contractsPath)) {
        fs.mkdirSync(contractsPath, { recursive: true });
      }

      // Definir caminhos dos arquivos
      const handlerFilePath = path.join(handlersPath, `${definition.name}Handler.cs`);
      const contractFilePath = path.join(contractsPath, 'IHandler.cs');

      // Gerar código do handler
      const handlerCode = this.generateHandler(definition);
      
      // Gerar interface IHandler (só uma vez)
      let createdFiles = [handlerFilePath];
      if (!fs.existsSync(contractFilePath)) {
        const contractCode = this.generateContract();
        fs.writeFileSync(contractFilePath, contractCode, 'utf8');
        createdFiles.push(contractFilePath);
      }

      // Sempre criar/sobrescrever handler
      fs.writeFileSync(handlerFilePath, handlerCode, 'utf8');

      const message = `Handler para '${definition.name}' criado com sucesso`;

      return {
        success: true,
        message: message,
        filePaths: createdFiles
      };

    } catch (error: any) {
      console.error('❌ Erro ao gerar handler:', error.message);
      return {
        success: false,
        message: 'Erro ao gerar handler',
        error: error.message
      };
    }
  }

  /**
   * Gera código C# do handler baseado na definição da entidade
   */
  generateHandler(definition: EntityDefinition): string {
    const handlerTemplate = this.loadHandlerTemplate();
    const handlerData = this.prepareHandlerTemplateData(definition);
    return handlerTemplate(handlerData);
  }

  /**
   * Gera código C# da interface IHandler
   */
  generateContract(): string {
    const contractTemplate = this.loadContractTemplate();
    return contractTemplate({});
  }

  /**
   * Prepara dados para o template de handler
   */
  private prepareHandlerTemplateData(definition: EntityDefinition) {
    const hasCollections = definition.properties.some(p => p.isCollection);
    
    // Comandos que o handler deve tratar (Create e Update)
    const commands = [
      {
        commandName: `Create${definition.name}Command`,
        isUpdateCommand: false,
        isFirst: true
      },
      {
        commandName: `Update${definition.name}Command`,
        isUpdateCommand: true,
        isFirst: false
      }
    ];

    return {
      name: definition.name,
      title: this.toCamelCase(definition.name),
      hasCollections,
      command: commands,
      repository: [
        {
          name: definition.name,
          title: this.toCamelCase(definition.name)
        }
      ]
    };
  }

  /**
   * Lista handlers existentes no projeto
   */
  async listHandlers(projectPath: string): Promise<string[]> {
    try {
      const handlersPath = path.join(projectPath, 'Domain', 'Handlers');
      
      if (!fs.existsSync(handlersPath)) {
        return [];
      }

      const handlers: string[] = [];
      const files = fs.readdirSync(handlersPath);
      
      for (const file of files) {
        if (file.endsWith('Handler.cs')) {
          handlers.push(file.replace('.cs', ''));
        }
      }

      return handlers;

    } catch (error) {
      console.error('❌ Erro ao listar handlers:', error);
      return [];
    }
  }

  /**
   * Converte para camelCase
   */
  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}
