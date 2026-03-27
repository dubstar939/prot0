import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Layers, 
  Zap, 
  Settings2, 
  Car, 
  Palette, 
  Image as ImageIcon, 
  Crop, 
  Wrench, 
  BoxSelect, 
  Download, 
  Undo2, 
  Redo2, 
  Maximize2, 
  ChevronRight, 
  ChevronLeft,
  Sliders,
  Sun,
  Contrast,
  Droplets,
  Focus,
  Wind,
  Thermometer,
  Sparkles,
  Moon,
  Eye,
  Eraser,
  Cloud,
  User,
  Share2,
  Printer,
  Globe,
  Trash2
} from 'lucide-react';
import { Mode, ToolCategory, ToolSettings, DEFAULT_SETTINGS } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TOOL_CATEGORIES: { id: ToolCategory; label: string; icon: any }[] = [
  { id: 'CORE', label: 'Core Tools', icon: Sliders },
  { id: 'AUTOMOTIVE', label: 'Automotive', icon: Car },
  { id: 'STYLE', label: 'Style Presets', icon: Palette },
  { id: 'BACKGROUND', label: 'Subject/BG', icon: ImageIcon },
  { id: 'FRAMING', label: 'Framing', icon: Crop },
  { id: 'REPAIR', label: 'Repair/Restore', icon: Wrench },
  { id: 'MASKING', label: 'Masking', icon: BoxSelect },
  { id: 'EXPORT', label: 'Export', icon: Download },
];

