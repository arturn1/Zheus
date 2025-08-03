import * as fs from 'fs';
import * as path from 'path';
import { TemplateManager } from '../utils/TemplateManager';

export interface InfrastructureResult {
  success: boolean;
  message: string;
  filePath?: string;
  files?: string[];
}

export class InfrastructureService {

  /**
   * Cria todos os arquivos da camada Infrastructure
   */
  async createInfrastructureLayer(projectPath: string, entities?: any[]): Promise<InfrastructureResult> {
    try {
      const infrastructurePath = path.join(projectPath, 'Infrastructure');

      // Verificar se diretório da Infrastructure existe
      if (!fs.existsSync(infrastructurePath)) {
        return {
          success: false,
          message: 'Projeto Infrastructure não encontrado. Execute o scaffold do projeto primeiro.'
        };
      }

      const createdFiles: string[] = [];

      // 1. Criar DatabaseConfig
      const databaseConfigResult = await this.createDatabaseConfig(infrastructurePath);
      if (databaseConfigResult.success && databaseConfigResult.filePath) {
        createdFiles.push(databaseConfigResult.filePath);
      }

      // 2. Criar ApplicationDbContext
      const dbContextResult = await this.createApplicationDbContext(infrastructurePath);
      if (dbContextResult.success && dbContextResult.filePath) {
        createdFiles.push(dbContextResult.filePath);
      }

      // 3. Criar RepositoryBase
      const repositoryBaseResult = await this.createRepositoryBase(infrastructurePath);
      if (repositoryBaseResult.success && repositoryBaseResult.filePath) {
        createdFiles.push(repositoryBaseResult.filePath);
      }

      // 4. Criar repositórios específicos para cada entidade
      if (entities && entities.length > 0) {
        for (const entity of entities) {
          const entityRepositoryResult = await this.createEntityRepository(infrastructurePath, entity.name);
          if (entityRepositoryResult.success && entityRepositoryResult.filePath) {
            createdFiles.push(entityRepositoryResult.filePath);
          }
        }
      }

      return {
        success: true,
        message: `${createdFiles.length} arquivos da Infrastructure criados com sucesso`,
        files: createdFiles
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar camada Infrastructure:', error);
      return {
        success: false,
        message: `Erro ao criar Infrastructure: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo DatabaseConfig.cs
   */
  async createDatabaseConfig(infrastructurePath: string): Promise<InfrastructureResult> {
    try {
      const configurationPath = path.join(infrastructurePath, 'Configuration');
      const filePath = path.join(configurationPath, 'DatabaseConfig.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'DatabaseConfig já existe',
          filePath
        };
      }

      // Obter template via TemplateManager
      const template = TemplateManager.getTemplate('infrastructure/configuration/databaseConfig.hbs');
      const templateContent = template({});

      // Escrever arquivo
      fs.writeFileSync(filePath, templateContent);

      return {
        success: true,
        message: 'DatabaseConfig criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar DatabaseConfig:', error);
      return {
        success: false,
        message: `Erro ao criar DatabaseConfig: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo ApplicationDbContext.cs
   */
  async createApplicationDbContext(infrastructurePath: string): Promise<InfrastructureResult> {
    try {
      const dataPath = path.join(infrastructurePath, 'Data');
      const filePath = path.join(dataPath, 'ApplicationDbContext.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'ApplicationDbContext já existe',
          filePath
        };
      }

      // Obter template via TemplateManager
      const template = TemplateManager.getTemplate('infrastructure/data/applicationDbContext.hbs');
      const templateContent = template({});

      // Escrever arquivo
      // Escrever arquivo
      fs.writeFileSync(filePath, templateContent);

      return {
        success: true,
        message: 'ApplicationDbContext criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar ApplicationDbContext:', error);
      return {
        success: false,
        message: `Erro ao criar ApplicationDbContext: ${error.message}`
      };
    }
  }

  /**
   * Cria o arquivo RepositoryBase.cs
   */
  async createRepositoryBase(infrastructurePath: string): Promise<InfrastructureResult> {
    try {
      const repositoryContractsPath = path.join(infrastructurePath, 'Repositories', 'Contracts');
      const filePath = path.join(repositoryContractsPath, 'RepositoryBase.cs');

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'RepositoryBase já existe',
          filePath
        };
      }

      // Obter template via TemplateManager
      const template = TemplateManager.getTemplate('infrastructure/repositories/contracts/repositoryBase.hbs');
      const templateContent = template({});

      // Escrever arquivo
      fs.writeFileSync(filePath, templateContent);

      return {
        success: true,
        message: 'RepositoryBase criado com sucesso',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar RepositoryBase:', error);
      return {
        success: false,
        message: `Erro ao criar RepositoryBase: ${error.message}`
      };
    }
  }

  /**
   * Verifica se a camada Infrastructure está configurada
   */
  hasInfrastructureLayer(projectPath: string): boolean {
    try {
      const infrastructurePath = path.join(projectPath, 'Infrastructure');
      
      const requiredFiles = [
        'Configuration/DatabaseConfig.cs',
        'Data/ApplicationDbContext.cs',
        'Repositories/Contracts/RepositoryBase.cs'
      ];

      return requiredFiles.every(file => 
        fs.existsSync(path.join(infrastructurePath, file))
      );

    } catch (error) {
      return false;
    }
  }

  /**
   * Lista todos os arquivos da Infrastructure
   */
  getInfrastructureFiles(projectPath: string): string[] {
    try {
      const infrastructurePath = path.join(projectPath, 'Infrastructure');
      
      if (!fs.existsSync(infrastructurePath)) {
        return [];
      }

      const files: string[] = [];
      
      // Verificar Configuration
      const configurationPath = path.join(infrastructurePath, 'Configuration');
      if (fs.existsSync(configurationPath)) {
        const configFiles = fs.readdirSync(configurationPath);
        files.push(...configFiles.map(f => `Configuration/${f}`));
      }

      // Verificar Data
      const dataPath = path.join(infrastructurePath, 'Data');
      if (fs.existsSync(dataPath)) {
        const dataFiles = fs.readdirSync(dataPath);
        files.push(...dataFiles.map(f => `Data/${f}`));
      }

      // Verificar Repositories/Contracts
      const repositoryContractsPath = path.join(infrastructurePath, 'Repositories', 'Contracts');
      if (fs.existsSync(repositoryContractsPath)) {
        const repositoryFiles = fs.readdirSync(repositoryContractsPath);
        files.push(...repositoryFiles.map(f => `Repositories/Contracts/${f}`));
      }

      return files;

    } catch (error) {
      console.error('❌ Erro ao listar arquivos da Infrastructure:', error);
      return [];
    }
  }

  /**
   * Cria um repositório específico para uma entidade
   */
  async createEntityRepository(infrastructurePath: string, entityName: string): Promise<InfrastructureResult> {
    try {
      const repositoriesPath = path.join(infrastructurePath, 'Repositories');
      const filePath = path.join(repositoriesPath, `${entityName}Repository.cs`);

      // Verificar se já existe
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: `${entityName}Repository já existe`,
          filePath
        };
      }

      // Obter template via TemplateManager
      const template = TemplateManager.getTemplate('infrastructure/entityRepository.hbs');
      const templateContent = template({ name: entityName });

      // Escrever arquivo
      fs.writeFileSync(filePath, templateContent);

      return {
        success: true,
        message: `${entityName}Repository criado com sucesso`,
        filePath
      };

    } catch (error: any) {
      console.error(`❌ Erro ao criar ${entityName}Repository:`, error);
      return {
        success: false,
        message: `Erro ao criar ${entityName}Repository: ${error.message}`
      };
    }
  }

