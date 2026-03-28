// Theme-matched real stock video from Mixkit (free, direct CDN, no API key)
// All URLs verified as 200 OK

const V = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;

const THEME_VIDEOS: Record<string, string[]> = {
  植樹:     [V(1563), V(4698), V(3454)],   // tree planting, forest, nature
  食:       [V(4473), V(4440), V(1943)],    // cooking, food prep, kitchen
  物語:     [V(1192), V(9460), V(3064)],    // campfire, night, storytelling
  雨水収集: [V(9425), V(22456), V(28189)],  // rain, water, nature
  音楽:     [V(1547), V(8854), V(34151)],   // music, concert, guitar
  ヨガ:     [V(4883), V(2831), V(40822)],   // yoga, meditation, calm
  アート:   [V(12735), V(4905), V(9026)],   // painting, art, creative
  対話:     [V(45831), V(3244), V(4801)],   // conversation, people, cafe
  DIY:      [V(34421), V(50701), V(40269)], // workshop, crafting, tools
  ハイキング:[V(1310), V(4815), V(41788)],  // hiking, mountain, trail
  焚き火:   [V(1192), V(1644), V(4358)],   // fire, campfire, flames
  農業:     [V(12943), V(6588), V(11374)],  // farming, harvest, fields
  瞑想:     [V(2831), V(22707), V(42322)],  // zen, peaceful, meditation
  星空:     [V(3039), V(28665), V(34487)],  // stars, night sky, space
  子どもと: [V(50434), V(1978), V(41481)],  // children, family, playing
};

const DEFAULT_VIDEOS = [V(1310), V(4883), V(3454)];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export async function generateAIVideo(
  theme: string, title: string, _description: string,
): Promise<string> {
  const videos = THEME_VIDEOS[theme] ?? DEFAULT_VIDEOS;
  return videos[hash(title) % videos.length];
}
