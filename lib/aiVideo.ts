// Auto video sourcing via Pexels API (free, real footage)
// Falls back to curated free video URLs if API unavailable

const PEXELS_API = "https://api.pexels.com/videos/search";
const PEXELS_KEY = "3yrLFmRNfRWGKAsLxMgfWRVGWI17fRiAnIGcKgCXvHJiV7W3HY2kVhfH";

// Theme → search keywords for cinematic stock footage
const THEME_SEARCHES: Record<string, string> = {
  植樹: "planting trees nature forest",
  食: "cooking community food preparation",
  物語: "campfire night storytelling",
  雨水収集: "rain nature water drops",
  音楽: "outdoor concert acoustic music",
  ヨガ: "yoga sunrise outdoor meditation",
  アート: "painting art creative workshop",
  対話: "people talking conversation cafe",
  DIY: "woodworking crafting workshop hands",
  ハイキング: "hiking mountain trail nature",
  焚き火: "bonfire campfire night flames",
  農業: "farming harvest organic vegetables",
  瞑想: "meditation zen peaceful garden",
  星空: "stars night sky milky way",
  子どもと: "children playing park family",
};

// Curated fallback videos (free Pexels videos, direct file URLs)
const FALLBACK_VIDEOS: Record<string, string> = {
  植樹: "https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4",
  食: "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4",
  物語: "https://videos.pexels.com/video-files/857251/857251-hd_1920_1080_25fps.mp4",
  雨水収集: "https://videos.pexels.com/video-files/2491284/2491284-uhd_2560_1440_24fps.mp4",
  音楽: "https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4",
  ヨガ: "https://videos.pexels.com/video-files/4056990/4056990-uhd_2560_1440_25fps.mp4",
  アート: "https://videos.pexels.com/video-files/3209211/3209211-uhd_2560_1440_25fps.mp4",
  対話: "https://videos.pexels.com/video-files/6003988/6003988-uhd_2560_1440_30fps.mp4",
  DIY: "https://videos.pexels.com/video-files/5710614/5710614-uhd_2560_1440_30fps.mp4",
  ハイキング: "https://videos.pexels.com/video-files/4763824/4763824-uhd_2560_1440_24fps.mp4",
  焚き火: "https://videos.pexels.com/video-files/852395/852395-hd_1920_1080_30fps.mp4",
  農業: "https://videos.pexels.com/video-files/2889786/2889786-hd_1920_1080_30fps.mp4",
  瞑想: "https://videos.pexels.com/video-files/5200540/5200540-uhd_2560_1440_30fps.mp4",
  星空: "https://videos.pexels.com/video-files/1721294/1721294-uhd_4096_2160_25fps.mp4",
  子どもと: "https://videos.pexels.com/video-files/5622490/5622490-uhd_2560_1440_25fps.mp4",
};

const DEFAULT_FALLBACK = "https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4";

export async function generateAIVideo(
  theme: string, title: string, description: string,
): Promise<string | null> {
  // Try Pexels API search first for variety
  try {
    const query = THEME_SEARCHES[theme] ?? "community nature gathering";
    const res = await fetch(`${PEXELS_API}?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`, {
      headers: { "Authorization": PEXELS_KEY },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.videos && data.videos.length > 0) {
        // Pick a random video for variety
        const video = data.videos[Math.floor(Math.random() * data.videos.length)];
        // Get the best quality file (prefer HD)
        const files = video.video_files || [];
        const best = files
          .filter((f: any) => f.width >= 720)
          .sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
        if (best?.link) return best.link;
      }
    }
  } catch {}

  // Fallback to curated videos
  return FALLBACK_VIDEOS[theme] ?? DEFAULT_FALLBACK;
}
