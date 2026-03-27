export type Mode = 'AUTO' | 'PRO';

export type ToolCategory = 
  | 'CORE' 
  | 'AUTOMOTIVE' 
  | 'STYLE' 
  | 'BACKGROUND' 
  | 'FRAMING' 
  | 'REPAIR' 
  | 'MASKING' 
  | 'EXPORT';

export interface ToolSettings {
  // Core
  exposure: number;
  contrast: number;
  saturation: number;
  sharpen: number;
  noiseReduction: number;
  whiteBalance: number;
  
  // Automotive
  paintGloss: number;
  wheelDetail: number;
  nightEnhance: number;
  reflectionClean: number;
  showroomFinish: number;
  
  // Style
  preset: string | null;
  
  // Background
  bgSimplify: number;
  subjectPop: number;
  bokeh: number;
  
  // Framing
  crop: string | null;
  straighten: number;
  perspective: number;
  
  // Repair
  compressionCleanup: number;
  lowQualityRestore: number;
  reflectionReduction: number;
  glareReduction: number;
  
  // Masking
  selectiveEdit: number;
  skyReplace: number;
  skinCleanup: number;
  
  // Export
  exportFormat: 'image/jpeg' | 'image/png' | 'image/webp';
  exportQuality: number;
}

export const DEFAULT_SETTINGS: ToolSettings = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  sharpen: 0,
  noiseReduction: 0,
  whiteBalance: 0,
  paintGloss: 0,
  wheelDetail: 0,
  nightEnhance: 0,
  reflectionClean: 0,
  showroomFinish: 0,
  preset: null,
  bgSimplify: 0,
  subjectPop: 0,
  bokeh: 0,
  crop: null,
  straighten: 0,
  perspective: 0,
  compressionCleanup: 0,
  lowQualityRestore: 0,
  reflectionReduction: 0,
  glareReduction: 0,
  selectiveEdit: 0,
  skyReplace: 0,
  skinCleanup: 0,
  exportFormat: 'image/jpeg',
  exportQuality: 95,
};

export interface ImageState {
  url: string | null;
  settings: ToolSettings;
  mode: Mode;
}
