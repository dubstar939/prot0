import React, { useEffect, useCallback } from 'react';
import { 
  Plus, 
  Sparkles, 
  Layers, 
  Download, 
  Undo2, 
  Redo2, 
  Trash2, 
  Image as ImageIcon, 
  Wand2, 
  Scissors, 
  Palette, 
  Crop, 
  Layout, 
  Maximize, 
  Share2, 
  ChevronRight, 
  ChevronLeft, 
  Menu, 
  X, 
  Settings, 
  HelpCircle, 
  Zap, 
  Monitor, 
  Smartphone, 
  Grid, 
  Type, 
  History, 
  Save, 
  Search, 
  Filter, 
  Sliders, 
  Aperture, 
  Box, 
  Compass, 
  Dna, 
  Feather, 
  Focus, 
  Ghost, 
  Layers2, 
  Move, 
  Orbit, 
  Paintbrush, 
  Pipette, 
  RotateCcw, 
  Scan, 
  Shapes, 
  Stamp, 
  Sticker, 
  Sun, 
  Target, 
  Wind, 
  Workflow, 
  Eye, 
  EyeOff, 
  MoreVertical, 
  Copy, 
  Lock, 
  Unlock, 
  Group, 
  ChevronUp, 
  ChevronDown, 
  ArrowUpRight, 
  Check, 
  AlertCircle, 
  Loader2, 
  Upload, 
  Camera, 
  Video, 
  Mic, 
  Music, 
  Globe, 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github, 
  Youtube, 
  Twitch, 
  Slack, 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  Mic2, 
  Phone, 
  VideoOff, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  List, 
  Music2, 
  Disc, 
  Radio, 
  Headphones, 
  Cast, 
  Bluetooth, 
  Wifi, 
  Battery, 
  Clock, 
  Calendar, 
  Bell, 
  Mail as MailIcon, 
  Star, 
  Heart, 
  Bookmark, 
  Share, 
  ExternalLink, 
  Download as DownloadIcon, 
  RefreshCw, 
  Search as SearchIcon, 
  Filter as FilterIcon, 
  Sliders as SlidersIcon, 
  Settings as SettingsIcon, 
  User, 
  Users, 
  Home, 
  Layout as LayoutIcon, 
  File, 
  Folder, 
  Archive, 
  Cloud, 
  Database, 
  Server, 
  Terminal, 
  Code, 
  Cpu, 
  HardDrive, 
  MousePointer2, 
  Touchpad, 
  Keyboard, 
  Printer, 
  Tv, 
  Watch, 
  Smartphone as SmartphoneIcon, 
  Tablet, 
  Laptop, 
  Monitor as MonitorIcon, 
  CreditCard, 
  Wallet, 
  ShoppingBag, 
  ShoppingCart, 
  Tag, 
  Gift, 
  Trophy, 
  Medal, 
  Flag, 
  Map, 
  Pin, 
  Navigation, 
  Compass as CompassIcon, 
  Anchor, 
  Ship, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Bike, 
  Footprints, 
  Moon, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog, 
  Wind as WindIcon, 
  Droplets, 
  Thermometer, 
  Sunrise, 
  Sunset, 
  Mountain, 
  Trees, 
  Flower2, 
  Leaf, 
  Flame, 
  Zap as ZapIcon, 
  Skull, 
  Ghost as GhostIcon, 
  Eye as EyeIcon, 
  Brain, 
  Activity, 
  Stethoscope, 
  HeartPulse, 
  Microscope, 
  FlaskConical, 
  Atom, 
  Dna as DnaIcon, 
  Infinity, 
  Pi, 
  Sigma, 
  Variable, 
  FunctionSquare, 
  Binary, 
  Hash, 
  Percent, 
  Divide, 
  X as XIcon, 
  Minus, 
  Plus as PlusIcon, 
  Equal, 
  ChevronRight as ChevronRightIcon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronUp as ChevronUpIcon, 
  ChevronDown as ChevronDownIcon, 
  ChevronsRight, 
  ChevronsLeft, 
  ChevronsUp, 
  ChevronsDown, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpRight as ArrowUpRightIcon, 
  ArrowUpLeft, 
  ArrowDownRight, 
  ArrowDownLeft, 
  CornerRightUp, 
  CornerRightDown, 
  CornerLeftUp, 
  CornerLeftDown, 
  CornerUpRight, 
  CornerUpLeft, 
  CornerDownRight, 
  CornerDownLeft, 
  Move as MoveIcon, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw as RotateCcwIcon, 
  FlipHorizontal, 
  FlipVertical, 
  Crop as CropIcon, 
  Grid as GridIcon, 
  Columns, 
  Rows, 
  Square, 
  Circle, 
  Triangle, 
  Pentagon, 
  Hexagon, 
  Octagon, 
  Star as StarIcon, 
  Heart as HeartIcon, 
  Cloud as CloudIcon, 
  Zap as ZapIcon2, 
  Sun as SunIcon, 
  Moon as MoonIcon, 
  Droplet, 
  Flame as FlameIcon, 
  Leaf as LeafIcon, 
  Flower as FlowerIcon, 
  TreePine, 
  Mountain as MountainIcon, 
  Waves, 
  Wind as WindIcon2, 
  Snowflake, 
  Umbrella, 
  Briefcase, 
  GraduationCap, 
  Book, 
  BookOpen, 
  Library, 
  Pencil, 
  Eraser, 
  Brush, 
  Palette as PaletteIcon, 
  PaintBucket, 
  SprayCan, 
  PenTool, 
  MousePointer, 
  Grab, 
  Hand, 
  Pointer, 
  Scissors as ScissorsIcon, 
  Sticker as StickerIcon, 
  Stamp as StampIcon, 
  Type as TypeIcon, 
  Italic, 
  Bold, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List as ListIcon, 
  ListOrdered, 
  CheckSquare, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  HelpCircle as HelpCircleIcon, 
  MessageCircle, 
  MessageSquare as MessageSquareIcon, 
  Phone as PhoneIcon, 
  Video as VideoIcon, 
  Mail as MailIcon2, 
  Share2 as Share2Icon, 
  Link, 
  ExternalLink as ExternalLinkIcon, 
  Eye as EyeIcon2, 
  EyeOff as EyeOffIcon, 
  Lock as LockIcon, 
  Unlock as UnlockIcon, 
  Key, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldOff, 
  Fingerprint, 
  Scan as ScanIcon, 
  QrCode, 
  Barcode, 
  Bluetooth as BluetoothIcon, 
  Wifi as WifiIcon, 
  Cast as CastIcon, 
  Tv as TvIcon, 
  Speaker, 
  Mic as MicIcon2, 
  Headphones as HeadphonesIcon, 
  Music as MusicIcon, 
  Play as PlayIcon, 
  Pause as PauseIcon, 
  StopCircle, 
  FastForward, 
  Rewind, 
  SkipForward as SkipForwardIcon, 
  SkipBack as SkipBackIcon, 
  Repeat as RepeatIcon, 
  Shuffle as ShuffleIcon, 
  Volume1, 
  Volume2 as Volume2Icon, 
  VolumeX as VolumeXIcon, 
  Clock as ClockIcon, 
  Calendar as CalendarIcon, 
  Timer, 
  History as HistoryIcon, 
  Save as SaveIcon, 
  Download as DownloadIcon2, 
  Upload as UploadIcon, 
  Cloud as CloudIcon2, 
  CloudUpload, 
  CloudDownload, 
  HardDrive as HardDriveIcon, 
  Database as DatabaseIcon, 
  Server as ServerIcon, 
  Cpu as CpuIcon, 
  Terminal as TerminalIcon, 
  Code as CodeIcon, 
  Bug, 
  Activity as ActivityIcon, 
  HeartPulse as HeartPulseIcon, 
  Stethoscope as StethoscopeIcon, 
  Thermometer as ThermometerIcon, 
  Microscope as MicroscopeIcon, 
  FlaskConical as FlaskConicalIcon, 
  Atom as AtomIcon, 
  Dna as DnaIcon2, 
  Infinity as InfinityIcon, 
  Pi as PiIcon, 
  Sigma as SigmaIcon, 
  Variable as VariableIcon, 
  FunctionSquare as FunctionSquareIcon, 
  Binary as BinaryIcon, 
  Hash as HashIcon, 
  Percent as PercentIcon, 
  Divide as DivideIcon, 
  X as XIcon2, 
  Minus as MinusIcon, 
  Plus as PlusIcon2, 
  Equal as EqualIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  EditMode, 
  Layer, 
  LayerGroup, 
  TargetResolution, 
  FilterPreset, 
  SocialPreset, 
  BlendMode 
} from './types';
import { 
  FILTER_CATEGORIES, 
  PRESET_FILTERS, 
  STYLE_PRESETS, 
  SOCIAL_PRESETS, 
  POSTER_PRESETS, 
  LOGO_PRESETS, 
  COLLAGE_LAYOUTS, 
  BLEND_MODES, 
  ENHANCE_METHODS 
} from './src/constants';
import { useAppState } from './src/hooks/useAppState';
import { Logo } from './src/components/Logo';
import { CropOverlay } from './src/components/CropOverlay';
import { TransformOverlay } from './src/components/TransformOverlay';
import LayerPanelContent from './src/components/LayerPanelContent';
import MobileBottomSheet from './src/components/MobileBottomSheet';
import { 
  applyFiltersToImage, 
  resizeImageToAspectRatio, 
  createCollage, 
  cropImage 
} from './services/localImageService';
import { exportComposition, mergeLayersToDataUrl } from './src/services/canvasService';

