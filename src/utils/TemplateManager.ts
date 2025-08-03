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
      
      console.log(`🔍 TemplateManager: Loading template ${templatePath} from ${fullPath}`);
      console.log(`🔍 Current working directory: ${process.cwd()}`);
      console.log(`🔍 __dirname: ${__dirname}`);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(fullPath)) {
        // Tentar caminhos alternativos
        const altPath1 = path.join(process.cwd(), 'dist/templates', templatePath);
        const altPath2 = path.join(process.cwd(), 'src/templates', templatePath);
        
        console.log(`❌ Template not found at ${fullPath}`);
        console.log(`🔍 Trying alternative path 1: ${altPath1} - exists: ${fs.existsSync(altPath1)}`);
        console.log(`🔍 Trying alternative path 2: ${altPath2} - exists: ${fs.existsSync(altPath2)}`);
        
        if (fs.existsSync(altPath1)) {
          const content = fs.readFileSync(altPath1, 'utf-8');
          const compiledTemplate = Handlebars.compile(content);
          this.templates.set(templatePath, compiledTemplate);
          console.log(`✅ Template loaded from alternative path 1: ${altPath1}`);
          return compiledTemplate;
        }
        
        if (fs.existsSync(altPath2)) {
          const content = fs.readFileSync(altPath2, 'utf-8');
          const compiledTemplate = Handlebars.compile(content);
          this.templates.set(templatePath, compiledTemplate);
          console.log(`✅ Template loaded from alternative path 2: ${altPath2}`);
          return compiledTemplate;
        }
      }
      
      // Carrega e compila o template
      const content = fs.readFileSync(fullPath, 'utf-8');
      const compiledTemplate = Handlebars.compile(content);
      
      console.log(`✅ Template ${templatePath} loaded successfully from ${fullPath}`);
      
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
