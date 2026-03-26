import { FilterPreset, SocialPreset, BlendMode, EditMode } from '../types';

/**
 * @fileoverview Application constants and configuration presets.
 */

/**
 * Categories for filtering the preset list.
 */
export const FILTER_CATEGORIES = [
  { id: 'all', label: 'All', icon: '🌈' },
  { id: 'vintage', label: 'Vintage', icon: '🎞️' },
  { id: 'bw', label: 'Black & White', icon: '🏁' },
  { id: 'artistic', label: 'Artistic', icon: '🎨' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
  { id: 'experimental', label: 'FX', icon: '🧪' },
];

/**
 * Predefined image filters with CSS filter strings.
 */
export const PRESET_FILTERS: (FilterPreset & { category: string })[] = [
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

/**
 * Artistic style presets for style transfer.
 */
export const STYLE_PRESETS = [
  { id: 'gogh', label: 'Van Gogh', artist: 'Vincent van Gogh', icon: '🌻', prompt: "saturate(2) contrast(1.2) sepia(0.2) blur(1px)" },
  { id: 'picasso', label: 'Picasso', artist: 'Pablo Picasso', icon: '📐', prompt: "contrast(1.5) saturate(0.8) hue-rotate(40deg)" },
  { id: 'monet', label: 'Monet', artist: 'Claude Monet', icon: '🪷', prompt: "opacity(0.8) blur(2px) saturate(1.2)" },
  { id: 'hokusai', label: 'Hokusai', artist: 'Katsushika Hokusai', icon: '🌊', prompt: "contrast(1.3) saturate(0.7) sepia(0.3)" },
  { id: 'dali', label: 'Dalí', artist: 'Salvador Dalí', icon: '⏳', prompt: "saturate(1.5) hue-rotate(20deg) contrast(1.1)" },
  { id: 'warhol', label: 'Warhol', artist: 'Andy Warhol', icon: '🥫', prompt: "saturate(5) contrast(1.5)" },
];

/**
 * Social media aspect ratio presets.
 */
export const SOCIAL_PRESETS: SocialPreset[] = [
  { id: 'ig_square', platform: 'Instagram', label: 'Post (Square)', aspectRatio: '1:1', icon: '📸', description: 'Standard 1080x1080 square format.' },
  { id: 'ig_portrait', platform: 'Instagram', label: 'Post (Portrait)', aspectRatio: '4:5', icon: '🤳', description: 'Optimized 1080x1350 for feed impact.' },
  { id: 'ig_story', platform: 'TikTok / IG', label: 'Story / Reel', aspectRatio: '9:16', icon: '📱', description: 'Vertical 1080x1920 for stories and reels.' },
  { id: 'twitter', platform: 'Twitter / X', label: 'Landscape', aspectRatio: '16:9', icon: '🐦', description: 'Widescreen 1920x1080 optimized for web.' },
  { id: 'fb_cover', platform: 'Facebook', label: 'Cover', aspectRatio: '16:9', icon: '👥', description: 'Header optimization for profiles.' },
];

/**
 * Poster design presets.
 */
export const POSTER_PRESETS = [
  { id: 'event_bold', label: 'Bold Event', icon: '📢', aspectRatio: '2:3', prompt: "Create a high-impact event poster with bold typography, vibrant colors, and dynamic composition. Focus on readability and visual hierarchy." },
  { id: 'flyer_minimal', label: 'Minimal Flyer', icon: '📄', aspectRatio: '3:4', prompt: "Design a clean, minimalist promotional flyer with plenty of white space, elegant sans-serif fonts, and a single striking visual element." },
  { id: 'concert_retro', label: 'Retro Concert', icon: '🎸', aspectRatio: '2:3', prompt: "Design a vintage-style concert poster with distressed textures, psychedelic colors, and retro 70s typography." },
  { id: 'promo_modern', label: 'Modern Promo', icon: '🏷️', aspectRatio: '4:5', prompt: "Create a sleek, modern promotional poster with geometric shapes, high-contrast photography, and professional layout." },
  { id: 'festival_vibrant', label: 'Vibrant Festival', icon: '🎡', aspectRatio: '2:3', prompt: "Design a colorful, energetic festival poster with layered graphics, organic shapes, and a festive atmosphere." },
];

/**
 * Logo design presets.
 */
export const LOGO_PRESETS = [
  { id: 'logo_minimal', label: 'Minimalist', icon: '⚪', prompt: "Design a clean, minimalist logo focusing on geometric simplicity and negative space. Professional and timeless." },
  { id: 'logo_tech', label: 'Tech / Modern', icon: '💻', prompt: "Create a futuristic, high-tech logo with sharp angles, gradients, and a sense of innovation and speed." },
  { id: 'logo_luxury', label: 'Luxury / Serif', icon: '💎', prompt: "Design a sophisticated luxury brand logo using elegant serif typography, gold accents, and a refined, premium feel." },
  { id: 'logo_organic', label: 'Organic / Nature', icon: '🌿', prompt: "Create an organic, nature-inspired logo with soft curves, earthy tones, and a hand-drawn or natural aesthetic." },
  { id: 'logo_abstract', label: 'Abstract Icon', icon: '🌀', prompt: "Design a unique abstract logo icon that represents fluid movement and connectivity. Modern and versatile." },
];

/**
 * Collage layout presets.
 */
export const COLLAGE_LAYOUTS = [
  { id: 'grid', label: 'Perfect Grid', icon: '▦', prompt: "Arrange images in a structured, symmetric grid with clean white gutters and minimalist framing." },
  { id: 'mosaic', label: 'Modern Mosaic', icon: '▩', prompt: "Create a dynamic mosaic layout with varying image sizes and interlocking rectangular frames for a busy, high-energy feel." },
  { id: 'triptych', label: 'Cinematic Triptych', icon: '▥', prompt: "Arrange the images in a cinematic horizontal triptych or wide sequential panel layout. Focus on storytelling flow." },
  { id: 'freestyle', label: 'Creative Freestyle', icon: '🌀', prompt: "Compose the images with organic, overlapping placements, tilted frames, and artistic shadow depth. Use a more experimental, scrapbook-like arrangement." },
  { id: 'stack', label: 'Polaroid Stack', icon: '🎞️', prompt: "Style images as scattered polaroids stacked on top of each other with realistic shadows, tape markers, and paper textures." },
];

/**
 * Supported blend modes for layers.
 */
export const BLEND_MODES: { value: BlendMode; label: string; short: string }[] = [
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

/**
 * Image enhancement methods.
 */
export const ENHANCE_METHODS = [
  { id: 'remaster', label: 'Balanced Remaster', icon: '🪄', prompt: "Balanced neural remastering. Optimize lighting, color balance, and sharp details simultaneously." },
  { id: 'denoise', label: 'Noise Reduction', icon: '🧼', prompt: "Deep noise reduction. Remove digital grain and compression artifacts while keeping edges smooth." },
  { id: 'sharpen', label: 'Edge Sharpen', icon: '🎯', prompt: "Intelligent edge sharpening. Reconstruct blurry edges and enhance structural details." },
  { id: 'texture', label: 'Detail Synthesis', icon: '🧬', prompt: "Hyper-detail synthesis. Reconstruct microscopic textures like skin pores, fabric weaves, and surface grit." },
  { id: 'generative', label: 'Generative Upscale', icon: '✨', prompt: "Generative upscaling. Reimagine and hallucinate fine details and textures to create a hyper-detailed version of the original." },
];

/**
 * Common RAW image file extensions.
 */
export const RAW_EXTENSIONS = ['.cr2', '.nef', '.raw', '.arw', '.dng', '.orf', '.raf'];
