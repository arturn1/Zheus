export interface ProjectCreationOptions {
  name: string;
  template?: 'console' | 'web' | 'webapi' | 'mvc' | 'blazor' | 'classlib' | 'wpf' | 'winforms';
  framework?: string; // e.g., 'net8.0', 'net6.0'
  language?: 'C#' | 'F#' | 'VB';
  outputPath?: string;
  force?: boolean; // sobrescrever se existir
}

export interface ProjectCreationResult {
  success: boolean;
  message: string;
  projectName?: string;
  projectPath?: string;
  template?: string;
  framework?: string;
  error?: string;
}