const App: React.FC = () => {
  const {
    state,
    setState,
    prompt,
    setPrompt,
    showExportModal,
    setShowExportModal,
    showLayers,
    setShowLayers,
    showMobileLayers,
    setShowMobileLayers,
    showMobileTools,
    setShowMobileTools,
    showMobileSuite,
    setShowMobileSuite,
    showMobileFilters,
    setShowMobileFilters,
    showMobileControls,
    setShowMobileControls,
    showGuide,
    setShowGuide,
    deferredPrompt,
    setDeferredPrompt,
    exportConfig,
    setExportConfig,
    brushSize,
    setBrushSize,
    isBrushing,
    setIsBrushing,
    brushHistory,
    setBrushHistory,
    brushHistoryIndex,
    setBrushHistoryIndex,
    brightness,
    setBrightness,
    saturation,
    setSaturation,
    hue,
    setHue,
    blur,
    setBlur,
    activeEnhanceMethod,
    setActiveEnhanceMethod,
    enhanceIntensity,
    setEnhanceIntensity,
    isComparing,
    setIsComparing,
    activeStyle,
    setActiveStyle,
    activeSocial,
    setActiveSocial,
    activePoster,
    setActivePoster,
    activeLogo,
    setActiveLogo,
    activeCollageLayout,
    setActiveCollageLayout,
    filterCategory,
    setFilterCategory,
    cropRect,
    setCropRect,
    cropBounds,
    setCropBounds,
    draggedLayerId,
    setDraggedLayerId,
    dragOverLayerId,
    setDragOverLayerId,
    selectedLayerIds,
    setSelectedLayerIds,
    rawParams,
    setRawParams,
    imageRef,
    canvasRef,
    brushCanvasRef,
    fileInputRef,
    workspaceRef,
    addToHistory,
    undo,
    redo,
    deleteLayer,
    moveLayer,
    updateLayer,
    updateSelectedLayer,
    setActiveLayerId,
    toggleLayerSelection,
    groupSelectedLayers,
    ungroupLayer,
    createGroup,
    toggleGroupCollapse,
    toggleAllGroups,
    resetColorLab,
    resetRawParams,
    closeMobilePanels,
    handleModeSwitch,
    resetLayerToOriginal,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    duplicateLayer,
    flattenLayers,
    setIsProcessing,
    setError
  } = useAppState();

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const currentActiveLayer = state.layers.find(l => l.id === state.activeLayerId);

  const handleMergeLayers = async () => {
    if (state.layers.length < 2) return;
    setIsProcessing(true);
    try {
      // Use the dimensions of the first visible layer or workspace bounds
      const firstVisible = state.layers.find(l => l.isVisible);
      if (!firstVisible) return;
      
      const img = new Image();
      img.src = firstVisible.url;
      await new Promise(r => img.onload = r);
      
      const mergedUrl = await mergeLayersToDataUrl(state.layers, img.naturalWidth, img.naturalHeight);
      flattenLayers(mergedUrl);
    } catch (error) {
      console.error("Merge failed", error);
      setError("Failed to merge layers.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newLayer: Layer = {
        id: Date.now().toString(),
        url,
        originalUrl: url,
        opacity: 100,
        isVisible: true,
        name: file.name,
        blendMode: 'normal',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
      };
      addToHistory([newLayer, ...state.layers], newLayer.id, 'Import Image');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1", imageSize: state.targetResolution } }
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        const newLayer: Layer = {
          id: Date.now().toString(),
          url: imageUrl,
          originalUrl: imageUrl,
          opacity: 100,
          isVisible: true,
          name: `Generated: ${prompt.slice(0, 20)}...`,
          blendMode: 'normal',
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0
        };
        addToHistory([newLayer, ...state.layers], newLayer.id, 'Generate Image');
        setPrompt('');
      }
    } catch (error) {
      console.error("Generation failed", error);
      setState(prev => ({ ...prev, error: "Neural generation failed. Please try again." }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleEdit = async () => {
    if (!prompt || !currentActiveLayer) return;
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            { inlineData: { data: currentActiveLayer.url.split(',')[1], mimeType: "image/png" } },
            { text: prompt }
          ]
        }
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        const newLayers = state.layers.map(l => 
          l.id === state.activeLayerId ? { ...l, url: imageUrl, neuralPrompt: prompt } : l
        );
        addToHistory(newLayers, state.activeLayerId, 'Neural Edit');
        setPrompt('');
      }
    } catch (error) {
      console.error("Edit failed", error);
      setState(prev => ({ ...prev, error: "Neural edit failed. Please try again." }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleApplyFilter = async (filter: FilterPreset) => {
    if (!currentActiveLayer) return;
    const filteredUrl = await applyFiltersToImage(currentActiveLayer.url, filter.prompt);
    const newLayers = state.layers.map(l => 
      l.id === state.activeLayerId ? { ...l, url: filteredUrl, cssFilter: filter.prompt } : l
    );
    addToHistory(newLayers, state.activeLayerId, `Apply Filter: ${filter.label}`);
  };

  const handleApplyStyle = async (style: any) => {
    if (!currentActiveLayer) return;
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            { inlineData: { data: currentActiveLayer.url.split(',')[1], mimeType: "image/png" } },
            { text: `Apply the artistic style of ${style.artist} to this image. Maintain the original composition but transform the textures and colors.` }
          ]
        }
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        const newLayers = state.layers.map(l => 
          l.id === state.activeLayerId ? { ...l, url: imageUrl } : l
        );
        addToHistory(newLayers, state.activeLayerId, `Style Transfer: ${style.label}`);
      }
    } catch (error) {
      console.error("Style transfer failed", error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleSocialResize = async (preset: SocialPreset) => {
    if (!currentActiveLayer) return;
    const resizedUrl = await resizeImageToAspectRatio(currentActiveLayer.url, preset.aspectRatio);
    const newLayers = state.layers.map(l => 
      l.id === state.activeLayerId ? { ...l, url: resizedUrl } : l
    );
    addToHistory(newLayers, state.activeLayerId, `Social Resize: ${preset.label}`);
  };

  const handleCrop = async () => {
    if (!currentActiveLayer || !imageRef.current) return;
    const img = imageRef.current;
    const realX = (cropRect.x / 100) * img.naturalWidth;
    const realY = (cropRect.y / 100) * img.naturalHeight;
    const realW = (cropRect.width / 100) * img.naturalWidth;
    const realH = (cropRect.height / 100) * img.naturalHeight;

    const croppedUrl = await cropImage(currentActiveLayer.url, { x: realX, y: realY, width: realW, height: realH });
    const newLayers = state.layers.map(l => 
      l.id === state.activeLayerId ? { ...l, url: croppedUrl } : l
    );
    addToHistory(newLayers, state.activeLayerId, 'Crop Image');
    handleModeSwitch(EditMode.GENERATE);
  };

  const handleCollage = async () => {
    if (selectedLayerIds.length < 2) return;
    const urls = state.layers.filter(l => selectedLayerIds.includes(l.id)).map(l => l.url);
    const collageUrl = await createCollage(urls, activeCollageLayout as any);
    const newLayer: Layer = {
      id: Date.now().toString(),
      url: collageUrl,
      originalUrl: collageUrl,
      opacity: 100,
      isVisible: true,
      name: `Collage: ${activeCollageLayout}`,
      blendMode: 'normal',
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0
    };
    addToHistory([newLayer, ...state.layers], newLayer.id, 'Create Collage');
    handleModeSwitch(EditMode.GENERATE);
  };

  const handleExport = async () => {
    if (state.layers.length === 0) return;
    // For simplicity, we use the first layer's dimensions or a default
    const firstImg = new Image();
    firstImg.src = state.layers[0].url;
    await new Promise(r => firstImg.onload = r);
    
    await exportComposition(
      state.layers, 
      firstImg.naturalWidth, 
      firstImg.naturalHeight, 
      exportConfig
    );
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-fuchsia-500/30 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl z-50">
        <Logo />
        
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          {Object.values(EditMode).slice(0, 6).map(mode => (
            <button
              key={mode}
              onClick={() => handleModeSwitch(mode)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.activeMode === mode ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 mr-2">
            <button onClick={undo} disabled={state.historyIndex >= state.history.length - 1} className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition-all"><Undo2 className="w-5 h-5" /></button>
            <button onClick={redo} disabled={state.historyIndex === 0} className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition-all"><Redo2 className="w-5 h-5" /></button>
          </div>
          <button 
            onClick={() => setShowExportModal(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-fuchsia-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            Export
          </button>
          <button onClick={() => setShowLayers(!showLayers)} className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10"><Layers className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Tools */}
        <aside className="hidden md:flex w-20 flex-col items-center py-6 gap-6 border-r border-white/5 bg-black/20">
          {[
            { mode: EditMode.GENERATE, icon: <Sparkles />, label: 'Neural' },
            { mode: EditMode.COLOR, icon: <Sliders />, label: 'Color' },
            { mode: EditMode.STYLE_TRANSFER, icon: <Palette />, label: 'Style' },
            { mode: EditMode.CROP, icon: <Crop />, label: 'Crop' },
            { mode: EditMode.SOCIAL, icon: <Maximize />, label: 'Social' },
            { mode: EditMode.COLLAGE, icon: <Layout />, label: 'Collage' },
            { mode: EditMode.TRANSFORM, icon: <Move />, label: 'Move' },
          ].map(tool => (
            <button
              key={tool.mode}
              onClick={() => handleModeSwitch(tool.mode)}
              className={`group flex flex-col items-center gap-2 transition-all ${state.activeMode === tool.mode ? 'text-fuchsia-500' : 'text-white/30 hover:text-white'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${state.activeMode === tool.mode ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/5' : 'bg-white/5 border border-transparent group-hover:bg-white/10'}`}>
                {React.cloneElement(tool.icon as React.ReactElement, { className: 'w-5 h-5' })}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">{tool.label}</span>
            </button>
          ))}
        </aside>

        {/* Workspace */}
        <section ref={workspaceRef} className="flex-1 relative bg-[#0a0a0a] flex items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          <div className="relative max-w-full max-h-full shadow-2xl shadow-black/50 group">
            <AnimatePresence mode="wait">
              {state.layers.length > 0 ? (
                <div className="relative">
                  {state.layers.map((layer, idx) => (
                    <motion.div
                      key={layer.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: layer.isVisible ? (layer.opacity / 100) : 0, 
                        scale: layer.scale || 1,
                        x: layer.x || 0,
                        y: layer.y || 0,
                        rotate: layer.rotation || 0
                      }}
                      className="absolute inset-0 pointer-events-none"
                      style={{ 
                        zIndex: state.layers.length - idx,
                        mixBlendMode: layer.blendMode as any,
                        filter: layer.cssFilter
                      }}
                    >
                      <img 
                        src={isComparing && state.activeLayerId === layer.id ? layer.originalUrl : layer.url} 
                        alt={layer.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ))}
                  
                  {/* Active Layer Interaction Layer */}
                  {currentActiveLayer && (
                    <div className="relative z-[100]">
                      <img 
                        ref={imageRef}
                        src={isComparing ? currentActiveLayer.originalUrl : currentActiveLayer.url} 
                        alt="Active Layer"
                        className="max-w-full max-h-[70vh] object-contain opacity-0"
                        onLoad={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setCropBounds({ width: rect.width, height: rect.height, left: rect.left, top: rect.top });
                        }}
                      />
                      
                      {state.activeMode === EditMode.CROP && (
                        <CropOverlay rect={cropRect} onChange={setCropRect} imageRef={imageRef} />
                      )}
                      
                      {state.activeMode === EditMode.TRANSFORM && (
                        <TransformOverlay 
                          layer={currentActiveLayer} 
                          onChange={(updates) => updateSelectedLayer(updates)} 
                          imageRef={imageRef} 
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-8 text-center"
                >
                  <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-fuchsia-600/20 to-purple-600/20 border border-white/5 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-fuchsia-500 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tighter">Start your creation</h2>
                    <p className="text-white/40 text-sm max-w-xs">Upload an image or use neural generation to begin your masterpiece.</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
                    >
                      <Upload className="w-4 h-4" /> Import Image
                    </button>
                    <button 
                      onClick={() => handleModeSwitch(EditMode.GENERATE)}
                      className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
                    >
                      <Sparkles className="w-4 h-4" /> Neural Draft
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Controls */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-2 pr-6 border-r border-white/10">
              <button 
                onMouseDown={() => setIsComparing(true)}
                onMouseUp={() => setIsComparing(false)}
                onTouchStart={() => setIsComparing(true)}
                onTouchEnd={() => setIsComparing(false)}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                title="Compare with Original"
              >
                <History className="w-5 h-5" />
              </button>
              <button 
                onClick={() => currentActiveLayer && resetLayerToOriginal(currentActiveLayer.id)}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                title="Reset Layer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Resolution</span>
                <select 
                  value={state.targetResolution}
                  onChange={(e) => setState(prev => ({ ...prev, targetResolution: e.target.value as TargetResolution }))}
                  className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer hover:text-fuchsia-400 transition-colors"
                >
                  <option value="1K">1K Standard</option>
                  <option value="2K">2K High-Res</option>
                  <option value="4K">4K Ultra-HD</option>
                </select>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Active Mode</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-500">{state.activeMode}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel (Contextual) */}
        <aside className={`hidden md:flex w-80 flex-col border-l border-white/5 bg-black/40 backdrop-blur-xl transition-all ${showLayers ? 'mr-0' : '-mr-0'}`}>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {state.activeMode === EditMode.GENERATE || state.activeMode === EditMode.EDIT ? (
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Neural Engine</h3>
                    <Zap className="w-4 h-4 text-fuchsia-500" />
                  </div>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={state.activeMode === EditMode.GENERATE ? "Describe the image you want to create..." : "Describe the changes you want to make..."}
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-medium placeholder:text-white/20 focus:border-fuchsia-500/50 focus:bg-white/[0.07] outline-none transition-all resize-none"
                  />
                  <button 
                    onClick={state.activeMode === EditMode.GENERATE ? handleGenerate : handleEdit}
                    disabled={state.isProcessing || !prompt}
                    className="w-full py-5 bg-white text-black rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5"
                  >
                    {state.isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {state.activeMode === EditMode.GENERATE ? 'Generate Asset' : 'Apply Neural Edit'}
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Quick Looks</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PRESET_FILTERS.slice(0, 4).map(filter => (
                      <button 
                        key={filter.id}
                        onClick={() => handleApplyFilter(filter)}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-fuchsia-500/30 hover:bg-white/10 transition-all text-left group"
                      >
                        <span className="text-xl mb-2 block group-hover:scale-110 transition-transform">{filter.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{filter.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : state.activeMode === EditMode.COLOR ? (
              <div className="p-8 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Color Lab</h3>
                {[
                  { label: 'Brightness', value: brightness, setter: setBrightness, min: 0, max: 200 },
                  { label: 'Saturation', value: saturation, setter: setSaturation, min: 0, max: 200 },
                  { label: 'Hue', value: hue, setter: setHue, min: 0, max: 360 },
                  { label: 'Blur', value: blur, setter: setBlur, min: 0, max: 20 },
                ].map(control => (
                  <div key={control.label} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{control.label}</span>
                      <span className="text-[10px] font-mono text-fuchsia-500">{control.value}</span>
                    </div>
                    <input 
                      type="range" 
                      min={control.min} 
                      max={control.max} 
                      value={control.value} 
                      onChange={(e) => control.setter(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-fuchsia-500"
                    />
                  </div>
                ))}
                <button 
                  onClick={() => {
                    if (!currentActiveLayer) return;
                    const filter = `brightness(${brightness}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`;
                    handleApplyFilter({ id: 'custom', label: 'Custom', icon: '', prompt: filter, color: '' });
                  }}
                  className="w-full py-5 bg-fuchsia-600 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-500 transition-all"
                >
                  Apply Adjustments
                </button>
              </div>
            ) : state.activeMode === EditMode.CROP ? (
              <div className="p-8 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Precision Crop</h3>
                <p className="text-xs text-white/40 leading-relaxed">Adjust the handles in the workspace to define your crop area. Use the rule of thirds grid for better composition.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '1:1 Square', ratio: '1:1' },
                    { label: '4:5 Portrait', ratio: '4:5' },
                    { label: '16:9 Wide', ratio: '16:9' },
                    { label: '9:16 Story', ratio: '9:16' },
                  ].map(preset => (
                    <button 
                      key={preset.ratio}
                      onClick={() => {
                        const [w, h] = preset.ratio.split(':').map(Number);
                        const newH = (80 * (h/w));
                        setCropRect({ x: 10, y: 10, width: 80, height: Math.min(80, newH) });
                      }}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-fuchsia-500/30 transition-all text-[9px] font-black uppercase tracking-widest text-white/60"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleCrop}
                  className="w-full py-5 bg-white text-black rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                >
                  Confirm Crop
                </button>
              </div>
            ) : state.activeMode === EditMode.SOCIAL ? (
              <div className="p-8 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Social Optimizer</h3>
                <div className="space-y-3">
                  {SOCIAL_PRESETS.map(preset => (
                    <button 
                      key={preset.id}
                      onClick={() => handleSocialResize(preset)}
                      className="w-full p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-fuchsia-500/30 hover:bg-white/10 transition-all flex items-center gap-4 text-left"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl">{preset.icon}</div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white">{preset.label}</div>
                        <div className="text-[8px] font-bold uppercase tracking-widest text-white/30 mt-1">{preset.platform} • {preset.aspectRatio}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : state.activeMode === EditMode.COLLAGE ? (
              <div className="p-8 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Collage Architect</h3>
                <p className="text-xs text-white/40 leading-relaxed">Select 2 or more layers in the layer panel, then choose a layout to merge them into a creative collage.</p>
                <div className="space-y-3">
                  {COLLAGE_LAYOUTS.map(layout => (
                    <button 
                      key={layout.id}
                      onClick={() => {
                        setActiveCollageLayout(layout.id);
                        handleCollage();
                      }}
                      disabled={selectedLayerIds.length < 2}
                      className="w-full p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-fuchsia-500/30 hover:bg-white/10 transition-all flex items-center gap-4 text-left disabled:opacity-30"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl">{layout.icon}</div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white">{layout.label}</div>
                        <div className="text-[8px] font-bold uppercase tracking-widest text-white/30 mt-1">Smart Layout Engine</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Select a tool to begin</p>
              </div>
            )}
          </div>
          
          {/* Layer Panel (Integrated) */}
          <div className="h-1/2 border-t border-white/5">
            <LayerPanelContent 
              activeMode={state.activeMode}
              layers={state.layers}
              groups={state.groups}
              activeLayerId={state.activeLayerId}
              selectedLayerIds={selectedLayerIds}
              isComparing={isComparing}
              createGroup={createGroup}
              mergeLayers={handleMergeLayers}
              duplicateLayer={duplicateLayer}
              toggleGroupCollapse={toggleGroupCollapse}
              setActiveLayer={setActiveLayerId}
              updateLayer={updateLayer}
              deleteLayer={deleteLayer}
              moveLayer={moveLayer}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              setSelectedLayerIds={setSelectedLayerIds}
            />
          </div>
        </aside>
      </main>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tighter">Export Asset</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Configure your final output</p>
                  </div>
                  <button onClick={() => setShowExportModal(false)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Format</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['image/jpeg', 'image/png', 'image/webp'].map(format => (
                        <button 
                          key={format}
                          onClick={() => setExportConfig(prev => ({ ...prev, format: format as any }))}
                          className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${exportConfig.format === format ? 'bg-white text-black' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
                        >
                          {format.split('/')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Quality</label>
                      <span className="text-[10px] font-mono text-fuchsia-500">{exportConfig.quality}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={exportConfig.quality} 
                      onChange={(e) => setExportConfig(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-fuchsia-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleExport}
                  className="w-full py-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl shadow-fuchsia-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" /> Download Master Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheets */}
      <MobileBottomSheet isOpen={showMobileLayers} onClose={() => setShowMobileLayers(false)} title="Layers">
        <LayerPanelContent 
          activeMode={state.activeMode}
          layers={state.layers}
          groups={state.groups}
          activeLayerId={state.activeLayerId}
          selectedLayerIds={selectedLayerIds}
          isComparing={isComparing}
          createGroup={createGroup}
          mergeLayers={handleMergeLayers}
          duplicateLayer={duplicateLayer}
          toggleGroupCollapse={toggleGroupCollapse}
          setActiveLayer={(id) => { setActiveLayerId(id); setShowMobileLayers(false); }}
          updateLayer={updateLayer}
          deleteLayer={deleteLayer}
          moveLayer={moveLayer}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          setSelectedLayerIds={setSelectedLayerIds}
        />
      </MobileBottomSheet>

      {/* Mobile Nav */}
      <nav className="md:hidden h-20 border-t border-white/5 bg-black/80 backdrop-blur-2xl flex items-center justify-around px-6 pb-2">
        {[
          { mode: EditMode.GENERATE, icon: <Sparkles />, label: 'Neural' },
          { mode: EditMode.COLOR, icon: <Sliders />, label: 'Color' },
          { mode: EditMode.LAYERS, icon: <Layers />, label: 'Layers', onClick: () => setShowMobileLayers(true) },
          { mode: EditMode.TRANSFORM, icon: <Move />, label: 'Move' },
        ].map(tool => (
          <button
            key={tool.label}
            onClick={tool.onClick || (() => handleModeSwitch(tool.mode))}
            className={`flex flex-col items-center gap-1.5 ${state.activeMode === tool.mode ? 'text-fuchsia-500' : 'text-white/30'}`}
          >
            {React.cloneElement(tool.icon as React.ReactElement, { className: 'w-6 h-6' })}
            <span className="text-[8px] font-black uppercase tracking-widest">{tool.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
