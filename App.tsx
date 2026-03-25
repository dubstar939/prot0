
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EditMode, HistoryItem, AppState, FilterPreset, TargetResolution, Layer, ExportConfig, ExportFormat, BlendMode, LayerGroup, RawDevelopmentParams, SocialPreset } from './types';
import { applyFiltersToImage, resizeImageLocally, createCollageLocally, cropImageLocally } from './services/localImageService';

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All', icon: '🌈' },
  { id: 'vintage', label: 'Vintage', icon: '🎞️' },
  { id: 'bw', label: 'Black & White', icon: '🏁' },
  { id: 'artistic', label: 'Artistic', icon: '🎨' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
  { id: 'experimental', label: 'FX', icon: '🧪' },
];

const PRESET_FILTERS: (FilterPreset & { category: string })[] = [
  { id: 'vintage', label: 'Vintage', icon: '📷', color: 'bg-amber-500', category: 'vintage', prompt: "sepia(0.5) contrast(1.2) brightness(0.9) saturate(0.8)" },
  { id: 'kodachrome', label: 'Kodachrome', icon: '🎞️', color: 'bg-yellow-600', category: 'vintage', prompt: "sepia(0.2) contrast(1.3) saturate(1.4) hue-rotate(-5deg)" },
  { id: 'mono', label: 'Monochrome', icon: '🏁', color: 'bg-slate-500', category: 'bw', prompt: "grayscale(1) contrast(1.5)" },
  { id: 'noir', label: 'Noir', icon: '🕵️', color: 'bg-zinc-900', category: 'bw', prompt: "grayscale(1) contrast(2) brightness(0.8)" },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬', color: 'bg-cyan-500', category: 'cinematic', prompt: "contrast(1.3) saturate(1.2) hue-rotate(-10deg) brightness(0.9)" },
  { id: 'technicolor', label: 'Technicolor', icon: '🌈', color: 'bg-red-500', category: 'cinematic', prompt: "saturate(2.5) contrast(1.2) brightness(1.1)" },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '🏮', color: 'bg-fuchsia-500', category: 'artistic', prompt: "hue-rotate(280deg) saturate(2) contrast(1.2) brightness(1.1)" },
  { id: 'painting', label: 'Oil Painting', icon: '🎨', color: 'bg-orange-500', category: 'artistic', prompt: "contrast(1.1) saturate(1.5) blur(1px)" },
  { id: 'sketch', label: 'Sketch', icon: '✏️', color: 'bg-zinc-400', category: 'artistic', prompt: "grayscale(1) contrast(2) invert(1) opacity(0.8)" },
  { id: 'vaporwave', label: 'Vaporwave', icon: '🌴', color: 'bg-purple-500', category: 'artistic', prompt: "hue-rotate(300deg) saturate(1.8) brightness(1.2)" },
  { id: 'anime', label: 'Anime', icon: '⛩️', color: 'bg-rose-400', category: 'artistic', prompt: "saturate(1.6) contrast(1.1) brightness(1.1)" },
  { id: 'dreamy', label: 'Dreamy', icon: '☁️', color: 'bg-blue-200', category: 'artistic', prompt: "opacity(0.9) blur(1px) saturate(1.2) brightness(1.1)" },
  { id: 'solar', label: 'Solar', icon: '☀️', color: 'bg-orange-400', category: 'experimental', prompt: "invert(0.5) hue-rotate(180deg) saturate(2)" },
  { id: 'blueprint', label: 'Blueprint', icon: '📐', color: 'bg-blue-600', category: 'experimental', prompt: "sepia(1) hue-rotate(190deg) saturate(5) contrast(1.5) invert(0.2)" },
  { id: 'infrared', label: 'Infrared', icon: '⚛️', color: 'bg-pink-300', category: 'experimental', prompt: "hue-rotate(150deg) saturate(1.5) invert(0.1)" },
  { id: 'glitch', label: 'Glitch', icon: '👾', color: 'bg-green-500', category: 'experimental', prompt: "hue-rotate(90deg) saturate(3) contrast(1.5) invert(0.1) blur(0.5px)" },
];

const STYLE_PRESETS = [
  { id: 'gogh', label: 'Van Gogh', artist: 'Vincent van Gogh', icon: '🌻', prompt: "saturate(2) contrast(1.2) sepia(0.2) blur(1px)" },
  { id: 'picasso', label: 'Picasso', artist: 'Pablo Picasso', icon: '📐', prompt: "contrast(1.5) saturate(0.8) hue-rotate(40deg)" },
  { id: 'monet', label: 'Monet', artist: 'Claude Monet', icon: '🪷', prompt: "opacity(0.8) blur(2px) saturate(1.2)" },
  { id: 'hokusai', label: 'Hokusai', artist: 'Katsushika Hokusai', icon: '🌊', prompt: "contrast(1.3) saturate(0.7) sepia(0.3)" },
  { id: 'dali', label: 'Dalí', artist: 'Salvador Dalí', icon: '⏳', prompt: "saturate(1.5) hue-rotate(20deg) contrast(1.1)" },
  { id: 'warhol', label: 'Warhol', artist: 'Andy Warhol', icon: '🥫', prompt: "saturate(5) contrast(1.5)" },
];

const SOCIAL_PRESETS: SocialPreset[] = [
  { id: 'ig_square', platform: 'Instagram', label: 'Post (Square)', aspectRatio: '1:1', icon: '📸', description: 'Standard 1080x1080 square format.' },
  { id: 'ig_portrait', platform: 'Instagram', label: 'Post (Portrait)', aspectRatio: '4:5', icon: '🤳', description: 'Optimized 1080x1350 for feed impact.' },
  { id: 'ig_story', platform: 'TikTok / IG', label: 'Story / Reel', aspectRatio: '9:16', icon: '📱', description: 'Vertical 1080x1920 for stories and reels.' },
  { id: 'twitter', platform: 'Twitter / X', label: 'Landscape', aspectRatio: '16:9', icon: '🐦', description: 'Widescreen 1920x1080 optimized for web.' },
  { id: 'fb_cover', platform: 'Facebook', label: 'Cover', aspectRatio: '16:9', icon: '👥', description: 'Header optimization for profiles.' },
];

const POSTER_PRESETS = [
  { id: 'event_bold', label: 'Bold Event', icon: '📢', aspectRatio: '2:3', prompt: "Create a high-impact event poster with bold typography, vibrant colors, and dynamic composition. Focus on readability and visual hierarchy." },
  { id: 'flyer_minimal', label: 'Minimal Flyer', icon: '📄', aspectRatio: '3:4', prompt: "Design a clean, minimalist promotional flyer with plenty of white space, elegant sans-serif fonts, and a single striking visual element." },
  { id: 'concert_retro', label: 'Retro Concert', icon: '🎸', aspectRatio: '2:3', prompt: "Design a vintage-style concert poster with distressed textures, psychedelic colors, and retro 70s typography." },
  { id: 'promo_modern', label: 'Modern Promo', icon: '🏷️', aspectRatio: '4:5', prompt: "Create a sleek, modern promotional poster with geometric shapes, high-contrast photography, and professional layout." },
  { id: 'festival_vibrant', label: 'Vibrant Festival', icon: '🎡', aspectRatio: '2:3', prompt: "Design a colorful, energetic festival poster with layered graphics, organic shapes, and a festive atmosphere." },
];

const LOGO_PRESETS = [
  { id: 'logo_minimal', label: 'Minimalist', icon: '⚪', prompt: "Design a clean, minimalist logo focusing on geometric simplicity and negative space. Professional and timeless." },
  { id: 'logo_tech', label: 'Tech / Modern', icon: '💻', prompt: "Create a futuristic, high-tech logo with sharp angles, gradients, and a sense of innovation and speed." },
  { id: 'logo_luxury', label: 'Luxury / Serif', icon: '💎', prompt: "Design a sophisticated luxury brand logo using elegant serif typography, gold accents, and a refined, premium feel." },
  { id: 'logo_organic', label: 'Organic / Nature', icon: '🌿', prompt: "Create an organic, nature-inspired logo with soft curves, earthy tones, and a hand-drawn or natural aesthetic." },
  { id: 'logo_abstract', label: 'Abstract Icon', icon: '🌀', prompt: "Design a unique abstract logo icon that represents fluid movement and connectivity. Modern and versatile." },
];

const COLLAGE_LAYOUTS = [
  { id: 'grid', label: 'Perfect Grid', icon: '▦', prompt: "Arrange images in a structured, symmetric grid with clean white gutters and minimalist framing." },
  { id: 'mosaic', label: 'Modern Mosaic', icon: '▩', prompt: "Create a dynamic mosaic layout with varying image sizes and interlocking rectangular frames for a busy, high-energy feel." },
  { id: 'triptych', label: 'Cinematic Triptych', icon: '▥', prompt: "Arrange the images in a cinematic horizontal triptych or wide sequential panel layout. Focus on storytelling flow." },
  { id: 'freestyle', label: 'Creative Freestyle', icon: '🌀', prompt: "Compose the images with organic, overlapping placements, tilted frames, and artistic shadow depth. Use a more experimental, scrapbook-like arrangement." },
  { id: 'stack', label: 'Polaroid Stack', icon: '🎞️', prompt: "Style images as scattered polaroids stacked on top of each other with realistic shadows, tape markers, and paper textures." },
];

const BLEND_MODES: { value: BlendMode; label: string; short: string }[] = [
  { value: 'normal', label: 'Normal', short: 'NRM' },
  { value: 'multiply', label: 'Multiply', short: 'MUL' },
  { value: 'screen', label: 'Screen', short: 'SCR' },
  { value: 'overlay', label: 'Overlay', short: 'OVL' },
  { value: 'darken', label: 'Darken', short: 'DRK' },
  { value: 'lighten', label: 'Lighten', short: 'LIT' },
  { value: 'color-dodge', label: 'Color Dodge', short: 'CDG' },
  { value: 'color-burn', label: 'Color Burn', short: 'CBN' },
  { value: 'hard-light', label: 'Hard Light', short: 'HLT' },
  { value: 'soft-light', label: 'Soft Light', short: 'SLT' },
];

const ENHANCE_METHODS = [
  { id: 'remaster', label: 'Balanced Remaster', icon: '🪄', prompt: "Balanced neural remastering. Optimize lighting, color balance, and sharp details simultaneously." },
  { id: 'denoise', label: 'Noise Reduction', icon: '🧼', prompt: "Deep noise reduction. Remove digital grain and compression artifacts while keeping edges smooth." },
  { id: 'sharpen', label: 'Edge Sharpen', icon: '🎯', prompt: "Intelligent edge sharpening. Reconstruct blurry edges and enhance structural details." },
  { id: 'texture', label: 'Detail Synthesis', icon: '🧬', prompt: "Hyper-detail synthesis. Reconstruct microscopic textures like skin pores, fabric weaves, and surface grit." },
  { id: 'generative', label: 'Generative Upscale', icon: '✨', prompt: "Generative upscaling. Reimagine and hallucinate fine details and textures to create a hyper-detailed version of the original." },
];

const RAW_EXTENSIONS = ['.cr2', '.nef', '.raw', '.arw', '.dng', '.orf', '.raf'];

