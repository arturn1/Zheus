import * as fs from 'fs';
import * as path from 'path';
import { TemplateManager } from '../utils/TemplateManager';

export interface IoCRegistration {
  name: string;
  type: 'repository' | 'handler' | 'service';
}

export interface IoCResult {
  success: boolean;
  message: string;
  filePath?: string;
  registrations?: IoCRegistration[];
}

export class IoCService {
  
  /**
   * Cria o arquivo NativeInjectorBootStrapper inicial
   */
  async createNativeInjectorBootStrapper(projectPath: string): Promise<IoCResult> {
    try {
      const iocPath = path.join(projectPath, 'IoC');
      const filePath = path.join(iocPath, 'NativeInjectorBootStrapper.cs');

      // Garantir que diretório IoC existe
      if (!fs.existsSync(iocPath)) {
        fs.mkdirSync(iocPath, { recursive: true });
      }

      // Obter template via TemplateManager
      const template = TemplateManager.getTemplate('ioc/nativeInjectorBootStrapper.hbs');
      const templateContent = template({});

      // Escrever arquivo
      fs.writeFileSync(filePath, templateContent);

      return {
        success: true,
        message: 'NativeInjectorBootStrapper criado com sucesso',
        filePath,
        registrations: []
      };

    } catch (error: any) {
      console.error('❌ Erro ao criar NativeInjectorBootStrapper:', error);
      return {
        success: false,
        message: `Erro ao criar NativeInjectorBootStrapper: ${error.message}`
      };
    }
  }

  /**
   * Adiciona registros de injeção de dependência baseado na entidade
   */
  async addEntityRegistrations(projectPath: string, entityName: string): Promise<IoCResult> {
    try {
      const filePath = path.join(projectPath, 'IoC', 'NativeInjectorBootStrapper.cs');

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'Arquivo NativeInjectorBootStrapper não encontrado'
        };
      }

      const newRegistrations = {
        repositories: [`services.AddScoped<I${entityName}Repository, ${entityName}Repository>();`],
        handlers: [`services.AddTransient<${entityName}Handler>();`]
      };

      const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
      const newContent: string[] = [];
      let foundRegion = false;

      for (const line of lines) {
        newContent.push(line);

        // Adicionar repositories
        if (line.includes('#region Repositories')) {
          foundRegion = true;
          const indentation = line.match(/^\s*/)?.[0] || '            ';

          for (const registration of newRegistrations.repositories) {
            if (!lines.toString().includes(registration)) {
              newContent.push(`${indentation}${registration}`);
            }
          }
        }

        // Adicionar handlers
        if (line.includes('#region Handlers')) {
          foundRegion = true;
          const indentation = line.match(/^\s*/)?.[0] || '            ';

          for (const registration of newRegistrations.handlers) {
            if (!lines.toString().includes(registration)) {
              newContent.push(`${indentation}${registration}`);
            }
          }
        }
      }

      if (!foundRegion) {
        return {
          success: false,
          message: 'Regiões #region não encontradas no arquivo'
        };
      }

      // Escrever arquivo atualizado
      fs.writeFileSync(filePath, newContent.join('\n'));

      const registrations: IoCRegistration[] = [
        { name: entityName, type: 'repository' },
        { name: entityName, type: 'handler' }
      ];

