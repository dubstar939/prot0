import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, History, RotateCcw, Layers, Plus, AlertCircle, X
} from 'lucide-react';
import { useAppState } from './src/hooks/useAppState';
import { EditMode, Layer } from './types';
import { generateImage } from './src/services/geminiService';
import { mergeLayersToDataUrl } from './src/services/canvasService';
import { applyFiltersToImage, createCollage } from './services/localImageService';

// New Components
import { Sidebar } from './src/components/Sidebar';
import { Workspace } from './src/components/Workspace';
import { ContextualPanel } from './src/components/ContextualPanel';
import { LayerPanelContent } from './src/components/LayerPanelContent';

/**
 * @fileoverview Main application component for Neural Canvas.
 * Orchestrates the overall layout, state management, and high-level handlers.
 * Refactored for readability, simplicity, and performance.
 */
const App: React.FC = () => {
  const {
    state,
    setState,
    prompt,
    setPrompt,
    showLayers,
    setShowLayers,
    isComparing,
    setIsComparing,
    cropRect,
    setCropRect,
    cropBounds,
    setCropBounds,
    addToHistory,
    undo,
    redo,
    deleteLayer,
    updateLayer,
    updateSelectedLayer,
    setActiveLayerId,
    handleModeSwitch,
    resetLayerToOriginal,
    setIsProcessing,
    setError,
    toggleLayerVisibility
  } = useAppState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  /**
   * Handles local image file uploads.
   * Captures image dimensions at import time to optimize future canvas operations.
   */
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        
        const img = new Image();
        img.onload = () => {
          const newLayer: Layer = {
            id: Date.now().toString(),
            url: dataUrl,
            originalUrl: dataUrl,
            opacity: 100,
            isVisible: true,
            name: file.name,
            blendMode: 'normal',
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            width: img.naturalWidth,
            height: img.naturalHeight,
            filters: {
              brightness: 100,
              contrast: 100,
              saturation: 100,
              'hue-rotate': 0,
              blur: 0,
              sepia: 0,
              grayscale: 0
            }
          };
          addToHistory([newLayer, ...state.layers], newLayer.id, 'Import Image');
          setIsProcessing(false);
        };
        img.onerror = () => {
          setError('Failed to decode image dimensions.');
          setIsProcessing(false);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image.');
      setIsProcessing(false);
    }
  }, [state.layers, addToHistory, setIsProcessing, setError]);

  /**
   * Triggers neural image generation via Gemini API.
   */
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await generateImage(prompt, state.targetResolution);
      
      const dim = state.targetResolution === '4K' ? 4096 : state.targetResolution === '2K' ? 2048 : 1024;
      
      const newLayer: Layer = {
        id: Date.now().toString(),
        url: result,
        originalUrl: result,
        opacity: 100,
        isVisible: true,
        name: `AI: ${prompt.slice(0, 20)}...`,
        blendMode: 'normal',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        width: dim,
        height: dim,
        neuralPrompt: prompt,
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          'hue-rotate': 0,
          blur: 0,
          sepia: 0,
          grayscale: 0
        }
      };
      
      addToHistory([newLayer, ...state.layers], newLayer.id, 'AI Generate');
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Neural synthesis failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [prompt, state.targetResolution, state.layers, addToHistory, setPrompt, setIsProcessing, setError]);

  /**
   * Adjusts color properties of the selected layer.
   * Uses optimistic UI updates for immediate feedback.
   */
  const handleColorAdjust = useCallback(async (type: string, value: number) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (!activeLayer) return;

    const newFilters = { ...activeLayer.filters, [type]: value };
    
    // Optimistically update UI
    updateSelectedLayer({ filters: newFilters });

    try {
      const filteredUrl = await applyFiltersToImage(activeLayer.originalUrl, newFilters);
      updateSelectedLayer({ url: filteredUrl });
    } catch (err) {
      console.error('Filter application failed:', err);
    }
  }, [state.layers, state.activeLayerId, updateSelectedLayer]);

  /**
   * Applies artistic style transfer to the selected layer.
   */
  const handleStyleTransfer = useCallback(async (style: string) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (!activeLayer) return;

    setIsProcessing(true);
    setError(null);

    try {
      const styledUrl = await generateImage(
        `Apply ${style} artistic style to this image while preserving its core structure and content.`,
        state.targetResolution,
        activeLayer.url
      );
      
      const newLayer: Layer = {
        id: Date.now().toString(),
        url: styledUrl,
        originalUrl: styledUrl,
        opacity: 100,
        isVisible: true,
        name: `${style}: ${activeLayer.name}`,
        blendMode: 'normal',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        width: activeLayer.width,
        height: activeLayer.height,
        filters: { ...activeLayer.filters }
      };
      
      addToHistory([newLayer, ...state.layers], newLayer.id, `Style Transfer: ${style}`);
    } catch (err: any) {
      setError(err.message || 'Style transfer failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [state.layers, state.activeLayerId, state.targetResolution, addToHistory, setIsProcessing, setError]);

  /**
   * Resizes and expands the image for social media aspect ratios using generative fill.
   */
  const handleSocialResize = useCallback(async (platform: string) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (!activeLayer) return;

    setIsProcessing(true);
    setError(null);

    try {
      const resizedUrl = await generateImage(
        `Expand and resize this image for ${platform.replace('_', ' ')} aspect ratio. Use generative fill to complete the edges naturally.`,
        state.targetResolution,
        activeLayer.url
      );
      
      let w = 1024, h = 1024;
      if (platform.includes('story')) { w = 1080; h = 1920; }
      else if (platform.includes('thumb') || platform.includes('twitter')) { w = 1920; h = 1080; }
      else if (platform.includes('banner')) { w = 1584; h = 396; }

      const newLayer: Layer = {
        id: Date.now().toString(),
        url: resizedUrl,
        originalUrl: resizedUrl,
        opacity: 100,
        isVisible: true,
        name: `${platform.split('_')[0]} Resize`,
        blendMode: 'normal',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        width: w,
        height: h,
        filters: { ...activeLayer.filters }
      };
      
      addToHistory([newLayer, ...state.layers], newLayer.id, `Social Resize: ${platform}`);
    } catch (err: any) {
      setError(err.message || 'Social resize failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [state.layers, state.activeLayerId, state.targetResolution, addToHistory, setIsProcessing, setError]);

  /**
   * Crops the selected layer based on the workspace overlay.
   */
  const handleCrop = useCallback(async () => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (!activeLayer || !imageRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = activeLayer.url;
      });

      const scaleX = img.width / cropBounds.width;
      const scaleY = img.height / cropBounds.height;

      const cropX = cropRect.x * (cropBounds.width / 100) * scaleX;
      const cropY = cropRect.y * (cropBounds.height / 100) * scaleY;
      const cropW = cropRect.width * (cropBounds.width / 100) * scaleX;
      const cropH = cropRect.height * (cropBounds.height / 100) * scaleY;

      canvas.width = cropW;
      canvas.height = cropH;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const croppedUrl = canvas.toDataURL('image/png', 1.0);
      
      const newLayer: Layer = {
        id: Date.now().toString(),
        url: croppedUrl,
        originalUrl: croppedUrl,
        opacity: 100,
        isVisible: true,
        name: `Crop: ${activeLayer.name}`,
        blendMode: 'normal',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        width: cropW,
        height: cropH,
        filters: { ...activeLayer.filters }
      };
      
      addToHistory([newLayer, ...state.layers], newLayer.id, 'Crop Image');
      handleModeSwitch(EditMode.TRANSFORM);
    } catch (err) {
      setError('Crop failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [state.layers, state.activeLayerId, cropRect, cropBounds, addToHistory, handleModeSwitch, setIsProcessing, setError]);

  /**
   * Creates a collage from visible layers.
   */
  const handleCollage = useCallback(async (layout: string) => {
    const visibleLayers = state.layers.filter(l => l.isVisible);
    if (visibleLayers.length < 2) {
      setError('Need at least 2 visible layers for a collage.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const collageUrl = await createCollage(visibleLayers, layout as any);
      const newLayer: Layer = {
        id: Date.now().toString(),
        url: collageUrl,
        originalUrl: collageUrl,
        opacity: 100,
        isVisible: true,
        name: `Collage: ${layout}`,
        blendMode: 'normal',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        width: 2000,
        height: 2000,
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          'hue-rotate': 0,
          blur: 0,
          sepia: 0,
          grayscale: 0
        }
      };
      addToHistory([newLayer, ...state.layers], newLayer.id, 'Create Collage');
    } catch (err) {
      setError('Collage creation failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [state.layers, addToHistory, setIsProcessing, setError]);

  /**
   * Merges all visible layers into a single composition.
   */
  const handleMergeLayers = useCallback(async () => {
    if (state.layers.length < 2) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const maxWidth = Math.max(...state.layers.map(l => l.width || 0));
      const maxHeight = Math.max(...state.layers.map(l => l.height || 0));
      const mergedUrl = await mergeLayersToDataUrl(state.layers, maxWidth, maxHeight);
      
      const newLayer: Layer = {
        id: Date.now().toString(),
        url: mergedUrl,
        originalUrl: mergedUrl,
        opacity: 100,
        isVisible: true,
        name: 'Merged Composition',
        blendMode: 'normal',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        width: maxWidth,
        height: maxHeight,
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          'hue-rotate': 0,
          blur: 0,
          sepia: 0,
          grayscale: 0
        }
      };
      
      addToHistory([newLayer, ...state.layers], newLayer.id, 'Merge Layers');
    } catch (err) {
      setError('Layer merge failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [state.layers, addToHistory, setIsProcessing, setError]);

  /**
   * Exports the final composition as a downloadable image.
   */
  const handleExport = useCallback(async () => {
    if (state.layers.length === 0) return;
    
    setIsProcessing(true);
    try {
      const maxWidth = Math.max(...state.layers.map(l => l.width || 0));
      const maxHeight = Math.max(...state.layers.map(l => l.height || 0));
      const finalUrl = await mergeLayersToDataUrl(state.layers, maxWidth, maxHeight);
      const link = document.createElement('a');
      link.href = finalUrl;
      link.download = `neural-canvas-export-${Date.now()}.png`;
      link.click();
    } catch (err) {
      setError('Export failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [state.layers, setIsProcessing, setError]);

  // --- Render ---

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-fuchsia-500/30">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      <Sidebar 
        activeMode={state.activeMode} 
        onModeSwitch={handleModeSwitch} 
      />

      <main className="flex-1 flex flex-col relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-xl z-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.2em]">Neural Canvas</h1>
              <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">v2.5 Professional</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/5">
              <button 
                onClick={undo}
                disabled={state.historyIndex >= state.history.length - 1}
                className="p-2.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all disabled:opacity-20"
                title="Undo (Ctrl+Z)"
              >
                <History className="w-4 h-4" />
              </button>
              <button 
                onClick={redo}
                disabled={state.historyIndex === 0}
                className="p-2.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all disabled:opacity-20"
                title="Redo (Ctrl+Y)"
              >
                <RotateCcw className="w-4 h-4 scale-x-[-1]" />
              </button>
            </div>
            <button 
              onClick={() => setShowLayers(!showLayers)}
              className={`p-3 rounded-2xl transition-all ${showLayers ? 'bg-fuchsia-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              <Layers className="w-5 h-5" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Import
            </button>
          </div>
        </header>

        <Workspace 
          layers={state.layers}
          activeLayerId={state.activeLayerId}
          activeMode={state.activeMode}
          targetResolution={state.targetResolution}
          isComparing={isComparing}
          cropRect={cropRect}
          setCropRect={setCropRect}
          setCropBounds={setCropBounds}
          updateSelectedLayer={updateSelectedLayer}
          resetLayerToOriginal={resetLayerToOriginal}
          setIsComparing={setIsComparing}
          setTargetResolution={(res) => setState(prev => ({ ...prev, targetResolution: res }))}
          handleModeSwitch={handleModeSwitch}
          onImportClick={() => fileInputRef.current?.click()}
          imageRef={imageRef}
          workspaceRef={workspaceRef}
        />

        <AnimatePresence>
          {state.error && (
            <motion.div 
              initial={{ opacity: 0, y: 20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="absolute bottom-32 left-1/2 flex items-center gap-3 bg-red-500/10 border border-red-500/20 backdrop-blur-2xl px-6 py-4 rounded-2xl text-red-400 text-xs font-bold z-[200]"
            >
              <AlertCircle className="w-4 h-4" />
              {state.error}
              <button onClick={() => setError(null)} className="ml-4 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="flex h-full">
        <AnimatePresence>
          {showLayers && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <LayerPanelContent 
                layers={state.layers}
                activeLayerId={state.activeLayerId}
                onSelectLayer={setActiveLayerId}
                onToggleVisibility={toggleLayerVisibility}
                onDeleteLayer={deleteLayer}
                onReorderLayers={(layers) => addToHistory(layers, state.activeLayerId, 'Reorder Layers')}
                onAddLayer={() => fileInputRef.current?.click()}
                onUpdateLayer={updateLayer}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ContextualPanel 
          activeMode={state.activeMode}
          activeLayerId={state.activeLayerId}
          layers={state.layers}
          isProcessing={state.isProcessing}
          prompt={prompt}
          setPrompt={setPrompt}
          handleGenerate={handleGenerate}
          handleColorAdjust={handleColorAdjust}
          handleStyleTransfer={handleStyleTransfer}
          handleSocialResize={handleSocialResize}
          handleCrop={handleCrop}
          handleCollage={handleCollage}
          handleExport={handleExport}
          handleMergeLayers={handleMergeLayers}
          updateSelectedLayer={updateSelectedLayer}
          onCancel={() => handleModeSwitch(EditMode.TRANSFORM)}
        />
      </div>
    </div>
  );
};

export default App;
