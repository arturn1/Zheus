import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectCreationOptions, ProjectCreationResult } from '../types/project';
import { TemplateManager } from '../utils/TemplateManager';
import { DotNetService } from './dotNetService';
import { IoCService } from './iocService';
import { ApplicationService } from './applicationService';
import { InfrastructureService } from './infrastructureService';
import { ApiService } from './apiService';
import { NuGetService } from './nugetService';

const execAsync = promisify(exec);

export class ProjectService {
  private dotNetService: DotNetService;
  private iocService: IoCService;
  private applicationService: ApplicationService;
  private infrastructureService: InfrastructureService;
  private apiService: ApiService;
  private nugetService: NuGetService;

  constructor() {
    this.dotNetService = new DotNetService();
    this.iocService = new IoCService();
    this.applicationService = new ApplicationService();
    this.infrastructureService = new InfrastructureService();
    this.apiService = new ApiService();
    this.nugetService = new NuGetService();
  }

  /**
   * Cria um novo projeto .NET
   */
  async createProject(options: ProjectCreationOptions): Promise<ProjectCreationResult> {
    try {
      // Verificar se .NET está instalado
      const dotNetInfo = await this.dotNetService.checkDotNetInstallation();
      if (!dotNetInfo.isInstalled) {
        return {
          success: false,
          message: '.NET não está instalado. Execute a instalação primeiro.',
          error: 'DotNet not installed'
        };
      }

      // Validar nome do projeto
      if (!this.isValidProjectName(options.name)) {
        return {
          success: false,
          message: 'Nome do projeto inválido. Use apenas letras, números e underscores.',
          error: 'Invalid project name'
        };
      }

      const template = options.template || 'webapi';
      const framework = options.framework || 'net8.0';
      const language = options.language || 'C#';
      const outputPath = options.outputPath || process.cwd();
      const projectPath = path.join(outputPath, options.name);

      // Verificar se o diretório já existe
      if (fs.existsSync(projectPath) && !options.force) {
        return {
          success: false,
          message: `Projeto '${options.name}' já existe. Use force: true para sobrescrever.`,
          error: 'Project already exists'
        };
      }

      // Criar comando dotnet new
      const command = this.buildCreateCommand(options, outputPath);
      console.log(`📋 Executando: ${command}`);

      // Executar comando
      const { stdout, stderr } = await execAsync(command, {
        cwd: outputPath,
        timeout: 60000 // 1 minuto timeout
      });

      // Verificar se o projeto foi criado
      if (fs.existsSync(projectPath)) {
        // Se for Web API, criar estrutura Clean Architecture
        if (template === 'webapi') {
          await this.createCleanArchitectureStructure(options.name, outputPath, framework);
        }

        return {
          success: true,
          message: `Projeto '${options.name}' criado com sucesso`,
          projectName: options.name,
          projectPath,
          template,
          framework
        };
      } else {
        return {
          success: false,
          message: 'Falha na criação do projeto',
          error: stderr || 'Unknown error'
        };
      }

    } catch (error: any) {
      console.error('❌ Erro ao criar projeto:', error.message);
      return {
        success: false,
        message: 'Erro ao criar projeto .NET',
        error: error.message
      };
    }
  }

      /**
   * Constrói o comando de criação do projeto
   */
  private buildCreateCommand(options: ProjectCreationOptions, outputPath: string): string {
    let command = `dotnet new ${options.template || 'console'}`;
    
    command += ` --name "${options.name}"`;
    
    if (options.framework) {
      command += ` --framework ${options.framework}`;
    }
    
    if (options.language && options.language !== 'C#') {
      command += ` --language ${options.language}`;
    }
    
    if (options.force) {
      command += ` --force`;
    }
    
    return command;
  }

