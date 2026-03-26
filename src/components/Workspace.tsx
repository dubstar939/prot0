import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Upload, History, RotateCcw } from 'lucide-react';
import { Layer, EditMode, TargetResolution } from '../../types';
import { CropOverlay } from './CropOverlay';
import { TransformOverlay } from './TransformOverlay';

interface WorkspaceProps {
  layers: Layer[];
  activeLayerId: string | null;
  activeMode: EditMode;
  targetResolution: TargetResolution;
  isComparing: boolean;
  cropRect: any;
  setCropRect: (rect: any) => void;
  setCropBounds: (bounds: any) => void;
  updateSelectedLayer: (updates: Partial<Layer>) => void;
  resetLayerToOriginal: (id: string) => void;
  setIsComparing: (val: boolean) => void;
  setTargetResolution: (res: TargetResolution) => void;
  handleModeSwitch: (mode: EditMode) => void;
  onImportClick: () => void;
  imageRef: React.RefObject<HTMLImageElement | null>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  layers,
  activeLayerId,
  activeMode,
  targetResolution,
  isComparing,
  cropRect,
  setCropRect,
  setCropBounds,
  updateSelectedLayer,
  resetLayerToOriginal,
  setIsComparing,
  setTargetResolution,
  handleModeSwitch,
  onImportClick,
  imageRef,
  workspaceRef
}) => {
  const currentActiveLayer = layers.find(l => l.id === activeLayerId);

  return (
    <section ref={workspaceRef} className="flex-1 relative bg-[#0a0a0a] flex items-center justify-center p-12 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="relative max-w-full max-h-full shadow-2xl shadow-black/50 group">
        <AnimatePresence mode="wait">
          {layers.length > 0 ? (
            <div className="relative">
              {layers.map((layer, idx) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: layer.isVisible ? (layer.opacity / 100) : 0, 
                    scale: layer.scale || 1,
                    x: layer.x || 0,
                    y: layer.y || 0,
                    rotate: layer.rotation || 0
                  }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    zIndex: layers.length - idx,
                    mixBlendMode: layer.blendMode as any,
                    filter: layer.cssFilter
                  }}
                >
                  <img 
                    src={isComparing && activeLayerId === layer.id ? layer.originalUrl : layer.url} 
                    alt={layer.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              ))}
              
              {currentActiveLayer && (
                <div className="relative z-[100]">
                  <img 
                    ref={imageRef}
                    src={isComparing ? currentActiveLayer.originalUrl : currentActiveLayer.url} 
                    alt="Active Layer"
                    className="max-w-full max-h-[70vh] object-contain opacity-0"
                    onLoad={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setCropBounds({ width: rect.width, height: rect.height, left: rect.left, top: rect.top });
                    }}
                  />
                  
                  {activeMode === EditMode.CROP && (
                    <CropOverlay rect={cropRect} onChange={setCropRect} imageRef={imageRef} />
                  )}
                  
                  {activeMode === EditMode.TRANSFORM && (
                    <TransformOverlay 
                      layer={currentActiveLayer} 
                      onChange={updateSelectedLayer} 
                      imageRef={imageRef} 
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-fuchsia-600/20 to-purple-600/20 border border-white/5 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-fuchsia-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter">Start your creation</h2>
                <p className="text-white/40 text-sm max-w-xs">Upload an image or use neural generation to begin your masterpiece.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={onImportClick}
                  className="px-8 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
                >
                  <Upload className="w-4 h-4" /> Import Image
                </button>
                <button 
                  onClick={() => handleModeSwitch(EditMode.GENERATE)}
                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
                >
                  <Sparkles className="w-4 h-4" /> Neural Draft
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-2 pr-6 border-r border-white/10">
          <button 
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Compare with Original"
          >
            <History className="w-5 h-5" />
          </button>
          <button 
            onClick={() => currentActiveLayer && resetLayerToOriginal(currentActiveLayer.id)}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
            title="Reset Layer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Resolution</span>
            <select 
              value={targetResolution}
              onChange={(e) => setTargetResolution(e.target.value as TargetResolution)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer hover:text-fuchsia-400 transition-colors"
            >
              <option value="1K">1K Standard</option>
              <option value="2K">2K High-Res</option>
              <option value="4K">4K Ultra-HD</option>
            </select>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Active Mode</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-500">{activeMode}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
