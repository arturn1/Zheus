import { Request, Response } from 'express';
import { asyncHandler, ResponseUtils } from '../utils/responseUtils';
import { CommandService } from '../services/commandService';

export class CommandController {
  private commandService: CommandService;

  constructor() {
    this.commandService = new CommandService();
  }

  /**
   * Gera um novo comando no projeto .NET
   * POST /api/command/generate
   */
  public generateCommand = asyncHandler(async (req: Request, res: Response) => {
    const request = req.body;
    
    if (!request.projectPath) {
      return ResponseUtils.badRequest(res, 'Caminho do projeto é obrigatório');
    }

    if (!request.entity || !request.entity.name) {
      return ResponseUtils.badRequest(res, 'Definição da entidade é obrigatória');
    }
    
    const includeId = request.includeId !== false; // default true
    const result = await this.commandService.generateCommandFile(request.projectPath, request.entity, includeId);
    
    if (result.success) {
      return ResponseUtils.success(res, result, 
        `✅ Comandos para '${request.entity.name}' gerados com sucesso`);
    } else {
      return ResponseUtils.badRequest(res, result.message);
    }
  });

  /**
   * Lista comandos existentes no projeto
   * GET /api/command/list/:projectPath
   */
  public listCommands = asyncHandler(async (req: Request, res: Response) => {
    const projectPath = decodeURIComponent(req.params.projectPath);
    
    if (!projectPath) {
      return ResponseUtils.badRequest(res, 'Caminho do projeto é obrigatório');
    }
    
    const commands = await this.commandService.listCommands(projectPath);
    
    return ResponseUtils.success(res, { commands }, 
      `📋 ${commands.length} comando(s) encontrado(s)`);
  });
}
