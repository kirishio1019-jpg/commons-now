// AI Video Generation via Replicate API
// Uses minimax/video-01-live for text-to-video generation

const REPLICATE_API = "https://api.replicate.com/v1/predictions";

// Theme → cinematic prompt templates
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

const DEFAULT_PROMPT = "Cinematic shot of a diverse community gathering outdoors in beautiful natural setting, warm golden hour lighting, people connecting and sharing experiences, 4K quality";

function buildPrompt(theme: string, title: string, description: string): string {
  const base = THEME_PROMPTS[theme] ?? DEFAULT_PROMPT;

  // Extract key visual cues from title/description
  const keywords: string[] = [];
  if (description.includes("朝") || title.includes("朝")) keywords.push("morning sunrise");
  if (description.includes("夜") || title.includes("夜")) keywords.push("evening twilight");
  if (description.includes("海") || title.includes("海")) keywords.push("ocean coastline");
  if (description.includes("山") || title.includes("山")) keywords.push("mountain landscape");
  if (description.includes("川") || title.includes("川")) keywords.push("riverside");
  if (description.includes("公園") || title.includes("公園")) keywords.push("park setting");
  if (description.includes("室内") || title.includes("室内")) keywords.push("indoor space");
  if (description.includes("春")) keywords.push("cherry blossoms spring");
  if (description.includes("夏")) keywords.push("bright summer");
  if (description.includes("秋")) keywords.push("autumn foliage");
  if (description.includes("冬")) keywords.push("winter atmosphere");

  const extra = keywords.length > 0 ? `, ${keywords.join(", ")}` : "";
  return `${base}${extra}, smooth camera movement, professional cinematography`;
}

export async function generateAIVideo(
  theme: string,
  title: string,
  description: string,
): Promise<string | null> {
  const token = process.env.EXPO_PUBLIC_REPLICATE_TOKEN;
  if (!token) {
    console.log("No REPLICATE_TOKEN — skipping AI video generation");
    return null;
  }

  const prompt = buildPrompt(theme, title, description);

  try {
    // Create prediction
    const createRes = await fetch(REPLICATE_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Prefer": "wait",
      },
      body: JSON.stringify({
        model: "minimax/video-01-live",
        input: {
          prompt,
          prompt_optimizer: true,
        },
      }),
    });

    if (!createRes.ok) {
      // Try fallback model
      const fallbackRes = await fetch(REPLICATE_API, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Prefer": "wait",
        },
        body: JSON.stringify({
          model: "luma/ray",
          input: {
            prompt,
          },
        }),
      });

      if (!fallbackRes.ok) return null;
      const fallbackData = await fallbackRes.json();
      return await pollForResult(fallbackData, token);
    }

    const data = await createRes.json();

    // If "Prefer: wait" worked, output might be ready
    if (data.status === "succeeded" && data.output) {
      const output = Array.isArray(data.output) ? data.output[0] : data.output;
      return typeof output === "string" ? output : null;
    }

    // Otherwise poll
    return await pollForResult(data, token);
  } catch (err) {
    console.error("AI video generation failed:", err);
    return null;
  }
}

async function pollForResult(prediction: any, token: string): Promise<string | null> {
  const pollUrl = prediction.urls?.get || `${REPLICATE_API}/${prediction.id}`;

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    try {
      const res = await fetch(pollUrl, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.status === "succeeded") {
        const output = Array.isArray(data.output) ? data.output[0] : data.output;
        return typeof output === "string" ? output : null;
      }

      if (data.status === "failed" || data.status === "canceled") {
        return null;
      }
    } catch {
      continue;
    }
  }

  return null;
}
