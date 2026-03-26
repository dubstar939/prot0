import React from 'react';
import { motion, Reorder } from 'motion/react';
import { Eye, EyeOff, Trash2, Layers, Plus, ChevronUp, ChevronDown, Lock, Unlock } from 'lucide-react';
import { Layer } from '../../types';

interface LayerPanelContentProps {
  layers: Layer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayers: (layers: Layer[]) => void;
  onAddLayer: () => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
}

export const LayerPanelContent: React.FC<LayerPanelContentProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onDeleteLayer,
  onReorderLayers,
  onAddLayer,
  onUpdateLayer
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]/50 backdrop-blur-3xl border-l border-white/5 w-80">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
            <Layers className="w-4 h-4 text-fuchsia-500" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest">Layers</h3>
        </div>
        <button 
          onClick={onAddLayer}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Reorder.Group axis="y" values={layers} onReorder={onReorderLayers} className="space-y-2">
          {layers.map((layer) => (
            <Reorder.Item
              key={layer.id}
              value={layer}
              className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                activeLayerId === layer.id 
                  ? 'bg-white/10 border-white/20 shadow-xl shadow-black/20' 
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
              onClick={() => onSelectLayer(layer.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden border border-white/5 flex-shrink-0">
                  <img 
                    src={layer.url} 
                    alt={layer.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold truncate ${activeLayerId === layer.id ? 'text-white' : 'text-white/60'}`}>
                      {layer.name}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
                      >
                        {layer.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-fuchsia-500 transition-all duration-300" 
                        style={{ width: `${layer.opacity}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-black text-white/30 tabular-nums">{layer.opacity}%</span>
                  </div>
                </div>
              </div>

              {activeLayerId === layer.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 pt-4 border-t border-white/5 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Blend Mode</label>
                      <select 
                        value={layer.blendMode}
                        onChange={(e) => onUpdateLayer(layer.id, { blendMode: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-fuchsia-500/50 transition-all"
                      >
                        <option value="normal">Normal</option>
                        <option value="multiply">Multiply</option>
                        <option value="screen">Screen</option>
                        <option value="overlay">Overlay</option>
                        <option value="darken">Darken</option>
                        <option value="lighten">Lighten</option>
                        <option value="color-dodge">Dodge</option>
                        <option value="color-burn">Burn</option>
                        <option value="hard-light">Hard Light</option>
                        <option value="soft-light">Soft Light</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Opacity</label>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={layer.opacity}
                        onChange={(e) => onUpdateLayer(layer.id, { opacity: parseInt(e.target.value) })}
                        className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-fuchsia-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
};
