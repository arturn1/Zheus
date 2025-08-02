export interface EntityProperty {
  name: string;
  type: string;
  isRequired: boolean;
  isCollection?: 'List' | 'ICollection' | 'IEnumerable' | 'HashSet' | 'Array';
  isNavigationProperty: boolean;
}

export interface EntityDefinition {
  name: string;
  inheritsFromBase: boolean;
  namespace?: string;
  properties: EntityProperty[];
}

export interface EntityGenerationRequest {
  projectPath: string;
  entity: EntityDefinition;
}

export interface EntityGenerationResult {
  success: boolean;
  message: string;
  entityPath?: string;
  generatedFiles?: string[];
  error?: string;
}
