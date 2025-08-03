import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { EntityDefinition, EntityProperty } from '../types/entity';

export class CommandService {
  private commandTemplate!: HandlebarsTemplateDelegate;
  private updateCommandTemplate!: HandlebarsTemplateDelegate;

  constructor() {
    this.loadCommandTemplate();
    this.loadUpdateCommandTemplate();
  }

  /**
   * Carrega o template de comando
   */
  private loadCommandTemplate(): void {
    const templatePath = path.join(__dirname, '../templates/domain/commands/command.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    this.commandTemplate = Handlebars.compile(templateContent);
  }

  /**
   * Carrega o template de comando de atualização
   */
  private loadUpdateCommandTemplate(): void {
    const templatePath = path.join(__dirname, '../templates/domain/commands/updateCommand.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    this.updateCommandTemplate = Handlebars.compile(templateContent);
  }

  /**
   * Gera código C# do comando baseado na definição da entidade
   */
  generateCommand(definition: EntityDefinition, includeId: boolean = true): string {
    const commandData = this.prepareCommandTemplateData(definition, includeId, 'Create');
    return this.commandTemplate(commandData);
  }

  /**
   * Gera código C# do comando de atualização baseado na definição da entidade
   */
  generateUpdateCommand(definition: EntityDefinition): string {
    const commandData = this.prepareUpdateCommandTemplateData(definition);
    return this.updateCommandTemplate(commandData);
  }

  /**
   * Gera arquivo de comando no projeto - Sempre cria/sobrescreve ambos os comandos (Create e Update)
   */
  async generateCommandFile(projectPath: string, definition: EntityDefinition, includeId: boolean = true): Promise<{ success: boolean; message: string; filePaths?: string[]; error?: string }> {
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

      // Criar pasta específica para os comandos da entidade
      const commandsBasePath = path.join(domainPath, 'Commands');
      const entityCommandsPath = path.join(commandsBasePath, `${definition.name}Commands`);
      
      if (!fs.existsSync(entityCommandsPath)) {
        fs.mkdirSync(entityCommandsPath, { recursive: true });
      }

      // Definir caminhos dos arquivos
      const createCommandFilePath = path.join(entityCommandsPath, `Create${definition.name}Command.cs`);
      const updateCommandFilePath = path.join(entityCommandsPath, `Update${definition.name}Command.cs`);
      
      // Verificar se arquivos já existem para determinar se é criação ou edição
      const createExists = fs.existsSync(createCommandFilePath);
      const updateExists = fs.existsSync(updateCommandFilePath);
      const isEditing = createExists || updateExists;

      // Gerar códigos dos comandos
      const createCommandCode = this.generateCommand(definition, includeId);
      const updateCommandCode = this.generateUpdateCommand(definition);

      // Sempre criar/sobrescrever arquivos
      fs.writeFileSync(createCommandFilePath, createCommandCode, 'utf8');
      fs.writeFileSync(updateCommandFilePath, updateCommandCode, 'utf8');

      const actionType = isEditing ? 'atualizados' : 'criados';
      const message = `Comandos para '${definition.name}' ${actionType} com sucesso`;

      return {
        success: true,
        message: message,
        filePaths: [createCommandFilePath, updateCommandFilePath]
      };

    } catch (error: any) {
      console.error('❌ Erro ao gerar comandos:', error.message);
      return {
        success: false,
        message: 'Erro ao gerar comandos',
        error: error.message
      };
    }
  }

  /**
   * Lista comandos existentes no projeto
   */
  async listCommands(projectPath: string): Promise<string[]> {
    try {
      const commandsPath = path.join(projectPath, 'Domain', 'Commands');
      
      if (!fs.existsSync(commandsPath)) {
        return [];
      }

      const commands: string[] = [];
      
      // Ler arquivos na raiz de Commands
      const rootFiles = fs.readdirSync(commandsPath);
      for (const item of rootFiles) {
        const itemPath = path.join(commandsPath, item);
        
        if (fs.statSync(itemPath).isFile() && item.endsWith('Command.cs')) {
          commands.push(item.replace('.cs', ''));
        } else if (fs.statSync(itemPath).isDirectory() && !item.includes('Contracts')) {
          // Ler arquivos nas subpastas (ex: UserCommands/) - ignorar Contracts
          const subFiles = fs.readdirSync(itemPath);
          for (const subFile of subFiles) {
            if (subFile.endsWith('Command.cs')) {
              commands.push(`${item}/${subFile.replace('.cs', '')}`);
            }
          }
        }
      }

      return commands;

    } catch (error) {
      console.error('❌ Erro ao listar comandos:', error);
      return [];
    }
  }

  /**
   * Prepara dados para o template de comando
   */
  private prepareCommandTemplateData(definition: EntityDefinition, includeId: boolean, commandType: 'Create' | 'Update' = 'Create') {
    // Verificar se a entidade já tem uma propriedade Id
    const hasIdProperty = definition.properties.some(p => p.name.toLowerCase() === 'id');
    
    // Se já tem propriedade Id na entidade, não incluir o Guid Id padrão
    const shouldIncludeGuidId = includeId && !hasIdProperty;
    
    // Para comandos Create, incluir todas as propriedades
    const properties = definition.properties;
    
    const hasCollections = properties.some(p => p.isCollection);
    const hasEntities = properties.some(p => p.isNavigationProperty);
    
    // Construir parâmetros do construtor - incluir propriedades obrigatórias ou todas se for Create
    const constructorProps = commandType === 'Create' 
      ? properties.filter(p => p.isRequired || !p.name.toLowerCase().includes('id'))
      : properties.filter(p => p.isRequired);
      
    const constructorParams = constructorProps
      .map(p => {
        const csharpType = this.mapToCSharpType(p.type);
        const paramType = p.isCollection ? `${p.isCollection}<${csharpType}>` : csharpType;
        return `${paramType} ${this.toCamelCase(p.name)}`;
      })
      .join(', ');

    // Construir assignments no construtor
    const constructorAssignments = constructorProps
      .map(p => `\n            this.${p.name} = ${this.toCamelCase(p.name)};`)
      .join('');

    // Construir propriedades públicas
    const publicProperties = properties
      .map(p => {
        const csharpType = this.mapToCSharpType(p.type);
        const propType = p.isCollection ? `${p.isCollection}<${csharpType}>` : csharpType;
        return `\n\n        public ${propType} ${p.name} { get; set; }`;
      })
      .join('');

    return {
      name: `${commandType}${definition.name}Command`,
      entityName: definition.name,
      folderName: `${definition.name}Commands`,
      id: shouldIncludeGuidId,
      hasCollections,
      hasEntities,
      structureConstructor: constructorParams,
      structureEntityThis: constructorAssignments,
      structureEntityPublic: publicProperties
    };
  }

  /**
   * Prepara dados para o template de comando de atualização
   */
  private prepareUpdateCommandTemplateData(definition: EntityDefinition) {
    const properties = definition.properties; // Para update, incluir todas as propriedades
    
    const hasCollections = properties.some(p => p.isCollection);
    const hasEntities = properties.some(p => p.isNavigationProperty);
    
    // Para update, parâmetros opcionais (exceto collections que não vão no construtor)
    const constructorParams = properties
      .filter(p => !p.isCollection && !p.name.toLowerCase().includes('id'))
      .map(p => {
        const csharpType = this.mapToCSharpType(p.type);
        return `${csharpType} ${this.toCamelCase(p.name)}`;
      })
      .join(', ');

    // Assignments no construtor (exceto Id que já é tratado no template)
    const constructorAssignments = properties
      .filter(p => !p.isCollection && !p.name.toLowerCase().includes('id'))
      .map(p => `\n            this.${p.name} = ${this.toCamelCase(p.name)};`)
      .join('');

    // Todas as propriedades (exceto Id que já é tratado no template)
    const publicProperties = properties
      .filter(p => !p.name.toLowerCase().includes('id'))
      .map(p => {
        const csharpType = this.mapToCSharpType(p.type);
        const propType = p.isCollection ? `${p.isCollection}<${csharpType}>` : csharpType;
        return `\n\n        public ${propType} ${p.name} { get; set; }`;
      })
      .join('');

    return {
      entityName: definition.name,
      folderName: `${definition.name}Commands`,
      hasCollections,
      hasEntities,
      hasConstructorParams: constructorParams.length > 0,
      structureConstructor: constructorParams,
      structureEntityThis: constructorAssignments,
      structureEntityPublic: publicProperties
    };
  }

  /**
   * Mapeia tipos para C#
   */
  private mapToCSharpType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'int': 'int',
      'long': 'long',
      'double': 'double',
      'decimal': 'decimal',
      'bool': 'bool',
      'boolean': 'bool',
      'date': 'DateTime',
      'datetime': 'DateTime',
      'guid': 'Guid'
    };

    return typeMap[type.toLowerCase()] || type;
  }

  /**
   * Converte para camelCase
   */
  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}
