
/**
 * @fileoverview Local Image Processing Utilities.
 * Provides client-side image manipulation using HTML5 Canvas and CSS filters.
 * These utilities replace server-side processing for faster, private editing.
 */

/**
 * Applies CSS filters to an image and returns a new data URL.
 * 
 * @param {string} imageUrl - The source image URL (data URL or external).
 * @param {string} filterString - The CSS filter string to apply (e.g., "blur(5px) contrast(1.2)").
 * @returns {Promise<string>} A promise that resolves to the processed image as a data URL.
 * @example
 * const processed = await applyFiltersToImage(myImageUrl, "grayscale(1)");
 */
export const applyFiltersToImage = async (
  imageUrl: string,
  filterString: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error("Failed to initialize canvas context."));
        return;
      }

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      context.filter = filterString;
      context.drawImage(image, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };

    image.onerror = () => reject(new Error("Failed to load image for filter application."));
    image.src = imageUrl;
  });
};

/**
 * Resizes and crops an image to a specific aspect ratio.
 * 
 * @param {string} imageUrl - The source image URL.
 * @param {string} aspectRatio - The target aspect ratio in "W:H" format (e.g., "16:9").
 * @returns {Promise<string>} A promise that resolves to the resized image as a data URL.
 * @example
 * const squareImage = await resizeImageToAspectRatio(myImageUrl, "1:1");
 */
export const resizeImageToAspectRatio = async (
  imageUrl: string,
  aspectRatio: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error("Failed to initialize canvas context."));
        return;
      }

      const [targetWidth, targetHeight] = aspectRatio.split(':').map(Number);
      const targetRatio = targetWidth / targetHeight;
      const sourceRatio = image.naturalWidth / image.naturalHeight;

      let sourceWidth, sourceHeight, sourceX, sourceY;

      if (sourceRatio > targetRatio) {
        // Source is wider than target: crop sides
        sourceHeight = image.naturalHeight;
        sourceWidth = sourceHeight * targetRatio;
        sourceX = (image.naturalWidth - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Source is taller than target: crop top/bottom
        sourceWidth = image.naturalWidth;
        sourceHeight = sourceWidth / targetRatio;
        sourceX = 0;
        sourceY = (image.naturalHeight - sourceHeight) / 2;
      }

      canvas.width = sourceWidth;
      canvas.height = sourceHeight;

      context.drawImage(
        image, 
        sourceX, sourceY, sourceWidth, sourceHeight, 
        0, 0, sourceWidth, sourceHeight
      );

      resolve(canvas.toDataURL('image/png'));
    };

    image.onerror = () => reject(new Error("Failed to load image for resizing."));
    image.src = imageUrl;
  });
};

/**
 * Creates a collage from multiple images based on a specified layout.
 * 
 * @param {string[]} imageUrls - Array of image URLs to include in the collage.
 * @param {'grid' | 'mosaic' | 'triptych' | 'stack' | 'freestyle'} layout - The collage layout style.
 * @returns {Promise<string>} A promise that resolves to the collage as a data URL.
 * @example
 * const collage = await createCollage(myImages, 'grid');
 */
export const createCollage = async (
  imageUrls: string[],
  layout: 'grid' | 'mosaic' | 'triptych' | 'stack' | 'freestyle'
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error("Canvas context initialization failed.");

  // Standard high-resolution collage size
  canvas.width = 2000;
  canvas.height = 2000;
  context.fillStyle = '#020617'; // Dark slate background
  context.fillRect(0, 0, canvas.width, canvas.height);

  const loadedImages = await Promise.all(
    imageUrls.map(src => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      image.src = src;
    }))
  );

  const imageCount = loadedImages.length;
  const padding = 40;

  if (layout === 'grid' || layout === 'mosaic') {
    const columns = Math.ceil(Math.sqrt(imageCount));
    const rows = Math.ceil(imageCount / columns);
    const cellWidth = (canvas.width - (columns + 1) * padding) / columns;
    const cellHeight = (canvas.height - (rows + 1) * padding) / rows;

    loadedImages.forEach((image, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = padding + col * (cellWidth + padding);
      const y = padding + row * (cellHeight + padding);

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const cellRatio = cellWidth / cellHeight;
      let sw, sh, sx, sy;

      if (imageRatio > cellRatio) {
        sh = image.naturalHeight;
        sw = sh * cellRatio;
        sx = (image.naturalWidth - sw) / 2;
        sy = 0;
      } else {
        sw = image.naturalWidth;
        sh = sw / cellRatio;
        sx = 0;
        sy = (image.naturalHeight - sh) / 2;
      }

      context.drawImage(image, sx, sy, sw, sh, x, y, cellWidth, cellHeight);
    });
  } else if (layout === 'triptych') {
    const cellWidth = (canvas.width - (imageCount + 1) * padding) / imageCount;
    const cellHeight = canvas.height - 2 * padding;

    loadedImages.forEach((image, index) => {
      const x = padding + index * (cellWidth + padding);
      const y = padding;
      context.drawImage(image, x, y, cellWidth, cellHeight);
    });
  } else {
    // Stack or Freestyle: Randomized placement with shadows
    loadedImages.forEach((image) => {
      const size = canvas.width * 0.6;
      const x = Math.random() * (canvas.width - size);
      const y = Math.random() * (canvas.height - size);
      const rotationAngle = (Math.random() - 0.5) * 0.4;

      context.save();
      context.translate(x + size / 2, y + size / 2);
      context.rotate(rotationAngle);
      
      context.shadowColor = 'rgba(0,0,0,0.5)';
      context.shadowBlur = 30;
      context.shadowOffsetX = 10;
      context.shadowOffsetY = 10;

      // White polaroid-style border
      context.fillStyle = 'white';
      context.fillRect(-size / 2 - 10, -size / 2 - 10, size + 20, size + 20);

      context.drawImage(image, -size / 2, -size / 2, size, size);
      context.restore();
    });
  }

  return canvas.toDataURL('image/png');
};

/**
 * Crops an image to a specific rectangular region.
 * 
 * @param {string} imageUrl - The source image URL.
 * @param {Object} cropRect - The coordinates and dimensions of the crop area.
 * @param {number} cropRect.x - X coordinate of the top-left corner.
 * @param {number} cropRect.y - Y coordinate of the top-left corner.
 * @param {number} cropRect.width - Width of the crop area.
 * @param {number} cropRect.height - Height of the crop area.
 * @returns {Promise<string>} A promise that resolves to the cropped image as a data URL.
 * @example
 * const cropped = await cropImage(myImageUrl, { x: 0, y: 0, width: 100, height: 100 });
 */
export const cropImage = async (
  imageUrl: string,
  cropRect: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error("Failed to initialize canvas context."));
        return;
      }

      canvas.width = cropRect.width;
      canvas.height = cropRect.height;

      context.drawImage(
        image,
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

    image.onerror = () => reject(new Error("Failed to load image for cropping."));
    image.src = imageUrl;
  });
};
