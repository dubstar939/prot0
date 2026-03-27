
/**
 * Local Image Processing Utilities
 * Replaces Gemini API with client-side Canvas and CSS processing
 */

export const applyFiltersToImage = async (
  imageUrl: string,
  filters: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.filter = filters;
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
};

export const resizeImageLocally = async (
  imageUrl: string,
  aspectRatio: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      const [targetW, targetH] = aspectRatio.split(':').map(Number);
      const targetRatio = targetW / targetH;
      const currentRatio = img.naturalWidth / img.naturalHeight;

      let drawW, drawH, offsetX, offsetY;

      if (currentRatio > targetRatio) {
        // Image is wider than target
        drawH = img.naturalHeight;
        drawW = drawH * targetRatio;
        offsetX = (img.naturalWidth - drawW) / 2;
        offsetY = 0;
      } else {
        // Image is taller than target
        drawW = img.naturalWidth;
        drawH = drawW / targetRatio;
        offsetX = 0;
        offsetY = (img.naturalHeight - drawH) / 2;
      }

      canvas.width = drawW;
      canvas.height = drawH;

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH, 0, 0, drawW, drawH);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
};

export const createCollageLocally = async (
  images: string[],
  layout: 'grid' | 'mosaic' | 'triptych' | 'stack' | 'freestyle'
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas not supported");

      // Set a standard size for collage
      canvas.width = 2000;
      canvas.height = 2000;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const loadedImages = await Promise.all(
        images.map(src => new Promise<HTMLImageElement>((res, rej) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = src;
        }))
      );

      const count = loadedImages.length;
      const padding = 40;

      if (layout === 'grid' || layout === 'mosaic') {
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const cellW = (canvas.width - (cols + 1) * padding) / cols;
        const cellH = (canvas.height - (rows + 1) * padding) / rows;

        loadedImages.forEach((img, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = padding + col * (cellW + padding);
          const y = padding + row * (cellH + padding);

          // Draw image cropped to fill cell
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const cellRatio = cellW / cellH;
          let sw, sh, sx, sy;

          if (imgRatio > cellRatio) {
            sh = img.naturalHeight;
            sw = sh * cellRatio;
            sx = (img.naturalWidth - sw) / 2;
            sy = 0;
          } else {
            sw = img.naturalWidth;
            sh = sw / cellRatio;
            sx = 0;
            sy = (img.naturalHeight - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
        });
      } else if (layout === 'triptych') {
        const cellW = (canvas.width - (count + 1) * padding) / count;
        const cellH = canvas.height - 2 * padding;

        loadedImages.forEach((img, i) => {
          const x = padding + i * (cellW + padding);
          const y = padding;
          ctx.drawImage(img, x, y, cellW, cellH);
        });
      } else {
        // Stack or Freestyle - random placement
        loadedImages.forEach((img, i) => {
          const size = canvas.width * 0.6;
          const x = Math.random() * (canvas.width - size);
          const y = Math.random() * (canvas.height - size);
          const angle = (Math.random() - 0.5) * 0.4;

          ctx.save();
          ctx.translate(x + size / 2, y + size / 2);
          ctx.rotate(angle);
          
          // Shadow
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 10;

          // Border
          ctx.fillStyle = 'white';
          ctx.fillRect(-size / 2 - 10, -size / 2 - 10, size + 20, size + 20);

          ctx.drawImage(img, -size / 2, -size / 2, size, size);
          ctx.restore();
        });
      }

      resolve(canvas.toDataURL('image/png'));
    } catch (e) {
      reject(e);
    }
  });
};

export const cropImageLocally = async (
  imageUrl: string,
  cropRect: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = cropRect.width;
      canvas.height = cropRect.height;

      ctx.drawImage(
        img,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        cropRect.width,
        cropRect.height
      );

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
};
