/**
 * @fileoverview Canvas manipulation and export utilities.
 * Handles layer merging, blending modes, and image downloading.
 */

import { BlendMode, Layer, LayerGroup, ExportConfig } from '../../types';

/**
 * Maps application blend modes to HTML5 Canvas globalCompositeOperation values.
 * 
 * @param {BlendMode} mode - The application-specific blend mode.
 * @returns {GlobalCompositeOperation} The corresponding canvas composite operation.
 */
export const getCanvasCompositeOp = (mode: BlendMode): GlobalCompositeOperation => {
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

/**
 * Merges multiple layers into a single image.
 * 
 * @param {Layer[]} layers - The array of layers to merge.
 * @param {number} width - The width of the target canvas.
 * @param {number} height - The height of the target canvas.
 * @returns {Promise<string>} A promise that resolves to the merged image as a data URL.
 */
export const mergeLayersToDataUrl = async (
  layers: Layer[],
  width: number,
  height: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error("Failed to initialize canvas context."));
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const visibleLayers = [...layers].reverse().filter(l => l.isVisible);
    if (visibleLayers.length === 0) {
      resolve(canvas.toDataURL('image/png'));
      return;
    }

    let loadedCount = 0;
    visibleLayers.forEach(layer => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = (layer.opacity ?? 100) / 100;
        ctx.globalCompositeOperation = getCanvasCompositeOp(layer.blendMode);
        if (layer.cssFilter) ctx.filter = layer.cssFilter;
        
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
        
        loadedCount++;
        if (loadedCount === visibleLayers.length) {
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.onerror = () => reject(new Error(`Failed to load layer image: ${layer.name}`));
      img.src = layer.url;
    });
  });
};

/**
 * Handles the process of exporting and downloading the final composition.
 * 
 * @param {Layer[]} layers - The layers to include in the export.
 * @param {number} width - The width of the final image.
 * @param {number} height - The height of the final image.
 * @param {ExportConfig} config - Export settings (format, quality).
 * @param {boolean} [share=false] - Whether to trigger the native share dialog instead of downloading.
 * @returns {Promise<void>}
 */
export const exportComposition = async (
  layers: Layer[],
  width: number,
  height: number,
  config: ExportConfig,
  share: boolean = false
): Promise<void> => {
  const dataUrl = await mergeLayersToDataUrl(layers, width, height);
  
  if (share && navigator.share) {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File(
      [blob], 
      `creative-export-${Date.now()}.${config.format.split('/')[1]}`, 
      { type: config.format }
    );
    
    try {
      await navigator.share({
        files: [file],
        title: 'Creative Export',
        text: 'Created with Creative Suite'
      });
    } catch (e) {
      console.error("Sharing failed", e);
      // Fallback to download if sharing fails
      triggerDownload(dataUrl, config);
    }
  } else {
    triggerDownload(dataUrl, config);
  }
};

/**
 * Triggers a browser download for a given data URL.
 * 
 * @param {string} dataUrl - The data URL to download.
 * @param {ExportConfig} config - Export settings for naming.
 */
const triggerDownload = (dataUrl: string, config: ExportConfig) => {
  const link = document.createElement('a');
  link.download = `creative-asset-${Date.now()}.${config.format.split('/')[1]}`;
  link.href = dataUrl;
  link.click();
};
