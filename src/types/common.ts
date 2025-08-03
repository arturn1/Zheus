export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    statusCode: number;
    message: string;
    stack?: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Project Scaffold Types
export interface ProjectOptions {
  name: string;                    // Nome do projeto (obrigatório)
  template?: string;               // Template .NET (padrão: "webapi")
  framework?: string;              // Framework .NET (padrão: "net8.0")
  outputPath?: string;             // Caminho de saída (padrão: cwd)
  useCleanArchitecture?: boolean;  // Usar estrutura Clean Architecture (padrão: true)
}

export interface EntityProperty {
  name: string;                    // Nome da propriedade (ex: "Name", "Email")
  type: string;                    // Tipo C# (ex: "string", "int", "decimal", "DateTime")
  isRequired: boolean;             // Propriedade obrigatória
  isNavigationProperty?: boolean;  // Propriedade de navegação (padrão: false)
  isCollection?: string;           // Tipo de coleção ("List", "ICollection", etc.)
}

export interface EntityDefinition {
  name: string;                    // Nome da entidade (ex: "User", "Product")
  inheritsFromBase?: boolean;      // Herdar de BaseEntity (padrão: true)
  namespace?: string;              // Namespace (padrão: "Domain.Entities")
  generateCommands?: boolean;      // Gerar comandos CQRS (padrão: true)
  properties: EntityProperty[];    // Array de propriedades da entidade
}

export interface ScaffoldRequest {
  projectOptions: ProjectOptions;
  entities: EntityDefinition[];
}

export interface ScaffoldValidationResult {
  validation: {
    projectOptions: { valid: boolean; errors: string[] };
    entities: { name: string; valid: boolean; errors: string[] }[];
    templates: { valid: boolean; loaded: string[]; missing: string[] };
  };
  preview: {
    projectStructure: string[];
    filesToGenerate: { 
      entities: number; 
      commands: number; 
      handlers: number; 
      repositories: number; 
    };
  };
}

export interface ScaffoldResult {
  project: { success: boolean; projectPath?: string; message: string };
  entities: { className: string; success: boolean; files: string[]; message: string }[];
  commands: { entityName: string; success: boolean; files: string[] }[];
  handlers: { entityName: string; success: boolean; files: string[] }[];
  repositories: { entityName: string; success: boolean; fileName: string }[];
  infrastructure?: {
    success: boolean;
    filesCreated?: number;
    message: string;
    files?: string[];
  };
  application?: {
    success: boolean;
    filesCreated?: number;
    message: string;
    files?: string[];
  };
  api?: {
    success: boolean;
    filesCreated?: number;
    message: string;
    files?: string[];
  };
  ioc?: {
    success: boolean;
    registrations?: number;
    entities?: string[];
    message: string;
  };
  summary: {
    projectCreated: boolean;
    entitiesGenerated: number;
    commandsGenerated: number;
    handlersGenerated: number;
    repositoriesGenerated: number;
    totalFiles: number;
  };
}