      return {
        success: true,
        message: `Registros IoC adicionados para entidade '${entityName}'`,
        filePath,
        registrations
      };

    } catch (error: any) {
      console.error('❌ Erro ao adicionar registros IoC:', error);
      return {
        success: false,
        message: `Erro ao adicionar registros IoC: ${error.message}`
      };
    }
  }

  /**
   * Adiciona múltiplas entidades de uma vez
   */
  async addMultipleEntityRegistrations(projectPath: string, entityNames: string[]): Promise<IoCResult> {
    try {
      const filePath = path.join(projectPath, 'IoC', 'NativeInjectorBootStrapper.cs');

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'Arquivo NativeInjectorBootStrapper não encontrado'
        };
      }

      let content = fs.readFileSync(filePath, 'utf-8');
      const allRegistrations: IoCRegistration[] = [];

      // Para cada entidade, adicionar repository e handler se não existir
      for (const entityName of entityNames) {
        const repositoryRegistration = `services.AddScoped<I${entityName}Repository, ${entityName}Repository>();`;
        const handlerRegistration = `services.AddTransient<${entityName}Handler>();`;

        // Adicionar repository se não existir
        if (!content.includes(repositoryRegistration)) {
          const repositoriesRegion = content.indexOf('#region Repositories');
          if (repositoriesRegion !== -1) {
            const nextLine = content.indexOf('\n', repositoriesRegion) + 1;
            const indentation = '            ';
            content = content.slice(0, nextLine) + 
                     `${indentation}${repositoryRegistration}\n` + 
                     content.slice(nextLine);
            allRegistrations.push({ name: entityName, type: 'repository' });
          }
        }

        // Adicionar handler se não existir
        if (!content.includes(handlerRegistration)) {
          const handlersRegion = content.indexOf('#region Handlers');
          if (handlersRegion !== -1) {
            const nextLine = content.indexOf('\n', handlersRegion) + 1;
            const indentation = '            ';
            content = content.slice(0, nextLine) + 
                     `${indentation}${handlerRegistration}\n` + 
                     content.slice(nextLine);
            allRegistrations.push({ name: entityName, type: 'handler' });
          }
        }
      }

      // Escrever arquivo atualizado
      fs.writeFileSync(filePath, content);

      return {
        success: true,
        message: `Registros IoC adicionados para ${entityNames.length} entidades`,
        filePath,
        registrations: allRegistrations
      };

    } catch (error: any) {
      console.error('❌ Erro ao adicionar múltiplos registros IoC:', error);
      return {
        success: false,
        message: `Erro ao adicionar registros IoC: ${error.message}`
      };
    }
  }

  /**
   * Verifica se uma entidade já está registrada
   */
  isEntityRegistered(projectPath: string, entityName: string): boolean {
    try {
      const filePath = path.join(projectPath, 'IoC', 'NativeInjectorBootStrapper.cs');
      
      if (!fs.existsSync(filePath)) {
        return false;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const repositoryRegistration = `I${entityName}Repository`;
      const handlerRegistration = `${entityName}Handler`;

      return content.includes(repositoryRegistration) && content.includes(handlerRegistration);

    } catch (error) {
      console.error('❌ Erro ao verificar registro IoC:', error);
      return false;
    }
  }

  /**
   * Lista todas as entidades registradas
   */
  getRegisteredEntities(projectPath: string): string[] {
    try {
      const filePath = path.join(projectPath, 'IoC', 'NativeInjectorBootStrapper.cs');
      
      if (!fs.existsSync(filePath)) {
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const entities: string[] = [];

      // Extrair nomes das entidades dos registros de repository
      const repositoryMatches = content.match(/services\.AddScoped<I(\w+)Repository/g);
      if (repositoryMatches) {
        for (const match of repositoryMatches) {
          const entityName = match.match(/I(\w+)Repository/)?.[1];
          if (entityName && !entities.includes(entityName)) {
            entities.push(entityName);
          }
        }
      }

      return entities;

    } catch (error) {
      console.error('❌ Erro ao listar entidades registradas:', error);
      return [];
    }
  }

  /**
   * Remove registros de uma entidade específica
   */
  async removeEntityRegistrations(projectPath: string, entityName: string): Promise<IoCResult> {
    try {
      const filePath = path.join(projectPath, 'IoC', 'NativeInjectorBootStrapper.cs');

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'Arquivo NativeInjectorBootStrapper não encontrado'
        };
      }

      const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
      const newContent: string[] = [];
      let removedCount = 0;

      // Definir padrões a serem removidos
      const repositoryPattern = `services.AddScoped<I${entityName}Repository, ${entityName}Repository>();`;
      const handlerPattern = `services.AddTransient<${entityName}Handler>();`;

      for (const line of lines) {
        // Verificar se a linha contém registros da entidade
        const isRepositoryLine = line.trim() === repositoryPattern;
        const isHandlerLine = line.trim() === handlerPattern;

        if (isRepositoryLine || isHandlerLine) {
          // Pular esta linha (não adicionar ao novo conteúdo)
          removedCount++;
          console.log(`  🗑️  Removendo: ${line.trim()}`);
        } else {
          // Manter a linha
          newContent.push(line);
        }
      }

      if (removedCount === 0) {
        return {
          success: false,
          message: `Nenhum registro encontrado para entidade '${entityName}'`
        };
      }

      // Escrever arquivo atualizado
      fs.writeFileSync(filePath, newContent.join('\n'));

      const removedRegistrations: IoCRegistration[] = [];
      if (removedCount >= 1) removedRegistrations.push({ name: entityName, type: 'repository' });
      if (removedCount >= 2) removedRegistrations.push({ name: entityName, type: 'handler' });

      return {
        success: true,
        message: `${removedCount} registro(s) removido(s) para entidade '${entityName}'`,
        filePath,
        registrations: removedRegistrations
      };

    } catch (error: any) {
      console.error('❌ Erro ao remover registros IoC:', error);
      return {
        success: false,
        message: `Erro ao remover registros IoC: ${error.message}`
      };
    }
  }

  /**
   * Remove registros de múltiplas entidades
   */
  async removeMultipleEntityRegistrations(projectPath: string, entityNames: string[]): Promise<IoCResult> {
    try {
      const filePath = path.join(projectPath, 'IoC', 'NativeInjectorBootStrapper.cs');

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'Arquivo NativeInjectorBootStrapper não encontrado'
        };
      }

      const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
      const newContent: string[] = [];
      let totalRemovedCount = 0;
      const removedRegistrations: IoCRegistration[] = [];

      // Criar padrões para todas as entidades
      const patternsToRemove: string[] = [];
      for (const entityName of entityNames) {
        patternsToRemove.push(`services.AddScoped<I${entityName}Repository, ${entityName}Repository>();`);
        patternsToRemove.push(`services.AddTransient<${entityName}Handler>();`);
      }

      for (const line of lines) {
        const trimmedLine = line.trim();
        const shouldRemove = patternsToRemove.includes(trimmedLine);

        if (shouldRemove) {
          // Identificar qual entidade foi removida
          for (const entityName of entityNames) {
            if (trimmedLine.includes(`I${entityName}Repository`)) {
              removedRegistrations.push({ name: entityName, type: 'repository' });
            } else if (trimmedLine.includes(`${entityName}Handler`)) {
              removedRegistrations.push({ name: entityName, type: 'handler' });
            }
          }
          
          totalRemovedCount++;
          console.log(`  🗑️  Removendo: ${trimmedLine}`);
        } else {
          // Manter a linha
          newContent.push(line);
        }
      }

      if (totalRemovedCount === 0) {
        return {
          success: false,
          message: `Nenhum registro encontrado para as entidades: ${entityNames.join(', ')}`
        };
      }

      // Escrever arquivo atualizado
      fs.writeFileSync(filePath, newContent.join('\n'));

      return {
        success: true,
        message: `${totalRemovedCount} registro(s) removido(s) para ${entityNames.length} entidade(s)`,
        filePath,
        registrations: removedRegistrations
      };

    } catch (error: any) {
      console.error('❌ Erro ao remover múltiplos registros IoC:', error);
      return {
        success: false,
        message: `Erro ao remover registros IoC: ${error.message}`
      };
    }
  }

  /**
   * Limpa todos os registros de entidades (mantém Services, Dictionary, Helper)
   */
  async clearAllEntityRegistrations(projectPath: string): Promise<IoCResult> {
    try {
      const filePath = path.join(projectPath, 'IoC', 'NativeInjectorBootStrapper.cs');

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'Arquivo NativeInjectorBootStrapper não encontrado'
        };
      }

      const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
      const newContent: string[] = [];
      let totalRemovedCount = 0;
      let insideRepositoriesRegion = false;
      let insideHandlersRegion = false;

      for (const line of lines) {
        // Detectar início de regiões
        if (line.includes('#region Repositories')) {
          insideRepositoriesRegion = true;
          newContent.push(line);
          continue;
        } else if (line.includes('#endregion') && insideRepositoriesRegion) {
          insideRepositoriesRegion = false;
          newContent.push(line);
          continue;
        } else if (line.includes('#region Handlers')) {
          insideHandlersRegion = true;
          newContent.push(line);
          continue;
        } else if (line.includes('#endregion') && insideHandlersRegion) {
          insideHandlersRegion = false;
          newContent.push(line);
          continue;
        }

        // Remover linhas de registro dentro das regiões
        if (insideRepositoriesRegion || insideHandlersRegion) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('services.Add') && (trimmedLine.includes('Repository') || trimmedLine.includes('Handler'))) {
            totalRemovedCount++;
            console.log(`  🗑️  Removendo: ${trimmedLine}`);
            continue; // Pular esta linha
          }
        }

        // Manter todas as outras linhas
        newContent.push(line);
      }

      // Escrever arquivo atualizado
      fs.writeFileSync(filePath, newContent.join('\n'));

      return {
        success: true,
        message: `${totalRemovedCount} registro(s) de entidades removido(s)`,
        filePath,
        registrations: []
      };

    } catch (error: any) {
      console.error('❌ Erro ao limpar registros IoC:', error);
      return {
        success: false,
        message: `Erro ao limpar registros IoC: ${error.message}`
      };
    }
  }
}
