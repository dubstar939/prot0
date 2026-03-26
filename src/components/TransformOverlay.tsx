import React, { useState, useEffect } from 'react';
import { Layer } from '../../types';

/**
 * @fileoverview Transform Overlay Component.
 * Provides interactive handles for moving, scaling, and rotating layers.
 */

interface TransformOverlayProps {
  /** The layer being transformed. */
  layer: Layer;
  /** Callback triggered when the layer's transform properties change. */
  onChange: (updates: Partial<Layer>) => void;
  /** Reference to the underlying image element for coordinate calculations. */
  imageRef: React.RefObject<HTMLImageElement>;
}

/**
 * Renders an interactive transform overlay with handles for position, scale, and rotation.
 * 
 * @param {TransformOverlayProps} props - Component props.
 * @returns {JSX.Element} The rendered transform overlay.
 */
export const TransformOverlay: React.FC<TransformOverlayProps> = ({ layer, onChange, imageRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'scale' | 'rotate' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startLayer, setStartLayer] = useState(layer);

  const handleStart = (clientX: number, clientY: number, type: 'move' | 'scale' | 'rotate') => {
    setIsDragging(true);
    setDragType(type);
    setStartPos({ x: clientX, y: clientY });
    setStartLayer(layer);
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !imageRef.current) return;
      
      const dx = clientX - startPos.x;
      const dy = clientY - startPos.y;

      if (dragType === 'move') {
        onChange({
          x: (startLayer.x || 0) + dx,
          y: (startLayer.y || 0) + dy
        });
      } else if (dragType === 'scale') {
        const scaleChange = dx / 100;
        onChange({
          scale: Math.max(0.1, (startLayer.scale || 1) + scaleChange)
        });
      } else if (dragType === 'rotate') {
        const rotationChange = dx;
        onChange({
          rotation: (startLayer.rotation || 0) + rotationChange
        });
      }
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
  }, [isDragging, dragType, startPos, startLayer, onChange, imageRef]);

  return (
    <div 
      className="absolute border-2 border-dashed border-fuchsia-500/50 z-50 pointer-events-none"
      style={{ 
        width: '100%', 
        height: '100%',
        transform: `translate(${layer.x || 0}px, ${layer.y || 0}px) scale(${layer.scale || 1}) rotate(${layer.rotation || 0}deg)`
      }}
    >
      {/* Move Area */}
      <div 
        className="absolute inset-0 cursor-move pointer-events-auto"
        onMouseDown={(e) => { e.stopPropagation(); handleStart(e.clientX, e.clientY, 'move'); }}
        onTouchStart={(e) => { e.stopPropagation(); handleStart(e.touches[0].clientX, e.touches[0].clientY, 'move'); }}
      />
      
      {/* Scale Handle */}
      <div 
        className="absolute -bottom-3 -right-3 w-8 h-8 bg-white border-2 border-fuchsia-500 rounded-full shadow-lg flex items-center justify-center cursor-se-resize pointer-events-auto transition-transform hover:scale-110"
        onMouseDown={(e) => { e.stopPropagation(); handleStart(e.clientX, e.clientY, 'scale'); }}
        onTouchStart={(e) => { e.stopPropagation(); handleStart(e.touches[0].clientX, e.touches[0].clientY, 'scale'); }}
      >
        <span className="text-[10px]">↔️</span>
      </div>

      {/* Rotate Handle */}
      <div 
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-fuchsia-500 rounded-full shadow-lg flex items-center justify-center cursor-alias pointer-events-auto transition-transform hover:scale-110"
        onMouseDown={(e) => { e.stopPropagation(); handleStart(e.clientX, e.clientY, 'rotate'); }}
        onTouchStart={(e) => { e.stopPropagation(); handleStart(e.touches[0].clientX, e.touches[0].clientY, 'rotate'); }}
      >
        <span className="text-[10px]">🔄</span>
      </div>
    </div>
  );
};
