
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EditMode, HistoryItem, AppState, FilterPreset, TargetResolution, Layer, ExportConfig, ExportFormat, BlendMode, LayerGroup, RawDevelopmentParams, SocialPreset } from './types';
import { editImageWithAI, generateImageFromText, createCollageWithAI } from './services/geminiService';

const PRESET_FILTERS: FilterPreset[] = [
  { id: 'vintage', label: 'Vintage', icon: '📷', color: 'bg-amber-500', prompt: "Apply a 1970s vintage analog film look with warm tones, slight grain, and faded shadows." },
  { id: 'mono', label: 'Monochrome', icon: '🏁', color: 'bg-slate-500', prompt: "Convert this image into a high-contrast artistic black and white photograph with deep shadows and clear highlights." },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬', color: 'bg-cyan-500', prompt: "Apply a cinematic teal and orange color grade with dramatic lighting and a high-budget movie atmosphere." },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '🏮', color: 'bg-fuchsia-500', prompt: "Transform this image with a cyberpunk aesthetic: neon pink and blue lighting, futuristic atmosphere, and high-tech glow." },
  { id: 'painting', label: 'Oil Painting', icon: '🎨', color: 'bg-orange-500', prompt: "Transform this image into a detailed, textured oil painting with visible brushstrokes and rich colors." },
  { id: 'sketch', label: 'Sketch', icon: '✏️', color: 'bg-zinc-400', prompt: "Transform this image into a minimalist architectural pencil and charcoal sketch on textured paper." },
  { id: 'noir', label: 'Noir', icon: '🕵️', color: 'bg-zinc-900', prompt: "Apply a Noir film aesthetic: intense high-contrast black and white, dramatic hard lighting with deep shadows, sharp edges, and a moody, mysterious atmosphere." },
  { id: 'vaporwave', label: 'Vaporwave', icon: '🌴', color: 'bg-purple-500', prompt: "Transform into a Vaporwave aesthetic: soft pastel pinks, purples, and cyans. Add a nostalgic 1980s retro-futuristic glow and low-fidelity digital textures." },
  { id: 'anime', label: 'Anime', icon: '⛩️', color: 'bg-rose-400', prompt: "Reimagine as high-quality modern Anime art: vibrant saturated colors, cel-shaded lighting, clean character-style outlines, and a painterly atmospheric background." },
  { id: 'solar', label: 'Solar', icon: '☀️', color: 'bg-orange-400', prompt: "Apply a Solarized effect: partially inverted tonal values, vibrant surreal color shifts, and high-energy glowing edges with an experimental photographic feel." },
  { id: 'blueprint', label: 'Blueprint', icon: '📐', color: 'bg-blue-600', prompt: "Convert into a technical Blueprint: deep cyan background with crisp white technical lines, architectural drafting style, and slight grid paper texture." },
  { id: 'infrared', label: 'Infrared', icon: '⚛️', color: 'bg-pink-300', prompt: "Simulate Infrared photography: foliage turned bright white and pink, deep dark skies, and a high-contrast ethereal dreamlike quality." },
];

const STYLE_PRESETS = [
  { id: 'gogh', label: 'Van Gogh', artist: 'Vincent van Gogh', icon: '🌻', prompt: "Apply the artistic style of Vincent van Gogh's 'Starry Night'. Use thick impasto brushstrokes, swirling energy, vibrant ochre yellows, and deep cobalt blues." },
  { id: 'picasso', label: 'Picasso', artist: 'Pablo Picasso', icon: '📐', prompt: "Transform this image into synthetic cubism in the style of Pablo Picasso. Use geometric fragmentation, bold flat color blocks, and abstract multi-perspective outlines." },
  { id: 'monet', label: 'Monet', artist: 'Claude Monet', icon: '🪷', prompt: "Apply an impressionist style inspired by Claude Monet. Focus on dappled light, soft atmospheric perspective, and visible small brushstrokes capturing the movement of light." },
  { id: 'hokusai', label: 'Hokusai', artist: 'Katsushika Hokusai', icon: '🌊', prompt: "Apply the Japanese Ukiyo-e woodblock print style of Hokusai. Use clean graphic lines, flat color gradients, and stylized natural forms like the 'Great Wave'." },
  { id: 'dali', label: 'Dalí', artist: 'Salvador Dalí', icon: '⏳', prompt: "Apply a surrealist style inspired by Salvador Dalí. Introduce dreamlike distortion, hyper-realistic textures in bizarre arrangements, and vast desert-like atmospheric light." },
  { id: 'warhol', label: 'Warhol', artist: 'Andy Warhol', icon: '🥫', prompt: "Transform into high-contrast Pop Art in the style of Andy Warhol. Use vibrant, saturated silkscreen print textures and bold complementary color palettes." },
];

