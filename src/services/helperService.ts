import * as fs from 'fs';
import * as path from 'path';

export class HelperService {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(__dirname, '../templates/domain/helpers');
  }

  /**
   * Gera arquivos da camada Helpers
   */
  async generateHelpers(domainPath: string): Promise<{ success: boolean; message: string; filePaths?: string[]; error?: string }> {
    try {
      // Verificar se existe Domain path
      if (!fs.existsSync(domainPath)) {
        return {
          success: false,
          message: 'Projeto Domain não encontrado. Certifique-se de que é um projeto Clean Architecture.',
          error: 'Domain project not found'
        };
      }

      // Criar pasta Helpers
      const helpersPath = path.join(domainPath, 'Helpers');
      
      if (!fs.existsSync(helpersPath)) {
        fs.mkdirSync(helpersPath, { recursive: true });
      }

      // Definir caminho do arquivo
      const mapperFilePath = path.join(helpersPath, 'Mapper.cs');

      // Gerar código do Mapper
      const mapperCode = this.generateMapper();

      // Sempre criar/sobrescrever arquivo
      fs.writeFileSync(mapperFilePath, mapperCode, 'utf8');

      console.log('✅ Mapper.cs gerado com sucesso');

      return {
        success: true,
        message: 'Helpers gerados com sucesso',
        filePaths: [mapperFilePath]
      };

    } catch (error: any) {
      console.error('❌ Erro ao gerar helpers:', error.message);
      return {
        success: false,
        message: 'Erro ao gerar helpers',
        error: error.message
      };
    }
  }

  /**
   * Gera código C# do Mapper usando template estático
   */
  generateMapper(): string {
    const templatePath = path.join(this.templateDir, 'mapper.hbs');
    return fs.readFileSync(templatePath, 'utf-8');
  }
}
