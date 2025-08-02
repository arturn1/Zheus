import * as path from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import { EntityDefinition, EntityGenerationRequest, EntityGenerationResult, EntityProperty } from '../types/entity';

export class EntityService {
  private template!: HandlebarsTemplateDelegate;

  constructor() {
    this.loadTemplate();
    this.registerHelpers();
  }

  /**
   * Carrega o template externo
   */
  private loadTemplate(): void {
    const templatePath = path.join(__dirname, '../templates/domain/entities/entity.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    this.template = Handlebars.compile(templateContent);
  }

  /**
   * Gera código C# da entidade baseado na definição
   */
  private generateEntityCode(definition: EntityDefinition): string {
    const templateData = this.prepareTemplateData(definition);
    return this.template(templateData);
  }

  /**
   * Prepara dados para o template
   */
  private prepareTemplateData(definition: EntityDefinition): any {
    const hasCollections = definition.properties.some(p => p.isCollection);

    return {
      name: definition.name,
      namespace: definition.namespace || 'Domain.Entities',
      baseSkip: !definition.inheritsFromBase,
      hasCollections,
      structureConstructor: this.buildConstructorParameters(definition.properties),
      structureEntityThis: this.buildConstructorBody(definition.properties),
      structureEntityPublic: this.buildProperties(definition.properties),
      initializeCollections: this.buildCollectionInitializers(definition.properties)
    };
  }

  /**
   * Gera entidade no projeto .NET
   */
  async generateEntity(request: EntityGenerationRequest): Promise<EntityGenerationResult> {
    try {
      // Validar projeto
      const domainPath = path.join(request.projectPath, 'Domain');
      if (!fs.existsSync(domainPath)) {
        return {
          success: false,
          message: 'Projeto Domain não encontrado. Certifique-se de que é um projeto Clean Architecture.',
          error: 'Domain project not found'
        };
      }

      // Verificar se entidade já existe
      const entitiesPath = path.join(domainPath, 'Entities');
      const entityFilePath = path.join(entitiesPath, `${request.entity.name}Entity.cs`);
      
      if (fs.existsSync(entityFilePath)) {
        return {
          success: false,
          message: `Entidade '${request.entity.name}Entity' já existe.`,
          error: 'Entity already exists'
        };
      }

      // Gerar código da entidade
      const entityCode = this.generateEntityCode(request.entity);

      // Criar arquivo
      fs.writeFileSync(entityFilePath, entityCode, 'utf8');

      return {
        success: true,
        message: `Entidade '${request.entity.name}Entity' criada com sucesso`,
        entityPath: entityFilePath,
        generatedFiles: [entityFilePath]
      };

    } catch (error: any) {
      console.error('❌ Erro ao gerar entidade:', error.message);
      return {
        success: false,
        message: 'Erro ao gerar entidade',
        error: error.message
      };
    }
  }

  /**
   * Lista entidades existentes no projeto
   */
  async listEntities(projectPath: string): Promise<string[]> {
    try {
      const entitiesPath = path.join(projectPath, 'Domain', 'Entities');
      
      if (!fs.existsSync(entitiesPath)) {
        return [];
      }

      const files = fs.readdirSync(entitiesPath);
      return files
        .filter(file => file.endsWith('.cs'))
        .map(file => file.replace('.cs', ''));

    } catch (error) {
      console.error('❌ Erro ao listar entidades:', error);
      return [];
    }
  }

  /**
   * Valida definição da entidade
   */
  private validateEntityDefinition(entity: EntityDefinition): string | null {
    if (!entity.name || entity.name.trim() === '') {
      return 'Nome da entidade é obrigatório';
    }

    if (entity.properties.length === 0) {
      return 'Entidade deve ter pelo menos uma propriedade';
    }

    for (const prop of entity.properties) {
      if (!prop.name || prop.name.trim() === '') {
        return 'Nome da propriedade é obrigatório';
      }
      
      if (!prop.type || prop.type.trim() === '') {
        return 'Tipo da propriedade é obrigatório';
      }
    }

    return null;
  }

  /**
   * Constrói parâmetros do construtor
   */
  private buildConstructorParameters(properties: EntityProperty[]): string {
    const params = properties
      .filter(p => !p.isCollection)
      .map(p => `${this.getCSharpType(p)} ${this.toCamelCase(p.name)}`)
      .join(', ');
    
    return params;
  }

  /**
   * Constrói corpo do construtor
   */
  private buildConstructorBody(properties: EntityProperty[]): string {
    const assignments = properties
      .filter(p => !p.isCollection)
      .map(p => `            ${p.name} = ${this.toCamelCase(p.name)};`)
      .join('\n');

    const collectionInitializers = properties
      .filter(p => p.isCollection)
      .map(p => `            ${p.name} = new ${this.getCollectionInitializer(p)}();`)
      .join('\n');

    return assignments + (assignments && collectionInitializers ? '\n' : '') + collectionInitializers;
  }

  /**
   * Constrói propriedades públicas
   */
  private buildProperties(properties: EntityProperty[]): string {
    return properties.map(p => {
      const csharpType = this.getCSharpType(p);
      return `        public ${csharpType} ${p.name} { get; set; }`;
    }).join('\n\n');
  }

  /**
   * Constrói inicializadores de collections
   */
  private buildCollectionInitializers(properties: EntityProperty[]): string[] {
    return properties
      .filter(p => p.isCollection)
      .map(p => `${p.name} = new ${this.getCollectionInitializer(p)}();`);
  }

  /**
   * Mapeia tipos para C# (método utilitário compartilhado)
   */
  public mapToCSharpType(type: string): string {
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
   * Converte para camelCase (método utilitário compartilhado)
   */
  public toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Obtém tipo C# baseado na propriedade (método utilitário compartilhado)
   */
  public getCSharpType(property: EntityProperty): string {
    if (property.isCollection) {
      return `${property.isCollection}<${property.type}>`;
    }

    return this.mapToCSharpType(property.type);
  }

  /**
   * Obtém inicializador de collection (método utilitário compartilhado)
   */
  public getCollectionInitializer(property: EntityProperty): string {
    const collectionType = property.isCollection || 'List';
    
    switch (collectionType) {
      case 'List':
        return `List<${property.type}>`;
      case 'HashSet':
        return `HashSet<${property.type}>`;
      case 'ICollection':
      case 'IEnumerable':
        return `List<${property.type}>`;
      case 'Array':
        return `${property.type}[0]`;
      default:
        return `List<${property.type}>`;
    }
  }

  /**
   * Registra helpers do Handlebars
   */
  private registerHelpers(): void {
    // Helpers podem ser adicionados aqui para lógicas mais complexas no template
  }
}
