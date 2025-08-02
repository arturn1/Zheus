import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { DotNetInfo, DotNetInstallResult, DotNetInstallOptions } from '../types/dotnet';

const execAsync = promisify(exec);

export class DotNetService {
  private readonly platform: 'windows' | 'linux' | 'macos';
  private readonly architecture: string;

  constructor() {
    this.platform = this.detectPlatform();
    this.architecture = this.detectArchitecture();
  }

  /**
   * Verifica se o .NET está instalado e retorna informações
   */
  async checkDotNetInstallation(): Promise<DotNetInfo> {
    try {
      const { stdout } = await execAsync('dotnet --version');
      const version = stdout.trim();

      // Obter informações detalhadas
      const sdkInfo = await this.getSdkVersions();
      const runtimeInfo = await this.getRuntimeVersions();

      return {
        isInstalled: true,
        version,
        platform: this.platform,
        architecture: this.architecture,
        sdkVersions: sdkInfo,
        runtimeVersions: runtimeInfo
      };
    } catch (error) {
      return {
        isInstalled: false,
        platform: this.platform,
        architecture: this.architecture
      };
    }
  }

  /**
   * Instala a versão LTS mais recente do .NET
   */
  async installLatestLTS(options?: DotNetInstallOptions): Promise<DotNetInstallResult> {
    try {
      console.log('🔄 Iniciando instalação do .NET LTS...');

      const installCommand = this.getInstallCommand(options);
      console.log(`📋 Executando: ${installCommand}`);

      const { stdout, stderr } = await execAsync(installCommand, { 
        timeout: 300000 // 5 minutos timeout
      });

      // Verificar se a instalação foi bem-sucedida
      const verification = await this.checkDotNetInstallation();
      
      if (verification.isInstalled) {
        return {
          success: true,
          message: 'Instalação do .NET concluída com sucesso',
          version: verification.version,
          installPath: await this.getDotNetInstallPath()
        };
      } else {
        return {
          success: false,
          message: 'Falha na verificação pós-instalação',
          error: 'Installation verification failed'
        };
      }
    } catch (error: any) {
      console.error('❌ Erro durante a instalação:', error.message);
      return {
        success: false,
        message: 'Falha na instalação do .NET',
        error: error.message
      };
    }
  }

  /**
   * Obtém informações detalhadas sobre a instalação do .NET
   */
  async getDotNetInfo(): Promise<DotNetInfo> {
    return await this.checkDotNetInstallation();
  }

  /**
   * Detecta a plataforma do sistema operacional
   */
  private detectPlatform(): 'windows' | 'linux' | 'macos' {
    const platform = os.platform();
    switch (platform) {
      case 'win32':
        return 'windows';
      case 'darwin':
        return 'macos';
      case 'linux':
        return 'linux';
      default:
        return 'linux'; // fallback
    }
  }

  /**
   * Detecta a arquitetura do sistema
   */
  private detectArchitecture(): string {
    return os.arch();
  }

  /**
   * Obtém versões do SDK instaladas
   */
  private async getSdkVersions(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('dotnet --list-sdks');
      return stdout.trim().split('\n').map(line => line.split(' ')[0]).filter(v => v);
    } catch {
      return [];
    }
  }

  /**
   * Obtém versões do runtime instaladas
   */
  private async getRuntimeVersions(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('dotnet --list-runtimes');
      return stdout.trim().split('\n').map(line => {
        const match = line.match(/^(.+?)\s+(\d+\.\d+\.\d+)/);
        return match ? `${match[1]} ${match[2]}` : '';
      }).filter(v => v);
    } catch {
      return [];
    }
  }

  /**
   * Gera o comando de instalação baseado na plataforma
   */
  private getInstallCommand(options?: DotNetInstallOptions): string {
    const channel = options?.channel || 'LTS';
    const architecture = options?.architecture || this.architecture;

    switch (this.platform) {
      case 'windows':
        return this.getWindowsInstallCommand(channel, architecture);
      case 'linux':
        return this.getLinuxInstallCommand(channel, architecture);
      case 'macos':
        return this.getMacOSInstallCommand(channel, architecture);
      default:
        throw new Error(`Plataforma não suportada: ${this.platform}`);
    }
  }

  /**
   * Comando de instalação para Windows
   */
  private getWindowsInstallCommand(channel: string, architecture: string): string {
    return `powershell -Command "& { Invoke-WebRequest -Uri 'https://dot.net/v1/dotnet-install.ps1' -OutFile 'dotnet-install.ps1'; ./dotnet-install.ps1 -Channel ${channel} -Architecture ${architecture} }"`;
  }

  /**
   * Comando de instalação para Linux
   */
  private getLinuxInstallCommand(channel: string, architecture: string): string {
    return `curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel ${channel} --architecture ${architecture}`;
  }

  /**
   * Comando de instalação para macOS
   */
  private getMacOSInstallCommand(channel: string, architecture: string): string {
    return `curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel ${channel} --architecture ${architecture}`;
  }

  /**
   * Obtém o caminho de instalação do .NET
   */
  private async getDotNetInstallPath(): Promise<string> {
    try {
      const { stdout } = await execAsync('dotnet --info');
      const match = stdout.match(/Base Path:\s+(.+)/);
      return match ? match[1].trim() : 'Unknown';
    } catch {
      return 'Unknown';
    }
  }
}
