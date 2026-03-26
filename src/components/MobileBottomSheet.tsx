/**
 * @fileoverview MobileBottomSheet component.
 * Provides a slide-up panel for mobile interactions.
 */

import React from 'react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Component for a mobile bottom sheet panel.
 * 
 * @param {MobileBottomSheetProps} props - Component properties.
 * @returns {JSX.Element | null} The rendered bottom sheet or null if not open.
 */
const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-slate-900 rounded-t-[2.5rem] border-t border-white/5 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-400 ease-out shadow-2xl">
        <div className="w-full flex justify-center py-4 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
        </div>
        <div className="px-8 pb-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h4>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomSheet;
