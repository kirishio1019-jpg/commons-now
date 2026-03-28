import { Wave } from "../../types";
import { WaveInteractionAggregate } from "./types";

export function computeCollaborativeScores(
  candidates: Wave[],
  committedWaves: Wave[],
  aggregates: WaveInteractionAggregate[]
): Record<string, number> {
  const scores: Record<string, number> = {};
  if (committedWaves.length === 0) return scores;

  const aggMap = new Map(aggregates.map((a) => [a.wave_id, a]));
  const committedThemes = new Set(committedWaves.map((w) => w.theme));
  const committedOrgs = new Set(committedWaves.map((w) => w.organizer_id));
  const avgCapacity = committedWaves.reduce((s, w) => s + w.capacity, 0) / committedWaves.length;

  for (const wave of candidates) {
    let score = 0;

    // Theme similarity
    if (committedThemes.has(wave.theme)) score += 0.35;

    // Organizer overlap
    if (committedOrgs.has(wave.organizer_id)) score += 0.20;

    // Capacity similarity
    const capDiff = Math.abs(wave.capacity - avgCapacity) / Math.max(avgCapacity, 1);
    score += Math.max(0, 0.15 * (1 - capDiff));

    // Aggregate popularity signal
    const agg = aggMap.get(wave.id);
    if (agg && agg.total_impressions > 0) {
      score += Math.min(0.30, agg.commit_rate * 0.5);
    }

    scores[wave.id] = Math.min(1, score);
  }

  return scores;
}
