
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light';

export interface RawDevelopmentParams {
  exposure: number; // -5 to +5
  temperature: number; // 2000 to 12000
  tint: number; // -150 to 150
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
}

export interface Layer {
  id: string;
  url: string; // The current rendered pixel data
  originalUrl: string; // The initial source data (pre-neural processing)
  opacity: number;
  isVisible: boolean;
  name: string;
  blendMode: BlendMode;
  groupId?: string;
  neuralPrompt?: string; // The last prompt applied to this layer
  isRaw?: boolean; // Indicates if the layer originated from a RAW file
  rawParams?: RawDevelopmentParams; // Parameters for the Creative RAW Developer
  blur?: number; // Blur intensity (0-100)
}

export interface LayerGroup {
  id: string;
  name: string;
  isCollapsed: boolean;
}

export interface HistoryItem {
  id: string;
  layers: Layer[];
  groups: LayerGroup[];
  activeLayerId: string;
  timestamp: number;
  prompt?: string;
}

export enum EditMode {
  GENERATE = 'GENERATE',
  EDIT = 'EDIT',
  ENHANCE = 'ENHANCE',
  ISOLATE = 'ISOLATE',
  REMOVE = 'REMOVE',
  COLOR = 'COLOR',
  BLUR = 'BLUR',
  RAW_DEV = 'RAW_DEV',
  STYLE_TRANSFER = 'STYLE_TRANSFER',
  SOCIAL = 'SOCIAL',
  CROP = 'CROP',
  LAYERS = 'LAYERS',
  COLLAGE = 'COLLAGE',
  POSTER = 'POSTER',
  LOGO = 'LOGO'
}

export type TargetResolution = '1K' | '2K' | '4K';

export type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export interface ExportConfig {
  format: ExportFormat;
  quality: number; // 0 to 100
  platform?: string;
}

export interface FilterPreset {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  color: string;
}

export interface SocialPreset {
  id: string;
  platform: string;
  label: string;
  aspectRatio: string;
  icon: string;
  description: string;
}

export interface AppState {
  layers: Layer[];
  groups: LayerGroup[];
  activeLayerId: string | null;
  history: HistoryItem[];
  historyIndex: number;
  isProcessing: boolean;
  activeMode: EditMode;
  error: string | null;
  targetResolution: TargetResolution;
  promptHistory: string[];
  savedPrompts: string[];
}
