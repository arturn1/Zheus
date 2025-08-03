import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectCreationOptions, ProjectCreationResult } from '../types/project';
import { DotNetService } from './dotNetService';

const execAsync = promisify(exec);

export class ProjectService {
  private dotNetService: DotNetService;

  constructor() {
    this.dotNetService = new DotNetService();
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

      const template = options.template || 'console';
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
   * Cria os arquivos base do Domain
   */
  private async createBaseEntityFiles(domainPath: string): Promise<void> {
    // Carregar templates
    const validatableTemplate = fs.readFileSync(path.join(__dirname, '../templates/domain/validation/validatable.hbs'), 'utf-8');
    const validatableTypesTemplate = fs.readFileSync(path.join(__dirname, '../templates/domain/validation/validatableTypes.hbs'), 'utf-8');
    const baseEntityTemplate = fs.readFileSync(path.join(__dirname, '../templates/domain/entities/baseEntity.hbs'), 'utf-8');
    const iCommandResultTemplate = fs.readFileSync(path.join(__dirname, '../templates/domain/commands/iCommandResult.hbs'), 'utf-8');
    const commandResultTemplate = fs.readFileSync(path.join(__dirname, '../templates/domain/commands/commandResult.hbs'), 'utf-8');
    const iCommandTemplate = fs.readFileSync(path.join(__dirname, '../templates/domain/commands/iCommand.hbs'), 'utf-8');
    
    // Criar arquivos
    fs.writeFileSync(path.join(domainPath, 'Validation', 'Validatable.cs'), validatableTemplate);
    fs.writeFileSync(path.join(domainPath, 'Validation', 'ValidatableTypes.cs'), validatableTypesTemplate);
    fs.writeFileSync(path.join(domainPath, 'Entities', 'BaseEntity.cs'), baseEntityTemplate);
    fs.writeFileSync(path.join(domainPath, 'Commands', 'Contracts', 'ICommandResult.cs'), iCommandResultTemplate);
    fs.writeFileSync(path.join(domainPath, 'Commands', 'Contracts', 'ICommand.cs'), iCommandTemplate);
    fs.writeFileSync(path.join(domainPath, 'Commands', 'CommandResult.cs'), commandResultTemplate);
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
  }

  /**
   * Cria o projeto API (Web API)
   */
  private async createAPIProject(projectName: string, rootPath: string, framework: string): Promise<void> {
    const apiPath = path.join(rootPath, 'API');
    await execAsync(`dotnet new webapi --name "API" --framework ${framework}`, { cwd: rootPath });

    // Criar estrutura de pastas
    const folders = ['Controllers/Contract', 'Configurations', 'Middleware', 'EntityExplorerModule', 'Properties'];
    for (const folder of folders) {
      fs.mkdirSync(path.join(apiPath, folder), { recursive: true });
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
   * Cria o projeto Application (Class Library)
   */
  private async createApplicationProject(projectName: string, rootPath: string, framework: string): Promise<void> {
    const appPath = path.join(rootPath, 'Application');
    await execAsync(`dotnet new classlib --name "Application" --framework ${framework}`, { cwd: rootPath });

    // Criar estrutura de pastas
    const folders = ['DTOs', 'Services', 'Interfaces', 'Dictionary'];
    for (const folder of folders) {
      fs.mkdirSync(path.join(appPath, folder), { recursive: true });
    }
  }

  /**
   * Cria o projeto Infrastructure (Class Library)
   */
  private async createInfrastructureProject(projectName: string, rootPath: string, framework: string): Promise<void> {
    const infraPath = path.join(rootPath, 'Infrastructure');
    await execAsync(`dotnet new classlib --name "Infrastructure" --framework ${framework}`, { cwd: rootPath });

    // Criar estrutura de pastas
    const folders = ['Data', 'Repositories', 'Migrations', 'Configuration'];
    for (const folder of folders) {
      fs.mkdirSync(path.join(infraPath, folder), { recursive: true });
    }
  }

  /**
   * Cria o projeto IoC (Class Library)
   */
  private async createIoCProject(projectName: string, rootPath: string, framework: string): Promise<void> {
    const iocPath = path.join(rootPath, 'IoC');
    await execAsync(`dotnet new classlib --name "IoC" --framework ${framework}`, { cwd: rootPath });
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
