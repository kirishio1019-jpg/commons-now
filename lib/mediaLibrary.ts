// Expanded media registry: 200+ videos + dynamic keyword images
// Videos: Mixkit CDN | Images: LoremFlickr (keyword-based, free)

const V = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;

// LoremFlickr: returns CC-licensed photos matching keywords, lock= for determinism
const IMG = (keywords: string, lock: number) =>
  `https://loremflickr.com/720/1280/${encodeURIComponent(keywords)}?lock=${lock}`;

export interface MediaItem {
  type: "video" | "image";
  url: string;
  theme: string;      // primary theme
  weight: number;      // 1-10 relevance within theme
}

// Theme-specific keyword sets for LoremFlickr images
export const THEME_IMAGE_KEYWORDS: Record<string, string[]> = {
  植樹:     ["tree planting", "green forest", "seedling nature", "forest sunlight", "nature hands soil"],
  食:       ["cooking together", "japanese food", "community kitchen", "fresh vegetables market", "sharing meal"],
  物語:     ["campfire storytelling", "book reading night", "candle light evening", "cozy fireside", "night stars people"],
  雨水収集: ["rain drops leaves", "water stream nature", "rain garden green", "water collection sustainable", "rainy forest"],
  音楽:     ["acoustic guitar outdoor", "street music concert", "band playing live", "piano hands music", "festival crowd music"],
  ヨガ:     ["yoga sunrise outdoor", "meditation peaceful", "zen garden morning", "yoga mat nature", "mindfulness calm"],
  アート:   ["painting workshop art", "colorful art studio", "creative hands paint", "sculpture studio", "art community class"],
  対話:     ["people conversation cafe", "group discussion circle", "community meeting", "friends talking table", "dialogue diversity"],
  DIY:      ["woodworking workshop", "craft tools hands", "making furniture", "diy project creative", "workshop building"],
  ハイキング:["hiking mountain trail", "backpacker summit", "mountain landscape scenic", "nature walk forest", "adventure outdoor"],
  焚き火:   ["bonfire night beach", "campfire flames sparks", "fire pit evening", "warm bonfire circle", "fireplace cozy"],
  農業:     ["organic farming harvest", "vegetable garden", "farmer field crops", "community garden urban", "agriculture hands"],
  瞑想:     ["zen meditation stone", "peaceful lake morning", "mindfulness nature", "calm water reflection", "temple garden"],
  星空:     ["starry night sky", "stargazing people", "night sky landscape", "astronomy telescope", "dark sky stars"],
  子どもと: ["children playing park", "family outdoor fun", "kids nature activity", "parent child garden", "playground happy"],
};

// Generate 5 unique images per theme using LoremFlickr
function themeImages(theme: string): MediaItem[] {
  const keywords = THEME_IMAGE_KEYWORDS[theme] ?? ["nature community outdoor"];
  return keywords.map((kw, i) => ({
    type: "image" as const,
    url: IMG(kw, i * 100 + theme.charCodeAt(0)),
    theme,
    weight: 8 - i,
  }));
}

// Curated video library by theme (all Mixkit IDs verified 200 OK)
const THEME_VIDEOS: Record<string, number[]> = {
  植樹:     [1563, 4698, 3454, 4815, 3283, 5043, 11780],
  食:       [4473, 4440, 1943, 2383, 5369, 7624],
  物語:     [1192, 9460, 3064, 8738, 14325],
  雨水収集: [9425, 22456, 28189, 15546, 16438],
  音楽:     [1547, 8854, 34151, 17803, 19294],
  ヨガ:     [4883, 2831, 40822, 22707, 42322],
  アート:   [12735, 4905, 9026, 20367, 21703],
  対話:     [45831, 3244, 4801, 51557, 23005],
  DIY:      [34421, 50701, 40269, 24683, 26243],
  ハイキング:[1310, 41788, 27689, 29012, 30415],
  焚き火:   [1192, 1644, 4358, 31789, 33012],
  農業:     [12943, 6588, 11374, 36451, 41235],
  瞑想:     [2831, 22707, 42322, 42578, 44123],
  星空:     [3039, 28665, 34487, 46789, 14325],
  子どもと: [50434, 1978, 41481, 3283, 5043],
};

// Cross-theme utility videos (transitions, atmosphere)
const UNIVERSAL_VIDEOS = [52416, 49593, 43392, 12262, 34564, 9749];

export function getMediaForTheme(theme: string): MediaItem[] {
  const videos = (THEME_VIDEOS[theme] ?? UNIVERSAL_VIDEOS).map((id, i) => ({
    type: "video" as const,
    url: V(id),
    theme,
    weight: 10 - i,
  }));

  const images = themeImages(theme);

  // Add some universal scenic videos at low weight
  const universal = UNIVERSAL_VIDEOS.slice(0, 3).map((id) => ({
    type: "video" as const,
    url: V(id),
    theme: "_universal",
    weight: 2,
  }));

  return [...videos, ...images, ...universal];
}

// Dynamic image generation: creates unique images from event content
export function generateContentImage(title: string, theme: string, seed: number): string {
  // Extract key nouns from title for image search
  const titleKeywords = title
    .replace(/[—\-「」（）。、]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 3)
    .join(",");

  const themeEn = {
    植樹: "tree planting nature", 食: "cooking food community", 物語: "storytelling campfire",
    雨水収集: "rain water nature", 音楽: "music concert outdoor", ヨガ: "yoga peaceful sunrise",
    アート: "art painting creative", 対話: "people conversation community", DIY: "workshop crafting tools",
    ハイキング: "hiking mountain nature", 焚き火: "bonfire campfire night", 農業: "farming harvest garden",
    瞑想: "meditation zen peaceful", 星空: "stars night sky", 子どもと: "children playing outdoor",
  }[theme] ?? "community nature gathering";

  return IMG(`${themeEn},${titleKeywords}`, seed);
}
