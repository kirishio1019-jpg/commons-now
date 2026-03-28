// AI Video Generation via Replicate API

const API = "https://api.replicate.com/v1/predictions";

const THEME_PROMPTS: Record<string, string> = {
  植樹: "Cinematic shot of people planting young trees in a beautiful green forest clearing, morning golden sunlight filtering through leaves, warm natural lighting, community gathering outdoors, 4K cinematic quality, shallow depth of field",
  食: "Warm cinematic close-up of hands preparing fresh food in a community kitchen, steam rising from cooking pots, people gathering around a wooden table, golden hour indoor lighting, Japanese home cooking atmosphere, 4K quality",
  物語: "Atmospheric cinematic shot of people sitting around a campfire at dusk by a river, warm firelight illuminating faces, storytelling circle, starry sky above, peaceful evening atmosphere, 4K cinematic",
  雨水収集: "Beautiful cinematic shot of rain falling on green leaves and flowing into collection barrels, crystal clear water droplets in slow motion, lush garden setting, fresh atmosphere after rain, 4K nature documentary style",
  音楽: "Cinematic wide shot of a small outdoor acoustic concert in a park, musicians playing guitar under string lights at golden hour, audience sitting on grass, warm evening atmosphere, 4K quality",
  ヨガ: "Serene cinematic shot of people doing yoga in a peaceful outdoor setting at sunrise, misty mountains in background, soft golden morning light, calm and meditative atmosphere, 4K quality",
  アート: "Cinematic close-up of artists painting together in an open-air workshop, vibrant colors on canvases, creative community gathering, natural daylight, paint-splattered hands, 4K art documentary style",
  対話: "Warm cinematic shot of a diverse group of people in deep conversation at a cozy community space, soft indoor lighting, books and plants in background, intimate dialogue circle, 4K quality",
  DIY: "Cinematic shot of people building wooden furniture together in a workshop, sawdust in sunbeams, hands using tools, collaborative crafting, warm industrial lighting, 4K maker documentary style",
  ハイキング: "Breathtaking cinematic aerial shot of hikers on a mountain trail surrounded by vast green forest, panoramic vista, morning mist in valleys, adventure atmosphere, 4K nature cinematography",
  焚き火: "Intimate cinematic shot of a bonfire at twilight on a riverbank, warm flickering firelight on faces, sparks rising into purple sky, peaceful community gathering, 4K atmospheric quality",
  農業: "Beautiful cinematic shot of people harvesting vegetables in a sunlit organic farm, golden hour lighting, green fields stretching to horizon, community farming, 4K agricultural documentary style",
  瞑想: "Serene cinematic shot of people meditating in a minimalist zen garden at dawn, soft fog, morning light through bamboo, absolute tranquility, 4K contemplative quality",
  星空: "Stunning cinematic wide shot of people stargazing lying on a hilltop, Milky Way stretching across dark sky, telescope silhouette, peaceful night atmosphere, 4K astrophotography quality",
  子どもと: "Joyful cinematic shot of children and parents playing together in a sunny park, colorful activities, genuine laughter, warm family atmosphere, natural lighting, 4K family documentary style",
};

function buildPrompt(theme: string, title: string, description: string): string {
  const base = THEME_PROMPTS[theme] ?? "Cinematic shot of a diverse community gathering outdoors in beautiful natural setting, warm golden hour lighting, people connecting and sharing, 4K quality";
  const kw: string[] = [];
  if (description.includes("朝") || title.includes("朝")) kw.push("morning sunrise");
  if (description.includes("夜") || title.includes("夜")) kw.push("evening twilight");
  if (description.includes("海")) kw.push("ocean coastline");
  if (description.includes("山")) kw.push("mountain landscape");
  if (description.includes("川")) kw.push("riverside");
  if (description.includes("公園")) kw.push("park setting");
  if (description.includes("春")) kw.push("cherry blossoms spring");
  if (description.includes("冬")) kw.push("winter atmosphere");
  return base + (kw.length ? `, ${kw.join(", ")}` : "") + ", smooth camera movement";
}

export async function generateAIVideo(
  theme: string, title: string, description: string,
): Promise<string | null> {
  const token = process.env.EXPO_PUBLIC_REPLICATE_TOKEN;
  if (!token) return null;

  const prompt = buildPrompt(theme, title, description);

  // Try multiple models in order of preference
  const models = [
    { version: "b01a98e1fdab1a82dd4d1de8dba5a2ef397ac9ef67c26e376b9b79b0a1fa090d", input: { prompt, prompt_optimizer: true } },
    { version: "1e9e4e9bb1300f6aa7552e1ea7a0bfaa52cf8d36e5eb2aab2c6cfb5344e68b53", input: { prompt } },
  ];

  for (const model of models) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version: model.version, input: model.input }),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const result = await poll(data.urls?.get || `${API}/${data.id}`, token);
      if (result) return result;
    } catch {
      continue;
    }
  }

  return null;
}

async function poll(url: string, token: string): Promise<string | null> {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    try {
      const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
      const d = await res.json();
      if (d.status === "succeeded") {
        const out = Array.isArray(d.output) ? d.output[0] : d.output;
        return typeof out === "string" ? out : null;
      }
      if (d.status === "failed" || d.status === "canceled") return null;
    } catch { continue; }
  }
  return null;
}
