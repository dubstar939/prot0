import React, { useState, useCallback, useRef } from 'react';
import { 
  AppState, 
  EditMode, 
  Layer, 
  HistoryItem, 
  TargetResolution, 
  RawDevelopmentParams,
  ExportConfig,
  LayerGroup
} from '../../types';

/**
 * @fileoverview Custom hook for managing the application state.
 * Handles layers, history, active modes, and various UI states.
 */

/**
 * Hook to manage the core application state and history.
 * 
 * @returns {Object} State and state management functions.
 */
/**
 * Custom hook to manage the application's state, including layers, history, UI states, and refs.
 * Encapsulates complex state logic to keep the main App component clean and maintainable.
 * 
 * @returns {Object} An object containing all state variables, setters, refs, and helper functions.
 * 
 * @example
 * const { state, addToHistory, undo, redo, deleteLayer } = useAppState();
 */
export const useAppState = () => {
  /**
   * Core application state including layers, groups, history, and processing status.
   * @type {AppState}
   */
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

  /** Current text prompt for generation or editing. */
  const [prompt, setPrompt] = useState('');
  /** Visibility of the export configuration modal. */
  const [showExportModal, setShowExportModal] = useState(false);
  /** Visibility of the desktop layers panel. */
  const [showLayers, setShowLayers] = useState(false);
  /** Visibility of the mobile layers panel. */
  const [showMobileLayers, setShowMobileLayers] = useState(false);
  /** Visibility of the mobile tools panel. */
  const [showMobileTools, setShowMobileTools] = useState(false);
  /** Visibility of the mobile suite panel. */
  const [showMobileSuite, setShowMobileSuite] = useState(false);
  /** Visibility of the mobile filters panel. */
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  /** Visibility of the mobile controls panel. */
  const [showMobileControls, setShowMobileControls] = useState(false);
  /** Visibility of the user guide modal. */
  const [showGuide, setShowGuide] = useState(false);
  /** Deferred PWA install prompt. */
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  /** Configuration for image export (format, quality). */
  const [exportConfig, setExportConfig] = useState<ExportConfig>({ format: 'image/jpeg', quality: 90 });
  /** Size of the brush tool. */
  const [brushSize, setBrushSize] = useState(40);
  /** Whether the user is currently brushing. */
  const [isBrushing, setIsBrushing] = useState(false);
  /** History of brush strokes for local undo/redo. */
  const [brushHistory, setBrushHistory] = useState<string[]>([]);
  /** Current index in the brush history. */
  const [brushHistoryIndex, setBrushHistoryIndex] = useState(-1);
  
  /** Brightness adjustment value (0-200). */
  const [brightness, setBrightness] = useState(100);
  /** Saturation adjustment value (0-200). */
  const [saturation, setSaturation] = useState(100);
  /** Hue rotation adjustment value (0-360). */
  const [hue, setHue] = useState(0);
  /** Blur intensity adjustment value (0-100). */
  const [blur, setBlur] = useState(0);
  /** Currently active enhancement method (e.g., 'remaster'). */
  const [activeEnhanceMethod, setActiveEnhanceMethod] = useState<string>('remaster');
  /** Intensity of the enhancement effect (0-100). */
  const [enhanceIntensity, setEnhanceIntensity] = useState(75);
  /** Whether comparison mode (original vs. edited) is active. */
  const [isComparing, setIsComparing] = useState(false);
  /** Currently selected style preset ID. */
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  /** Currently selected social media preset ID. */
  const [activeSocial, setActiveSocial] = useState<string | null>(null);
  /** Currently selected poster preset ID. */
  const [activePoster, setActivePoster] = useState<string | null>(null);
  /** Currently selected logo preset ID. */
  const [activeLogo, setActiveLogo] = useState<string | null>(null);
  /** Currently selected collage layout ID. */
  const [activeCollageLayout, setActiveCollageLayout] = useState<string>('grid');
  /** Currently selected filter category (e.g., 'all', 'artistic'). */
  const [filterCategory, setFilterCategory] = useState<string>('all');
  /** Current crop rectangle coordinates and dimensions. */
  const [cropRect, setCropRect] = useState({ x: 10, y: 10, width: 80, height: 80 });
  /** Bounding box of the image within the workspace for overlay positioning. */
  const [cropBounds, setCropBounds] = useState({ width: 0, height: 0, left: 0, top: 0 });

  /** ID of the layer currently being dragged. */
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  /** ID of the layer being dragged over. */
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);

  /** Ref for the workspace container element. */
  const workspaceRef = useRef<HTMLDivElement>(null);

  /**
   * Adds a new state to the history for undo/redo.
   * Matches the stack-based history logic from the original App.tsx.
   * 
   * @param {Layer[]} layers - The new layers state.
   * @param {string | null} activeLayerId - The new active layer ID.
   * @param {string} [actionLabel] - A label describing the action for history display.
   * @param {LayerGroup[]} [groups=state.groups] - The new groups state.
   */
  const addToHistory = useCallback((layers: Layer[], activeLayerId: string | null, actionLabel?: string, groups: LayerGroup[] = state.groups) => {
    setState(prev => {
      const slicedHistory = prev.history.slice(prev.historyIndex);
      const newItem: HistoryItem = { 
        id: Date.now().toString(), 
        layers, 
        activeLayerId: activeLayerId || '', 
        groups, 
        timestamp: Date.now(), 
        prompt: actionLabel 
      };
      return { 
        ...prev, 
        history: [newItem, ...slicedHistory], 
        historyIndex: 0, 
        isProcessing: false, 
        layers, 
        activeLayerId, 
        groups 
      };
    });
  }, [state.groups]);

  /**
   * Handles the start of a layer drag operation.
   * 
   * @param {React.DragEvent} e - The drag event.
   * @param {string} id - The ID of the layer being dragged.
   */
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedLayerId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    const ghost = e.currentTarget as HTMLElement;
    ghost.style.opacity = '0.5';
  }, []);

  /**
   * Handles the end of a layer drag operation.
   * 
   * @param {React.DragEvent} e - The drag event.
   */
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  }, []);

  /**
   * Handles the drag over event to provide visual feedback.
   * 
   * @param {React.DragEvent} e - The drag event.
   * @param {string} id - The ID of the layer being dragged over.
   */
  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedLayerId !== id) {
      setDragOverLayerId(id);
    }
  }, [draggedLayerId]);

  /**
   * Handles the drop event to reorder layers.
   * 
   * @param {React.DragEvent} e - The drag event.
   * @param {string} targetId - The ID of the layer where the dragged layer was dropped.
   */
  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
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
  }, [draggedLayerId, state.layers, addToHistory]);
  /** IDs of layers currently selected (for batch actions like collage). */
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);

  /** Parameters for RAW image development. */
  const [rawParams, setRawParams] = useState<RawDevelopmentParams>({
    exposure: 0,
    temperature: 5600,
    tint: 0,
    highlights: 0,
    shadows: 0
  });

  /** Ref for the main image element. */
  const imageRef = useRef<HTMLImageElement>(null);
  /** Ref for the main canvas element. */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Ref for the brush drawing canvas element. */
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  /** Ref for the hidden file input element. */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Undoes the last action by moving forward in the history stack.
   */
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const newIndex = prev.historyIndex + 1;
      const historyItem = prev.history[newIndex];
      return {
        ...prev,
        layers: historyItem.layers,
        groups: historyItem.groups,
        activeLayerId: historyItem.activeLayerId,
        historyIndex: newIndex
      };
    });
  }, []);

  /**
   * Redoes the last undone action by moving backward in the history stack.
   */
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev;
      const newIndex = prev.historyIndex - 1;
      const historyItem = prev.history[newIndex];
      return {
        ...prev,
        layers: historyItem.layers,
        groups: historyItem.groups,
        activeLayerId: historyItem.activeLayerId,
        historyIndex: newIndex
      };
    });
  }, []);

  /**
   * Deletes a layer by ID and updates history.
   * 
   * @param {string} id - The ID of the layer to delete.
   */
  const deleteLayer = useCallback((id: string) => {
    const newLayers = state.layers.filter(l => l.id !== id);
    const newActiveId = state.activeLayerId === id ? (newLayers[0]?.id || null) : state.activeLayerId;
    addToHistory(newLayers, newActiveId, 'Delete Layer');
  }, [state.layers, state.activeLayerId, addToHistory]);

  /**
   * Moves a layer up, down, to the top, or to the bottom within the layers list.
   * 
   * @param {string} id - The ID of the layer to move.
   * @param {'up' | 'down' | 'top' | 'bottom'} direction - The direction to move the layer.
   */
  const moveLayer = useCallback((id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const index = state.layers.findIndex(l => l.id === id);
    if (index === -1) return;

    const newLayers = [...state.layers];
    const layer = newLayers.splice(index, 1)[0];

    if (direction === 'up' && index > 0) {
      newLayers.splice(index - 1, 0, layer);
    } else if (direction === 'down' && index < state.layers.length - 1) {
      newLayers.splice(index + 1, 0, layer);
    } else if (direction === 'top') {
      newLayers.unshift(layer);
    } else if (direction === 'bottom') {
      newLayers.push(layer);
    } else {
      return;
    }

    addToHistory(newLayers, id, 'Reorder Layers');
  }, [state.layers, addToHistory]);

  /**
   * Updates the currently active layer with partial properties.
   * 
   * @param {Partial<Layer>} updates - The properties to update on the active layer.
   */
  const updateSelectedLayer = useCallback((updates: Partial<Layer>) => {
    if (!state.activeLayerId) return;
    const newLayers = state.layers.map(l => 
      l.id === state.activeLayerId ? { ...l, ...updates } : l
    );
    // Note: We don't always want to add to history for every small update (like dragging)
    // but for discrete property changes we do. For now, we update state directly.
    setState(prev => ({ ...prev, layers: newLayers }));
  }, [state.activeLayerId, state.layers]);

  /**
   * Updates a specific layer by ID with partial properties.
   * 
   * @param {string} id - The ID of the layer to update.
   * @param {Partial<Layer>} updates - The properties to update.
   */
  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    const newLayers = state.layers.map(l => 
      l.id === id ? { ...l, ...updates } : l
    );
    setState(prev => ({ ...prev, layers: newLayers }));
  }, [state.layers]);

  /**
   * Sets the active layer by ID.
   * 
   * @param {string | null} id - The ID of the layer to set as active.
   */
  const setActiveLayerId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, activeLayerId: id }));
  }, []);

  /**
   * Duplicates a layer by ID and adds it to the stack.
   * 
   * @param {string} id - The ID of the layer to duplicate.
   */
  const duplicateLayer = useCallback((id: string) => {
    const layer = state.layers.find(l => l.id === id);
    if (!layer) return;

    const newLayer: Layer = {
      ...layer,
      id: Date.now().toString(),
      name: `${layer.name} (Copy)`,
      x: (layer.x || 0) + 20,
      y: (layer.y || 0) + 20
    };

    const index = state.layers.findIndex(l => l.id === id);
    const newLayers = [...state.layers];
    newLayers.splice(index, 0, newLayer);
    
    addToHistory(newLayers, newLayer.id, 'Duplicate Layer');
  }, [state.layers, addToHistory]);

  /**
   * Flattens all visible layers into a single new layer.
   * 
   * @param {string} mergedUrl - The data URL of the merged image.
   */
  const flattenLayers = useCallback((mergedUrl: string) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      url: mergedUrl,
      originalUrl: mergedUrl,
      opacity: 100,
      isVisible: true,
      name: 'Flattened Composition',
      blendMode: 'normal',
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0
    };
    addToHistory([newLayer], newLayer.id, 'Flatten Layers', []);
  }, [addToHistory]);

  /**
   * Toggles the selection of a layer for batch actions.
   * 
   * @param {string} id - The ID of the layer to toggle.
   */
  const toggleLayerSelection = useCallback((id: string) => {
    setSelectedLayerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  /**
   * Groups the currently selected layers into a new group.
   */
  const groupSelectedLayers = useCallback(() => {
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
  }, [selectedLayerIds, state.groups, state.layers, state.activeLayerId, addToHistory]);

  /**
   * Removes a layer from its group.
   * 
   * @param {string} layerId - The ID of the layer to ungroup.
   */
  const ungroupLayer = useCallback((layerId: string) => {
    const newLayers = state.layers.map(l => l.id === layerId ? { ...l, groupId: undefined } : l);
    addToHistory(newLayers, state.activeLayerId!, 'Ungroup Layer');
  }, [state.layers, state.activeLayerId, addToHistory]);

  /**
   * Creates a new empty layer group.
   */
  const createGroup = useCallback(() => {
    const newGroup: LayerGroup = { 
      id: Date.now().toString(), 
      name: `Group ${state.groups.length + 1}`, 
      isCollapsed: false 
    };
    setState(prev => ({ ...prev, groups: [...prev.groups, newGroup] }));
  }, [state.groups]);

  /**
   * Toggles the collapsed state of a layer group.
   * 
   * @param {string} id - The ID of the group to toggle.
   */
  const toggleGroupCollapse = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === id ? { ...g, isCollapsed: !g.isCollapsed } : g)
    }));
  }, []);

  /**
   * Collapses or expands all layer groups.
   * 
   * @param {boolean} collapse - Whether to collapse all groups.
   */
  const toggleAllGroups = useCallback((collapse: boolean) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => ({ ...g, isCollapsed: collapse }))
    }));
  }, []);

  /**
   * Resets color adjustment parameters to their default values.
   */
  const resetColorLab = useCallback(() => {
    setBrightness(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
  }, []);

  /**
   * Resets RAW development parameters to their default values.
   */
  const resetRawParams = useCallback(() => {
    setRawParams({
      exposure: 0,
      temperature: 5600,
      tint: 0,
      highlights: 0,
      shadows: 0
    });
  }, []);

  /**
   * Closes all mobile panels.
   */
  const closeMobilePanels = useCallback(() => {
    setShowMobileLayers(false);
    setShowMobileTools(false);
    setShowMobileSuite(false);
    setShowMobileFilters(false);
    setShowMobileControls(false);
  }, []);

  /**
   * Switches the active editing mode and performs necessary resets.
   * 
   * @param {EditMode} mode - The new editing mode to switch to.
   */
  const handleModeSwitch = useCallback((mode: EditMode) => {
    setState(prev => ({ ...prev, activeMode: mode }));
    // Mode-specific resets
    if (mode !== EditMode.COLOR && mode !== EditMode.RAW_DEV && mode !== EditMode.BLUR) resetColorLab();
    if (mode !== EditMode.COLLAGE) setSelectedLayerIds([]);
    if (mode !== EditMode.SOCIAL) setActiveSocial(null);
    if (mode !== EditMode.POSTER) setActivePoster(null);
    if (mode !== EditMode.LOGO) setActiveLogo(null);
  }, [resetColorLab]);

  /**
   * Resets a layer to its original state (URL and metadata).
   * 
   * @param {string} layerId - The ID of the layer to reset.
   */
  const resetLayerToOriginal = useCallback((layerId: string) => {
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer) return;
    const newLayers = state.layers.map(l => l.id === layerId ? { ...l, url: l.originalUrl, neuralPrompt: undefined } : l);
    addToHistory(newLayers, layerId, 'Reset to Original');
  }, [state.layers, addToHistory]);

  return {
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
    setIsProcessing: (isProcessing: boolean) => setState(prev => ({ ...prev, isProcessing })),
    setError: (error: string | null) => setState(prev => ({ ...prev, error }))
  };
};
