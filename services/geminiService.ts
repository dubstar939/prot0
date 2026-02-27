
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const editImageWithAI = async (
  base64Image: string,
  prompt: string,
  imageSize: '1K' | '2K' | '4K' = '1K',
  mimeType: string = 'image/png',
  maskBase64?: string,
  aspectRatio?: string
): Promise<string> => {
  const ai = getAI();
  const model = imageSize !== '1K' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    const parts: any[] = [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ];

    if (maskBase64) {
      const maskData = maskBase64.split(',')[1] || maskBase64;
      parts.push({
        inlineData: {
          data: maskData,
          mimeType: 'image/png',
        },
      });
      // Append instruction for mask usage if not already detailed in prompt
      parts.push({
        text: `${prompt}. Use the provided second image as a mask where white areas indicate the region to modify.`,
      });
    } else {
      parts.push({
        text: prompt,
      });
    }

    const imageConfig: any = {};
    if (aspectRatio) {
      imageConfig.aspectRatio = aspectRatio;
    } else {
      imageConfig.aspectRatio = "1:1";
    }

    // Only add imageSize if using the Pro model, as Flash model throws error for this parameter
    if (model === 'gemini-3-pro-image-preview') {
      imageConfig.imageSize = imageSize;
    }

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
       throw new Error("Invalid response structure from Neural Engine.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image was generated in the response.");
  } catch (error) {
    console.error("Gemini Image Editing Error:", error);
    throw error;
  }
};

export const createCollageWithAI = async (
  base64Images: string[],
  prompt: string,
  aspectRatio: string = "1:1",
  imageSize: '1K' | '2K' | '4K' = '1K'
): Promise<string> => {
  const ai = getAI();
  const model = imageSize !== '1K' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  try {
    const parts: any[] = base64Images.map(img => ({
      inlineData: {
        data: img.split(',')[1] || img,
        mimeType: 'image/png',
      }
    }));

    parts.push({
      text: `Create a professional artistic photo collage using all provided images. ${prompt}. Ensure balanced composition and cohesive style.`
    });

    const imageConfig: any = { aspectRatio };
    if (model === 'gemini-3-pro-image-preview') {
      imageConfig.imageSize = imageSize;
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: { imageConfig }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("Invalid response from Neural Engine.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Gemini Collage Error:", error);
    throw error;
  }
};

export const generateImageFromText = async (
  prompt: string
): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-2.5-flash-image';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