const PRESETS = [
  { id: 'coastal_minimalist', label: 'Coastal Minimalist', description: 'Cool whites, soft blues, matte highlights.' },
  { id: 'high_contrast_street', label: 'High Contrast Street', description: 'Bold contrast and crisp micro-detail.' },
  { id: 'film_939', label: 'Film 939', description: 'Warm tones, subtle grain, soft halation.' },
  { id: 'matte_fade', label: 'Matte Fade', description: 'Soft matte finish with lifted shadows.' },
  { id: 'vivid_pop', label: 'Vivid Pop', description: 'Natural boost to vibrancy and clarity.' },
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('AUTO');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('CORE');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [history, setHistory] = useState<{
    past: ToolSettings[];
    present: ToolSettings;
    future: ToolSettings[];
  }>({
    past: [],
    present: DEFAULT_SETTINGS,
    future: [],
  });

  const settings = history.present;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImage(objectUrl);
      setHistory({ past: [], present: DEFAULT_SETTINGS, future: [] });
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: !!image,
  } as any);

  const updateSetting = (key: keyof ToolSettings, value: any) => {
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: { ...prev.present, [key]: value },
      future: [],
    }));
    
    if (mode === 'AUTO') {
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  const undo = () => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  };

  const redo = () => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  };

  const clearImage = () => {
    setImage(null);
    setHistory({ past: [], present: DEFAULT_SETTINGS, future: [] });
  };

  const startBlankCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setImage(canvas.toDataURL('image/jpeg'));
      setHistory({ past: [], present: DEFAULT_SETTINGS, future: [] });
    }
  };

  const handleExport = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      const { exposure, contrast, saturation, bokeh, whiteBalance, sharpen, exportFormat, exportQuality } = settings;
      let filters = [];
      if (exposure !== 0) filters.push(`brightness(${100 + exposure}%)`);
      if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`);
      if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`);
      if (bokeh !== 0) filters.push(`blur(${bokeh / 10}px)`);
      if (whiteBalance !== 0) filters.push(`hue-rotate(${whiteBalance}deg)`);
      if (sharpen > 0) filters.push(`contrast(${100 + sharpen / 2}%)`);
      
      ctx.filter = filters.join(' ');
      
      if (settings.straighten !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((settings.straighten * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const ext = exportFormat.split('/')[1];
        link.download = `prot0-neural-export-${Date.now()}.${ext}`;
        link.href = url;
        link.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, exportFormat, exportQuality / 100);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cssFilters = useMemo(() => {
    const { exposure, contrast, saturation, sharpen, noiseReduction, whiteBalance, bokeh } = settings;
    let filters = [];
    if (exposure !== 0) filters.push(`brightness(${100 + exposure}%)`);
    if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`);
    if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`);
    if (bokeh !== 0) filters.push(`blur(${bokeh / 10}px)`);
    if (whiteBalance !== 0) filters.push(`hue-rotate(${whiteBalance}deg)`);
    // Simulation of sharpen/noise reduction via contrast/blur
    if (sharpen > 0) filters.push(`contrast(${100 + sharpen / 2}%)`);
    
    return filters.join(' ');
  }, [settings]);

  const renderToolControls = () => {
    switch (activeCategory) {
      case 'CORE':
        return (
          <div className="space-y-6">
            <ControlGroup label="Exposure" value={settings.exposure} min={-100} max={100} onChange={(v) => updateSetting('exposure', v)} icon={Sun} />
            <ControlGroup label="Contrast" value={settings.contrast} min={-100} max={100} onChange={(v) => updateSetting('contrast', v)} icon={Contrast} />
            <ControlGroup label="Saturation" value={settings.saturation} min={-100} max={100} onChange={(v) => updateSetting('saturation', v)} icon={Droplets} />
            <ControlGroup label="Sharpen" value={settings.sharpen} min={0} max={100} onChange={(v) => updateSetting('sharpen', v)} icon={Focus} />
            <ControlGroup label="Noise Reduction" value={settings.noiseReduction} min={0} max={100} onChange={(v) => updateSetting('noiseReduction', v)} icon={Wind} />
            <ControlGroup label="White Balance" value={settings.whiteBalance} min={-100} max={100} onChange={(v) => updateSetting('whiteBalance', v)} icon={Thermometer} />
          </div>
        );
      case 'AUTOMOTIVE':
        return (
          <div className="space-y-6">
            <ControlGroup label="Paint Gloss Boost" value={settings.paintGloss} min={0} max={100} onChange={(v) => updateSetting('paintGloss', v)} icon={Sparkles} />
            <ControlGroup label="Wheel Detail" value={settings.wheelDetail} min={0} max={100} onChange={(v) => updateSetting('wheelDetail', v)} icon={Focus} />
            <ControlGroup label="Night Meet Enhance" value={settings.nightEnhance} min={0} max={100} onChange={(v) => updateSetting('nightEnhance', v)} icon={Moon} />
            <ControlGroup label="Reflection Clean" value={settings.reflectionClean} min={0} max={100} onChange={(v) => updateSetting('reflectionClean', v)} icon={Eye} />
            <ControlGroup label="Showroom Finish" value={settings.showroomFinish} min={0} max={100} onChange={(v) => updateSetting('showroomFinish', v)} icon={Camera} />
          </div>
        );
      case 'STYLE':
        return (
          <div className="space-y-3">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => updateSetting('preset', preset.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all duration-200",
                  settings.preset === preset.id 
                    ? "bg-accent text-bg border-accent" 
                    : "bg-surface-hover border-border hover:border-accent-muted"
                )}
              >
                <div className="font-medium text-sm">{preset.label}</div>
                <div className={cn("text-[10px] mt-1", settings.preset === preset.id ? "text-bg/70" : "text-accent-muted")}>
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        );
      case 'BACKGROUND':
        return (
          <div className="space-y-6">
            <ControlGroup label="Background Simplify" value={settings.bgSimplify} min={0} max={100} onChange={(v) => updateSetting('bgSimplify', v)} icon={Eraser} />
            <ControlGroup label="Subject Pop" value={settings.subjectPop} min={0} max={100} onChange={(v) => updateSetting('subjectPop', v)} icon={Maximize2} />
            <ControlGroup label="Bokeh Boost" value={settings.bokeh} min={0} max={100} onChange={(v) => updateSetting('bokeh', v)} icon={Focus} />
          </div>
        );
      case 'FRAMING':
        return (
          <div className="space-y-6">
            <ControlGroup label="Straighten" value={settings.straighten} min={-45} max={45} onChange={(v) => updateSetting('straighten', v)} icon={Undo2} />
            <ControlGroup label="Perspective" value={settings.perspective} min={-100} max={100} onChange={(v) => updateSetting('perspective', v)} icon={Maximize2} />
            <div className="pt-4 border-t border-border">
              <span className="prot0-label">Aspect Ratio</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['1:1', '4:5', '16:9', '9:16'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => updateSetting('crop', ratio)}
                    className={cn(
                      "py-2 rounded border text-xs font-mono",
                      settings.crop === ratio ? "bg-accent text-bg border-accent" : "bg-surface-hover border-border"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'REPAIR':
        return (
          <div className="space-y-6">
            <ControlGroup label="Compression Cleanup" value={settings.compressionCleanup} min={0} max={100} onChange={(v) => updateSetting('compressionCleanup', v)} icon={Wind} />
            <ControlGroup label="Low Quality Restore" value={settings.lowQualityRestore} min={0} max={100} onChange={(v) => updateSetting('lowQualityRestore', v)} icon={Zap} />
            <ControlGroup label="Reflection Reduction" value={settings.reflectionReduction} min={0} max={100} onChange={(v) => updateSetting('reflectionReduction', v)} icon={Eye} />
            <ControlGroup label="Glare Reduction" value={settings.glareReduction} min={0} max={100} onChange={(v) => updateSetting('glareReduction', v)} icon={Sun} />
          </div>
        );
      case 'MASKING':
        return (
          <div className="space-y-6">
            <ControlGroup label="Selective Edit" value={settings.selectiveEdit} min={0} max={100} onChange={(v) => updateSetting('selectiveEdit', v)} icon={BoxSelect} />
            <ControlGroup label="Sky Replace" value={settings.skyReplace} min={0} max={100} onChange={(v) => updateSetting('skyReplace', v)} icon={Cloud} />
            <ControlGroup label="Skin Cleanup" value={settings.skinCleanup} min={0} max={100} onChange={(v) => updateSetting('skinCleanup', v)} icon={User} />
          </div>
        );
      case 'EXPORT':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="prot0-label">Format</span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['image/jpeg', 'image/png', 'image/webp'].map(format => (
                  <button
                    key={format}
                    onClick={() => updateSetting('exportFormat', format)}
                    className={cn(
                      "py-2 rounded border text-[10px] font-mono",
                      settings.exportFormat === format ? "bg-accent text-bg border-accent" : "bg-surface-hover border-border"
                    )}
                  >
                    {format.split('/')[1].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {(settings.exportFormat === 'image/jpeg' || settings.exportFormat === 'image/webp') && (
              <ControlGroup 
                label="Export Quality" 
                value={settings.exportQuality} 
                min={1} 
                max={100} 
                onChange={(v) => updateSetting('exportQuality', v)} 
                icon={Settings2} 
              />
            )}

            <div className="pt-4 border-t border-border space-y-4">
              <ExportButton 
                label="Download Image" 
                icon={Download} 
                description={`Export as ${settings.exportFormat.split('/')[1].toUpperCase()}`} 
                onClick={handleExport}
                disabled={isProcessing}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-bg text-accent font-sans overflow-hidden flex-col md:flex-row">
      {/* Left Sidebar - Categories (Bottom bar on mobile) */}
      <aside className="w-full md:w-16 h-16 md:h-full border-t md:border-t-0 md:border-r border-border flex flex-row md:flex-col items-center justify-around md:justify-start py-0 md:py-6 gap-0 md:gap-6 bg-surface z-30 order-last md:order-first">
        <div className="hidden md:flex w-10 h-10 bg-accent text-bg rounded-xl items-center justify-center font-black text-xl mb-4">
          P0
        </div>
        {TOOL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "p-3 rounded-xl transition-all duration-200 group relative",
              activeCategory === cat.id ? "bg-accent text-bg" : "text-accent-muted hover:text-accent hover:bg-surface-hover"
            )}
          >
            <cat.icon size={20} />
            <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-border rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {cat.label}
            </div>
          </button>
        ))}
        <div className="hidden md:flex mt-auto flex-col gap-4">
          <button className="p-3 text-accent-muted hover:text-accent group relative">
            <Settings2 size={20} />
            <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-border rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Settings
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-surface/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-[10px] md:text-xs font-mono tracking-widest uppercase text-accent-muted truncate max-w-[120px] md:max-w-none">Prot0 Neural v1.0</span>
            <div className="h-4 w-[1px] bg-border hidden sm:block" />
            <div className="flex items-center gap-1 bg-bg rounded-full p-0.5 md:p-1 border border-border">
              <button
                onClick={() => setMode('AUTO')}
                className={cn(
                  "px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold tracking-widest transition-all",
                  mode === 'AUTO' ? "bg-accent text-bg" : "text-accent-muted hover:text-accent"
                )}
              >
                AUTO
              </button>
              <button
                onClick={() => setMode('PRO')}
                className={cn(
                  "px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold tracking-widest transition-all",
                  mode === 'PRO' ? "bg-accent text-bg" : "text-accent-muted hover:text-accent"
                )}
              >
                PRO
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={undo} 
              disabled={history.past.length === 0}
              className="prot0-button prot0-button-secondary py-1 px-2 md:py-1.5 md:px-3 text-[10px] md:text-xs disabled:opacity-30 group relative"
            >
              <Undo2 size={12} className="md:w-3.5 md:h-3.5" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface border border-border rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Undo
              </div>
            </button>
            <button 
              onClick={redo} 
              disabled={history.future.length === 0}
              className="prot0-button prot0-button-secondary py-1 px-2 md:py-1.5 md:px-3 text-[10px] md:text-xs disabled:opacity-30 group relative"
            >
              <Redo2 size={12} className="md:w-3.5 md:h-3.5" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface border border-border rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Redo
              </div>
            </button>
            <button onClick={clearImage} className="prot0-button prot0-button-secondary py-1 px-2 md:py-1.5 md:px-3 text-[10px] md:text-xs group relative">
              <Trash2 size={12} className="md:w-3.5 md:h-3.5" /> <span className="hidden sm:inline">Clear</span>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface border border-border rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Clear Image
              </div>
            </button>
            <button 
              onClick={handleExport}
              disabled={!image}
              className="prot0-button prot0-button-primary py-1 px-3 md:py-1.5 md:px-4 text-[10px] md:text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed group relative"
            >
              <Download size={12} className="md:w-3.5 md:h-3.5" /> <span className="hidden sm:inline">Export</span>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface border border-border rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Export Image
              </div>
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div 
          {...getRootProps()} 
          className={cn(
            "flex-1 flex items-center justify-center p-8 transition-colors duration-300 relative",
            isDragActive ? "bg-accent/5" : "bg-bg"
          )}
        >
          {/* Neural Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ 
                 backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px'
               }} 
          />
          
          <input {...getInputProps()} />
          
          {!image ? (
            <div className="text-center space-y-4 max-w-md">
              <div className="w-20 h-20 border-2 border-dashed border-border rounded-3xl flex items-center justify-center mx-auto text-accent-muted group-hover:border-accent transition-colors">
                <ImageIcon size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Drop your masterpiece</h2>
                <p className="text-accent-muted text-sm mt-1">RAW, JPEG, PNG supported. Neural engine ready.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <button className="prot0-button prot0-button-primary px-8">
                  Select File
                </button>
                <button 
                  onClick={startBlankCanvas}
                  className="prot0-button prot0-button-secondary px-8"
                >
                  Blank Canvas
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group max-w-full max-h-full">
              <motion.div 
                layoutId="image-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative shadow-2xl rounded-sm overflow-hidden border border-border bg-surface"
              >
                <img 
                  src={image} 
                  alt="Preview" 
                  className="max-w-full max-h-[75vh] object-contain transition-all duration-500"
                  style={{ 
                    filter: cssFilters,
                    transform: `rotate(${settings.straighten}deg) scale(${1 + Math.abs(settings.perspective) / 500})`
                  }}
                />
                
                {/* Neural Processing Overlay */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-bg/20 backdrop-blur-[2px] flex items-center justify-center z-10"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-mono tracking-[0.3em] uppercase animate-pulse">Neural Processing</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Viewport Toolbar */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface/90 backdrop-blur-md border border-border p-1.5 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ViewportTool icon={Undo2} label="Undo" />
                <ViewportTool icon={Redo2} label="Redo" />
                <div className="w-[1px] h-4 bg-border mx-1" />
                <ViewportTool icon={Maximize2} label="Full Screen" />
                <ViewportTool icon={Crop} label="Crop" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <footer className="h-8 border-t border-border bg-surface flex items-center justify-between px-4 text-[9px] font-mono text-accent-muted uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>Status: {isProcessing ? 'Processing' : 'Ready'}</span>
            <span>Engine: Prot0 Neural v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Mode: {mode}</span>
            <span>Resolution: {image ? '3840 x 2160' : 'N/A'}</span>
          </div>
        </footer>
      </main>

      {/* Right Sidebar - Controls (Overlay on mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed md:relative right-0 top-0 bottom-0 w-72 md:w-80 border-l border-border bg-surface flex flex-col z-40 md:z-30 shadow-2xl md:shadow-none"
          >
            <div className="p-6 flex items-center justify-between border-b border-border">
              <h3 className="text-xs font-bold tracking-widest uppercase">{activeCategory}</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-accent-muted hover:text-accent group relative">
                <ChevronRight size={16} />
                <div className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-surface border border-border rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Close Sidebar
                </div>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {renderToolControls()}
            </div>

            <div className="p-6 border-t border-border bg-bg/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono text-accent-muted uppercase tracking-widest">History</span>
                <span className="text-[10px] font-mono text-accent-muted">08 Steps</span>
              </div>
              <div className="space-y-2">
                <HistoryItem label="Import Original" active />
                <HistoryItem label="Neural Exposure" />
                <HistoryItem label="Gloss Boost" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-surface border-l border-y border-border rounded-l-md flex items-center justify-center text-accent-muted hover:text-accent z-40 group relative"
        >
          <ChevronLeft size={16} />
          <div className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-surface border border-border rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            Open Sidebar
          </div>
        </button>
      )}
    </div>
  );
}

const ControlGroup = React.memo(({ label, value, min, max, onChange, icon: Icon }: { label: string, value: number, min: number, max: number, onChange: (v: number) => void, icon: any }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 group relative">
          <Icon size={14} className="text-accent-muted" />
          <div className="absolute bottom-full mb-2 left-0 px-2 py-1 bg-surface border border-border rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            {label}
          </div>
          <span className="prot0-label mb-0">{label}</span>
        </div>
        <span className="text-[10px] font-mono text-accent">{value > 0 ? `+${value}` : value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="prot0-slider"
      />
    </div>
  );
});

const ExportButton = React.memo(({ label, icon: Icon, description, onClick, disabled }: { label: string, icon: any, description: string, onClick?: () => void, disabled?: boolean }) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="w-full group text-left p-4 rounded-xl bg-surface-hover border border-border hover:border-accent-muted transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-lg bg-bg text-accent-muted group-hover:text-accent transition-colors relative group/icon">
          <Icon size={18} />
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface border border-border rounded text-[9px] whitespace-nowrap opacity-0 group-hover/icon:opacity-100 pointer-events-none transition-opacity z-50">
            {label}
          </div>
        </div>
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      <p className="text-[10px] text-accent-muted ml-11">{description}</p>
    </button>
  );
});

function ViewportTool({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="p-2 text-accent-muted hover:text-accent hover:bg-white/10 rounded-full transition-all group relative">
      <Icon size={18} />
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface border border-border rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        {label}
      </div>
    </button>
  );
}

function HistoryItem({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-[10px] font-medium transition-colors cursor-pointer",
      active ? "bg-accent/10 text-accent border-l-2 border-accent" : "text-accent-muted hover:bg-surface-hover"
    )}>
      <div className={cn("w-1 h-1 rounded-full", active ? "bg-accent" : "bg-border")} />
      {label}
    </div>
  );
}
