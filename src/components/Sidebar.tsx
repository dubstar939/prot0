import React from 'react';
import { EditMode } from '../../types';
import { Sparkles, Sliders, Palette, Crop, Maximize, Layout, Move } from 'lucide-react';

interface SidebarProps {
  activeMode: EditMode;
  onModeSwitch: (mode: EditMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMode, onModeSwitch }) => {
  const tools = [
    { mode: EditMode.GENERATE, icon: <Sparkles />, label: 'Neural' },
    { mode: EditMode.COLOR, icon: <Sliders />, label: 'Color' },
    { mode: EditMode.STYLE_TRANSFER, icon: <Palette />, label: 'Style' },
    { mode: EditMode.CROP, icon: <Crop />, label: 'Crop' },
    { mode: EditMode.SOCIAL, icon: <Maximize />, label: 'Social' },
    { mode: EditMode.COLLAGE, icon: <Layout />, label: 'Collage' },
    { mode: EditMode.TRANSFORM, icon: <Move />, label: 'Move' },
  ];

  return (
    <aside className="hidden md:flex w-20 flex-col items-center py-6 gap-6 border-r border-white/5 bg-black/20">
      {tools.map(tool => (
        <button
          key={tool.mode}
          onClick={() => onModeSwitch(tool.mode)}
          className={`group flex flex-col items-center gap-2 transition-all ${activeMode === tool.mode ? 'text-fuchsia-500' : 'text-white/30 hover:text-white'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeMode === tool.mode ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/5' : 'bg-white/5 border border-transparent group-hover:bg-white/10'}`}>
            {React.cloneElement(tool.icon as React.ReactElement, { className: 'w-5 h-5' })}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">{tool.label}</span>
        </button>
      ))}
    </aside>
  );
};
