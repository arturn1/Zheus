import * as path from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';

/**
 * Gerenciador global de templates com cache e lazy loading
 * Resolve o problema de carregamento de templates no constructor
 */
export class TemplateManager {
  private static templates = new Map<string, HandlebarsTemplateDelegate>();

  /**
   * Obtém um template compilado (com cache e lazy loading)
   * @param templatePath Caminho relativo do template (ex: 'domain/entities/entity.hbs')
   * @returns Template compilado do Handlebars
   */
  static getTemplate(templatePath: string): HandlebarsTemplateDelegate {
    // Verifica se já está no cache
    if (this.templates.has(templatePath)) {
      return this.templates.get(templatePath)!;
    }

    try {
      // Resolve caminho absoluto do template
      const fullPath = path.join(__dirname, '../templates', templatePath);
      
      // Carrega e compila o template
      const content = fs.readFileSync(fullPath, 'utf-8');
      const compiledTemplate = Handlebars.compile(content);
      
      // Armazena no cache
      this.templates.set(templatePath, compiledTemplate);
      
      return compiledTemplate;
      
    } catch (error: any) {
      throw new Error(`Failed to load template '${templatePath}': ${error.message}`);
    }
  }

  /**
   * Limpa o cache de templates (útil para testes)
   */
  static clearCache(): void {
    this.templates.clear();
  }

  /**
   * Obtém estatísticas do cache
   */
  static getCacheStats(): { size: number; templates: string[] } {
    return {
      size: this.templates.size,
      templates: Array.from(this.templates.keys())
    };
  }
}
