import * as fs from 'fs';
import * as path from 'path';
import { TemplateManager } from '../utils/TemplateManager';

export class RepositoryService {

  constructor() {
    // Templates gerenciados via TemplateManager
  }

  /**
   * Gera os arquivos de repositório base (IRepository e IRepositoryBase) na pasta Contracts
   */
  async generateBaseRepositories(domainPath: string): Promise<void> {
    try {
      const contractsPath = path.join(domainPath, 'Repositories', 'Contracts');
      
      // Garantir que o diretório existe
      if (!fs.existsSync(contractsPath)) {
        fs.mkdirSync(contractsPath, { recursive: true });
      }

      // Gerar IRepository.cs
      await this.generateRepositoryContract(contractsPath);
      
      // Gerar IRepositoryBase.cs
      await this.generateRepositoryBaseContract(contractsPath);

      console.log('✅ Arquivos base de repositório gerados com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao gerar arquivos base de repositório:', error.message);
      throw error;
    }
  }

  /**
   * Gera interface de repositório específica para uma entidade
   */
  async generateEntityRepository(entityName: string, domainPath: string): Promise<void> {
    try {
      const repositoriesPath = path.join(domainPath, 'Repositories');
      
      // Garantir que o diretório existe
      if (!fs.existsSync(repositoriesPath)) {
        fs.mkdirSync(repositoriesPath, { recursive: true });
      }

      // Carregar template
      const template = TemplateManager.getTemplate('domain/repositories/entityRepository.hbs');

      // Preparar dados para o template
      const templateData = {
        name: entityName
      };

      // Gerar conteúdo
      const content = template(templateData);

      // Criar arquivo
      const fileName = `I${entityName}Repository.cs`;
      const filePath = path.join(repositoriesPath, fileName);
      
      fs.writeFileSync(filePath, content);
      
      console.log(`✅ Interface de repositório gerada: ${fileName}`);
    } catch (error: any) {
      console.error(`❌ Erro ao gerar repositório para ${entityName}:`, error.message);
      throw error;
    }
  }

  /**
   * Gera o arquivo IRepository.cs na pasta Contracts
   */
  private async generateRepositoryContract(contractsPath: string): Promise<void> {
    const template = TemplateManager.getTemplate('domain/repositories/contracts/iRepository.hbs');
    const templateContent = template({});
    
    const filePath = path.join(contractsPath, 'IRepository.cs');
    fs.writeFileSync(filePath, templateContent);
    
    console.log('✅ IRepository.cs gerado');
  }

  /**
   * Gera o arquivo IRepositoryBase.cs na pasta Contracts
   */
  private async generateRepositoryBaseContract(contractsPath: string): Promise<void> {
    const template = TemplateManager.getTemplate('domain/repositories/contracts/iRepositoryBase.hbs');
    const templateContent = template({});
    
    const filePath = path.join(contractsPath, 'IRepositoryBase.cs');
    fs.writeFileSync(filePath, templateContent);
    
    console.log('✅ IRepositoryBase.cs gerado');
  }

  /**
   * Método unificado para gerar repositórios (base + entidades específicas)
   */
  async generateAllRepositories(domainPath: string, entities?: string[]): Promise<{
    baseFiles: string[];
    entityFiles: string[];
    totalFiles: number;
  }> {
    try {
      const result = {
        baseFiles: [] as string[],
        entityFiles: [] as string[],
        totalFiles: 0
      };

      // 1. Sempre gerar arquivos base (estáticos)
      await this.generateBaseRepositories(domainPath);
      result.baseFiles = ['IRepository.cs', 'IRepositoryBase.cs'];

      // 2. Gerar repositórios específicos se entidades fornecidas
      if (entities && entities.length > 0) {
        for (const entityName of entities) {
          await this.generateEntityRepository(entityName, domainPath);
          result.entityFiles.push(`I${entityName}Repository.cs`);
        }
      }

      result.totalFiles = result.baseFiles.length + result.entityFiles.length;

      console.log(`✅ ${result.totalFiles} arquivos de repositório gerados (${result.baseFiles.length} base + ${result.entityFiles.length} específicos)`);
      return result;
    } catch (error: any) {
      console.error('❌ Erro ao gerar repositórios:', error.message);
      throw error;
    }
  }

  /**
   * Lista todos os repositórios gerados
   */
  async listGeneratedRepositories(domainPath: string): Promise<string[]> {
    const repositoriesPath = path.join(domainPath, 'Repositories');
    
    if (!fs.existsSync(repositoriesPath)) {
      return [];
    }

    const files = fs.readdirSync(repositoriesPath);
    return files
      .filter(file => file.startsWith('I') && file.endsWith('Repository.cs'))
      .map(file => file.replace('I', '').replace('Repository.cs', ''));
  }
}
