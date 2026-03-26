import React from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Lock, 
  Unlock, 
  Type, 
  Image as ImageIcon, 
  Group 
} from 'lucide-react';
import { Layer, LayerGroup } from '../../types';

/**
 * Props for the LayerItem component.
 * 
 * @interface LayerItemProps
 * @property {Layer} layer - The layer to display.
 * @property {boolean} isActive - Whether the layer is currently active.
 * @property {boolean} isSelected - Whether the layer is currently selected.
 * @property {(id: string) => void} onSelect - Callback when the layer is selected.
 * @property {(id: string, updates: Partial<Layer>) => void} onUpdate - Callback to update the layer.
 * @property {(id: string) => void} onDelete - Callback to delete the layer.
 * @property {(id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void} onMove - Callback to move the layer.
 * @property {(id: string) => void} onDuplicate - Callback to duplicate the layer.
 * @property {(id: string) => void} onDragStart - Callback when dragging starts.
 * @property {(id: string) => void} onDragOver - Callback when dragging over.
 * @property {(id: string) => void} onDrop - Callback when dropping.
 */
/**
 * Props for the LayerItem component.
 * 
 * @interface LayerItemProps
 * @property {Layer} layer - The layer to display.
 * @property {boolean} isActive - Whether the layer is currently active.
 * @property {boolean} isSelected - Whether the layer is currently selected.
 * @property {boolean} isComparing - Whether comparison mode is active.
 * @property {(id: string) => void} onSelect - Callback when the layer is selected.
 * @property {(id: string, updates: Partial<Layer>) => void} onUpdate - Callback to update the layer.
 * @property {(id: string) => void} onDelete - Callback to delete the layer.
 * @property {(id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void} onMove - Callback to move the layer.
 * @property {(id: string) => void} onDuplicate - Callback to duplicate the layer.
 * @property {(id: string) => void} onDragStart - Callback when dragging starts.
 * @property {(id: string) => void} onDragOver - Callback when dragging over.
 * @property {(id: string) => void} onDrop - Callback when dropping.
 */
interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  isSelected: boolean;
  isComparing: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Layer>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onDuplicate: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
}

/**
 * A component representing a single layer in the layers list.
 * 
 * @param {LayerItemProps} props - The component props.
 * @returns {JSX.Element} The rendered LayerItem component.
 */
export const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  isActive,
  isSelected,
  isComparing,
  onSelect,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(layer.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(layer.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(layer.id);
      }}
      onClick={() => onSelect(layer.id)}
      className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
        isActive 
          ? 'bg-white/10 border-white/20 shadow-lg' 
          : isSelected
            ? 'bg-white/5 border-white/10'
            : 'border-transparent hover:bg-white/5'
      }`}
    >
      {/* Layer Thumbnail/Icon */}
      <div className="relative w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
        <img 
          src={isComparing && isActive ? layer.originalUrl : layer.url} 
          alt={layer.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Layer Index Badge */}
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded bg-black/60 flex items-center justify-center text-[10px] font-medium text-white/60">
          IMG
        </div>
      </div>

      {/* Layer Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-white/70'}`}>
            {layer.name}
          </span>
          {/* Add lock icon if you add a locked property to Layer interface later */}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">
            {Math.round(layer.opacity * 100)}% Opacity
          </span>
          {layer.blendMode !== 'normal' && (
            <span className="text-[10px] px-1 rounded bg-white/10 text-white/60 uppercase tracking-wider">
              {layer.blendMode}
            </span>
          )}
        </div>
      </div>

      {/* Layer Actions */}
      <div className={`flex items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(layer.id, { isVisible: !layer.isVisible });
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title={layer.isVisible ? 'Hide Layer' : 'Show Layer'}
        >
          {layer.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(layer.id);
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Duplicate Layer"
        >
          <Copy className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-0.5" />
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(layer.id, 'up');
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Move Up"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(layer.id, 'down');
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Move Down"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(layer.id);
          }}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
          title="Delete Layer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
      )}
    </div>
  );
};
