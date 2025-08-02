export interface DotNetInfo {
  isInstalled: boolean;
  version?: string;
  platform: 'windows' | 'linux' | 'macos';
  architecture?: string;
  sdkVersions?: string[];
  runtimeVersions?: string[];
}

export interface DotNetInstallResult {
  success: boolean;
  message: string;
  version?: string;
  installPath?: string;
  error?: string;
}

export interface DotNetInstallOptions {
  version?: string;
  channel?: 'LTS' | 'Current' | 'Preview';
  architecture?: 'x64' | 'x86' | 'arm64';
  installDir?: string;
}
