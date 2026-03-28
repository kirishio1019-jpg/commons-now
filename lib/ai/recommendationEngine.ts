import { Wave, Commitment } from "../../types";
import { UserPreferenceVector, WaveScore, ScoringContext } from "./types";
import { AI } from "./constants";

export function scoreWaves(
  waves: Wave[],
  prefs: UserPreferenceVector,
  commitments: Commitment[],
  context: ScoringContext,
  collaborativeScores: Record<string, number>
): WaveScore[] {
  const committedIds = new Set(commitments.filter((c) => c.level === "going").map((c) => c.wave_id));
  const allCommittedIds = new Set(commitments.map((c) => c.wave_id));

  // For diversity tracking
  const themeCounts: Record<string, number> = {};

  const scored: WaveScore[] = waves.map((wave) => {
    // 1. Content match (0-30)
    let contentMatch = (prefs.themeAffinities[wave.theme] ?? 0) * 25;
    // Cross-theme bonus
    for (const [tag, themes] of Object.entries(AI.TAG_TO_THEMES)) {
      if (themes.includes(wave.theme) && prefs.themeAffinities[tag]) {
        contentMatch += prefs.themeAffinities[tag] * 1.5;
      }
    }
    contentMatch = Math.min(contentMatch, AI.CONTENT_MAX);

    // 2. Collaborative (0-15)
    const collaborative = (collaborativeScores[wave.id] ?? 0) * AI.COLLAB_MAX;

    // 3. Contextual (0-15)
    let contextual = 0;
    if (wave.time_start) {
      const waveHour = parseInt(wave.time_start.split(":")[0], 10);
      const hourDiff = Math.min(
        ...prefs.timePreferences.preferredHours.map((h) => Math.abs(h - waveHour))
      );
      if (hourDiff <= 2) contextual += 8;
      else if (hourDiff <= 4) contextual += 4;
    }
    if (wave.date) {
      const waveDay = new Date(wave.date).getDay();
      if (prefs.timePreferences.preferredDays.includes(waveDay)) contextual += 7;
    }
    contextual = Math.min(contextual, AI.CONTEXT_MAX);

    // 4. Proximity (0-15)
    let proximity = 0;
    const dist = wave.distance_km;
    if (dist != null) {
      if (dist <= prefs.distanceComfortKm) {
        proximity = AI.PROXIMITY_MAX * (1 - dist / Math.max(prefs.distanceComfortKm, 1));
      } else {
        proximity = Math.max(0, 5 - (dist - prefs.distanceComfortKm) * 0.2);
      }
    } else {
      proximity = 5; // Unknown distance gets neutral
    }

    // 5. Popularity (0-10)
    let popularity = 0;
    if (wave.capacity > 0) {
      const fillRate = wave.current_participants / wave.capacity;
      let groupMult = 1.0;
      if (prefs.groupSizePreference === "small" && wave.capacity < 10) groupMult = 1.4;
      else if (prefs.groupSizePreference === "large" && wave.capacity > 25) groupMult = 1.4;
      else if (prefs.groupSizePreference === "medium" && wave.capacity >= 10 && wave.capacity <= 25) groupMult = 1.3;
      popularity = fillRate * 6 * groupMult;
      if (fillRate > 0.7) popularity += 2; // Urgency
      if (fillRate > 0.95) popularity -= 5; // Almost full
    }
    popularity = Math.max(0, Math.min(popularity, AI.POPULARITY_MAX));

    // 6. Recency (0-10)
    const daysUntil = Math.max(0, (new Date(wave.date).getTime() - Date.now()) / 86400000);
    const recency = Math.max(0, AI.RECENCY_MAX - daysUntil * 0.7);

    // 7. Diversity (-10 to +10)
    let diversity = 0;
    const sameCount = themeCounts[wave.theme] ?? 0;
    if (sameCount >= AI.SAME_THEME_THRESHOLD) {
      diversity = -5 * (sameCount - AI.SAME_THEME_THRESHOLD + 1);
    }
    if (!(wave.theme in prefs.themeAffinities)) {
      diversity += 5; // Novel theme bonus
    }
    themeCounts[wave.theme] = sameCount + 1;

    // Eco interest bonus within content
    if (prefs.ecoInterestScore > 0.6) {
      const eco = wave.eco_impact_target;
      if (eco.trees_planted > 0 || eco.water_collected_liters > 0 || eco.meals_shared > 0) {
        contentMatch = Math.min(contentMatch + 3, AI.CONTENT_MAX);
      }
    }

    // Committed penalty
    const exploration = 0;
    let penalty = 0;
    if (committedIds.has(wave.id)) penalty = AI.COMMITTED_PENALTY;
    else if (allCommittedIds.has(wave.id)) penalty = -10;

    const totalScore = contentMatch + collaborative + contextual + proximity + popularity + recency + diversity + penalty;

    return {
      waveId: wave.id,
      totalScore,
      breakdown: {
        contentMatch,
        collaborative,
        contextual,
        proximity,
        popularity,
        recency,
        diversity,
        exploration,
      },
      isExploration: false,
      isPersonalized: contentMatch > 15,
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored;
}