const SOCIAL_PRESETS: SocialPreset[] = [
  { id: 'ig_square', platform: 'Instagram', label: 'Post (Square)', aspectRatio: '1:1', icon: '📸', description: 'Standard 1080x1080 square format.' },
  { id: 'ig_portrait', platform: 'Instagram', label: 'Post (Portrait)', aspectRatio: '4:5', icon: '🤳', description: 'Optimized 1080x1350 for feed impact.' },
  { id: 'ig_story', platform: 'TikTok / IG', label: 'Story / Reel', aspectRatio: '9:16', icon: '📱', description: 'Vertical 1080x1920 for stories and reels.' },
  { id: 'twitter', platform: 'Twitter / X', label: 'Landscape', aspectRatio: '16:9', icon: '🐦', description: 'Widescreen 1920x1080 optimized for web.' },
  { id: 'fb_cover', platform: 'Facebook', label: 'Cover', aspectRatio: '16:9', icon: '👥', description: 'Header optimization for profiles.' },
];

const COLLAGE_LAYOUTS = [
  { id: 'grid', label: 'Perfect Grid', icon: '▦', prompt: "Arrange images in a structured, symmetric grid with clean white gutters and minimalist framing." },
  { id: 'mosaic', label: 'Modern Mosaic', icon: '▩', prompt: "Create a dynamic mosaic layout with varying image sizes and interlocking rectangular frames for a busy, high-energy feel." },
  { id: 'triptych', label: 'Cinematic Triptych', icon: '▥', prompt: "Arrange the images in a cinematic horizontal triptych or wide sequential panel layout. Focus on storytelling flow." },
  { id: 'freestyle', label: 'Neural Freestyle', icon: '🌀', prompt: "Compose the images with organic, overlapping placements, tilted frames, and artistic shadow depth. Use a more experimental, scrapbook-like arrangement." },
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400">Neural</span>
        </div>
        <div className="text-xs font-light text-slate-400">by 939Pro Studio</div>
      </div>
    )}
  </div>
);

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({ format: 'image/jpeg', quality: 90 });
  const [brushSize, setBrushSize] = useState(40);
  const [isBrushing, setIsBrushing] = useState(false);
  
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [activeEnhanceMethod, setActiveEnhanceMethod] = useState<string>('remaster');
  const [enhanceIntensity, setEnhanceIntensity] = useState(75);
  const [isComparing, setIsComparing] = useState(false);
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [activeSocial, setActiveSocial] = useState<string | null>(null);
  const [activeCollageLayout, setActiveCollageLayout] = useState<string>('grid');
  
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

  const checkProKey = async () => {
    if (state.targetResolution !== '1K') {
      // @ts-ignore
      const hasKey = await window.aistudio?.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio?.openSelectKey();
        return false;
      }
    }
    return true;
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
    if (!(await checkProKey())) return;
    const isBackgroundRemoval = state.activeMode === EditMode.ISOLATE;
    const isEnhance = state.activeMode === EditMode.ENHANCE;
    const isRemoval = state.activeMode === EditMode.REMOVE;
    const isColorGrading = state.activeMode === EditMode.COLOR;
    const isBlur = state.activeMode === EditMode.BLUR;
    const isRawDev = state.activeMode === EditMode.RAW_DEV;
    const isStyleTransfer = state.activeMode === EditMode.STYLE_TRANSFER;
    const isSocial = state.activeMode === EditMode.SOCIAL;
    const isCollage = state.activeMode === EditMode.COLLAGE;

    if (!prompt.trim() && !isBackgroundRemoval && !isEnhance && !isRemoval && !isColorGrading && !isBlur && !isRawDev && !isStyleTransfer && !isSocial && !isCollage && state.activeMode !== EditMode.GENERATE) { 
      handleError("Please describe a transformation or select a tool."); return; 
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    const img = imageRef.current;
    let ar = img ? getClosestAspectRatio(img.naturalWidth, img.naturalHeight) : "1:1";

    try {
      let resultUrl = '';
      if (state.activeMode === EditMode.GENERATE) {
        resultUrl = await generateImageFromText(prompt);
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
        const layout = COLLAGE_LAYOUTS.find(l => l.id === activeCollageLayout);
        const finalPrompt = `Layout Strategy: ${layout?.label}. Style: ${layout?.prompt}. User Instruction: ${prompt}`;
        resultUrl = await createCollageWithAI(images, finalPrompt, ar, state.targetResolution);
        const newLayer: Layer = { 
          id: Date.now().toString(), 
          url: resultUrl, 
          originalUrl: resultUrl,
          opacity: 100, 
          isVisible: true, 
          name: `Composition: ${layout?.label}`, 
          blendMode: 'normal',
          neuralPrompt: finalPrompt
        };
        addToHistory([newLayer, ...state.layers], newLayer.id, 'Neural Collage');
        setSelectedLayerIds([]);
      } else {
        if (!currentActiveLayer) { handleError("Select a layer first."); return; }
        let finalPrompt = prompt;
        let maskBase64: string | undefined = undefined;

        if (isEnhance) {
          const method = ENHANCE_METHODS.find(m => m.id === activeEnhanceMethod);
          finalPrompt = `${method?.prompt} Processing Intensity: ${enhanceIntensity}%. Target resolution: ${state.targetResolution}. ${prompt}`;
        } else if (isStyleTransfer) {
          const style = STYLE_PRESETS.find(s => s.id === activeStyle);
          if (!style) { handleError("Please select an artist style first."); return; }
          finalPrompt = `Apply Artistic Style Transfer. Style: ${style.label} (${style.artist}). Instructions: ${style.prompt}. Style Application Intensity: ${enhanceIntensity}%. Combine this style with the user's manual guidance if present: ${prompt}`;
        } else if (isSocial) {
          const social = SOCIAL_PRESETS.find(s => s.id === activeSocial);
          ar = social?.aspectRatio || ar;
          finalPrompt = `Neural Resize and Subject-Aware Crop for ${social?.platform} ${social?.label}. Ensure main subject is centered and perfectly framed for ${ar} ratio. Intelligent content filling if necessary. ${prompt}`;
        } else if (isBackgroundRemoval) {
          finalPrompt = "Isolate the main subject by removing the background entirely. Output the subject on a clean, high-contrast background or extract it with high precision.";
        } else if (isRawDev) {
          finalPrompt = `Develop RAW image with following parameters: Exposure Offset ${rawParams.exposure}EV, Color Temperature ${rawParams.temperature}K, Tint ${rawParams.tint}, Highlights ${rawParams.highlights}%, Shadows ${rawParams.shadows}%. Enhance digital negative range. ${prompt}`;
        } else if (isRemoval) {
          finalPrompt = prompt || "Remove objects in the marked area and reconstruct the background naturally.";
          if (brushCanvasRef.current) {
            const temp = document.createElement('canvas');
            temp.width = brushCanvasRef.current.width; temp.height = brushCanvasRef.current.height;
            const tCtx = temp.getContext('2d');
            if (tCtx) { 
              tCtx.fillStyle = 'black'; 
              tCtx.fillRect(0, 0, temp.width, temp.height); 
              tCtx.drawImage(brushCanvasRef.current, 0, 0); 
              maskBase64 = temp.toDataURL('image/png'); 
            }
          }
        } else if (isColorGrading) {
          finalPrompt = `Color grade: Brightness ${brightness}%, Saturation ${saturation}%, Hue ${hue}°.`;
        } else if (isBlur) {
          finalPrompt = `Apply a realistic background blur (bokeh) effect with ${blur}% intensity. Keep the main subject sharp and in focus while blurring the background naturally. ${prompt}`;
        }
        
        resultUrl = await editImageWithAI(currentActiveLayer.url, finalPrompt, state.targetResolution, 'image/png', maskBase64, ar);
        const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, url: resultUrl, neuralPrompt: finalPrompt, rawParams: isRawDev ? rawParams : l.rawParams, blur: isBlur ? blur : l.blur } : l);
        addToHistory(newLayers, state.activeLayerId!, actionLabelFor(state.activeMode));
      }
      setPrompt('');
      setShowMobileTools(false);
      setShowMobileFilters(false);
    } catch (err: any) { 
      if (err.message?.includes("entity was not found")) {
        // @ts-ignore
        await window.aistudio?.openSelectKey();
      } else {
        handleError(err.message || "Neural Engine Error."); 
      }
    }
  };

  const actionLabelFor = (mode: EditMode) => {
    if (mode === EditMode.ENHANCE) return `Upscale (${state.targetResolution})`;
    if (mode === EditMode.STYLE_TRANSFER) return `Neural Style Transfer`;
    if (mode === EditMode.RAW_DEV) return `Neural RAW Development`;
    if (mode === EditMode.SOCIAL) return `Social Optimization`;
    if (mode === EditMode.ISOLATE) return `Background Removed`;
    if (mode === EditMode.REMOVE) return `Neural Object Removal`;
    if (mode === EditMode.COLOR) return `Color Grade Applied`;
    if (mode === EditMode.BLUR) return `Neural Bokeh Applied`;
    if (mode === EditMode.COLLAGE) return `Neural Collage created`;
    return `Neural Edit`;
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
      setIsBrushing(false); 
      ctx.closePath(); 
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
      const ar = imageRef.current ? getClosestAspectRatio(imageRef.current.naturalWidth, imageRef.current.naturalHeight) : "1:1";
      const resultUrl = await editImageWithAI(currentActiveLayer.url, filter.prompt, state.targetResolution, 'image/png', undefined, ar);
      const newLayers = state.layers.map(l => l.id === state.activeLayerId ? { ...l, url: resultUrl, neuralPrompt: filter.prompt } : l);
      addToHistory(newLayers, state.activeLayerId!, `Filter: ${filter.label}`);
      setPrompt('');
      setShowMobileFilters(false);
    } catch (err: any) {
      handleError(err.message || "Neural filter failed.");
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
                    title: 'Prot0 Neural Creation',
                    text: 'Created with Prot0 Neural Suite'
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
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{isSelected ? 'Active Selection' : 'Ready for Neural Mix'}</span>
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
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Stack</h3>
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
  };

  const closeMobilePanels = () => {
    setShowMobileLayers(false);
    setShowMobileTools(false);
    setShowMobileFilters(false);
  };

  const MobileBottomSheet: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="md:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-slate-900 rounded-t-[2.5rem] border-t border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 ease-out-expo shadow-2xl">
          <div className="w-full flex justify-center py-4 cursor-pointer" onClick={onClose}>
            <div className="w-12 h-1.5 bg-slate-700 rounded-full opacity-40 hover:opacity-100 transition-opacity" />
          </div>
          <div className="px-8 pb-6 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-400">{title}</h4>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 -mr-2">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24">
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
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Engine Controls</h3>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { id: EditMode.GENERATE, label: 'Neural Create', icon: '✨' },
                  { id: EditMode.COLLAGE, label: 'Neural Collage', icon: '🧩' },
                  { id: EditMode.EDIT, label: 'Neural Edit', icon: '🎨' },
                  { id: EditMode.REMOVE, label: 'Neural Eraser', icon: '🧽' },
                  { id: EditMode.ISOLATE, label: 'Remove Background', icon: '👤' },
                  { id: EditMode.ENHANCE, label: 'Upscale & Enhance', icon: '🚀' },
                  { id: EditMode.COLOR, label: 'Neural Color', icon: '🧪' },
                  { id: EditMode.BLUR, label: 'Neural Bokeh', icon: '🌫️' },
                  { id: EditMode.STYLE_TRANSFER, label: 'Neural Style', icon: '🖼️' },
                  { id: EditMode.SOCIAL, label: 'Social Hub', icon: '📱' },
                  { id: EditMode.RAW_DEV, label: 'RAW Developer', icon: '📷', show: currentActiveLayer?.isRaw },
                ].filter(m => m.show !== false).map((mode) => (
                  <button key={mode.id} onClick={() => handleModeSwitch(mode.id as EditMode)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${state.activeMode === mode.id ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                    <span className="text-lg">{mode.icon}</span> {mode.label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Neural Looks</h3>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_FILTERS.map((filter) => (
                  <button key={filter.id} disabled={state.layers.length === 0 || state.isProcessing} onClick={() => handleApplyFilter(filter)} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-fuchsia-500/50 transition-all group disabled:opacity-30 active:scale-95">
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{filter.icon}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{filter.label}</span>
                  </button>
                ))}
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
            <button onClick={() => setShowExportModal(true)} disabled={state.layers.length === 0} className="p-2.5 bg-fuchsia-600 rounded-xl text-xs font-black uppercase shadow-lg disabled:opacity-30 flex items-center gap-2">
               <span className="hidden md:inline">Publish</span>
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
          </div>
        </header>

        {/* Viewport Canvas Area */}
        <div ref={workspaceRef} className="flex-1 flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]">
          {state.error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-4">{state.error}</div>}
          
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none z-10">
            {state.layers.length === 0 ? (
              <div className="text-center space-y-5 pointer-events-auto animate-in fade-in zoom-in-95 duration-700">
                <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-dashed border-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4 hover:border-fuchsia-500 transition-all cursor-pointer bg-slate-900/40" onClick={() => fileInputRef.current?.click()}>
                  <span className="text-4xl text-slate-500 font-light">+</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Prot0 Neural Suite</h2>
                <p className="text-slate-500 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">Subject-aware neural scaling and professional creative suite.</p>
              </div>
            ) : (
              <div className="relative h-full w-full pointer-events-auto flex items-center justify-center">
                {state.activeMode === EditMode.COLLAGE && selectedLayerIds.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-slate-950/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-800 z-50">
                    <span className="text-4xl mb-4">🧩</span>
                    <h3 className="text-lg font-black uppercase text-white tracking-widest mb-2">Composition Hub</h3>
                    <p className="text-slate-400 text-xs max-w-[300px]">Select 2 or more images from your stack on the right to start building your neural collage.</p>
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
                      filter: layer.id === state.activeLayerId && state.activeMode === EditMode.COLOR 
                        ? `brightness(${brightness}%) saturate(${saturation}%) hue-rotate(${hue}deg)` 
                        : layer.id === state.activeLayerId && state.activeMode === EditMode.BLUR
                        ? `blur(${blur / 10}px)`
                        : 'none'
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

                {state.isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-slate-950/80 backdrop-blur-md rounded-2xl">
                    <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-5 shadow-lg" />
                    <span className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Running Neural Engine</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel Container (Desktop) */}
        <div className="hidden md:block px-8 pb-12 z-20 space-y-4">
          {state.activeMode === EditMode.COLLAGE && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 animate-in slide-in-from-bottom-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🧩</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.2em]">Neural Architect</span>
                    <span className="text-[8px] font-bold text-slate-500">Pick a layout strategy for your composition</span>
                  </div>
                </div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">Selected: <span className="text-fuchsia-400">{selectedLayerIds.length}</span></div>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {COLLAGE_LAYOUTS.map(layout => (
                  <button 
                    key={layout.id} 
                    onClick={() => setActiveCollageLayout(layout.id)} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeCollageLayout === layout.id ? 'bg-fuchsia-600/10 border-fuchsia-500 shadow-lg' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                    title={layout.prompt}
                  >
                    <span className="text-2xl mb-1">{layout.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-tight text-slate-100">{layout.label}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                 <div className="h-px bg-slate-800" />
                 <div className="flex gap-3">
                    <textarea 
                      value={prompt} 
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Theme guidance (e.g. 'Vintage scrapbook', 'Minimalist black & white')..."
                      className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-inner"
                      rows={2}
                    />
                    <button 
                      onClick={handleAction} 
                      disabled={state.isProcessing || selectedLayerIds.length < 2} 
                      className="px-8 bg-fuchsia-600 rounded-xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-fuchsia-500 disabled:opacity-30 transition-all shadow-xl active:scale-95"
                    >
                      Compose Collage
                    </button>
                 </div>
              </div>
            </div>
          )}

          {state.activeMode === EditMode.REMOVE && (
            <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 animate-in slide-in-from-bottom-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3"><span className="text-xl">🧽</span><div className="flex flex-col"><span className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.2em]">Neural Eraser</span></div></div>
                <button onClick={clearBrush} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-black uppercase rounded-lg border border-slate-700">Clear Selection</button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Brush Size</span><span className="text-fuchsia-400">{brushSize}px</span></div>
                <input type="range" min="5" max="200" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full accent-fuchsia-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
              </div>
            </div>
          )}

          {state.activeMode === EditMode.BLUR && (
            <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 animate-in slide-in-from-bottom-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3"><span className="text-xl">🌫️</span><div className="flex flex-col"><span className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.2em]">Neural Bokeh</span></div></div>
                <button onClick={resetColorLab} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-black uppercase rounded-lg border border-slate-700">Reset</button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Blur Intensity</span><span className="text-fuchsia-400">{blur}%</span></div>
                <input type="range" min="0" max="100" value={blur} onChange={(e) => setBlur(parseInt(e.target.value))} className="w-full accent-fuchsia-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
              </div>
            </div>
          )}

          {state.activeMode === EditMode.RAW_DEV && (
            <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 animate-in slide-in-from-bottom-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3"><span className="text-xl">📷</span><div className="flex flex-col"><span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Neural RAW Developer</span></div></div>
                <button onClick={resetRawParams} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-black uppercase rounded-lg border border-slate-700">Reset Parameters</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Exposure</span><span className="text-amber-400">{rawParams.exposure > 0 ? '+' : ''}{rawParams.exposure.toFixed(2)} EV</span></div>
                  <input type="range" min="-5" max="5" step="0.1" value={rawParams.exposure} onChange={(e) => setRawParams(prev => ({ ...prev, exposure: parseFloat(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Temperature</span><span className="text-amber-400">{rawParams.temperature} K</span></div>
                  <input type="range" min="2000" max="12000" step="100" value={rawParams.temperature} onChange={(e) => setRawParams(prev => ({ ...prev, temperature: parseInt(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Tint</span><span className="text-amber-400">{rawParams.tint > 0 ? '+' : ''}{rawParams.tint}</span></div>
                  <input type="range" min="-150" max="150" step="1" value={rawParams.tint} onChange={(e) => setRawParams(prev => ({ ...prev, tint: parseInt(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Highlights</span><span className="text-amber-400">{rawParams.highlights > 0 ? '+' : ''}{rawParams.highlights}%</span></div>
                  <input type="range" min="-100" max="100" step="1" value={rawParams.highlights} onChange={(e) => setRawParams(prev => ({ ...prev, highlights: parseInt(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Shadows</span><span className="text-amber-400">{rawParams.shadows > 0 ? '+' : ''}{rawParams.shadows}%</span></div>
                  <input type="range" min="-100" max="100" step="1" value={rawParams.shadows} onChange={(e) => setRawParams(prev => ({ ...prev, shadows: parseInt(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {state.activeMode === EditMode.SOCIAL && (
            <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 animate-in slide-in-from-bottom-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📱</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.2em]">Social Optimization Hub</span>
                    <span className="text-[8px] font-bold text-slate-500">Subject-aware neural crop and reframe for any platform</span>
                  </div>
                </div>
                {activeSocial && (
                  <div className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest bg-fuchsia-500/10 px-3 py-1.5 rounded-full border border-fuchsia-500/20">
                    Target: {SOCIAL_PRESETS.find(s => s.id === activeSocial)?.label}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-5 gap-3">
                {SOCIAL_PRESETS.map(social => (
                  <button 
                    key={social.id} 
                    onClick={() => setActiveSocial(social.id)} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeSocial === social.id ? 'bg-fuchsia-600/10 border-fuchsia-500 shadow-lg' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                  >
                    <span className="text-2xl mb-1">{social.icon}</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black uppercase tracking-tight text-slate-100">{social.label}</span>
                      <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">{social.platform}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                 <div className="h-px bg-slate-800" />
                 <div className="flex gap-3">
                    <textarea 
                      value={prompt} 
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Optional framing guidance (e.g. 'Focus on the eyes', 'Keep the horizon level')..."
                      className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-inner"
                      rows={2}
                    />
                    <button 
                      onClick={handleAction} 
                      disabled={state.isProcessing || !activeSocial} 
                      className="px-8 bg-fuchsia-600 rounded-xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-fuchsia-500 disabled:opacity-30 transition-all shadow-xl active:scale-95"
                    >
                      Neural Reframe
                    </button>
                 </div>
              </div>
            </div>
          )}

          {state.activeMode !== EditMode.COLLAGE && state.activeMode !== EditMode.SOCIAL && (
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
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-slate-900/70 backdrop-blur-2xl border border-white/5 rounded-full flex items-center justify-around px-4 shadow-2xl z-[90] ring-1 ring-white/10">
          <button onClick={() => { closeMobilePanels(); setShowMobileTools(true); }} className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${showMobileTools ? 'bg-fuchsia-600 text-white scale-110' : 'text-slate-400'}`}>
            <span className="text-xl">🪄</span>
          </button>
          <button onClick={() => { closeMobilePanels(); setShowMobileFilters(true); }} className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${showMobileFilters ? 'bg-fuchsia-600 text-white scale-110' : 'text-slate-400'}`}>
            <span className="text-xl">🎨</span>
          </button>
          <button onClick={() => { closeMobilePanels(); setShowMobileLayers(true); }} className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${showMobileLayers ? 'bg-fuchsia-600 text-white scale-110' : 'text-slate-400'}`}>
            <span className="text-xl">📑</span>
          </button>
          <button onClick={() => { handleModeSwitch(EditMode.SOCIAL); closeMobilePanels(); }} className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${state.activeMode === EditMode.SOCIAL ? 'bg-fuchsia-600 text-white scale-110' : 'text-slate-400'}`}>
            <span className="text-xl">📱</span>
          </button>
        </nav>

        {/* Mobile Floating Action Button (FAB) */}
        {!state.isProcessing && state.layers.length > 0 && !showMobileLayers && !showMobileTools && !showMobileFilters && state.activeMode !== EditMode.COLLAGE && (
          <div className="md:hidden fixed bottom-24 right-6 z-[80] animate-in zoom-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={handleAction}
              className="w-16 h-16 bg-fuchsia-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-fuchsia-600/40 active:scale-90 transition-transform ring-4 ring-slate-950"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        )}

        {/* Mobile Bottom Sheets */}
        <MobileBottomSheet isOpen={showMobileTools} onClose={() => setShowMobileTools(false)} title="Neural Engine Hub">
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: EditMode.GENERATE, label: 'Create', icon: '✨' },
              { id: EditMode.COLLAGE, label: 'Collage', icon: '🧩' },
              { id: EditMode.EDIT, label: 'Edit', icon: '🎨' },
              { id: EditMode.REMOVE, label: 'Eraser', icon: '🧽' },
              { id: EditMode.ISOLATE, label: 'BG Remove', icon: '👤' },
              { id: EditMode.ENHANCE, label: 'Upscale', icon: '🚀' },
              { id: EditMode.COLOR, label: 'Color', icon: '🧪' },
              { id: EditMode.BLUR, label: 'Bokeh', icon: '🌫️' },
              { id: EditMode.STYLE_TRANSFER, label: 'Style', icon: '🖼️' },
              { id: EditMode.SOCIAL, label: 'Social', icon: '📱' },
            ].map(mode => (
              <button 
                key={mode.id} 
                onClick={() => { handleModeSwitch(mode.id as EditMode); setShowMobileTools(false); }}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all active:scale-95 ${state.activeMode === mode.id ? 'bg-fuchsia-600/10 border-fuchsia-500 text-white' : 'bg-slate-800/40 border-slate-800 text-slate-400'}`}
              >
                <span className="text-3xl">{mode.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
              </button>
            ))}
          </div>
          {state.activeMode !== EditMode.COLLAGE && (
            <div className="mt-8 space-y-4">
              <div className="h-px bg-slate-800" />
              
              {state.activeMode === EditMode.RAW_DEV && (
                <div className="space-y-6 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Exposure</span><span className="text-amber-400">{rawParams.exposure > 0 ? '+' : ''}{rawParams.exposure.toFixed(2)} EV</span></div>
                    <input type="range" min="-5" max="5" step="0.1" value={rawParams.exposure} onChange={(e) => setRawParams(prev => ({ ...prev, exposure: parseFloat(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Temperature</span><span className="text-amber-400">{rawParams.temperature} K</span></div>
                    <input type="range" min="2000" max="12000" step="100" value={rawParams.temperature} onChange={(e) => setRawParams(prev => ({ ...prev, temperature: parseInt(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Tint</span><span className="text-amber-400">{rawParams.tint > 0 ? '+' : ''}{rawParams.tint}</span></div>
                    <input type="range" min="-150" max="150" step="1" value={rawParams.tint} onChange={(e) => setRawParams(prev => ({ ...prev, tint: parseInt(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Highlights</span><span className="text-amber-400">{rawParams.highlights > 0 ? '+' : ''}{rawParams.highlights}%</span></div>
                    <input type="range" min="-100" max="100" step="1" value={rawParams.highlights} onChange={(e) => setRawParams(prev => ({ ...prev, highlights: parseInt(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest"><span>Shadows</span><span className="text-amber-400">{rawParams.shadows > 0 ? '+' : ''}{rawParams.shadows}%</span></div>
                    <input type="range" min="-100" max="100" step="1" value={rawParams.shadows} onChange={(e) => setRawParams(prev => ({ ...prev, shadows: parseInt(e.target.value) }))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full cursor-pointer" />
                  </div>
                  <button onClick={resetRawParams} className="w-full py-3 bg-slate-800 text-slate-300 text-[10px] font-black uppercase rounded-xl border border-slate-700">Reset Parameters</button>
                  <div className="h-px bg-slate-800" />
                </div>
              )}

              {state.activeMode === EditMode.SOCIAL && (
                <div className="space-y-6 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    {SOCIAL_PRESETS.map(social => (
                      <button 
                        key={social.id} 
                        onClick={() => setActiveSocial(social.id)} 
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${activeSocial === social.id ? 'bg-fuchsia-600/10 border-fuchsia-500' : 'bg-slate-950/40 border-slate-800'}`}
                      >
                        <span className="text-xl">{social.icon}</span>
                        <div className="flex flex-col items-start">
                          <span className="text-[9px] font-black uppercase tracking-tight text-slate-100">{social.label}</span>
                          <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">{social.platform}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="h-px bg-slate-800" />
                </div>
              )}

              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Instruction Input</label>
              <textarea 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="How should the Engine transform this?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-5 text-sm focus:outline-none focus:border-fuchsia-500 transition-all resize-none shadow-xl"
                  rows={2}
              />
              <button onClick={() => { handleAction(); setShowMobileTools(false); }} className="w-full py-5 bg-fuchsia-600 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-fuchsia-600/20 active:scale-95">Run Transformation</button>
            </div>
          )}
        </MobileBottomSheet>

        <MobileBottomSheet isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)} title="Neural Looks Library">
          <div className="grid grid-cols-3 gap-3">
            {PRESET_FILTERS.map(filter => (
              <button 
                key={filter.id} 
                onClick={() => handleApplyFilter(filter)}
                className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-slate-800/40 border border-slate-800 active:bg-fuchsia-600/20 active:border-fuchsia-500 transition-all"
              >
                <span className="text-2xl">{filter.icon}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{filter.label}</span>
              </button>
            ))}
          </div>
        </MobileBottomSheet>

        <MobileBottomSheet isOpen={showMobileLayers} onClose={() => setShowMobileLayers(false)} title="Neural Layer Stack">
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

        {/* Export Modal */}
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