  /**
   * Adiciona entidades dinamicamente no ApplicationDbContext.cs
   */
  async addEntityToDbContext(projectPath: string, entityName: string): Promise<InfrastructureResult> {
    try {
      const infrastructurePath = path.join(projectPath, 'Infrastructure');
      const filePath = path.join(infrastructurePath, 'Data', 'ApplicationDbContext.cs');

      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'ApplicationDbContext.cs não encontrado. Execute o scaffold primeiro.'
        };
      }

      // Ler conteúdo atual do arquivo
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Definir a linha DbSet a ser adicionada
      const dbSetLine = `        public DbSet<${entityName}Entity> ${entityName} { get; set; }`;

      // Verificar se a entidade já foi adicionada
      if (content.includes(dbSetLine.trim())) {
        return {
          success: true,
          message: `${entityName} já está registrada no ApplicationDbContext`,
          filePath
        };
      }

      const newContent: string[] = [];
      let foundRegion = false;
      let dbSetAdded = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        newContent.push(line);

        // Procurar pela região DbSet
        if (line.includes('#region DbSet')) {
          foundRegion = true;
          
          // Adicionar a nova entidade após a linha do #region
          newContent.push(dbSetLine);
          dbSetAdded = true;
        }
      }

      // Se não encontrou a região, criar ela
      if (!foundRegion) {
        // Procurar pelo construtor e adicionar após ele
        const newContentWithRegion: string[] = [];
        let constructorFound = false;

        for (let i = 0; i < newContent.length; i++) {
          const line = newContent[i];
          newContentWithRegion.push(line);

          // Adicionar região após o construtor
          if (line.includes(': base(options)') && !constructorFound) {
            const nextLine = newContent[i + 1];
            if (nextLine && nextLine.includes('}')) {
              newContentWithRegion.push(nextLine); // fechar construtor
              i++; // pular a próxima iteração
              
              // Adicionar região DbSet
              newContentWithRegion.push('');
              newContentWithRegion.push('        #region DbSet');
              newContentWithRegion.push(dbSetLine);
              newContentWithRegion.push('        #endregion');
              
              constructorFound = true;
              dbSetAdded = true;
            }
          }
        }

        if (constructorFound) {
          newContent.length = 0;
          newContent.push(...newContentWithRegion);
        }
      }

      if (!dbSetAdded) {
        return {
          success: false,
          message: `Não foi possível adicionar ${entityName} ao ApplicationDbContext`
        };
      }

      // Escrever arquivo atualizado
      fs.writeFileSync(filePath, newContent.join('\n'));

      return {
        success: true,
        message: `${entityName} adicionada ao ApplicationDbContext com sucesso`,
        filePath
      };

    } catch (error: any) {
      console.error(`❌ Erro ao adicionar ${entityName} ao ApplicationDbContext:`, error);
      return {
        success: false,
        message: `Erro ao atualizar ApplicationDbContext: ${error.message}`
      };
    }
  }

  /**
   * Adiciona múltiplas entidades ao ApplicationDbContext de uma vez
   */
  async addMultipleEntitiesToDbContext(projectPath: string, entityNames: string[]): Promise<InfrastructureResult> {
    try {
      const infrastructurePath = path.join(projectPath, 'Infrastructure');
      const filePath = path.join(infrastructurePath, 'Data', 'ApplicationDbContext.cs');

      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'ApplicationDbContext.cs não encontrado. Execute o scaffold primeiro.'
        };
      }

      let addedEntities: string[] = [];
      let skippedEntities: string[] = [];

      // Ler conteúdo atual
      let content = fs.readFileSync(filePath, 'utf-8');

      for (const entityName of entityNames) {
        const dbSetLine = `        public DbSet<${entityName}Entity> ${entityName} { get; set; }`;
        
        // Verificar se já existe
        if (content.includes(dbSetLine.trim())) {
          skippedEntities.push(entityName);
          continue;
        }

        const lines = content.split('\n');
        const newContent: string[] = [];
        let entityAdded = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          newContent.push(line);

          // Adicionar após #region DbSet
          if (line.includes('#region DbSet') && !entityAdded) {
            newContent.push(dbSetLine);
            addedEntities.push(entityName);
            entityAdded = true;
          }
        }

        // Atualizar content para próxima iteração
        content = newContent.join('\n');
      }

      // Escrever arquivo final
      fs.writeFileSync(filePath, content);

      const totalProcessed = addedEntities.length + skippedEntities.length;
      let message = '';

      if (addedEntities.length > 0) {
        message += `✅ ${addedEntities.length} entidades adicionadas: ${addedEntities.join(', ')}`;
      }
      
      if (skippedEntities.length > 0) {
        if (message) message += '. ';
        message += `⚠️ ${skippedEntities.length} já existiam: ${skippedEntities.join(', ')}`;
      }

      return {
        success: true,
        message: message || 'Nenhuma entidade processada',
        filePath
      };

    } catch (error: any) {
      console.error('❌ Erro ao adicionar múltiplas entidades ao ApplicationDbContext:', error);
      return {
        success: false,
        message: `Erro ao atualizar ApplicationDbContext: ${error.message}`
      };
    }
  }
}
