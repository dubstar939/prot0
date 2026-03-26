import React, { useState, useEffect } from 'react';

/**
 * @fileoverview Crop Overlay Component.
 * Provides interactive handles for cropping an image.
 */

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropOverlayProps {
  /** The current crop rectangle in percentages (0-100). */
  rect: CropRect;
  /** Callback triggered when the crop rectangle changes. */
  onChange: (rect: CropRect) => void;
  /** Reference to the underlying image element for coordinate calculations. */
  imageRef: React.RefObject<HTMLImageElement>;
}

/**
 * Renders an interactive crop overlay with handles and rule-of-thirds grid.
 * 
 * @param {CropOverlayProps} props - Component props.
 * @returns {JSX.Element} The rendered crop overlay.
 */
export const CropOverlay: React.FC<CropOverlayProps> = ({ rect, onChange, imageRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startRect, setStartRect] = useState(rect);

  const handleStart = (clientX: number, clientY: number, type: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    setIsDragging(true);
    setDragType(type);
    setStartPos({ x: clientX, y: clientY });
    setStartRect(rect);
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !imageRef.current) return;
      
      const bounds = imageRef.current.getBoundingClientRect();
      const dx = ((clientX - startPos.x) / bounds.width) * 100;
      const dy = ((clientY - startPos.y) / bounds.height) * 100;

      let newRect = { ...startRect };
      
      if (dragType === 'move') {
        newRect.x = Math.max(0, Math.min(100 - startRect.width, startRect.x + dx));
        newRect.y = Math.max(0, Math.min(100 - startRect.height, startRect.y + dy));
      } else if (dragType === 'nw') {
        newRect.x = Math.max(0, Math.min(startRect.x + startRect.width - 5, startRect.x + dx));
        newRect.y = Math.max(0, Math.min(startRect.y + startRect.height - 5, startRect.y + dy));
        newRect.width = startRect.width - (newRect.x - startRect.x);
        newRect.height = startRect.height - (newRect.y - startRect.y);
      } else if (dragType === 'ne') {
        newRect.y = Math.max(0, Math.min(startRect.y + startRect.height - 5, startRect.y + dy));
        newRect.width = Math.max(5, Math.min(100 - startRect.x, startRect.width + dx));
        newRect.height = startRect.height - (newRect.y - startRect.y);
      } else if (dragType === 'sw') {
        newRect.x = Math.max(0, Math.min(startRect.x + startRect.width - 5, startRect.x + dx));
        newRect.width = startRect.width - (newRect.x - startRect.x);
        newRect.height = Math.max(5, Math.min(100 - startRect.y, startRect.height + dy));
      } else if (dragType === 'se') {
        newRect.width = Math.max(5, Math.min(100 - startRect.x, startRect.width + dx));
        newRect.height = Math.max(5, Math.min(100 - startRect.y, startRect.height + dy));
      }
      
      onChange(newRect);
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, dragType, startPos, startRect, onChange, imageRef]);

  const handles = [
    { type: 'nw', class: '-top-2 -left-2 cursor-nw-resize' },
    { type: 'ne', class: '-top-2 -right-2 cursor-ne-resize' },
    { type: 'sw', class: '-bottom-2 -left-2 cursor-sw-resize' },
    { type: 'se', class: '-bottom-2 -right-2 cursor-se-resize' },
  ] as const;

  return (
    <div 
      className="absolute border-2 border-fuchsia-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move z-50"
      style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
      onMouseDown={(e) => { e.stopPropagation(); handleStart(e.clientX, e.clientY, 'move'); }}
      onTouchStart={(e) => { e.stopPropagation(); handleStart(e.touches[0].clientX, e.touches[0].clientY, 'move'); }}
    >
      {/* Rule of Thirds Grid */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
        <div className="border-r border-b border-white/50" />
        <div className="border-r border-b border-white/50" />
        <div className="border-b border-white/50" />
        <div className="border-r border-b border-white/50" />
        <div className="border-r border-b border-white/50" />
        <div className="border-b border-white/50" />
        <div className="border-r border-white/50" />
        <div className="border-r border-white/50" />
        <div />
      </div>

      {/* Resize Handles */}
      {handles.map(handle => (
        <div 
          key={handle.type}
          className={`absolute w-5 h-5 bg-white border-2 border-fuchsia-500 rounded-full shadow-lg transition-transform hover:scale-125 ${handle.class}`}
          onMouseDown={(e) => { e.stopPropagation(); handleStart(e.clientX, e.clientY, handle.type); }}
          onTouchStart={(e) => { e.stopPropagation(); handleStart(e.touches[0].clientX, e.touches[0].clientY, handle.type); }}
        />
      ))}
    </div>
  );
};
