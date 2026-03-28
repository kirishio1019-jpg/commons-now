// AI Storyboard Generator
// Creates unique 6-segment storyboard per event
// Uses wave.id as seed → never produces the same video twice

import { MEDIA_LIBRARY, MediaItem } from "./mediaLibrary";

export interface StoryboardSegment {
  media: MediaItem;
  duration: number;        // seconds
  kenBurns: {
    fromScale: number;
    toScale: number;
    fromX: number;         // % translate
    fromY: number;
    toX: number;
    toY: number;
  };
  transition: "crossfade" | "zoom" | "slide-left" | "slide-up";
  colorShift: number;      // hue rotation degrees
}

export interface Storyboard {
  segments: StoryboardSegment[];
  totalDuration: number;
  colorGrade: { hue: number; saturation: number; brightness: number };
}

// Seeded PRNG for deterministic but unique output per wave
function createRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  let s = Math.abs(h) || 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function scoreMedia(item: MediaItem, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    for (const tag of item.tags) {
      if (tag === kw) score += 10;
      else if (tag.includes(kw) || kw.includes(tag)) score += 4;
    }
  }
  return score;
}

function tokenize(text: string): string[] {
  return text.split(/[\s,、。・\-—「」（）]+/).filter((t) => t.length > 0);
}

// Ken Burns presets - varied zoom/pan directions
const KB_PRESETS = [
  { fromScale: 1.0, toScale: 1.2, fromX: 0, fromY: 0, toX: -5, toY: -3 },
  { fromScale: 1.15, toScale: 1.0, fromX: -3, fromY: -2, toX: 2, toY: 1 },
  { fromScale: 1.0, toScale: 1.18, fromX: 3, fromY: 0, toX: -2, toY: -4 },
  { fromScale: 1.2, toScale: 1.05, fromX: 0, fromY: -3, toX: 0, toY: 2 },
  { fromScale: 1.05, toScale: 1.22, fromX: -4, fromY: 2, toX: 3, toY: -2 },
  { fromScale: 1.18, toScale: 1.0, fromX: 2, fromY: -4, toX: -1, toY: 1 },
  { fromScale: 1.0, toScale: 1.15, fromX: -2, fromY: 3, toX: 4, toY: -1 },
  { fromScale: 1.12, toScale: 1.0, fromX: 4, fromY: 1, toX: -3, toY: -2 },
];

const TRANSITIONS: StoryboardSegment["transition"][] = [
  "crossfade", "crossfade", "zoom", "slide-left", "crossfade", "slide-up",
];

export function generateStoryboard(
  waveId: string,
  theme: string,
  title: string,
  description: string,
): Storyboard {
  const rand = createRng(waveId + theme + title);
  const keywords = tokenize(`${title} ${description} ${theme}`);
  const SEGMENT_COUNT = 6;

  // Score all media
  const scored = MEDIA_LIBRARY.map((item) => ({
    item,
    score: scoreMedia(item, keywords) + rand() * 3, // Add randomness for variety
  }));
  scored.sort((a, b) => b.score - a.score);

  // Select top media, ensuring diversity
  const selected: MediaItem[] = [];
  const usedUrls = new Set<string>();
  const usedTypes = { video: 0, image: 0 };

  for (const entry of scored) {
    if (selected.length >= SEGMENT_COUNT) break;
    if (usedUrls.has(entry.item.url)) continue;

    // Ensure mix of videos and images (at least 2 of each, rest random)
    if (usedTypes.video >= 4 && entry.item.type === "video") continue;
    if (usedTypes.image >= 4 && entry.item.type === "image") continue;

    selected.push(entry.item);
    usedUrls.add(entry.item.url);
    usedTypes[entry.item.type]++;
  }

  // Fill remaining slots if needed
  while (selected.length < SEGMENT_COUNT) {
    const fallback = MEDIA_LIBRARY[Math.floor(rand() * MEDIA_LIBRARY.length)];
    if (!usedUrls.has(fallback.url)) {
      selected.push(fallback);
      usedUrls.add(fallback.url);
    }
  }

  // Shuffle with seed for unique ordering
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  // Build segments
  const segments: StoryboardSegment[] = selected.map((media, i) => ({
    media,
    duration: 4 + Math.floor(rand() * 3), // 4-6 seconds per segment
    kenBurns: KB_PRESETS[Math.floor(rand() * KB_PRESETS.length)],
    transition: TRANSITIONS[i % TRANSITIONS.length],
    colorShift: Math.floor(rand() * 20) - 10, // -10 to +10 degrees hue rotation
  }));

  // Theme-based color grade
  const themeGrades: Record<string, { hue: number; saturation: number; brightness: number }> = {
    植樹:     { hue: 120, saturation: 1.1, brightness: 0.95 },
    食:       { hue: 30,  saturation: 1.15, brightness: 1.0 },
    物語:     { hue: 260, saturation: 1.1, brightness: 0.9 },
    雨水収集: { hue: 200, saturation: 1.1, brightness: 0.95 },
    音楽:     { hue: 280, saturation: 1.1, brightness: 0.95 },
    ヨガ:     { hue: 210, saturation: 0.9, brightness: 1.0 },
    アート:   { hue: 300, saturation: 1.2, brightness: 1.0 },
    対話:     { hue: 40,  saturation: 0.95, brightness: 1.0 },
    DIY:      { hue: 35,  saturation: 1.1, brightness: 0.95 },
    ハイキング:{ hue: 140, saturation: 1.1, brightness: 1.0 },
    焚き火:   { hue: 15,  saturation: 1.2, brightness: 0.9 },
    農業:     { hue: 100, saturation: 1.1, brightness: 1.0 },
    瞑想:     { hue: 220, saturation: 0.85, brightness: 0.9 },
    星空:     { hue: 250, saturation: 1.15, brightness: 0.85 },
    子どもと: { hue: 50,  saturation: 1.1, brightness: 1.05 },
  };

  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  return {
    segments,
    totalDuration,
    colorGrade: themeGrades[theme] ?? { hue: 0, saturation: 1.0, brightness: 1.0 },
  };
}
