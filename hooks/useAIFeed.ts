import { useMemo, useEffect, useRef } from "react";
import { Wave, Commitment, User } from "../types";
import {
  scoreWaves,
  computeCollaborativeScores,
  applyExploration,
  buildInitialPreferences,
  updatePreferences,
  loadPreferences,
  savePreferences,
  eventTracker,
} from "../lib/ai";
import type { UserPreferenceVector, WaveScore } from "../lib/ai";
import { supabase } from "../lib/supabase";
import { useState, useCallback } from "react";

export function useAIFeed(
  waves: Wave[],
  commitments: Commitment[],
  user: User | null
) {
  const [prefs, setPrefs] = useState<UserPreferenceVector | null>(null);
  const [aggregates, setAggregates] = useState<any[]>([]);
  const initDone = useRef(false);

  // Load preferences on mount (graceful fallback if AI tables don't exist yet)
  useEffect(() => {
    if (!user || initDone.current) return;
    initDone.current = true;

    (async () => {
      try {
        let loaded = await loadPreferences(user.id);
        if (!loaded) {
          loaded = buildInitialPreferences(user);
          try { await savePreferences(user.id, loaded); } catch {}
        }
        setPrefs(loaded);
      } catch {
        setPrefs(buildInitialPreferences(user));
      }
    })();

    // Load wave aggregates (may not exist yet)
    supabase
      .from("wave_interaction_aggregates")
      .select("*")
      .then(({ data }) => { if (data) setAggregates(data); })
      .catch(() => {});
  }, [user?.id]);

  // Periodically update preferences from accumulated events
  useEffect(() => {
    if (!prefs || !user) return;

    const interval = setInterval(() => {
      const events = eventTracker.getRecentEvents(100);
      if (events.length === 0) return;

      const waveMap = new Map(waves.map((w) => [w.id, w]));
      const updated = updatePreferences(prefs, events, waveMap);
      setPrefs(updated);
      savePreferences(user.id, updated);
    }, 60000);

    return () => clearInterval(interval);
  }, [prefs, user?.id, waves]);

  // Score and rank waves
  const rankedWaves = useMemo(() => {
    if (!prefs || waves.length === 0) return waves;

    const committedWaves = commitments
      .filter((c) => c.level === "going")
      .map((c) => waves.find((w) => w.id === c.wave_id))
      .filter((w): w is Wave => !!w);

    const collabScores = computeCollaborativeScores(waves, committedWaves, aggregates);

    const context = {
      currentHour: new Date().getHours(),
      currentDay: new Date().getDay(),
    };

    const scores = scoreWaves(waves, prefs, commitments, context, collabScores);
    const explored = applyExploration(scores, waves, new Set(), prefs.explorationRate);

    return explored.map((s) => {
      const wave = waves.find((w) => w.id === s.waveId)!;
      return { ...wave, is_personalized: s.isPersonalized };
    });
  }, [waves, prefs, commitments, aggregates]);

  return { rankedWaves, prefs };
}
