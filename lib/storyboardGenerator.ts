// AI Storyboard Engine v2
// Creates unique 8-segment cinematic storyboards
// SVG motion filters + themed particles + parallax + varied transitions

import { getMediaForTheme, generateContentImage, MediaItem } from "./mediaLibrary";

export type SVGFilterType = "liquid" | "ripple" | "heat" | "breathe" | "none";
export type ParticleType = "embers" | "leaves" | "rain" | "stars" | "steam" | "dust" | "notes" | "bubbles" | null;
export type TransitionType = "crossfade" | "zoom-in" | "slide-left" | "blur-through";

export interface MotionConfig {
  kenBurns: { fromScale: number; toScale: number; fromX: number; fromY: number; toX: number; toY: number };
  svgFilter: SVGFilterType;
  svgIntensity: number;
  particleType: ParticleType;
}

export interface Segment {
  media: MediaItem;
  duration: number;
  motion: MotionConfig;
  transition: TransitionType;
}

export interface Storyboard {
  segments: Segment[];
  totalDuration: number;
  colorGrade: { hue: number; saturation: number; brightness: number };
  globalParticle: ParticleType;
}

// PRNG
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Theme → SVG filter + particle mapping
const THEME_MOTION: Record<string, { filter: SVGFilterType; particle: ParticleType; globalParticle: ParticleType }> = {
  植樹:     { filter: "breathe", particle: "leaves", globalParticle: "leaves" },
  食:       { filter: "liquid", particle: "steam", globalParticle: "steam" },
  物語:     { filter: "liquid", particle: "embers", globalParticle: "embers" },
  雨水収集: { filter: "ripple", particle: "rain", globalParticle: "rain" },
  音楽:     { filter: "breathe", particle: "notes", globalParticle: "notes" },
  ヨガ:     { filter: "breathe", particle: "dust", globalParticle: null },
  アート:   { filter: "liquid", particle: "bubbles", globalParticle: "bubbles" },
  対話:     { filter: "breathe", particle: null, globalParticle: null },
  DIY:      { filter: "none", particle: "dust", globalParticle: "dust" },
  ハイキング:{ filter: "breathe", particle: "leaves", globalParticle: null },
  焚き火:   { filter: "heat", particle: "embers", globalParticle: "embers" },
  農業:     { filter: "breathe", particle: "leaves", globalParticle: "dust" },
  瞑想:     { filter: "breathe", particle: "dust", globalParticle: null },
  星空:     { filter: "breathe", particle: "stars", globalParticle: "stars" },
  子どもと: { filter: "breathe", particle: "bubbles", globalParticle: "bubbles" },
};

const KB = [
  { fromScale: 1.0, toScale: 1.18, fromX: 0, fromY: 0, toX: -4, toY: -3 },
  { fromScale: 1.15, toScale: 1.0, fromX: -3, fromY: -2, toX: 3, toY: 2 },
  { fromScale: 1.0, toScale: 1.2, fromX: 4, fromY: 0, toX: -2, toY: -5 },
  { fromScale: 1.2, toScale: 1.05, fromX: 0, fromY: -4, toX: 0, toY: 3 },
  { fromScale: 1.05, toScale: 1.22, fromX: -5, fromY: 3, toX: 4, toY: -2 },
  { fromScale: 1.18, toScale: 1.0, fromX: 3, fromY: -5, toX: -2, toY: 2 },
  { fromScale: 1.0, toScale: 1.15, fromX: -2, fromY: 4, toX: 5, toY: -1 },
  { fromScale: 1.12, toScale: 1.0, fromX: 5, fromY: 2, toX: -4, toY: -3 },
];

const TRANSITIONS: TransitionType[] = ["crossfade", "zoom-in", "crossfade", "slide-left", "blur-through", "crossfade", "zoom-in", "crossfade"];

// Cinematic pacing: short-medium-long-short-long-medium-short-medium
const PACING = [3.5, 4.5, 5.5, 3, 6, 4, 3.5, 5];

