import { Wave, Commitment, User } from "../types";

// Tag affinity: maps user interest tags to wave themes
const TAG_TO_THEMES: Record<string, string[]> = {
  "植樹": ["植樹", "農業", "ハイキング"],
  "料理": ["食"],
  "読書": ["物語", "対話"],
  "音楽": ["音楽", "焚き火"],
  "焚き火": ["焚き火", "物語", "星空"],
  "農業": ["農業", "植樹", "食"],
  "ハイキング": ["ハイキング", "植樹", "星空"],
  "ヨガ": ["ヨガ", "瞑想"],
  "アート": ["アート", "DIY"],
  "対話": ["対話", "物語"],
  "水循環": ["雨水収集"],
  "DIY": ["DIY", "アート"],
  "星空": ["星空", "焚き火", "瞑想"],
  "子ども": ["子どもと"],
  "瞑想": ["瞑想", "ヨガ", "星空"],
};

interface PersonalizeInput {
  waves: Wave[];
  user: User | null;
  commitments: Commitment[];
}

export function personalizeWaves({ waves, user, commitments }: PersonalizeInput): Wave[] {
  if (!user || user.tags.length === 0) return waves;

  // Build theme affinity scores from user tags
  const themeScores: Record<string, number> = {};
  user.tags.forEach((tag) => {
    const related = TAG_TO_THEMES[tag] ?? [];
    related.forEach((theme, i) => {
      // First related theme gets higher score
      themeScores[theme] = (themeScores[theme] ?? 0) + (3 - Math.min(i, 2));
    });
  });

  // Boost themes the user has participated in before
  const committedWaveIds = new Set(
    commitments
      .filter((c) => c.level === "going" || c.level === "maybe")
      .map((c) => c.wave_id)
  );

  // Score each wave
  const scored = waves.map((wave) => {
    let score = 0;

    // Theme match (0-15 points)
    score += (themeScores[wave.theme] ?? 0) * 2;

    // Proximity boost (closer = higher, max 10 points)
    if (wave.distance_km != null) {
      score += Math.max(0, 10 - wave.distance_km * 0.5);
    }

    // Popularity signal (more participants = slightly higher, max 5 points)
    if (wave.capacity > 0) {
      const fillRate = wave.current_participants / wave.capacity;
      score += fillRate * 5;
    }

    // Recency boost (sooner events score higher, max 8 points)
    const daysUntil = Math.max(
      0,
      (new Date(wave.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, 8 - daysUntil * 0.5);

    // Already committed penalty (push to end so user sees new stuff)
    if (committedWaveIds.has(wave.id)) {
      score -= 20;
    }

    // Eco impact bonus
    const eco = wave.eco_impact_target;
    if (eco.trees_planted > 0 || eco.water_collected_liters > 0 || eco.meals_shared > 0) {
      score += 3;
    }

    return { wave: { ...wave, is_personalized: score > 8 }, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.wave);
}