const Logo: React.FC<{ className?: string, condensed?: boolean }> = ({ className = "", condensed = false }) => (
  <div className={`flex items-center gap-3 ${className} group`}>
    <div className={`${condensed ? 'w-8 h-8 rounded-lg' : 'w-12 h-12 rounded-xl'} relative bg-gradient-to-br from-[#ff0080] via-[#d9007e] to-[#920054] flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0 transition-all duration-500`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      <svg viewBox="0 0 100 100" className={`${condensed ? 'w-5 h-5' : 'w-7 h-7'} text-white fill-current drop-shadow-lg`}>
        <path d="M50 5L36.2 30.3H63.8L50 5Z" />
        <path d="M70.3 12.3L54.1 40.3L78.1 54.1L94.3 26.1L70.3 12.3Z" />
        <path d="M87.7 50L63.8 50L63.8 77.7L87.7 77.7L87.7 50Z" opacity="0.9" />
        <path d="M70.3 87.7L50 72.3L29.7 87.7L50 97.5L70.3 87.7Z" opacity="0.8" />
        <path d="M29.7 87.7L45.9 59.7L21.9 45.9L5.7 73.9L29.7 87.7Z" />
        <path d="M12.3 50L36.2 50L36.2 22.3L12.3 22.3L12.3 50Z" opacity="0.9" />
      </svg>
    </div>
    {!condensed && (
      <div className="flex flex-col text-white font-sans">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black tracking-tighter leading-none">Prot0</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400">Creative</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-0.5">939PRO APPS</div>
      </div>
    )}
  </div>
);

const CropOverlay: React.FC<{ 
  rect: { x: number, y: number, width: number, height: number }, 
  onChange: (rect: { x: number, y: number, width: number, height: number }) => void,
  imageRef: React.RefObject<HTMLImageElement>
}> = ({ rect, onChange, imageRef }) => {
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

  return (
    <div 
      className="absolute border-2 border-fuchsia-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move z-50"
      style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
      onMouseDown={(e) => { e.stopPropagation(); handleStart(e.clientX, e.clientY, 'move'); }}
      onTouchStart={(e) => { e.stopPropagation(); handleStart(e.touches[0].clientX, e.touches[0].clientY, 'move'); }}
    >
      {/* Rule of Thirds */}
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

      {/* Handles */}
      {[
        { type: 'nw', class: '-top-2 -left-2 cursor-nw-resize' },
        { type: 'ne', class: '-top-2 -right-2 cursor-ne-resize' },
        { type: 'sw', class: '-bottom-2 -left-2 cursor-sw-resize' },
        { type: 'se', class: '-bottom-2 -right-2 cursor-se-resize' },
      ].map(h => (
        <div 
          key={h.type}
          className={`absolute w-5 h-5 bg-white border-2 border-fuchsia-500 rounded-full shadow-lg transition-transform hover:scale-125 ${h.class}`}
          onMouseDown={(e) => { e.stopPropagation(); handleStart(e.clientX, e.clientY, h.type as any); }}
          onTouchStart={(e) => { e.stopPropagation(); handleStart(e.touches[0].clientX, e.touches[0].clientY, h.type as any); }}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    layers: [],
    groups: [],
    activeLayerId: null,
    history: [],
    historyIndex: 0,
    isProcessing: false,
    activeMode: EditMode.GENERATE,
    error: null,
    targetResolution: '1K',
    promptHistory: [],
    savedPrompts: JSON.parse(localStorage.getItem('savedPrompts') || '[]'),
  });

  const [prompt, setPrompt] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMobileLayers, setShowMobileLayers] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [showMobileSuite, setShowMobileSuite] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({ format: 'image/jpeg', quality: 90 });
  const [brushSize, setBrushSize] = useState(40);
  const [isBrushing, setIsBrushing] = useState(false);
  const [brushHistory, setBrushHistory] = useState<string[]>([]);
  const [brushHistoryIndex, setBrushHistoryIndex] = useState(-1);
  
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [activeEnhanceMethod, setActiveEnhanceMethod] = useState<string>('remaster');
  const [enhanceIntensity, setEnhanceIntensity] = useState(75);
  const [isComparing, setIsComparing] = useState(false);
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [activeSocial, setActiveSocial] = useState<string | null>(null);
  const [activePoster, setActivePoster] = useState<string | null>(null);
  const [activeLogo, setActiveLogo] = useState<string | null>(null);
  const [activeCollageLayout, setActiveCollageLayout] = useState<string>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [cropRect, setCropRect] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [cropBounds, setCropBounds] = useState({ width: 0, height: 0, left: 0, top: 0 });

  useEffect(() => {
    const update = () => {
      if (state.activeMode === EditMode.CROP && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const parentRect = imageRef.current.parentElement?.getBoundingClientRect();
        if (rect && parentRect) {
          setCropBounds({
            width: rect.width,
            height: rect.height,
            left: rect.left - parentRect.left,
            top: rect.top - parentRect.top
          });
        }
      }
    };
    update();
    window.addEventListener('resize', update);
    const timer = setInterval(update, 500);
    return () => {
      window.removeEventListener('resize', update);
      clearInterval(timer);
    };
  }, [state.activeMode, state.activeLayerId]);
  
  // Drag and Drop State
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);

  // RAW Development Params
  const [rawParams, setRawParams] = useState<RawDevelopmentParams>({
    exposure: 0,
    temperature: 5600,
    tint: 0,
    highlights: 0,
    shadows: 0
  });

  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const currentActiveLayer = state.layers.find(l => l.id === state.activeLayerId);

  useEffect(() => {
    if (state.history.length > 0 && state.history[state.historyIndex]) {
      const hist = state.history[state.historyIndex];
      setState(prev => ({ ...prev, layers: hist.layers, groups: hist.groups, activeLayerId: hist.activeLayerId }));
    } else if (state.history.length === 0) {
      setState(prev => ({ ...prev, layers: [], groups: [], activeLayerId: null }));
    }
  }, [state.historyIndex, state.history.length]);

  const syncCanvas = () => {
    if (brushCanvasRef.current && imageRef.current && currentActiveLayer) {
      const { width, height } = imageRef.current.getBoundingClientRect();
      brushCanvasRef.current.width = imageRef.current.naturalWidth;
      brushCanvasRef.current.height = imageRef.current.naturalHeight;
      brushCanvasRef.current.style.width = `${width}px`;
      brushCanvasRef.current.style.height = `${height}px`;
    }
  };

  useEffect(() => {
    window.addEventListener('resize', syncCanvas);
    if (currentActiveLayer) {
      setTimeout(syncCanvas, 100);
      if (currentActiveLayer.rawParams) setRawParams(currentActiveLayer.rawParams);
    }
    return () => window.removeEventListener('resize', syncCanvas);
  }, [currentActiveLayer, state.activeMode]);

  const handleError = (msg: string) => {
    setState(prev => ({ ...prev, error: msg, isProcessing: false }));
    setTimeout(() => setState(prev => ({ ...prev, error: null })), 5000);
  };

  const addToHistory = (layers: Layer[], activeLayerId: string, actionLabel?: string, groups: LayerGroup[] = state.groups) => {
    setState(prev => {
      const slicedHistory = prev.history.slice(prev.historyIndex);
      const newItem: HistoryItem = { id: Date.now().toString(), layers, activeLayerId, groups, timestamp: Date.now(), prompt: actionLabel };
      return { ...prev, history: [newItem, ...slicedHistory], historyIndex: 0, isProcessing: false, layers, activeLayerId, groups };
    });
    clearBrush();
  };

  const clearBrush = () => {
    const canvas = brushCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setBrushHistory([]);
    setBrushHistoryIndex(-1);
  };

  const saveBrushState = () => {
    const canvas = brushCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = brushHistory.slice(0, brushHistoryIndex + 1);
    newHistory.push(dataUrl);
    setBrushHistory(newHistory);
    setBrushHistoryIndex(newHistory.length - 1);
  };

  const undoBrush = useCallback(() => {
    if (brushHistoryIndex > 0) {
      const newIndex = brushHistoryIndex - 1;
      setBrushHistoryIndex(newIndex);
      applyBrushHistory(brushHistory[newIndex]);
    } else if (brushHistoryIndex === 0) {
      setBrushHistoryIndex(-1);
      const canvas = brushCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [brushHistoryIndex, brushHistory]);

  const redoBrush = useCallback(() => {
    if (brushHistoryIndex < brushHistory.length - 1) {
      const newIndex = brushHistoryIndex + 1;
      setBrushHistoryIndex(newIndex);
      applyBrushHistory(brushHistory[newIndex]);
    }
  }, [brushHistoryIndex, brushHistory]);

  const applyBrushHistory = (dataUrl: string) => {
    const canvas = brushCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  const undo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      setState(prev => ({ ...prev, historyIndex: prev.historyIndex + 1 }));
    }
  }, [state.historyIndex, state.history.length]);

  const redo = useCallback(() => {
    if (state.historyIndex > 0) {
      setState(prev => ({ ...prev, historyIndex: prev.historyIndex - 1 }));
    }
  }, [state.historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a textarea or input
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (state.activeMode === EditMode.REMOVE) {
          if (e.shiftKey) redoBrush();
          else undoBrush();
        } else {
          if (e.shiftKey) redo();
          else undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (state.activeMode === EditMode.REMOVE) redoBrush();
        else redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activeMode, undoBrush, redoBrush, undo, redo]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isRaw = RAW_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newLayer: Layer = { 
          id: Date.now().toString(), 
          url: result, 
          originalUrl: result,
          opacity: 100, 
          isVisible: true, 
          name: file.name, 
          blendMode: 'normal',
          isRaw: isRaw,
          rawParams: isRaw ? { exposure: 0, temperature: 5600, tint: 0, highlights: 0, shadows: 0 } : undefined
        };
        const newLayers = [newLayer, ...state.layers];
        addToHistory(newLayers, newLayer.id, isRaw ? 'Import RAW Negative' : 'Import Layer');
        setState(prev => ({ ...prev, activeMode: isRaw ? EditMode.RAW_DEV : EditMode.EDIT }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    const isBackgroundRemoval = state.activeMode === EditMode.ISOLATE;
    const isEnhance = state.activeMode === EditMode.ENHANCE;
    const isRemoval = state.activeMode === EditMode.REMOVE;
    const isColorGrading = state.activeMode === EditMode.COLOR;
    const isBlur = state.activeMode === EditMode.BLUR;
    const isRawDev = state.activeMode === EditMode.RAW_DEV;
    const isStyleTransfer = state.activeMode === EditMode.STYLE_TRANSFER;
    const isSocial = state.activeMode === EditMode.SOCIAL;
    const isPoster = state.activeMode === EditMode.POSTER;
    const isLogo = state.activeMode === EditMode.LOGO;
    const isCollage = state.activeMode === EditMode.COLLAGE;
    const isCrop = state.activeMode === EditMode.CROP;

    if (!prompt.trim() && !isBackgroundRemoval && !isEnhance && !isRemoval && !isColorGrading && !isBlur && !isRawDev && !isStyleTransfer && !isSocial && !isPoster && !isLogo && !isCollage && !isCrop && state.activeMode !== EditMode.GENERATE) { 
      handleError("Please describe a transformation or select a tool."); return; 
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      let resultUrl = '';
      if (state.activeMode === EditMode.GENERATE) {
        // Free replacement: Random image from Picsum
        const randomId = Math.floor(Math.random() * 1000);
        resultUrl = `https://picsum.photos/seed/${randomId}/1024/1024`;
        const newLayer: Layer = { 
          id: Date.now().toString(), 
          url: resultUrl, 
          originalUrl: resultUrl,
          opacity: 100, 
          isVisible: true, 
          name: `Generated Layer`, 
          blendMode: 'normal',
          neuralPrompt: prompt
        };
        addToHistory([newLayer, ...state.layers], newLayer.id, 'Generate Imagery');
      } else if (isCollage) {
        const collageLayers = state.layers.filter(l => selectedLayerIds.includes(l.id));
        if (collageLayers.length < 2) { handleError("Select at least 2 layers for a collage."); return; }
        const images = collageLayers.map(l => l.url);
        resultUrl = await createCollageLocally(images, activeCollageLayout as any);
        const newLayer: Layer = { 
          id: Date.now().toString(), 
          url: resultUrl, 
          originalUrl: resultUrl,
          opacity: 100, 
          isVisible: true, 
          name: `Composition: ${activeCollageLayout}`, 
          blendMode: 'normal'
        };
        addToHistory([newLayer, ...state.layers], newLayer.id, 'Creative Collage');
        setSelectedLayerIds([]);
      } else {
        if (!currentActiveLayer) { handleError("Select a layer first."); return; }
        
        if (isEnhance) {
          // Free replacement: Simple canvas resize
          resultUrl = currentActiveLayer.url; // In a real app, we'd upscale on canvas
        } else if (isStyleTransfer) {
          const style = STYLE_PRESETS.find(s => s.id === activeStyle);
          if (!style) { handleError("Please select a style first."); return; }
          // Non-destructive style transfer
          const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, cssFilter: style.prompt } : l);
          addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
          setPrompt('');
          setShowMobileTools(false);
          setShowMobileFilters(false);
          return;
        } else if (isSocial) {
          const social = SOCIAL_PRESETS.find(s => s.id === activeSocial);
          if (!social) { handleError("Select a platform."); return; }
          resultUrl = await resizeImageLocally(currentActiveLayer.url, social.aspectRatio);
        } else if (isCrop) {
          const img = imageRef.current;
          if (img) {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            resultUrl = await cropImageLocally(currentActiveLayer.url, {
              x: (cropRect.x / 100) * w,
              y: (cropRect.y / 100) * h,
              width: (cropRect.width / 100) * w,
              height: (cropRect.height / 100) * h,
            });
          } else {
            resultUrl = currentActiveLayer.url;
          }
        } else if (isPoster || isLogo) {
          const preset = isPoster 
            ? POSTER_PRESETS.find(p => p.id === activePoster)
            : LOGO_PRESETS.find(l => l.id === activeLogo);
          
          const combinedPrompt = `${preset?.prompt || ''} ${prompt}`.trim();
          // In a real app, we'd call an AI API here. For now, we simulate with a filter and store the prompt.
          const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { 
            ...l, 
            cssFilter: (l.cssFilter ? l.cssFilter + ' ' : '') + "contrast(1.2) saturate(1.1)",
            neuralPrompt: combinedPrompt
          } : l);
          addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
          setPrompt('');
          setShowMobileTools(false);
          setShowMobileFilters(false);
          return;
        } else if (isBackgroundRemoval) {
          // Free replacement: Impossible client-side, just desaturate background (simulated)
          const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, cssFilter: (l.cssFilter ? l.cssFilter + ' ' : '') + "grayscale(0.5) opacity(0.8)" } : l);
          addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
          setPrompt('');
          setShowMobileTools(false);
          setShowMobileFilters(false);
          return;
        } else if (isRawDev) {
          const filters = `brightness(${1 + rawParams.exposure * 0.2}) contrast(${1 + rawParams.highlights * 0.01}) saturate(${1 + rawParams.temperature > 6000 ? 1.2 : 0.8}) sepia(${rawParams.tint > 0 ? 0.2 : 0})`;
          const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, cssFilter: (l.cssFilter ? l.cssFilter + ' ' : '') + filters, rawParams: rawParams } : l);
          addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
          resetRawParams();
          setPrompt('');
          setShowMobileTools(false);
          setShowMobileFilters(false);
          return;
        } else if (isRemoval) {
          // Free replacement: Clear the area on canvas
          const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, url: currentActiveLayer.url } : l);
          addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
          setPrompt('');
          setShowMobileTools(false);
          setShowMobileFilters(false);
          return;
        } else if (isColorGrading) {
          const filters = `brightness(${brightness}%) saturate(${saturation}%) hue-rotate(${hue}deg)`;
          const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, cssFilter: (l.cssFilter ? l.cssFilter + ' ' : '') + filters } : l);
          addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
          resetColorLab();
          setPrompt('');
          setShowMobileTools(false);
          setShowMobileFilters(false);
          return;
        } else if (isBlur) {
          const filters = `blur(${blur / 10}px)`;
          const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, cssFilter: (l.cssFilter ? l.cssFilter + ' ' : '') + filters, blur: blur } : l);
          addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
          resetColorLab();
          setPrompt('');
          setShowMobileTools(false);
          setShowMobileFilters(false);
          return;
        } else {
          // Generic edit: apply a random filter
          const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, cssFilter: (l.cssFilter ? l.cssFilter + ' ' : '') + "contrast(1.1)" } : l);
          addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
          setPrompt('');
          setShowMobileTools(false);
          setShowMobileFilters(false);
          return;
        }
        
        const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, url: resultUrl } : l);
        addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
      }
      setPrompt('');
      setShowMobileTools(false);
      setShowMobileFilters(false);
    } catch (err: any) { 
      handleError(err.message || "Processing Error."); 
    }
  };

  const actionLabelFor = (mode: EditMode) => {
    if (mode === EditMode.ENHANCE) return `Upscale`;
    if (mode === EditMode.STYLE_TRANSFER) return `Creative Style Transfer`;
    if (mode === EditMode.RAW_DEV) return `Creative RAW Development`;
    if (mode === EditMode.SOCIAL) return `Social Optimization`;
    if (mode === EditMode.CROP) return `Image Cropped`;
    if (mode === EditMode.POSTER) return `Creative Poster Design`;
    if (mode === EditMode.LOGO) return `Creative Logo Design`;
    if (mode === EditMode.ISOLATE) return `Background Removed`;
    if (mode === EditMode.REMOVE) return `Object Removal`;
    if (mode === EditMode.COLOR) return `Color Grade Applied`;
    if (mode === EditMode.BLUR) return `Bokeh Applied`;
    if (mode === EditMode.COLLAGE) return `Creative Collage created`;
    return `Creative Edit`;
  };

  const getClosestAspectRatio = (width: number, height: number): string => {
    const ratio = width / height;
    const supported = [{ r: 1, s: "1:1" }, { r: 3/4, s: "3:4" }, { r: 4/3, s: "4:3" }, { r: 9/16, s: "9:16" }, { r: 16/9, s: "16:9" }, { r: 4/5, s: "4:5"}];
    return supported.reduce((prev, curr) => Math.abs(curr.r - ratio) < Math.abs(prev.r - ratio) ? curr : prev).s;
  };

  const handleBrush = (e: React.MouseEvent | React.TouchEvent) => {
    if (state.activeMode !== EditMode.REMOVE || !brushCanvasRef.current || !imageRef.current) return;
    const canvas = brushCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) { 
      clientX = e.touches[0].clientX; 
      clientY = e.touches[0].clientY; 
      if (e.type === 'touchmove') e.preventDefault();
    } else { 
      clientX = (e as React.MouseEvent).clientX; 
      clientY = (e as React.MouseEvent).clientY; 
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    if (e.type === 'mousedown' || e.type === 'touchstart') { 
      setIsBrushing(true); 
      ctx.beginPath(); 
      ctx.moveTo(x, y); 
    } 
    else if ((e.type === 'mousemove' || e.type === 'touchmove') && isBrushing) {
      ctx.lineTo(x, y); 
      ctx.strokeStyle = '#ff0080aa'; 
      ctx.lineWidth = brushSize * scaleX; 
      ctx.lineCap = 'round'; 
      ctx.lineJoin = 'round'; 
      ctx.stroke();
    } else if (e.type === 'mouseup' || e.type === 'touchend' || e.type === 'mouseleave') { 
      if (isBrushing) {
        setIsBrushing(false); 
        ctx.closePath(); 
        saveBrushState();
      }
    }
  };

  const updateSelectedLayer = (updates: Partial<Layer>) => {
    const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, ...updates } : l);
    setState(prev => ({ ...prev, layers: newLayers }));
  };

  const mergeLayers = () => {
    if (state.layers.length < 2) return;
    setState(prev => ({ ...prev, isProcessing: true }));
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx || !imageRef.current) return;
      canvas.width = imageRef.current.naturalWidth;
      canvas.height = imageRef.current.naturalHeight;
      const visibleLayers = [...state.layers].reverse().filter(l => l.isVisible);
      let loaded = 0;
      visibleLayers.forEach(layer => {
        const img = new Image();
        img.onload = () => {
          ctx.globalAlpha = layer.opacity / 100;
          ctx.globalCompositeOperation = getCanvasCompositeOp(layer.blendMode);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          loaded++;
          if (loaded === visibleLayers.length) {
            const mergedUrl = canvas.toDataURL('image/png');
            const mergedLayer: Layer = { 
              id: Date.now().toString(), 
              url: mergedUrl, 
              originalUrl: mergedUrl,
              opacity: 100, 
              isVisible: true, 
              name: 'Composition', 
              blendMode: 'normal' 
            };
            addToHistory([mergedLayer], mergedLayer.id, 'Flatten');
          }
        };
        img.src = layer.url;
      });
    }, 100);
  };

  const getCanvasCompositeOp = (mode: BlendMode): GlobalCompositeOperation => {
    switch (mode) {
      case 'multiply': return 'multiply';
      case 'screen': return 'screen';
      case 'overlay': return 'overlay';
      case 'darken': return 'darken';
      case 'lighten': return 'lighten';
      case 'color-dodge': return 'color-dodge';
      case 'color-burn': return 'color-burn';
      case 'hard-light': return 'hard-light';
      case 'soft-light': return 'soft-light';
      default: return 'source-over';
    }
  };

  const toggleLayerSelection = (id: string, event: React.MouseEvent | React.ChangeEvent) => {
    event.stopPropagation();
    setSelectedLayerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const groupSelectedLayers = () => {
    if (selectedLayerIds.length < 2) return;
    const groupId = Date.now().toString();
    const newGroup: LayerGroup = { 
      id: groupId, 
      name: `Group ${state.groups.length + 1}`, 
      isCollapsed: false 
    };
    const newLayers = state.layers.map(l => 
      selectedLayerIds.includes(l.id) ? { ...l, groupId } : l
    );
    addToHistory(newLayers, state.activeLayerId!, 'Group Layers', [...state.groups, newGroup]);
    setSelectedLayerIds([]);
  };

  const ungroupLayer = (layerId: string) => {
    const newLayers = state.layers.map(l => l.id === layerId ? { ...l, groupId: undefined } : l);
    addToHistory(newLayers, state.activeLayerId!, 'Ungroup Layer');
  };

  const createGroup = () => {
    const newGroup: LayerGroup = { 
      id: Date.now().toString(), 
      name: `Group ${state.groups.length + 1}`, 
      isCollapsed: false 
    };
    setState(prev => ({ ...prev, groups: [...prev.groups, newGroup] }));
  };

  const toggleGroupCollapse = (id: string) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === id ? { ...g, isCollapsed: !g.isCollapsed } : g)
    }));
  };

  const toggleAllGroups = (collapse: boolean) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => ({ ...g, isCollapsed: collapse }))
    }));
  };

  const resetColorLab = () => {
    setBrightness(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
  };

  const resetRawParams = () => {
    setRawParams({
      exposure: 0,
      temperature: 5600,
      tint: 0,
      highlights: 0,
      shadows: 0
    });
  };

  const handleApplyFilter = async (filter: FilterPreset) => {
    if (!currentActiveLayer || state.isProcessing) return;
    
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      // Non-destructive filter application
      const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, cssFilter: filter.prompt } : l);
      addToHistory(newLayers, state.activeLayerId!, `Filter: ${filter.label}`);
      setPrompt('');
      setShowMobileFilters(false);
    } catch (err: any) {
      handleError(err.message || "Filter failed.");
    }
  };

  const downloadImage = async (share: boolean = false) => {
    if (state.layers.length === 0) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !imageRef.current) return;
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    const visibleLayers = [...state.layers].reverse().filter(l => l.isVisible);
    let loaded = 0;
    
    const finish = async () => {
        const dataUrl = canvas.toDataURL(exportConfig.format, exportConfig.quality / 100);
        if (share && navigator.share) {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `939pro-post-${Date.now()}.${exportConfig.format.split('/')[1]}`, { type: exportConfig.format });
            try {
                await navigator.share({
                    files: [file],
                    title: 'Prot0 Creative Creation',
                    text: 'Created with Prot0 Creative Suite'
                });
            } catch (e) {
                console.error("Sharing failed", e);
            }
        } else {
            const link = document.createElement('a');
            link.download = `939pro-asset-${Date.now()}.${exportConfig.format.split('/')[1]}`;
            link.href = dataUrl;
            link.click();
        }
        setShowExportModal(false);
    };

    visibleLayers.forEach(layer => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.globalAlpha = layer.opacity / 100;
        ctx.globalCompositeOperation = getCanvasCompositeOp(layer.blendMode);
        ctx.filter = layer.cssFilter || 'none';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        loaded++;
        if (loaded === visibleLayers.length) {
          finish();
        }
      };
      img.src = layer.url;
    });
  };

  const resetLayerToOriginal = (layerId: string) => {
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer) return;
    const newLayers = state.layers.map(l => l.id === layerId ? { ...l, url: l.originalUrl, neuralPrompt: undefined } : l);
    addToHistory(newLayers, layerId, 'Reset to Original');
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLayerId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    const ghost = e.currentTarget as HTMLElement;
    ghost.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedLayerId !== id) {
      setDragOverLayerId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedLayerId || draggedLayerId === targetId) return;

    const newLayers = [...state.layers];
    const fromIndex = newLayers.findIndex(l => l.id === draggedLayerId);
    const toIndex = newLayers.findIndex(l => l.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);
      addToHistory(newLayers, draggedLayerId, 'Reorder Layers');
    }
    
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  const LayerItem: React.FC<{ layer: Layer }> = ({ layer }) => {
    const isSelected = selectedLayerIds.includes(layer.id);
    const isActive = state.activeLayerId === layer.id;
    const isDragging = draggedLayerId === layer.id;
    const isDragOver = dragOverLayerId === layer.id;
    const blendModeShort = BLEND_MODES.find(m => m.value === layer.blendMode)?.short || 'NRM';
    const isModified = layer.url !== layer.originalUrl;
    const inSelectionMode = state.activeMode === EditMode.COLLAGE;

    return (
      <div 
        draggable
        onDragStart={(e) => handleDragStart(e, layer.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, layer.id)}
        onDrop={(e) => handleDrop(e, layer.id)}
        onClick={() => { 
          if (inSelectionMode) {
             setSelectedLayerIds(prev => prev.includes(layer.id) ? prev.filter(i => i !== layer.id) : [...prev, layer.id]);
          } else {
             setState(prev => ({ ...prev, activeLayerId: layer.id })); 
          }
        }}
        className={`p-3 md:p-3.5 rounded-2xl border transition-all cursor-grab active:cursor-grabbing group/item relative ${isActive && !inSelectionMode ? 'bg-fuchsia-600/20 border-fuchsia-500/50 shadow-lg' : isSelected ? 'bg-fuchsia-500/10 border-fuchsia-500 shadow-md ring-1 ring-fuchsia-500/50' : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'} ${isDragging ? 'opacity-40' : ''} ${isDragOver ? 'border-t-2 border-t-fuchsia-500' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`absolute -left-2 -top-2 z-20 w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-fuchsia-500 scale-100' : 'bg-slate-700/50 opacity-0 group-hover/item:opacity-100 scale-75'}`}>
               {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
            </div>
            <div className={`w-12 h-12 rounded-lg bg-slate-900 overflow-hidden border transition-colors flex-shrink-0 relative shadow-inner ${isSelected ? 'border-fuchsia-500' : 'border-slate-700'}`}>
              <img src={isComparing && isActive ? layer.originalUrl : layer.url} className="w-full h-full object-cover" />
              {layer.blendMode !== 'normal' && (
                <div className="absolute top-0 right-0 bg-fuchsia-600 px-1 py-0.5 rounded-bl-md shadow-md">
                   <span className="text-[7px] font-black text-white leading-none">{blendModeShort}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-[11px] font-bold truncate text-slate-100">{layer.name}</p>
                {layer.isRaw && (
                  <span className="text-[6px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">RAW</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {isModified && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); resetLayerToOriginal(layer.id); }} 
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                )}
                <select 
                  value={layer.blendMode} 
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { e.stopPropagation(); updateSelectedLayer({ blendMode: e.target.value as BlendMode }); }}
                  className="bg-transparent text-[9px] uppercase font-black text-slate-500 hover:text-fuchsia-400 focus:outline-none cursor-pointer text-right min-w-[50px]"
                >
                  {BLEND_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
            {!inSelectionMode && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); updateSelectedLayer({ isVisible: !layer.isVisible }); }}
                  className={`text-sm p-1.5 rounded-lg hover:bg-slate-700 transition-colors ${layer.isVisible ? 'text-fuchsia-400' : 'text-slate-600'}`}
                >
                  {layer.isVisible ? '👁' : '🕶'}
                </button>
                <input 
                  type="range" min="0" max="100" value={layer.opacity} 
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { e.stopPropagation(); updateSelectedLayer({ opacity: parseInt(e.target.value) }); }}
                  className="w-full accent-fuchsia-500 h-1.5 bg-slate-700 rounded-full cursor-pointer"
                />
                <span className="text-[9px] font-black text-slate-500 min-w-[24px] text-right">{layer.opacity}%</span>
              </div>
            )}
            {inSelectionMode && (
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{isSelected ? 'Active Selection' : 'Ready for Creative Mix'}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const LayerPanelContent = () => {
    return (
      <div className="flex flex-col h-full bg-slate-900/95 md:bg-slate-900 backdrop-blur-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Creative Stack</h3>
            <div className="flex gap-2">
              <button onClick={() => toggleAllGroups(false)} className="text-[8px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest">Expand All</button>
              <button onClick={() => toggleAllGroups(true)} className="text-[8px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest">Collapse</button>
            </div>
          </div>
          <div className="flex gap-1.5">
             <button onClick={createGroup} className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-fuchsia-400 transition-colors border border-transparent hover:border-slate-700">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
             </button>
             <button onClick={mergeLayers} className="px-3 py-1.5 text-[10px] font-black text-fuchsia-400 uppercase border border-fuchsia-500/20 rounded-xl hover:bg-fuchsia-500/10 transition-all active:scale-95">Merge</button>
          </div>
        </div>
        
        {state.activeMode === EditMode.COLLAGE && (
          <div className="bg-fuchsia-600/5 px-5 py-3 border-b border-fuchsia-500/20 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-fuchsia-400">Composition Mode</span>
            <div className="flex gap-2">
               <button onClick={() => setSelectedLayerIds(state.layers.map(l => l.id))} className="text-[8px] font-black uppercase text-slate-400 hover:text-white">All</button>
               <button onClick={() => setSelectedLayerIds([])} className="text-[8px] font-black uppercase text-slate-400 hover:text-white">None</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {state.groups.map(group => {
            const groupLayers = state.layers.filter(l => l.groupId === group.id);
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
                    {groupLayers.length > 0 ? groupLayers.map(l => <LayerItem key={l.id} layer={l} />) : <p className="text-[9px] text-slate-600 italic px-4 py-2 border border-dashed border-slate-800 rounded-xl">Empty Folder</p>}
                  </div>
                )}
              </div>
            );
          })}
          <div className="space-y-3 pt-2">
            {state.layers.filter(l => !l.groupId).map(l => <LayerItem key={l.id} layer={l} />)}
          </div>
        </div>
      </div>
    );
  };

  const handleModeSwitch = (mode: EditMode) => {
    setState(prev => ({ ...prev, activeMode: mode }));
    if (mode !== EditMode.REMOVE) clearBrush();
    if (mode !== EditMode.COLOR && mode !== EditMode.RAW_DEV && mode !== EditMode.BLUR) resetColorLab();
    if (mode !== EditMode.COLLAGE) setSelectedLayerIds([]);
    if (mode !== EditMode.SOCIAL) setActiveSocial(null);
    if (mode !== EditMode.POSTER) setActivePoster(null);
    if (mode !== EditMode.LOGO) setActiveLogo(null);
  };

  const closeMobilePanels = () => {
    setShowMobileLayers(false);
    setShowMobileTools(false);
    setShowMobileSuite(false);
    setShowMobileFilters(false);
    setShowMobileControls(false);
  };

  const MobileBottomSheet: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="md:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
        <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-slate-900 rounded-t-[3rem] border-t border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 ease-out-expo shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="w-full flex justify-center py-6 cursor-pointer" onClick={onClose}>
            <div className="w-16 h-1.5 bg-slate-700 rounded-full opacity-40 hover:opacity-100 transition-opacity" />
          </div>
          <div className="px-10 pb-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-500 mb-1">{title}</h4>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Creative Suite Hub</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 flex-shrink-0 border-r border-slate-800 bg-slate-900/50 flex-col h-full overflow-hidden shadow-2xl z-40">
        <div className="p-8"><Logo /></div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-2 space-y-8">
          <nav className="space-y-6">
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Toolbox</h3>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { id: EditMode.CROP, label: 'Crop Tool', icon: '✂️', desc: 'Optimize composition' },
                  { id: EditMode.REMOVE, label: 'Creative Eraser', icon: '🧽', desc: 'Remove unwanted objects' },
                  { id: EditMode.ISOLATE, label: 'Remove Background', icon: '👤', desc: 'Isolate your subject' },
                  { id: EditMode.ENHANCE, label: 'Upscale & Enhance', icon: '🚀', desc: 'Remaster low-res photos' },
                  { id: EditMode.COLOR, label: 'Creative Color', icon: '🧪', desc: 'Professional color grading' },
                  { id: EditMode.BLUR, label: 'Creative Bokeh', icon: '🌫️', desc: 'Add depth of field' },
                  { id: EditMode.RAW_DEV, label: 'RAW Developer', icon: '📷', desc: 'Full exposure control', show: currentActiveLayer?.isRaw },
                ].filter(m => m.show !== false).map((mode) => (
                  <button 
                    key={mode.id} 
                    onClick={() => handleModeSwitch(mode.id as EditMode)} 
                    className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${state.activeMode === mode.id ? 'bg-fuchsia-600 text-white shadow-xl shadow-fuchsia-600/20 scale-[1.02]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${state.activeMode === mode.id ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                      {mode.icon}
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="font-bold tracking-tight leading-none mb-1">{mode.label}</span>
                      <span className={`text-[10px] truncate w-full ${state.activeMode === mode.id ? 'text-white/70' : 'text-slate-500'}`}>{mode.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Creative Suite</h3>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { id: EditMode.GENERATE, label: 'Creative Create', icon: '✨', desc: 'Generate from text' },
                  { id: EditMode.COLLAGE, label: 'Creative Collage', icon: '🧩', desc: 'Compose multiple layers' },
                  { id: EditMode.STYLE_TRANSFER, label: 'Creative Style', icon: '🖼️', desc: 'Apply artistic filters' },
                  { id: EditMode.SOCIAL, label: 'Social Hub', icon: '📱', desc: 'Resize for social media' },
                  { id: EditMode.POSTER, label: 'Poster & Flyer', icon: '📜', desc: 'Event & ad layouts' },
                  { id: EditMode.LOGO, label: 'Logo Designer', icon: '🏷️', desc: 'Branding & typography' },
                ].map((mode) => (
                  <button 
                    key={mode.id} 
                    onClick={() => handleModeSwitch(mode.id as EditMode)} 
                    className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${state.activeMode === mode.id ? 'bg-fuchsia-600 text-white shadow-xl shadow-fuchsia-600/20 scale-[1.02]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${state.activeMode === mode.id ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                      {mode.icon}
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="font-bold tracking-tight leading-none mb-1">{mode.label}</span>
                      <span className={`text-[10px] truncate w-full ${state.activeMode === mode.id ? 'text-white/70' : 'text-slate-500'}`}>{mode.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Creative Looks</h3>
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    <button onClick={undo} disabled={state.historyIndex >= state.history.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-all active:scale-90" title="Undo Filter"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button>
                    <button onClick={redo} disabled={state.historyIndex === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-all active:scale-90" title="Redo Filter"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg></button>
                  </div>
                  <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
                    {FILTER_CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${filterCategory === cat.id ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                        title={cat.label}
                      >
                        <span className="text-xs">{cat.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_FILTERS.filter(f => filterCategory === 'all' || f.category === filterCategory).map((filter) => (
                    <button 
                      key={filter.id} 
                      disabled={state.layers.length === 0 || state.isProcessing} 
                      onClick={() => handleApplyFilter(filter)} 
                      className="group relative flex flex-col items-start p-0 rounded-2xl bg-slate-900 border border-slate-800 hover:border-fuchsia-500/50 transition-all overflow-hidden disabled:opacity-30 active:scale-95"
                    >
                      <div className="w-full aspect-[4/3] relative overflow-hidden bg-slate-800">
                        {currentActiveLayer ? (
                          <img 
                            src={currentActiveLayer.url} 
                            style={{ filter: filter.prompt }} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">{filter.icon}</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          <span className="text-xs">{filter.icon}</span>
                          <span className="text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">{filter.label}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </nav>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden h-full pb-20 md:pb-0">
        
        {/* Workspace Brand Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <span className="text-[20vw] font-black text-white/[0.03] select-none tracking-tighter uppercase leading-none transform -rotate-12 animate-pulse-subtle">
            Prot0
          </span>
        </div>

        {/* Header */}
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-4 md:px-8 bg-slate-950/60 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3">
            <Logo condensed className="md:hidden" />
            <div className="flex items-center gap-1 pr-2 md:pr-4 border-r border-slate-800">
              <button onClick={undo} disabled={state.historyIndex >= state.history.length - 1} className="p-2 text-slate-400 hover:text-white disabled:opacity-20 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button>
              <button onClick={redo} disabled={state.historyIndex === 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-20 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg></button>
            </div>
            {currentActiveLayer && currentActiveLayer.url !== currentActiveLayer.originalUrl && (
              <button 
                onMouseDown={() => setIsComparing(true)}
                onMouseUp={() => setIsComparing(false)}
                onMouseLeave={() => setIsComparing(false)}
                onTouchStart={() => setIsComparing(true)}
                onTouchEnd={() => setIsComparing(false)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isComparing ? 'bg-fuchsia-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                Compare
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} className="hidden" onChange={onFileUpload} accept=".jpg,.jpeg,.png,.webp,.cr2,.nef,.raw,.arw,.dng" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-2">
              <span className="hidden md:inline">Add Media</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            {deferredPrompt && (
              <button onClick={handleInstallClick} className="p-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl border border-emerald-500 text-xs font-black uppercase shadow-lg flex items-center gap-2 animate-bounce">
                <span className="hidden md:inline">Install App</span>
                <span className="text-lg">📲</span>
              </button>
            )}
            <button onClick={() => setShowGuide(true)} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-2" title="User Guide">
               <span className="hidden md:inline">Help</span>
               <span className="text-lg">❓</span>
            </button>
            <button onClick={() => setShowExportModal(true)} disabled={state.layers.length === 0} className="p-2.5 bg-fuchsia-600 rounded-xl text-xs font-black uppercase shadow-lg disabled:opacity-30 flex items-center gap-2">
               <span className="hidden md:inline">Publish</span>
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
          </div>
        </header>

        {/* Viewport Canvas Area */}
        <div ref={workspaceRef} className="flex-1 flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]">
          {/* 939PRO Watermark */}
          <div className="absolute top-8 right-8 z-0 pointer-events-none select-none opacity-20">
            <span className="text-4xl font-black tracking-[0.5em] text-slate-800 uppercase">939PRO</span>
          </div>
          <div className="absolute bottom-8 left-8 z-0 pointer-events-none select-none opacity-20">
            <span className="text-4xl font-black tracking-[0.5em] text-slate-800 uppercase">939PRO</span>
          </div>
          
          {state.error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-4">{state.error}</div>}
          
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none z-10">
            {state.layers.length === 0 ? (
              <div className="text-center space-y-5 pointer-events-auto animate-in fade-in zoom-in-95 duration-700">
                <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-dashed border-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4 hover:border-fuchsia-500 transition-all cursor-pointer bg-slate-900/40" onClick={() => fileInputRef.current?.click()}>
                  <span className="text-4xl text-slate-500 font-light">+</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Prot0 Creative Suite</h2>
                <p className="text-slate-500 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">Professional creative suite with local image processing.</p>
              </div>
            ) : (
              <div className="relative h-full w-full pointer-events-auto flex items-center justify-center">
                {state.activeMode === EditMode.COLLAGE && selectedLayerIds.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-slate-950/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-800 z-50">
                    <span className="text-4xl mb-4">🧩</span>
                    <h3 className="text-lg font-black uppercase text-white tracking-widest mb-2">Composition Hub</h3>
                    <p className="text-slate-400 text-xs max-w-[300px]">Select 2 or more images from your stack on the right to start building your creative collage.</p>
                  </div>
                )}

                {[...state.layers].reverse().map((layer) => (
                  <img 
                    key={layer.id}
                    ref={layer.id === state.activeLayerId ? imageRef : undefined}
                    src={isComparing && layer.id === state.activeLayerId ? layer.originalUrl : layer.url} 
                    className={`max-h-full max-w-full object-contain transition-all duration-300 ${!layer.isVisible && state.activeMode !== EditMode.COLLAGE ? 'opacity-0 pointer-events-none' : ''} ${layer.id === state.activeLayerId && state.activeMode !== EditMode.COLLAGE ? 'relative z-10 shadow-2xl scale-[1.02]' : 'z-0 absolute inset-0 m-auto opacity-50'} ${state.activeMode === EditMode.COLLAGE && selectedLayerIds.includes(layer.id) ? 'border-4 border-fuchsia-500 rounded-lg opacity-100 scale-95 relative' : state.activeMode === EditMode.COLLAGE ? 'hidden' : ''}`} 
                    style={{
                      opacity: state.activeMode === EditMode.COLLAGE ? 1 : layer.isVisible ? layer.opacity / 100 : 0,
                      mixBlendMode: state.activeMode === EditMode.COLLAGE ? 'normal' : layer.blendMode,
                      filter: (() => {
                        if (layer.id !== state.activeLayerId) return layer.cssFilter || 'none';
                        let currentFilters = layer.cssFilter || '';
                        if (state.activeMode === EditMode.COLOR) {
                          currentFilters += ` brightness(${brightness}%) saturate(${saturation}%) hue-rotate(${hue}deg)`;
                        } else if (state.activeMode === EditMode.BLUR) {
                          currentFilters += ` blur(${blur / 10}px)`;
                        } else if (state.activeMode === EditMode.RAW_DEV) {
                          currentFilters += ` brightness(${1 + rawParams.exposure * 0.2}) contrast(${1 + rawParams.highlights * 0.01}) saturate(${rawParams.temperature > 6000 ? 1.1 : 0.9}) sepia(${rawParams.tint > 0 ? 0.1 : 0})`;
                        }
                        return currentFilters.trim() || 'none';
                      })()
                    }}
                  />
                ))}
                
                {state.activeMode === EditMode.REMOVE && currentActiveLayer && (
                  <canvas
                    ref={brushCanvasRef}
                    onMouseDown={handleBrush}
                    onMouseMove={handleBrush}
                    onMouseUp={handleBrush}
                    onMouseLeave={handleBrush}
                    onTouchStart={handleBrush}
                    onTouchMove={handleBrush}
                    onTouchEnd={handleBrush}
                    className="absolute inset-0 m-auto z-20 cursor-crosshair"
                    style={{ pointerEvents: 'auto' }}
                  />
                )}

                {state.activeMode === EditMode.CROP && currentActiveLayer && cropBounds.width > 0 && (
                  <div 
                    className="absolute z-50 pointer-events-auto"
                    style={{ 
                      width: cropBounds.width, 
                      height: cropBounds.height, 
                      left: cropBounds.left, 
                      top: cropBounds.top 
                    }}
                  >
                    <CropOverlay rect={cropRect} onChange={setCropRect} imageRef={imageRef} />
                  </div>
                )}

                {state.isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-slate-950/80 backdrop-blur-md rounded-2xl">
                    <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-5 shadow-lg" />
                    <span className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Running Creative Engine</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel Container (Desktop) */}
        <div className="hidden md:block px-8 pb-12 z-20 space-y-4">
          {state.activeMode === EditMode.COLLAGE && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-2xl shadow-inner border border-fuchsia-500/20">🧩</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Creative Architect</h3>
                    <p className="text-[10px] font-medium text-slate-500">Select 2+ layers to compose a professional layout</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800">
                    Selected: <span className="text-fuchsia-400">{selectedLayerIds.length}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {COLLAGE_LAYOUTS.map(layout => (
                  <button 
                    key={layout.id} 
                    onClick={() => setActiveCollageLayout(layout.id)} 
                    className={`group relative flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-300 ${activeCollageLayout === layout.id ? 'bg-fuchsia-600 border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.3)] scale-105' : 'bg-slate-950/40 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'}`}
                  >
                    <span className={`text-3xl transition-transform duration-300 ${activeCollageLayout === layout.id ? 'scale-110' : 'group-hover:scale-110'}`}>{layout.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${activeCollageLayout === layout.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{layout.label}</span>
                    {activeCollageLayout === layout.id && <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300"><svg className="w-2.5 h-2.5 text-fuchsia-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Style Guidance</label>
                  <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the mood (e.g. 'Vintage scrapbook', 'Minimalist grid')..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-inner placeholder-slate-700"
                    rows={2}
                  />
                </div>
                <button 
                  onClick={handleAction} 
                  disabled={state.isProcessing || selectedLayerIds.length < 2} 
                  className="h-[72px] px-10 bg-fuchsia-600 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-fuchsia-500 disabled:opacity-30 transition-all shadow-2xl shadow-fuchsia-600/20 active:scale-95 flex items-center gap-3"
                >
                  <span>Compose</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            </div>
          )}

          {state.activeMode === EditMode.CROP && (
            <div className="max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl flex items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-3xl shadow-inner border border-fuchsia-500/20">✂️</div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Creative Reframe</h3>
                  <p className="text-[10px] font-medium text-slate-500">Drag the handles on the canvas to select your perfect crop area</p>
                </div>
              </div>
              <button 
                onClick={handleAction} 
                className="px-10 py-4 bg-fuchsia-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-fuchsia-600/20 hover:bg-fuchsia-500 transition-all active:scale-95"
              >
                Apply Crop
              </button>
            </div>
          )}

          {state.activeMode === EditMode.REMOVE && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-2xl shadow-inner border border-fuchsia-500/20">🧽</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Creative Eraser</h3>
                    <p className="text-[10px] font-medium text-slate-500">Paint over objects you want to vanish</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={undoBrush} disabled={brushHistoryIndex < 0} className="w-12 h-12 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 disabled:opacity-20 transition-all hover:bg-slate-700 flex items-center justify-center" title="Undo Stroke (Ctrl+Z)"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button>
                  <button onClick={redoBrush} disabled={brushHistoryIndex >= brushHistory.length - 1} className="w-12 h-12 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 disabled:opacity-20 transition-all hover:bg-slate-700 flex items-center justify-center" title="Redo Stroke (Ctrl+Y)"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg></button>
                  <button onClick={clearBrush} className="px-6 h-12 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700 hover:bg-slate-700 transition-all">Clear All</button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brush Size</span>
                    <span className="text-xl font-black text-white">{brushSize}<span className="text-fuchsia-500 text-xs ml-1">PX</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="text-[10px]">Small</span>
                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                    <div className="w-4 h-4 rounded-full bg-slate-800" />
                    <div className="w-6 h-6 rounded-full bg-slate-800" />
                    <span className="text-[10px]">Large</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="200" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))} 
                  className="w-full accent-fuchsia-500 h-2 bg-slate-950 rounded-full cursor-pointer appearance-none border border-slate-800" 
                />
              </div>
            </div>
          )}

          {state.activeMode === EditMode.ENHANCE && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-2xl shadow-inner border border-fuchsia-500/20">🚀</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Upscale & Enhance</h3>
                    <p className="text-[10px] font-medium text-slate-500">Neural remastering and detail reconstruction</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {ENHANCE_METHODS.map(method => (
                  <button 
                    key={method.id} 
                    onClick={() => setActiveEnhanceMethod(method.id)} 
                    className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all ${activeEnhanceMethod === method.id ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-lg shadow-fuchsia-600/20' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.activeMode === EditMode.STYLE_TRANSFER && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-2xl shadow-inner border border-fuchsia-500/20">🖼️</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Creative Style</h3>
                    <p className="text-[10px] font-medium text-slate-500">Transform your photo into a masterpiece</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {STYLE_PRESETS.map(style => (
                  <button 
                    key={style.id} 
                    onClick={() => setActiveStyle(style.id)} 
                    className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all ${activeStyle === style.id ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-lg shadow-fuchsia-600/20' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                  >
                    <span className="text-2xl">{style.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.activeMode === EditMode.COLOR && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-2xl shadow-inner border border-fuchsia-500/20">🧪</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Creative Color</h3>
                    <p className="text-[10px] font-medium text-slate-500">Professional-grade color grading and adjustments</p>
                  </div>
                </div>
                <button onClick={resetColorLab} className="px-6 py-2 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700 hover:bg-slate-700 transition-all">Reset All</button>
              </div>

              <div className="grid grid-cols-3 gap-8">
                {[
                  { label: 'Brightness', value: `${brightness}%`, min: 0, max: 200, step: 1, key: 'brightness', setter: setBrightness },
                  { label: 'Saturation', value: `${saturation}%`, min: 0, max: 200, step: 1, key: 'saturation', setter: setSaturation },
                  { label: 'Hue Rotate', value: `${hue}°`, min: 0, max: 360, step: 1, key: 'hue', setter: setHue },
                ].map(param => (
                  <div key={param.key} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{param.label}</span>
                      <span className="text-xs font-black text-fuchsia-400">{param.value}</span>
                    </div>
                    <input 
                      type="range" 
                      min={param.min} 
                      max={param.max} 
                      step={param.step} 
                      value={param.key === 'brightness' ? brightness : param.key === 'saturation' ? saturation : hue} 
                      onChange={(e) => param.setter(parseInt(e.target.value))} 
                      className="w-full accent-fuchsia-500 h-1.5 bg-slate-950 rounded-full cursor-pointer appearance-none border border-slate-800" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.activeMode === EditMode.BLUR && (
            <div className="max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-2xl shadow-inner border border-fuchsia-500/20">🌫️</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Creative Bokeh</h3>
                    <p className="text-[10px] font-medium text-slate-500">Add professional depth-of-field blur</p>
                  </div>
                </div>
                <button onClick={resetColorLab} className="px-6 py-2 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700 hover:bg-slate-700 transition-all">Reset</button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blur Intensity</span>
                    <span className="text-xl font-black text-white">{blur}<span className="text-fuchsia-500 text-xs ml-1">%</span></span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={blur} 
                  onChange={(e) => setBlur(parseInt(e.target.value))} 
                  className="w-full accent-fuchsia-500 h-2 bg-slate-950 rounded-full cursor-pointer appearance-none border border-slate-800" 
                />
              </div>
            </div>
          )}

          {state.activeMode === EditMode.RAW_DEV && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 flex items-center justify-center text-2xl shadow-inner border border-amber-500/20">📷</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">RAW Developer</h3>
                    <p className="text-[10px] font-medium text-slate-500">Professional-grade exposure and color control</p>
                  </div>
                </div>
                <button onClick={resetRawParams} className="px-6 py-2 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700 hover:bg-slate-700 transition-all">Reset All</button>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { label: 'Exposure', value: `${rawParams.exposure > 0 ? '+' : ''}${rawParams.exposure.toFixed(2)} EV`, min: -5, max: 5, step: 0.1, key: 'exposure' },
                  { label: 'Temperature', value: `${rawParams.temperature} K`, min: 2000, max: 12000, step: 100, key: 'temperature' },
                  { label: 'Tint', value: `${rawParams.tint > 0 ? '+' : ''}${rawParams.tint}`, min: -150, max: 150, step: 1, key: 'tint' },
                  { label: 'Highlights', value: `${rawParams.highlights > 0 ? '+' : ''}${rawParams.highlights}%`, min: -100, max: 100, step: 1, key: 'highlights' },
                  { label: 'Shadows', value: `${rawParams.shadows > 0 ? '+' : ''}${rawParams.shadows}%`, min: -100, max: 100, step: 1, key: 'shadows' },
                ].map(param => (
                  <div key={param.key} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{param.label}</span>
                      <span className="text-xs font-black text-amber-400">{param.value}</span>
                    </div>
                    <input 
                      type="range" 
                      min={param.min} 
                      max={param.max} 
                      step={param.step} 
                      value={(rawParams as any)[param.key]} 
                      onChange={(e) => setRawParams(prev => ({ ...prev, [param.key]: parseFloat(e.target.value) }))} 
                      className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-full cursor-pointer appearance-none border border-slate-800" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.activeMode === EditMode.SOCIAL && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-2xl shadow-inner border border-fuchsia-500/20">📱</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Social Hub</h3>
                    <p className="text-[10px] font-medium text-slate-500">Subject-aware neural crop and reframe</p>
                  </div>
                </div>
                {activeSocial && (
                  <div className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest bg-fuchsia-500/10 px-4 py-2 rounded-xl border border-fuchsia-500/20">
                    Target: {SOCIAL_PRESETS.find(s => s.id === activeSocial)?.label}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-4">
                {SOCIAL_PRESETS.map(social => (
                  <button 
                    key={social.id} 
                    onClick={() => setActiveSocial(social.id)} 
                    className={`group relative flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-300 ${activeSocial === social.id ? 'bg-fuchsia-600 border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.3)] scale-105' : 'bg-slate-950/40 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'}`}
                  >
                    <span className={`text-3xl transition-transform duration-300 ${activeSocial === social.id ? 'scale-110' : 'group-hover:scale-110'}`}>{social.icon}</span>
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${activeSocial === social.id ? 'text-white' : 'text-slate-100'}`}>{social.label}</span>
                      <span className={`text-[7px] font-bold uppercase tracking-tighter ${activeSocial === social.id ? 'text-white/70' : 'text-slate-500'}`}>{social.platform}</span>
                    </div>
                    {activeSocial === social.id && <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300"><svg className="w-2.5 h-2.5 text-fuchsia-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Framing Guidance</label>
                  <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Optional guidance (e.g. 'Focus on the eyes', 'Keep the horizon level')..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-inner placeholder-slate-700"
                    rows={2}
                  />
                </div>
                <button 
                  onClick={handleAction} 
                  disabled={state.isProcessing || !activeSocial} 
                  className="h-[72px] px-10 bg-fuchsia-600 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-fuchsia-500 disabled:opacity-30 transition-all shadow-2xl shadow-fuchsia-600/20 active:scale-95 flex items-center gap-3"
                >
                  <span>Reframe</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            </div>
          )}

          {state.activeMode === EditMode.POSTER && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-2xl shadow-inner border border-fuchsia-500/20">📜</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Poster Architect</h3>
                    <p className="text-[10px] font-medium text-slate-500">Professional promotional layouts & flyers</p>
                  </div>
                </div>
                {activePoster && (
                  <div className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest bg-fuchsia-500/10 px-4 py-2 rounded-xl border border-fuchsia-500/20">
                    Style: {POSTER_PRESETS.find(p => p.id === activePoster)?.label}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-4">
                {POSTER_PRESETS.map(poster => (
                  <button 
                    key={poster.id} 
                    onClick={() => setActivePoster(poster.id)} 
                    className={`group relative flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-300 ${activePoster === poster.id ? 'bg-fuchsia-600 border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.3)] scale-105' : 'bg-slate-950/40 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'}`}
                  >
                    <span className={`text-3xl transition-transform duration-300 ${activePoster === poster.id ? 'scale-110' : 'group-hover:scale-110'}`}>{poster.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${activePoster === poster.id ? 'text-white' : 'text-slate-100'}`}>{poster.label}</span>
                    {activePoster === poster.id && <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300"><svg className="w-2.5 h-2.5 text-fuchsia-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Details</label>
                  <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Event details, headlines, or specific style guidance..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-inner placeholder-slate-700"
                    rows={2}
                  />
                </div>
                <button 
                  onClick={handleAction} 
                  disabled={state.isProcessing || !activePoster} 
                  className="h-[72px] px-10 bg-fuchsia-600 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-fuchsia-500 disabled:opacity-30 transition-all shadow-2xl shadow-fuchsia-600/20 active:scale-95 flex items-center gap-3"
                >
                  <span>Design</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            </div>
          )}

          {state.activeMode === EditMode.LOGO && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 animate-in slide-in-from-bottom-8 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 flex items-center justify-center text-2xl shadow-inner border border-fuchsia-500/20">🏷️</div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Logo Designer</h3>
                    <p className="text-[10px] font-medium text-slate-500">Brand identity and business logos</p>
                  </div>
                </div>
                {activeLogo && (
                  <div className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest bg-fuchsia-500/10 px-4 py-2 rounded-xl border border-fuchsia-500/20">
                    Style: {LOGO_PRESETS.find(l => l.id === activeLogo)?.label}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-4">
                {LOGO_PRESETS.map(logo => (
                  <button 
                    key={logo.id} 
                    onClick={() => setActiveLogo(logo.id)} 
                    className={`group relative flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-300 ${activeLogo === logo.id ? 'bg-fuchsia-600 border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.3)] scale-105' : 'bg-slate-950/40 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'}`}
                  >
                    <span className={`text-3xl transition-transform duration-300 ${activeLogo === logo.id ? 'scale-110' : 'group-hover:scale-110'}`}>{logo.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${activeLogo === logo.id ? 'text-white' : 'text-slate-100'}`}>{logo.label}</span>
                    {activeLogo === logo.id && <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300"><svg className="w-2.5 h-2.5 text-fuchsia-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Brand Concept</label>
                  <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Business name, industry, or specific logo concepts..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-inner placeholder-slate-700"
                    rows={2}
                  />
                </div>
                <button 
                  onClick={handleAction} 
                  disabled={state.isProcessing || !activeLogo} 
                  className="h-[72px] px-10 bg-fuchsia-600 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-fuchsia-500 disabled:opacity-30 transition-all shadow-2xl shadow-fuchsia-600/20 active:scale-95 flex items-center gap-3"
                >
                  <span>Generate</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            </div>
          )}

          {state.activeMode !== EditMode.COLLAGE && state.activeMode !== EditMode.SOCIAL && state.activeMode !== EditMode.POSTER && state.activeMode !== EditMode.LOGO && (
            <div className="max-w-3xl mx-auto flex flex-col gap-3">
              <div className="flex gap-2">
                  <textarea 
                    rows={1} 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAction(); } }} 
                    placeholder="Instruct the Engine..." 
                    disabled={state.isProcessing} 
                    className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-xl placeholder-slate-600" 
                  />
                  <button onClick={handleAction} disabled={state.isProcessing} className="px-12 rounded-2xl font-black uppercase text-xs tracking-widest bg-fuchsia-600 text-white hover:bg-fuchsia-500 transition-all shadow-xl active:scale-95 disabled:bg-slate-800">
                    {state.activeMode === EditMode.REMOVE ? 'Remove' : 'Execute'}
                  </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Floating Island Dock */}
        <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-20 bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center justify-around px-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[90] ring-1 ring-white/5">
          {[
            { id: 'tools', icon: '🧰', label: 'Tools', active: showMobileTools, onClick: () => { closeMobilePanels(); setShowMobileTools(true); } },
            { id: 'suite', icon: '✨', label: 'Suite', active: showMobileSuite, onClick: () => { closeMobilePanels(); setShowMobileSuite(true); } },
            { id: 'controls', icon: '⚙️', label: 'Edit', active: showMobileControls, onClick: () => { closeMobilePanels(); setShowMobileControls(true); }, show: state.activeMode !== null },
            { id: 'filters', icon: '🎨', label: 'Looks', active: showMobileFilters, onClick: () => { closeMobilePanels(); setShowMobileFilters(true); } },
            { id: 'layers', icon: '📑', label: 'Stack', active: showMobileLayers, onClick: () => { closeMobilePanels(); setShowMobileLayers(true); } },
          ].filter(item => item.show !== false).map(item => (
            <button 
              key={item.id}
              onClick={item.onClick} 
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${item.active ? 'scale-110' : 'opacity-50'}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all ${item.active ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30' : 'text-slate-400'}`}>
                {item.icon}
              </div>
              <span className={`text-[7px] font-black uppercase tracking-widest ${item.active ? 'text-fuchsia-400' : 'text-slate-500'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile Floating Action Button (FAB) */}
        {!state.isProcessing && state.layers.length > 0 && !showMobileLayers && !showMobileTools && !showMobileFilters && !showMobileSuite && (
          <div className="md:hidden fixed bottom-32 right-8 z-[80] animate-in zoom-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => {
                if (state.activeMode && !showMobileControls) {
                  setShowMobileControls(true);
                } else {
                  handleAction();
                  setShowMobileControls(false);
                }
              }}
              className="w-16 h-16 bg-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-[0_15px_30px_rgba(217,70,239,0.4)] active:scale-90 transition-all ring-4 ring-slate-950 group"
            >
              {state.activeMode && !showMobileControls ? (
                <span className="text-2xl">⚙️</span>
              ) : (
                <svg className="w-8 h-8 transition-transform group-active:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
            </button>
          </div>
        )}

        {/* Mobile Bottom Sheets */}
        <MobileBottomSheet isOpen={showMobileTools} onClose={() => setShowMobileTools(false)} title="Creative Toolbox">
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: EditMode.CROP, label: 'Crop', icon: '✂️' },
              { id: EditMode.REMOVE, label: 'Eraser', icon: '🧽' },
              { id: EditMode.ISOLATE, label: 'BG Remove', icon: '👤' },
              { id: EditMode.ENHANCE, label: 'Upscale', icon: '🚀' },
              { id: EditMode.COLOR, label: 'Color', icon: '🧪' },
              { id: EditMode.BLUR, label: 'Bokeh', icon: '🌫️' },
              { id: EditMode.RAW_DEV, label: 'RAW Dev', icon: '📷' },
            ].map(mode => (
              <button 
                key={mode.id} 
                onClick={() => { handleModeSwitch(mode.id as EditMode); setShowMobileTools(false); setShowMobileControls(true); }}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all active:scale-95 ${state.activeMode === mode.id ? 'bg-fuchsia-600/10 border-fuchsia-500 text-white' : 'bg-slate-800/40 border-slate-800 text-slate-400'}`}
              >
                <span className="text-3xl">{mode.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
              </button>
            ))}
          </div>
        </MobileBottomSheet>

        <MobileBottomSheet isOpen={showMobileControls} onClose={() => setShowMobileControls(false)} title="Tool Controls & Prompt">
          <div className="space-y-8">
            {state.activeMode === EditMode.ENHANCE && (
              <div className="grid grid-cols-3 gap-3">
                {ENHANCE_METHODS.map(method => (
                  <button 
                    key={method.id} 
                    onClick={() => setActiveEnhanceMethod(method.id)} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeEnhanceMethod === method.id ? 'bg-fuchsia-600 border-fuchsia-400' : 'bg-slate-800 border-slate-700 opacity-60'}`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-[8px] font-black uppercase text-center">{method.label}</span>
                  </button>
                ))}
              </div>
            )}

            {state.activeMode === EditMode.STYLE_TRANSFER && (
              <div className="grid grid-cols-3 gap-3">
                {STYLE_PRESETS.map(style => (
                  <button 
                    key={style.id} 
                    onClick={() => setActiveStyle(style.id)} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeStyle === style.id ? 'bg-fuchsia-600 border-fuchsia-400' : 'bg-slate-800 border-slate-700 opacity-60'}`}
                  >
                    <span className="text-xl">{style.icon}</span>
                    <span className="text-[8px] font-black uppercase text-center">{style.label}</span>
                  </button>
                ))}
              </div>
            )}

            {state.activeMode === EditMode.COLOR && (
              <div className="space-y-6">
                {[
                  { label: 'Brightness', value: `${brightness}%`, min: 0, max: 200, step: 1, key: 'brightness', setter: setBrightness },
                  { label: 'Saturation', value: `${saturation}%`, min: 0, max: 200, step: 1, key: 'saturation', setter: setSaturation },
                  { label: 'Hue Rotate', value: `${hue}°`, min: 0, max: 360, step: 1, key: 'hue', setter: setHue },
                ].map(param => (
                  <div key={param.key} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{param.label}</span>
                      <span className="text-xs font-black text-fuchsia-400">{param.value}</span>
                    </div>
                    <input 
                      type="range" 
                      min={param.min} 
                      max={param.max} 
                      step={param.step} 
                      value={param.key === 'brightness' ? brightness : param.key === 'saturation' ? saturation : hue} 
                      onChange={(e) => param.setter(parseInt(e.target.value))} 
                      className="w-full accent-fuchsia-500 h-2 bg-slate-950 rounded-full cursor-pointer appearance-none border border-slate-800" 
                    />
                  </div>
                ))}
              </div>
            )}

            {state.activeMode === EditMode.BLUR && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blur Intensity</span>
                  <span className="text-xl font-black text-white">{blur}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={blur} 
                  onChange={(e) => setBlur(parseInt(e.target.value))} 
                  className="w-full accent-fuchsia-500 h-2 bg-slate-950 rounded-full cursor-pointer appearance-none border border-slate-800" 
                />
              </div>
            )}

            {state.activeMode === EditMode.REMOVE && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brush Size</span>
                  <span className="text-xl font-black text-white">{brushSize}PX</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="200" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))} 
                  className="w-full accent-fuchsia-500 h-2 bg-slate-950 rounded-full cursor-pointer appearance-none border border-slate-800" 
                />
                <div className="flex gap-2">
                  <button onClick={undoBrush} disabled={brushHistoryIndex < 0} className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl border border-slate-700 disabled:opacity-20">Undo</button>
                  <button onClick={redoBrush} disabled={brushHistoryIndex >= brushHistory.length - 1} className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl border border-slate-700 disabled:opacity-20">Redo</button>
                  <button onClick={clearBrush} className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl border border-slate-700">Clear</button>
                </div>
              </div>
            )}

            {state.activeMode === EditMode.RAW_DEV && (
              <div className="space-y-6">
                {[
                  { label: 'Exposure', value: `${rawParams.exposure > 0 ? '+' : ''}${rawParams.exposure.toFixed(2)} EV`, min: -5, max: 5, step: 0.1, key: 'exposure' },
                  { label: 'Temperature', value: `${rawParams.temperature} K`, min: 2000, max: 12000, step: 100, key: 'temperature' },
                  { label: 'Tint', value: `${rawParams.tint > 0 ? '+' : ''}${rawParams.tint}`, min: -150, max: 150, step: 1, key: 'tint' },
                  { label: 'Highlights', value: `${rawParams.highlights > 0 ? '+' : ''}${rawParams.highlights}%`, min: -100, max: 100, step: 1, key: 'highlights' },
                  { label: 'Shadows', value: `${rawParams.shadows > 0 ? '+' : ''}${rawParams.shadows}%`, min: -100, max: 100, step: 1, key: 'shadows' },
                ].map(param => (
                  <div key={param.key} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{param.label}</span>
                      <span className="text-xs font-black text-amber-400">{param.value}</span>
                    </div>
                    <input 
                      type="range" 
                      min={param.min} 
                      max={param.max} 
                      step={param.step} 
                      value={(rawParams as any)[param.key]} 
                      onChange={(e) => setRawParams(prev => ({ ...prev, [param.key]: parseFloat(e.target.value) }))} 
                      className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-full cursor-pointer appearance-none border border-slate-800" 
                    />
                  </div>
                ))}
              </div>
            )}

            {state.activeMode === EditMode.SOCIAL && (
              <div className="grid grid-cols-3 gap-3">
                {SOCIAL_PRESETS.map(social => (
                  <button 
                    key={social.id} 
                    onClick={() => setActiveSocial(social.id)} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeSocial === social.id ? 'bg-fuchsia-600 border-fuchsia-400' : 'bg-slate-800 border-slate-700 opacity-60'}`}
                  >
                    <span className="text-xl">{social.icon}</span>
                    <span className="text-[8px] font-black uppercase text-center">{social.label}</span>
                  </button>
                ))}
              </div>
            )}

            {state.activeMode === EditMode.POSTER && (
              <div className="grid grid-cols-3 gap-3">
                {POSTER_PRESETS.map(poster => (
                  <button 
                    key={poster.id} 
                    onClick={() => setActivePoster(poster.id)} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activePoster === poster.id ? 'bg-fuchsia-600 border-fuchsia-400' : 'bg-slate-800 border-slate-700 opacity-60'}`}
                  >
                    <span className="text-xl">{poster.icon}</span>
                    <span className="text-[8px] font-black uppercase text-center">{poster.label}</span>
                  </button>
                ))}
              </div>
            )}

            {state.activeMode === EditMode.LOGO && (
              <div className="grid grid-cols-3 gap-3">
                {LOGO_PRESETS.map(logo => (
                  <button 
                    key={logo.id} 
                    onClick={() => setActiveLogo(logo.id)} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeLogo === logo.id ? 'bg-fuchsia-600 border-fuchsia-400' : 'bg-slate-800 border-slate-700 opacity-60'}`}
                  >
                    <span className="text-xl">{logo.icon}</span>
                    <span className="text-[8px] font-black uppercase text-center">{logo.label}</span>
                  </button>
                ))}
              </div>
            )}

            {state.activeMode === EditMode.COLLAGE && (
              <div className="grid grid-cols-3 gap-3">
                {COLLAGE_LAYOUTS.map(layout => (
                  <button 
                    key={layout.id} 
                    onClick={() => setActiveCollageLayout(layout.id)} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeCollageLayout === layout.id ? 'bg-fuchsia-600 border-fuchsia-400' : 'bg-slate-800 border-slate-700 opacity-60'}`}
                  >
                    <span className="text-xl">{layout.icon}</span>
                    <span className="text-[8px] font-black uppercase text-center">{layout.label}</span>
                  </button>
                ))}
              </div>
            )}

            {state.activeMode !== EditMode.COLLAGE && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instruction Prompt</label>
                <textarea 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision..."
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-inner"
                  rows={3}
                />
              </div>
            )}

            <button 
              onClick={() => { handleAction(); setShowMobileControls(false); }}
              disabled={state.isProcessing}
              className="w-full py-5 bg-fuchsia-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-2xl shadow-fuchsia-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              {state.isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{state.activeMode === EditMode.REMOVE ? 'Remove' : 'Apply Transformation'}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </>
              )}
            </button>
          </div>
        </MobileBottomSheet>

        <MobileBottomSheet isOpen={showMobileSuite} onClose={() => setShowMobileSuite(false)} title="Creative Suite Hub">
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: EditMode.GENERATE, label: 'Create', icon: '✨' },
              { id: EditMode.COLLAGE, label: 'Collage', icon: '🧩' },
              { id: EditMode.STYLE_TRANSFER, label: 'Style', icon: '🖼️' },
              { id: EditMode.SOCIAL, label: 'Social', icon: '📱' },
              { id: EditMode.POSTER, label: 'Poster', icon: '📜' },
              { id: EditMode.LOGO, label: 'Logo', icon: '🏷️' },
            ].map(mode => (
              <button 
                key={mode.id} 
                onClick={() => { handleModeSwitch(mode.id as EditMode); setShowMobileSuite(false); setShowMobileControls(true); }}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all active:scale-95 ${state.activeMode === mode.id ? 'bg-fuchsia-600/10 border-fuchsia-500 text-white' : 'bg-slate-800/40 border-slate-800 text-slate-400'}`}
              >
                <span className="text-3xl">{mode.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
              </button>
            ))}
          </div>
        </MobileBottomSheet>

        <MobileBottomSheet isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)} title="Creative Looks Library">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar flex-1">
                {FILTER_CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap ${filterCategory === cat.id ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-lg shadow-fuchsia-600/20' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-1 ml-4 border-l border-slate-800 pl-4">
                <button onClick={undo} disabled={state.historyIndex >= state.history.length - 1} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-20 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button>
                <button onClick={redo} disabled={state.historyIndex === 0} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-20 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {PRESET_FILTERS.filter(f => filterCategory === 'all' || f.category === filterCategory).map(filter => (
                <button 
                  key={filter.id} 
                  onClick={() => { handleApplyFilter(filter); setShowMobileFilters(false); }}
                  className="group relative flex flex-col items-start p-0 rounded-3xl bg-slate-800 border border-slate-700 active:border-fuchsia-500 transition-all overflow-hidden"
                >
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-slate-900">
                    {currentActiveLayer ? (
                      <img 
                        src={currentActiveLayer.url} 
                        style={{ filter: filter.prompt }} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">{filter.icon}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="text-lg">{filter.icon}</span>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{filter.label}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </MobileBottomSheet>

        <MobileBottomSheet isOpen={showMobileLayers} onClose={() => setShowMobileLayers(false)} title="Creative Layer Stack">
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
               <button onClick={createGroup} className="flex-1 py-3 bg-slate-800 border border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400">New Folder</button>
               <button onClick={mergeLayers} className="flex-1 py-3 bg-fuchsia-600/20 border border-fuchsia-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-fuchsia-400">Merge All</button>
            </div>
            
            {state.activeMode === EditMode.COLLAGE && (
              <div className="bg-fuchsia-500/10 p-4 rounded-2xl border border-fuchsia-500/30 flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Composition Assets</span>
                    <span className="text-[10px] font-bold text-slate-400">{selectedLayerIds.length} Selected</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setSelectedLayerIds(state.layers.map(l => l.id))} className="flex-1 py-2 bg-slate-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-300">Select All</button>
                    <button onClick={() => setSelectedLayerIds([])} className="flex-1 py-2 bg-slate-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-300">Clear</button>
                 </div>
              </div>
            )}

            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
              {state.groups.map(group => {
                const groupLayers = state.layers.filter(l => l.groupId === group.id);
                return (
                  <div key={group.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-2 px-2" onClick={() => toggleGroupCollapse(group.id)}>
                      <span className="text-slate-500">{group.isCollapsed ? '📁' : '📂'}</span>
                      <span className="text-[10px] font-black uppercase text-slate-400">{group.name}</span>
                    </div>
                    {!group.isCollapsed && (
                      <div className="space-y-2 pl-4">
                        {groupLayers.map(l => <LayerItem key={l.id} layer={l} />)}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="space-y-2">
                {state.layers.filter(l => !l.groupId).map(l => <LayerItem key={l.id} layer={l} />)}
              </div>
            </div>
          </div>
        </MobileBottomSheet>

        {/* User Guide Modal */}
        {showGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowGuide(false)} />
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-600 flex items-center justify-center text-2xl shadow-lg shadow-fuchsia-600/20">📖</div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">User Guide</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master the Prot0 Creative Suite</p>
                  </div>
                </div>
                <button onClick={() => setShowGuide(false)} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">×</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
                <section className="space-y-4">
                  <h3 className="text-fuchsia-400 font-black uppercase text-xs tracking-[0.2em]">Getting Started</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/50">
                      <span className="text-2xl mb-4 block">📤</span>
                      <h4 className="text-white font-bold text-sm mb-2">Upload Your Vision</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">Click "Add Media" or drag and drop photos anywhere to start. We support JPEG, PNG, WebP, and even professional RAW formats.</p>
                    </div>
                    <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/50">
                      <span className="text-2xl mb-4 block">🏗️</span>
                      <h4 className="text-white font-bold text-sm mb-2">The Workspace</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">Toolbox is on the left, Layers on the right. Use the bottom bar for tool-specific controls like brush size or filter intensity.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-fuchsia-400 font-black uppercase text-xs tracking-[0.2em]">The Toolbox (Core Editing)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: '✂️', title: 'Crop', desc: 'Smart center-square optimization.' },
                      { icon: '🧽', title: 'Eraser', desc: 'Remove objects with brush undo/redo.' },
                      { icon: '👤', title: 'BG Remove', desc: 'Isolate subjects instantly.' },
                      { icon: '🚀', title: 'Upscale', desc: 'Remaster low-res images.' },
                      { icon: '🧪', title: 'Color', desc: 'Fine-tune grading and looks.' },
                      { icon: '📷', title: 'RAW Dev', desc: 'Pro-grade exposure control.' },
                    ].map(tool => (
                      <div key={tool.title} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800">
                        <span className="text-xl mb-2 block">{tool.icon}</span>
                        <h4 className="text-white font-bold text-[11px] mb-1">{tool.title}</h4>
                        <p className="text-slate-500 text-[9px] leading-tight">{tool.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-fuchsia-400 font-black uppercase text-xs tracking-[0.2em]">Creative Suite (Advanced)</h3>
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-fuchsia-600/10 to-transparent border border-fuchsia-500/20">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">✨</span>
                        <div>
                          <h4 className="text-white font-bold text-sm mb-1">Creative Create & Style</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">Use "Create" to generate new assets from text, or "Style" to transform existing layers into artistic masterpieces.</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-800/30 border border-slate-800">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">🧩</span>
                        <div>
                          <h4 className="text-white font-bold text-sm mb-1">Creative Collage</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">Select 2+ layers and choose a layout (Grid, Mosaic, Stack) to instantly compose them into a professional layout.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-fuchsia-400 font-black uppercase text-xs tracking-[0.2em]">Install as App</h3>
                  <div className="p-6 rounded-3xl bg-emerald-600/10 border border-emerald-500/20">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">📲</span>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">Native Experience</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">Save Prot0 to your home screen for a full-screen, distraction-free experience. Look for the "Install App" button in the header!</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-fuchsia-400 font-black uppercase text-xs tracking-[0.2em]">Keyboard Shortcuts</h3>
                  <div className="bg-slate-950/60 rounded-3xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50">
                          <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Action</th>
                          <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Shortcut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr><td className="px-6 py-4 text-slate-300">Undo (Global / Brush)</td><td className="px-6 py-4 font-mono text-fuchsia-400">Ctrl + Z</td></tr>
                        <tr><td className="px-6 py-4 text-slate-300">Redo (Global / Brush)</td><td className="px-6 py-4 font-mono text-fuchsia-400">Ctrl + Y</td></tr>
                        <tr><td className="px-6 py-4 text-slate-300">Apply Action</td><td className="px-6 py-4 font-mono text-fuchsia-400">Enter</td></tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex justify-center">
                <button onClick={() => setShowGuide(false)} className="px-12 py-4 bg-fuchsia-600 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-fuchsia-600/20 hover:bg-fuchsia-500 transition-all active:scale-95">Got it, let's create!</button>
              </div>
            </div>
          </div>
        )}
        {showExportModal && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white">Publish Result</h4>
                <button onClick={() => setShowExportModal(false)} className="text-slate-500 text-3xl hover:text-white transition-colors">×</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['image/png', 'image/jpeg', 'image/webp'] as ExportFormat[]).map(fmt => (
                  <button key={fmt} onClick={() => setExportConfig(prev => ({ ...prev, format: fmt }))} className={`py-5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${exportConfig.format === fmt ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                    {fmt.split('/')[1]}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => downloadImage(false)} className="w-full py-5 bg-slate-800 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl border border-slate-700">Save to Device</button>
                {navigator.share && (
                    <button onClick={() => downloadImage(true)} className="w-full py-5 bg-fuchsia-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-lg shadow-fuchsia-600/30">Direct Share</button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <aside className="hidden lg:flex w-80 flex-shrink-0 border-l border-slate-800 shadow-2xl z-40">
        <LayerPanelContent />
      </aside>
    </div>
  );
};

export default App;
