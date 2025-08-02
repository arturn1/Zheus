import { Request, Response } from 'express';
import { DotNetService } from '../services/dotNetService';
import { ResponseUtils, asyncHandler } from '../utils/responseUtils';
import { DotNetInstallOptions } from '../types/dotnet';

export class DotNetController {
  private dotNetService: DotNetService;

  constructor() {
    this.dotNetService = new DotNetService();
  }

  /**
   * Verifica o status da instalação do .NET
   * GET /api/dotnet/status
   */
  public checkStatus = asyncHandler(async (req: Request, res: Response) => {
    const dotNetInfo = await this.dotNetService.checkDotNetInstallation();
    
    const message = dotNetInfo.isInstalled 
      ? `✅ .NET ${dotNetInfo.version} está instalado`
      : '❌ .NET não encontrado no sistema';

    return ResponseUtils.success(res, dotNetInfo, message);
  });

  /**
   * Instala a versão LTS mais recente do .NET
   * POST /api/dotnet/install
   */
  public installDotNet = asyncHandler(async (req: Request, res: Response) => {
    const options: DotNetInstallOptions = req.body;
    
    // Verificar se já está instalado
    const currentInfo = await this.dotNetService.checkDotNetInstallation();
    if (currentInfo.isInstalled) {
      return ResponseUtils.success(res, currentInfo, 
        `✅ .NET ${currentInfo.version} já está instalado`);
    }

    // Proceder com a instalação
    const installResult = await this.dotNetService.installLatestLTS(options);
    
    if (installResult.success) {
      return ResponseUtils.success(res, installResult, installResult.message, 201);
    } else {
      return ResponseUtils.error(res, installResult.message, 500);
    }
  });

  /**
   * Força a reinstalação do .NET
   * POST /api/dotnet/reinstall
   */
  public reinstallDotNet = asyncHandler(async (req: Request, res: Response) => {
    const options: DotNetInstallOptions = req.body;
    
    const installResult = await this.dotNetService.installLatestLTS(options);
    
    if (installResult.success) {
      return ResponseUtils.success(res, installResult, 
        `🔄 ${installResult.message}`, 201);
    } else {
      return ResponseUtils.error(res, installResult.message, 500);
    }
  });

  /**
   * Obtém informações detalhadas sobre a instalação do .NET
   * GET /api/dotnet/info
   */
  public getDotNetInfo = asyncHandler(async (req: Request, res: Response) => {
    const dotNetInfo = await this.dotNetService.getDotNetInfo();
    
    return ResponseUtils.success(res, dotNetInfo, 
      '📋 Informações do .NET obtidas com sucesso');
  });

  /**
   * Verifica se o sistema é compatível com .NET
   * GET /api/dotnet/compatibility
   */
  public checkCompatibility = asyncHandler(async (req: Request, res: Response) => {
    const dotNetInfo = await this.dotNetService.checkDotNetInstallation();
    
    const compatibility = {
      platform: dotNetInfo.platform,
      architecture: dotNetInfo.architecture,
      supported: ['windows', 'linux', 'macos'].includes(dotNetInfo.platform),
      recommendedVersion: 'LTS',
      downloadUrl: 'https://dotnet.microsoft.com/download'
    };

    return ResponseUtils.success(res, compatibility, 
      '🔍 Informações de compatibilidade obtidas com sucesso');
  });
}

// Instância única do controller
export const dotNetController = new DotNetController();