export function generateStoryboard(waveId: string, theme: string, title: string, description: string): Storyboard {
  const rand = rng(waveId + theme + title);
  const SEGMENT_COUNT = 8;

  // Get all theme media
  const allMedia = getMediaForTheme(theme);

  // Score by content relevance
  const keywords = `${title} ${description}`.split(/[\s,、。・\-—]+/).filter((t) => t.length > 0);
  const scored = allMedia.map((item) => {
    let score = item.weight + rand() * 2;
    // Bonus for matching keywords in URL (LoremFlickr images contain keywords)
    for (const kw of keywords) {
      if (item.url.includes(encodeURIComponent(kw))) score += 3;
    }
    return { item, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // Select segments: ensure mix of video + image, no duplicates
  const selected: MediaItem[] = [];
  const usedUrls = new Set<string>();
  let videoCount = 0;
  let imageCount = 0;

  for (const entry of scored) {
    if (selected.length >= SEGMENT_COUNT) break;
    if (usedUrls.has(entry.item.url)) continue;
    if (videoCount >= 5 && entry.item.type === "video") continue;
    if (imageCount >= 5 && entry.item.type === "image") continue;
    selected.push(entry.item);
    usedUrls.add(entry.item.url);
    if (entry.item.type === "video") videoCount++;
    else imageCount++;
  }

  // Fill remaining with content-specific images
  while (selected.length < SEGMENT_COUNT) {
    const seed = Math.floor(rand() * 10000);
    selected.push({
      type: "image",
      url: generateContentImage(title, theme, seed),
      theme,
      weight: 5,
    });
  }

  // Shuffle with seed
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  const themeMotion = THEME_MOTION[theme] ?? { filter: "breathe", particle: null, globalParticle: null };

  const segments: Segment[] = selected.map((media, i) => ({
    media,
    duration: PACING[i % PACING.length] + rand() * 1,
    motion: {
      kenBurns: KB[Math.floor(rand() * KB.length)],
      svgFilter: media.type === "image" ? themeMotion.filter : "none",
      svgIntensity: 0.3 + rand() * 0.5,
      particleType: i % 3 === 0 ? themeMotion.particle : null, // particles on every 3rd segment
    },
    transition: TRANSITIONS[i % TRANSITIONS.length],
  }));

  const grades: Record<string, Storyboard["colorGrade"]> = {
    植樹:     { hue: 120, saturation: 1.1, brightness: 0.95 },
    食:       { hue: 30, saturation: 1.15, brightness: 1.0 },
    物語:     { hue: 260, saturation: 1.1, brightness: 0.88 },
    雨水収集: { hue: 200, saturation: 1.1, brightness: 0.93 },
    音楽:     { hue: 280, saturation: 1.1, brightness: 0.95 },
    ヨガ:     { hue: 210, saturation: 0.9, brightness: 1.0 },
    アート:   { hue: 300, saturation: 1.2, brightness: 1.0 },
    対話:     { hue: 40, saturation: 0.95, brightness: 1.0 },
    DIY:      { hue: 35, saturation: 1.1, brightness: 0.95 },
    ハイキング:{ hue: 140, saturation: 1.1, brightness: 1.0 },
    焚き火:   { hue: 15, saturation: 1.2, brightness: 0.88 },
    農業:     { hue: 100, saturation: 1.1, brightness: 1.0 },
    瞑想:     { hue: 220, saturation: 0.85, brightness: 0.88 },
    星空:     { hue: 250, saturation: 1.15, brightness: 0.82 },
    子どもと: { hue: 50, saturation: 1.1, brightness: 1.05 },
  };

  return {
    segments,
    totalDuration: segments.reduce((s, seg) => s + seg.duration, 0),
    colorGrade: grades[theme] ?? { hue: 0, saturation: 1.0, brightness: 1.0 },
    globalParticle: themeMotion.globalParticle,
  };
}
