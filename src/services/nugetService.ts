import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

interface PackageInstallResult {
  success: boolean;
  packages: string[];
  errors: string[];
  message: string;
}

interface ProjectPackagesResult {
  infrastructure: PackageInstallResult;
  application: PackageInstallResult;
  api: PackageInstallResult;
  summary: {
    totalPackages: number;
    successfulInstalls: number;
    failedInstalls: number;
    success: boolean;
  };
}

/**
 * Serviço para gerenciar instalação de packages NuGet nos projetos gerados
 */
export class NuGetService {
  
  // Definição dos packages por projeto
  private readonly packagesByProject = {
    infrastructure: [
      { name: 'Microsoft.EntityFrameworkCore.SqlServer', version: '8.0.0' },
      { name: 'Microsoft.EntityFrameworkCore.Tools', version: '8.0.0' },
      { name: 'Microsoft.EntityFrameworkCore.Design', version: '8.0.0' }
    ],
    application: [
      { name: 'Newtonsoft.Json', version: '13.0.3' },
      { name: 'AutoMapper', version: '12.0.1' },
      { name: 'AutoMapper.Extensions.Microsoft.DependencyInjection', version: '12.0.1' }
    ],
    api: [
      { name: 'Swashbuckle.AspNetCore', version: '6.5.0' },
      { name: 'Microsoft.EntityFrameworkCore.InMemory', version: '8.0.0' }
    ]
  };

  /**
   * Instala todos os packages NuGet necessários para o projeto Clean Architecture
   */
  async installProjectPackages(projectPath: string): Promise<ProjectPackagesResult> {
    console.log(`📦 Iniciando instalação de packages NuGet em: ${projectPath}`);
    
    try {
      // Verificar se o projeto existe
      if (!fs.existsSync(projectPath)) {
        throw new Error(`Caminho do projeto não encontrado: ${projectPath}`);
      }

      const results: ProjectPackagesResult = {
        infrastructure: await this.installPackagesForProject(
          path.join(projectPath, 'Infrastructure'),
          this.packagesByProject.infrastructure,
          'Infrastructure'
        ),
        application: await this.installPackagesForProject(
          path.join(projectPath, 'Application'),
          this.packagesByProject.application,
          'Application'
        ),
        api: await this.installPackagesForProject(
          path.join(projectPath, 'API'),
          this.packagesByProject.api,
          'API'
        ),
        summary: {
          totalPackages: 0,
          successfulInstalls: 0,
          failedInstalls: 0,
          success: false
        }
      };

      // Calcular resumo
      results.summary.totalPackages = 
        results.infrastructure.packages.length + 
        results.application.packages.length + 
        results.api.packages.length;

      results.summary.successfulInstalls = 
        (results.infrastructure.success ? results.infrastructure.packages.length : 0) +
        (results.application.success ? results.application.packages.length : 0) +
        (results.api.success ? results.api.packages.length : 0);

      results.summary.failedInstalls = results.summary.totalPackages - results.summary.successfulInstalls;
      results.summary.success = results.summary.failedInstalls === 0;

      // Fazer restore final do projeto completo
      if (results.summary.success) {
        console.log('🔄 Fazendo restore final do projeto...');
        await this.restoreProject(projectPath);
        console.log('✅ Restore concluído com sucesso!');
      }

      return results;

    } catch (error) {
      console.error('❌ Erro ao instalar packages NuGet:', error);
      throw error;
    }
  }

  /**
   * Instala packages para um projeto específico
   */
  private async installPackagesForProject(
    projectPath: string,
    packages: Array<{ name: string; version: string }>,
    projectName: string
  ): Promise<PackageInstallResult> {
    
    const result: PackageInstallResult = {
      success: true,
      packages: [],
      errors: [],
      message: ''
    };

    console.log(`📁 Instalando packages para ${projectName}...`);

    if (!fs.existsSync(projectPath)) {
      result.success = false;
      result.errors.push(`Projeto ${projectName} não encontrado em: ${projectPath}`);
      result.message = `❌ Projeto ${projectName} não encontrado`;
      return result;
    }

    // Instalar cada package
    for (const pkg of packages) {
      try {
        console.log(`   📦 Instalando ${pkg.name} v${pkg.version}...`);
        await this.installPackage(projectPath, pkg.name, pkg.version);
        result.packages.push(`${pkg.name} v${pkg.version}`);
        console.log(`   ✅ ${pkg.name} instalado com sucesso`);
      } catch (error) {
        const errorMsg = `Erro ao instalar ${pkg.name}: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(errorMsg);
        result.success = false;
        console.error(`   ❌ ${errorMsg}`);
      }
    }

    result.message = result.success 
      ? `✅ Todos os packages do ${projectName} instalados com sucesso (${result.packages.length})`
      : `❌ Falha na instalação de alguns packages do ${projectName} (${result.errors.length} erros)`;

    return result;
  }

  /**
   * Instala um package específico em um projeto
   */
  private async installPackage(projectPath: string, packageName: string, version?: string): Promise<void> {
    const versionFlag = version ? ` --version ${version}` : '';
    const command = `dotnet add package ${packageName}${versionFlag}`;
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: projectPath,
        timeout: 60000 // 60 segundos timeout
      });
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }
      
    } catch (error) {
      throw new Error(`Falha ao executar '${command}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Faz restore de um projeto
   */
  private async restoreProject(projectPath: string): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync('dotnet restore', { 
        cwd: projectPath,
        timeout: 120000 // 2 minutos timeout
      });
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }
      
    } catch (error) {
      throw new Error(`Falha ao fazer restore: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Lista packages instalados em um projeto
   */
  async listInstalledPackages(projectPath: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync('dotnet list package', { 
        cwd: projectPath,
        timeout: 30000
      });
      
      // Parse da saída para extrair nomes dos packages
      const packages: string[] = [];
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        const match = line.match(/>\s+(\S+)\s+(\S+)/);
        if (match) {
          packages.push(`${match[1]} v${match[2]}`);
        }
      }
      
      return packages;
      
    } catch (error) {
      console.error('Erro ao listar packages:', error);
      return [];
    }
  }

  /**
   * Verifica se o .NET SDK está instalado
   */
  async checkDotNetSDK(): Promise<{ available: boolean; version?: string; error?: string }> {
    try {
      const { stdout } = await execAsync('dotnet --version', { timeout: 10000 });
      return {
        available: true,
        version: stdout.trim()
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

export const nugetService = new NuGetService();