  /**
   * Lista todos os templates disponíveis do .NET
   */
  async listTemplates(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('dotnet new list');
      const lines = stdout.split('\n');
      const templates: string[] = [];
      
      // Parse da saída do comando - formato: Template Name  Short Name  Language  Tags
      let isDataSection = false;
      for (const line of lines) {
        // Encontrar início da seção de dados
        if (line.includes('Template Name') && line.includes('Short Name')) {
          isDataSection = true;
          continue;
        }
        
        // Pular linha separadora
        if (line.includes('---')) {
          continue;
        }
        
        // Processar linhas de dados
        if (isDataSection && line.trim()) {
          // Dividir por espaços múltiplos
          const parts = line.split(/\s{2,}/);
          if (parts.length >= 2) {
            const shortName = parts[1].trim();
            // Pode ter múltiplos short names separados por vírgula
            const shortNames = shortName.split(',');
            for (const name of shortNames) {
              const cleanName = name.trim();
              if (cleanName && !templates.includes(cleanName)) {
                templates.push(cleanName);
              }
            }
          }
        }
      }
      
      return templates.length > 0 ? templates : ['console', 'web', 'webapi', 'mvc', 'blazor', 'classlib'];
    } catch {
      return ['console', 'web', 'webapi', 'mvc', 'blazor', 'classlib'];
    }
  }

  /**
   * Verifica se o nome do projeto é válido
   */
  private isValidProjectName(name: string): boolean {
    const regex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    return regex.test(name) && name.length <= 50;
  }

  /**
   * Cria estrutura Clean Architecture para projetos Web API
   */
  private async createCleanArchitectureStructure(projectName: string, outputPath: string, framework: string): Promise<void> {
    const rootPath = path.join(outputPath, projectName);
    
    // Remover projeto Web API simples criado inicialmente
    if (fs.existsSync(rootPath)) {
      await execAsync(`rm -rf "${rootPath}"`);
    }

    // Criar diretório raiz
    fs.mkdirSync(rootPath, { recursive: true });

    // Criar solution
    await execAsync(`dotnet new sln --name "${projectName}"`, { cwd: rootPath });

    // Criar projetos
    await this.createAPIProject(projectName, rootPath, framework);
    await this.createDomainProject(projectName, rootPath, framework);
    await this.createApplicationProject(projectName, rootPath, framework);
    await this.createInfrastructureProject(projectName, rootPath, framework);
    await this.createIoCProject(projectName, rootPath, framework);

    // Adicionar projetos à solution
    await this.addProjectsToSolution(projectName, rootPath);

    // Configurar referências entre projetos
    await this.configureProjectReferences(projectName, rootPath);

    // Instalar pacotes NuGet necessários
    console.log(`📦 Instalando pacotes NuGet...`);
    const nugetResult = await this.nugetService.installProjectPackages(rootPath);
    if (!nugetResult.summary.success) {
      console.warn(`⚠️ Aviso NuGet: Alguns pacotes falharam na instalação`);
      console.warn(`   - Sucessos: ${nugetResult.summary.successfulInstalls}`);
      console.warn(`   - Falhas: ${nugetResult.summary.failedInstalls}`);
    } else {
      console.log(`✅ Pacotes NuGet instalados: ${nugetResult.summary.totalPackages} pacote(s)`);
    }
  }

  /**
   * Cria o projeto API (Web API)
   */
  private async createAPIProject(projectName: string, rootPath: string, framework: string): Promise<void> {
    const apiPath = path.join(rootPath, 'API');
    console.log(`🔧 Criando projeto API em: ${apiPath}`);
    await execAsync(`dotnet new webapi --name "API" --framework ${framework}`, { cwd: rootPath });

    // Criar estrutura de pastas
    const folders = ['Controllers/Contract', 'Configurations', 'Middleware', 'Properties'];
    for (const folder of folders) {
      fs.mkdirSync(path.join(apiPath, folder), { recursive: true });
    }

    // Substituir Program.cs pelo template customizado
    console.log(`🔄 Substituindo Program.cs em: ${apiPath}`);
    await this.replaceProgramCs(apiPath);

    // Criar arquivos de configuração usando ApiService
    const apiResult = await this.apiService.createApiConfigurations(rootPath, { 
      projectName: projectName,
      swagger: { title: `${projectName} API`, version: '1.0', description: `API for ${projectName}` }
    });
    if (!apiResult.success) {
      console.warn(`⚠️ Aviso API: ${apiResult.message}`);
    } else {
      console.log(`✅ Arquivos de configuração da API criados: ${apiResult.files?.length || 0} arquivo(s)`);
    }
  }

  /**
   * Substitui o Program.cs padrão pelo template customizado
   */
  private async replaceProgramCs(apiPath: string): Promise<void> {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'api', 'Program.cs.hbs');
      const programPath = path.join(apiPath, 'Program.cs');

      // Verificar se o template existe
      if (!fs.existsSync(templatePath)) {
        console.warn(`⚠️ Template Program.cs não encontrado em: ${templatePath}`);
        return;
      }

      // Ler o template
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      
      // Escrever o novo Program.cs (sem processamento Handlebars pois não tem variáveis)
      fs.writeFileSync(programPath, templateContent, 'utf8');
      
      console.log(`✅ Program.cs customizado criado em: ${programPath}`);
    } catch (error) {
      console.error(`❌ Erro ao substituir Program.cs:`, error);
    }
  }

  /**
   * Cria o projeto Domain (Class Library)
   */
  private async createDomainProject(projectName: string, rootPath: string, framework: string): Promise<void> {
    const domainPath = path.join(rootPath, 'Domain');
    await execAsync(`dotnet new classlib --name "Domain" --framework ${framework}`, { cwd: rootPath });

    // Remover Class1.cs criado automaticamente pelo dotnet new classlib
    const class1Path = path.join(domainPath, 'Class1.cs');
    if (fs.existsSync(class1Path)) {
      fs.unlinkSync(class1Path);
    }

    // Criar estrutura de pastas
    const folders = ['Entities', 'Commands', 'Commands/Contracts', 'Handlers', 'Handlers/Contracts','Repositories','Repositories/Contracts', 'Validation', 'Helpers'];
    for (const folder of folders) {
      fs.mkdirSync(path.join(domainPath, folder), { recursive: true });
    }

    // Criar arquivos base
    await this.createBaseEntityFiles(domainPath);
  }

    /**
   * Cria os arquivos base do Domain
   */
  private async createBaseEntityFiles(domainPath: string): Promise<void> {
    // Obter templates via TemplateManager
    const validatableTemplate = TemplateManager.getTemplate('domain/validation/validatable.hbs');
    const validatableTypesTemplate = TemplateManager.getTemplate('domain/validation/validatableTypes.hbs');
    const baseEntityTemplate = TemplateManager.getTemplate('domain/entities/baseEntity.hbs');
    const iCommandResultTemplate = TemplateManager.getTemplate('domain/commands/iCommandResult.hbs');
    const commandResultTemplate = TemplateManager.getTemplate('domain/commands/commandResult.hbs');
    const iCommandTemplate = TemplateManager.getTemplate('domain/commands/iCommand.hbs');
    const iRepositoryBaseTemplate = TemplateManager.getTemplate('domain/repositories/contracts/iRepositoryBase.hbs');
    
    // Criar arquivos
    fs.writeFileSync(path.join(domainPath, 'Validation', 'Validatable.cs'), validatableTemplate({}));
    fs.writeFileSync(path.join(domainPath, 'Validation', 'ValidatableTypes.cs'), validatableTypesTemplate({}));
    fs.writeFileSync(path.join(domainPath, 'Entities', 'BaseEntity.cs'), baseEntityTemplate({}));
    fs.writeFileSync(path.join(domainPath, 'Commands', 'Contracts', 'ICommandResult.cs'), iCommandResultTemplate({}));
    fs.writeFileSync(path.join(domainPath, 'Commands', 'Contracts', 'ICommand.cs'), iCommandTemplate({}));
    fs.writeFileSync(path.join(domainPath, 'Commands', 'CommandResult.cs'), commandResultTemplate({}));
    fs.writeFileSync(path.join(domainPath, 'Repositories', 'Contracts', 'IRepositoryBase.cs'), iRepositoryBaseTemplate({}));
  }

  /**
   * Cria o projeto Application (Class Library)
   */
  private async createApplicationProject(projectName: string, rootPath: string, framework: string): Promise<void> {
    const appPath = path.join(rootPath, 'Application');
    await execAsync(`dotnet new classlib --name "Application" --framework ${framework}`, { cwd: rootPath });

    // Remover Class1.cs criado automaticamente pelo dotnet new classlib
    const class1Path = path.join(appPath, 'Class1.cs');
    if (fs.existsSync(class1Path)) {
      fs.unlinkSync(class1Path);
    }

    // Criar estrutura de pastas
    const folders = ['DTOs', 'DTOs/Response','Services', 'Interfaces', 'Dictionary'];
    for (const folder of folders) {
      fs.mkdirSync(path.join(appPath, folder), { recursive: true });
    }

    // Criar arquivos base usando ApplicationService
    const appResult = await this.applicationService.createApplicationLayer(rootPath);
    if (!appResult.success) {
      console.warn(`⚠️ Aviso Application: ${appResult.message}`);
    } else {
      console.log(`✅ Arquivos da camada Application criados: ${appResult.files?.length || 0} arquivo(s)`);
    }
  }

  /**
   * Cria o projeto Infrastructure (Class Library)
   */
  private async createInfrastructureProject(projectName: string, rootPath: string, framework: string): Promise<void> {
    const infraPath = path.join(rootPath, 'Infrastructure');
    await execAsync(`dotnet new classlib --name "Infrastructure" --framework ${framework}`, { cwd: rootPath });

    // Remover Class1.cs criado automaticamente pelo dotnet new classlib
    const class1Path = path.join(infraPath, 'Class1.cs');
    if (fs.existsSync(class1Path)) {
      fs.unlinkSync(class1Path);
    }

    // Criar estrutura de pastas
    const folders = ['Data', 'Repositories', 'Repositories/Contracts', 'Migrations', 'Configuration'];
    for (const folder of folders) {
      fs.mkdirSync(path.join(infraPath, folder), { recursive: true });
    }

    // Criar arquivos base usando InfrastructureService
    const infraResult = await this.infrastructureService.createInfrastructureLayer(rootPath);
    if (!infraResult.success) {
      console.warn(`⚠️ Aviso Infrastructure: ${infraResult.message}`);
    } else {
      console.log(`✅ Arquivos da camada Infrastructure criados: ${infraResult.files?.length || 0} arquivo(s)`);
    }
  }

  /**
   * Cria o projeto IoC (Class Library)
   */
  private async createIoCProject(projectName: string, rootPath: string, framework: string): Promise<void> {
    const iocPath = path.join(rootPath, 'IoC');
    await execAsync(`dotnet new classlib --name "IoC" --framework ${framework}`, { cwd: rootPath });

    // Criar NativeInjectorBootStrapper
    const iocResult = await this.iocService.createNativeInjectorBootStrapper(rootPath);
    if (!iocResult.success) {
      console.warn(`⚠️ Aviso: ${iocResult.message}`);
    } else {
      console.log(`✅ NativeInjectorBootStrapper criado: ${iocResult.filePath}`);
    }
  }

  /**
   * Adiciona todos os projetos à solution
   */
  private async addProjectsToSolution(projectName: string, rootPath: string): Promise<void> {
    const projects = ['API', 'Domain', 'Application', 'Infrastructure', 'IoC'];
    for (const project of projects) {
      await execAsync(`dotnet sln add ${project}/${project}.csproj`, { cwd: rootPath });
    }
  }

  /**
   * Configura referências entre projetos
   */
  private async configureProjectReferences(projectName: string, rootPath: string): Promise<void> {
    // API referencia Application e IoC
    await execAsync('dotnet add API/API.csproj reference Application/Application.csproj', { cwd: rootPath });
    await execAsync('dotnet add API/API.csproj reference IoC/IoC.csproj', { cwd: rootPath });

    // Application referencia Domain
    await execAsync('dotnet add Application/Application.csproj reference Domain/Domain.csproj', { cwd: rootPath });

    // Infrastructure referencia Domain
    await execAsync('dotnet add Infrastructure/Infrastructure.csproj reference Domain/Domain.csproj', { cwd: rootPath });

    // IoC referencia todos os outros
    await execAsync('dotnet add IoC/IoC.csproj reference Domain/Domain.csproj', { cwd: rootPath });
    await execAsync('dotnet add IoC/IoC.csproj reference Application/Application.csproj', { cwd: rootPath });
    await execAsync('dotnet add IoC/IoC.csproj reference Infrastructure/Infrastructure.csproj', { cwd: rootPath });
  }
}
