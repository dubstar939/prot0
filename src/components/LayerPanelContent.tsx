/**
 * @fileoverview LayerPanelContent component.
 * Displays the stack of layers and groups, allowing for management and reordering.
 */

import React from 'react';
import { EditMode, Layer, LayerGroup } from '../../types';
import { LayerItem } from './LayerItem';

interface LayerPanelContentProps {
  activeMode: EditMode;
  layers: Layer[];
  groups: LayerGroup[];
  activeLayerId: string | null;
  selectedLayerIds: string[];
  isComparing: boolean;
  createGroup: () => void;
  mergeLayers: () => void;
  duplicateLayer: (id: string) => void;
  toggleGroupCollapse: (id: string) => void;
  setActiveLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent, id: string) => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
  setSelectedLayerIds: (ids: string[]) => void;
}

/**
 * Component for the layers management panel.
 * 
 * @param {LayerPanelContentProps} props - Component properties.
 * @returns {JSX.Element} The rendered layer panel.
 */
const LayerPanelContent: React.FC<LayerPanelContentProps> = ({
  activeMode,
  layers,
  groups,
  activeLayerId,
  selectedLayerIds,
  isComparing,
  createGroup,
  mergeLayers,
  duplicateLayer,
  toggleGroupCollapse,
  setActiveLayer,
  updateLayer,
  deleteLayer,
  moveLayer,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setSelectedLayerIds,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-900/95 md:bg-slate-900 backdrop-blur-sm overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Your Stack</h3>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Manage your layers</p>
        </div>
        <div className="flex gap-2">
           <button onClick={createGroup} className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-fuchsia-400 transition-all border border-slate-700">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
           </button>
           <button onClick={mergeLayers} className="px-4 py-2 text-[10px] font-black text-fuchsia-400 uppercase border border-fuchsia-500/20 rounded-xl hover:bg-fuchsia-500/10 transition-all active:scale-95">Flatten</button>
        </div>
      </div>
      
      {activeMode === EditMode.COLLAGE && (
        <div className="bg-fuchsia-600/5 px-5 py-3 border-b border-fuchsia-500/20 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase text-fuchsia-400">Composition Mode</span>
          <div className="flex gap-2">
             <button onClick={() => setSelectedLayerIds(layers.map(l => l.id))} className="text-[8px] font-black uppercase text-slate-400 hover:text-white">All</button>
             <button onClick={() => setSelectedLayerIds([])} className="text-[8px] font-black uppercase text-slate-400 hover:text-white">None</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {groups.map(group => {
          const groupLayers = layers.filter(l => l.groupId === group.id);
          return (
            <div key={group.id} className={`space-y-1 transition-all rounded-2xl ${!group.isCollapsed ? 'bg-slate-800/20 pb-2' : ''}`}>
              <div 
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800/50 group/group-header transition-colors ${!group.isCollapsed ? 'bg-slate-800/40' : 'bg-slate-800/10'}`} 
                onClick={() => toggleGroupCollapse(group.id)}
              >
                <div className="flex items-center gap-2.5 flex-1">
                  <svg className={`w-3 h-3 text-slate-500 transition-transform duration-300 ${group.isCollapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  <div className="relative">
                    <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex-1">{group.name}</span>
                </div>
              </div>
              {!group.isCollapsed && (
                <div className="pl-4 space-y-3 py-1 border-l-2 border-slate-700/50 ml-4.5 animate-in slide-in-from-top-2 duration-200">
                  {groupLayers.length > 0 ? groupLayers.map(l => (
                    <LayerItem 
                      key={l.id} 
                      layer={l} 
                      isActive={activeLayerId === l.id}
                      isSelected={selectedLayerIds.includes(l.id)}
                      isComparing={isComparing}
                      onSelect={setActiveLayer}
                      onUpdate={updateLayer}
                      onDelete={deleteLayer}
                      onMove={moveLayer}
                      onDuplicate={duplicateLayer}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  )) : <p className="text-[9px] text-slate-600 italic px-4 py-2 border border-dashed border-slate-800 rounded-xl">Empty Folder</p>}
                </div>
              )}
            </div>
          );
        })}
        <div className="space-y-3 pt-2">
          {layers.filter(l => !l.groupId).map(l => (
            <LayerItem 
              key={l.id} 
              layer={l} 
              isActive={activeLayerId === l.id}
              isSelected={selectedLayerIds.includes(l.id)}
              isComparing={isComparing}
              onSelect={setActiveLayer}
              onUpdate={updateLayer}
              onDelete={deleteLayer}
              onMove={moveLayer}
              onDuplicate={duplicateLayer}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LayerPanelContent;
