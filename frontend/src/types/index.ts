export type CategoryType = 'all' | 'pdf' | 'office' | 'image' | 'media' | 'data' | 'ebook' | 'archive';

export interface OptionConfigItem {
  id: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'range';
  defaultValue: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface ConversionTool {
  id: string;
  name: string;
  description: string;
  category: CategoryType;
  iconName: string;
  fromExt: string[];
  toExt: string[];
  defaultTarget?: string;
  endpoint: string;
  popular?: boolean;
  clientSideCapable?: boolean;
  color: string;
  badge?: string;
  optionsConfig?: OptionConfigItem[];
}

export interface QueueItem {
  id: string;
  file: File;
  toolId: string;
  sourceExt: string;
  targetExt: string;
  status: 'idle' | 'converting' | 'completed' | 'error';
  progress: number;
  resultBlob?: Blob;
  resultUrl?: string;
  resultFileName?: string;
  errorMessage?: string;
  options: Record<string, any>;
  engineUsed?: 'client' | 'microservice';
}

export interface BackendHealth {
  status: 'online' | 'offline' | 'checking';
  version?: string;
  capabilities?: Record<string, any>;
}
