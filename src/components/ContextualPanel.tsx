import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EditMode, Layer, TargetResolution } from '../../types';
import { 
  Sparkles, Sliders, Palette, Crop, Maximize, Layout, Move, 
  ChevronRight, ArrowRight, Wand2, RefreshCw, Download, 
  Layers, Settings2, Image as ImageIcon, Check, X
} from 'lucide-react';

interface ContextualPanelProps {
  activeMode: EditMode;
  activeLayerId: string | null;
  layers: Layer[];
  isProcessing: boolean;
  prompt: string;
  setPrompt: (p: string) => void;
  handleGenerate: () => void;
  handleColorAdjust: (type: string, value: number) => void;
  handleStyleTransfer: (style: string) => void;
  handleSocialResize: (platform: string) => void;
  handleCrop: () => void;
  handleCollage: (layout: string) => void;
  handleExport: () => void;
  handleMergeLayers: () => void;
  updateSelectedLayer: (updates: Partial<Layer>) => void;
  onCancel: () => void;
}

export const ContextualPanel: React.FC<ContextualPanelProps> = ({
  activeMode,
  activeLayerId,
  layers,
  isProcessing,
  prompt,
  setPrompt,
  handleGenerate,
  handleColorAdjust,
  handleStyleTransfer,
  handleSocialResize,
  handleCrop,
  handleCollage,
  handleExport,
  handleMergeLayers,
  updateSelectedLayer,
  onCancel
}) => {
  const currentLayer = layers.find(l => l.id === activeLayerId);

  const renderContent = () => {
    switch (activeMode) {
      case EditMode.GENERATE:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                  <Sparkles className="w-5 h-5 text-fuchsia-500" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest">Neural Draft</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">AI-Powered Generation</p>
                </div>
              </div>
              
              <div className="relative group">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision in detail..."
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm outline-none focus:border-fuchsia-500/50 transition-all resize-none custom-scrollbar"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setPrompt('')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isProcessing || !prompt.trim()}
              className="w-full py-5 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-3xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-fuchsia-500/20"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isProcessing ? 'Synthesizing...' : 'Generate Vision'}
            </button>
          </div>
        );

      case EditMode.COLOR:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                <Sliders className="w-5 h-5 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">Color Grade</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Professional Adjustments</p>
              </div>
            </div>

            <div className="space-y-6">
              {['brightness', 'contrast', 'saturation', 'hue-rotate', 'blur', 'sepia', 'grayscale'].map((type) => (
                <div key={type} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">{type.replace('-', ' ')}</span>
                    <span className="text-fuchsia-500">
                      {currentLayer?.filters?.[type as keyof typeof currentLayer.filters] || 0}
                      {type === 'blur' ? 'px' : type === 'hue-rotate' ? '°' : '%'}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min={type === 'hue-rotate' ? 0 : type === 'blur' ? 0 : 0}
                    max={type === 'hue-rotate' ? 360 : type === 'blur' ? 20 : 200}
                    value={currentLayer?.filters?.[type as keyof typeof currentLayer.filters] || 0}
                    onChange={(e) => handleColorAdjust(type, parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case EditMode.STYLE_TRANSFER:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                <Palette className="w-5 h-5 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">Style Transfer</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Artistic Neural Filters</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['Cyberpunk', 'Oil Painting', 'Sketch', 'Pop Art', 'Vaporwave', 'Minimalist', 'Noir', 'Gothic'].map((style) => (
                <button 
                  key={style}
                  onClick={() => handleStyleTransfer(style)}
                  disabled={isProcessing}
                  className="group relative aspect-square rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:border-fuchsia-500/50 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Palette className="w-6 h-6 text-white/20 group-hover:text-fuchsia-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{style}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case EditMode.SOCIAL:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                <Maximize className="w-5 h-5 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">Social Presets</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Optimized Aspect Ratios</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'instagram_post', label: 'Instagram Post', ratio: '1:1' },
                { id: 'instagram_story', label: 'Instagram Story', ratio: '9:16' },
                { id: 'youtube_thumb', label: 'YouTube Thumbnail', ratio: '16:9' },
                { id: 'twitter_post', label: 'Twitter Post', ratio: '16:9' },
                { id: 'linkedin_banner', label: 'LinkedIn Banner', ratio: '4:1' },
              ].map((preset) => (
                <button 
                  key={preset.id}
                  onClick={() => handleSocialResize(preset.id)}
                  className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-fuchsia-500/50 transition-all group"
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest">{preset.label}</span>
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{preset.ratio}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-fuchsia-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        );

      case EditMode.CROP:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                <Crop className="w-5 h-5 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">Precision Crop</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Refine Composition</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleCrop}
                className="w-full py-5 bg-white text-black rounded-3xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Check className="w-4 h-4" /> Apply Crop
              </button>
              <button 
                onClick={onCancel}
                className="w-full py-5 bg-white/5 border border-white/10 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        );

      case EditMode.COLLAGE:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                <Layout className="w-5 h-5 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">Collage Engine</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Multi-Image Composition</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['grid', 'mosaic', 'stack', 'freestyle'].map((layout) => (
                <button 
                  key={layout}
                  onClick={() => handleCollage(layout)}
                  className="group flex flex-col items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-fuchsia-500/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layout className="w-6 h-6 text-white/20 group-hover:text-fuchsia-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">{layout}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case EditMode.TRANSFORM:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                <Move className="w-5 h-5 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest">Transform</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Position & Scale</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Scale</label>
                  <input 
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={currentLayer?.scale || 1}
                    onChange={(e) => updateSelectedLayer({ scale: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Rotation</label>
                  <input 
                    type="range"
                    min="0"
                    max="360"
                    value={currentLayer?.rotation || 0}
                    onChange={(e) => updateSelectedLayer({ rotation: parseInt(e.target.value) })}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/30">X Position</label>
                  <input 
                    type="number"
                    value={currentLayer?.x || 0}
                    onChange={(e) => updateSelectedLayer({ x: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-fuchsia-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Y Position</label>
                  <input 
                    type="number"
                    value={currentLayer?.y || 0}
                    onChange={(e) => updateSelectedLayer({ y: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-fuchsia-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
              <Settings2 className="w-8 h-8 text-white/10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest">Select a Tool</h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">To begin editing</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-96 flex flex-col bg-[#0a0a0a]/50 backdrop-blur-3xl border-l border-white/5">
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 border-t border-white/5 space-y-4">
        <button 
          onClick={handleMergeLayers}
          disabled={layers.length < 2 || isProcessing}
          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
        >
          <Layers className="w-4 h-4" /> Merge Layers
        </button>
        <button 
          onClick={handleExport}
          disabled={layers.length === 0 || isProcessing}
          className="w-full py-4 bg-fuchsia-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-fuchsia-600/20"
        >
          <Download className="w-4 h-4" /> Export Result
        </button>
      </div>
    </div>
  );
};
