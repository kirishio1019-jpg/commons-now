import { WaveScore } from "./types";
import { Wave } from "../../types";
import { AI } from "./constants";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function applyExploration(
  ranked: WaveScore[],
  allWaves: Wave[],
  seenWaveIds: Set<string>,
  explorationRate: number
): WaveScore[] {
  if (ranked.length < 5) return ranked;

  const result = [...ranked];
  const seed = hashSeed(new Date().toISOString().split("T")[0]); // Daily seed
  let rng = seed;
  const nextRand = () => {
    rng = (rng * 16807 + 0) % 2147483647;
    return rng / 2147483647;
  };

  // Find unseen waves from the bottom half
  const bottomHalf = ranked.slice(Math.floor(ranked.length / 2));
  const unseen = bottomHalf.filter((w) => !seenWaveIds.has(w.waveId));

  for (const slot of AI.EXPLORATION_SLOTS) {
    if (slot >= result.length) break;
    if (nextRand() > explorationRate) continue;
    if (unseen.length === 0) break;

    const pick = unseen.splice(Math.floor(nextRand() * unseen.length), 1)[0];
    const explorationEntry: WaveScore = {
      ...pick,
      isExploration: true,
      breakdown: { ...pick.breakdown, exploration: 20 },
      totalScore: pick.totalScore + 20,
    };

    // Remove from original position and insert at exploration slot
    const origIdx = result.findIndex((w) => w.waveId === pick.waveId);
    if (origIdx >= 0) result.splice(origIdx, 1);
    result.splice(Math.min(slot, result.length), 0, explorationEntry);
  }

  return result;
}
