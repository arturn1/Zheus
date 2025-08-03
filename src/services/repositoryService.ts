import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export class RepositoryService {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(__dirname, '../templates/domain/repositories');
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
      const templatePath = path.join(this.templateDir, 'entityRepository.hbs');
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);

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
   * Gera interfaces de repositório para múltiplas entidades
   */
  async generateRepositories(entityNames: string[], domainPath: string): Promise<void> {
    try {
      // Primeiro, gerar os arquivos base
      await this.generateBaseRepositories(domainPath);

      // Depois, gerar repositório para cada entidade
      for (const entityName of entityNames) {
        await this.generateEntityRepository(entityName, domainPath);
      }

      console.log(`✅ Repositórios gerados para ${entityNames.length} entidades`);
    } catch (error: any) {
      console.error('❌ Erro ao gerar repositórios:', error.message);
      throw error;
    }
  }

  /**
   * Gera o arquivo IRepository.cs na pasta Contracts
   */
  private async generateRepositoryContract(contractsPath: string): Promise<void> {
    const templatePath = path.join(this.templateDir, 'contracts', 'iRepository.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    
    const filePath = path.join(contractsPath, 'IRepository.cs');
    fs.writeFileSync(filePath, templateContent);
    
    console.log('✅ IRepository.cs gerado');
  }

  /**
   * Gera o arquivo IRepositoryBase.cs na pasta Contracts
   */
  private async generateRepositoryBaseContract(contractsPath: string): Promise<void> {
    const templatePath = path.join(this.templateDir, 'contracts', 'iRepositoryBase.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    
    const filePath = path.join(contractsPath, 'IRepositoryBase.cs');
    fs.writeFileSync(filePath, templateContent);
    
    console.log('✅ IRepositoryBase.cs gerado');
  }

  /**
   * Valida se um arquivo de repositório específico existe
   */
  async validateRepositoryExists(entityName: string, domainPath: string): Promise<boolean> {
    const filePath = path.join(domainPath, 'Repositories', `I${entityName}Repository.cs`);
    return fs.existsSync(filePath);
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
