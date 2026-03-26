import { GoogleGenAI } from "@google/genai";
import { TargetResolution } from "../../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateImage = async (prompt: string, resolution: TargetResolution, sourceImage?: string): Promise<string> => {
  try {
    const parts: any[] = [{ text: prompt }];
    
    if (sourceImage) {
      parts.push({
        inlineData: {
          data: sourceImage.split(',')[1],
          mimeType: "image/png"
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: resolution
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    const base64Data = part?.inlineData?.data;

    if (!base64Data) {
      throw new Error("No image data received from the AI model.");
    }

    return `data:image/png;base64,${base64Data}`;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};
