import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabase";
import { UserPreferenceVector, AIEvent } from "./types";
import { AI } from "./constants";
import { User, Wave } from "../../types";

const PREFS_KEY = "@ai_preferences";

function ema(current: number, observation: number, alpha: number): number {
  return (1 - alpha) * current + alpha * observation;
}

export function buildInitialPreferences(user: User): UserPreferenceVector {
  const affinities: Record<string, number> = {};
  const allThemes = new Set<string>();

  // Build from explicit tags
  for (const tag of user.tags) {
    const themes = AI.TAG_TO_THEMES[tag] ?? [];
    themes.forEach((theme, i) => {
      allThemes.add(theme);
      const weight = (3 - Math.min(i, 2)) / 3;
      affinities[theme] = Math.max(affinities[theme] ?? 0, weight);
    });
  }

  // Normalize
  const total = Object.values(affinities).reduce((s, v) => s + v, 0) || 1;
  for (const k of Object.keys(affinities)) {
    affinities[k] = affinities[k] / total;
  }

  return {
    themeAffinities: affinities,
    timePreferences: { preferredHours: [9, 10, 18, 19], preferredDays: [0, 6] },
    distanceComfortKm: 10,
    groupSizePreference: "medium",
    ecoInterestScore: 0.5,
    engagementType: "browser",
    explorationRate: AI.EXPLORATION_INITIAL,
    notificationOptimalHours: [...AI.DEFAULT_HOURS],
    notificationResponsiveness: 0.5,
    totalEventsProcessed: 0,
    modelVersion: 1,
  };
}

export function updatePreferences(
  current: UserPreferenceVector,
  events: AIEvent[],
  waveMap: Map<string, Wave>
): UserPreferenceVector {
  if (events.length === 0) return current;

  const prefs = { ...current, themeAffinities: { ...current.themeAffinities } };
  const sessionHours: number[] = [];
  const sessionDays: number[] = [];
  let commitCount = 0;
  let browseCount = 0;
  let createCount = 0;
  let notifTaps = 0;
  let notifTotal = 0;
  const notifTapHours: number[] = [];

  for (const event of events) {
    const wave = event.wave_id ? waveMap.get(event.wave_id) : undefined;
    const theme = wave?.theme;

    switch (event.event_type) {
      case "wave_detail_view":
        if (theme) {
          prefs.themeAffinities[theme] = ema(prefs.themeAffinities[theme] ?? 0, 1.0, AI.ALPHA_DETAIL_VIEW);
        }
        browseCount++;
        break;

      case "wave_dwell":
        if (theme && event.payload.duration_ms > 3000) {
          prefs.themeAffinities[theme] = ema(prefs.themeAffinities[theme] ?? 0, 0.7, AI.ALPHA_DWELL);
        }
        browseCount++;
        break;

      case "wave_commit_change":
        if (theme && event.payload.to === "going") {
          prefs.themeAffinities[theme] = ema(prefs.themeAffinities[theme] ?? 0, 1.0, AI.ALPHA_COMMIT);
          if (wave?.distance_km != null) {
            prefs.distanceComfortKm = ema(prefs.distanceComfortKm, wave.distance_km, AI.ALPHA_DISTANCE);
          }
          if (wave) {
            const cap = wave.capacity;
            if (cap < 10) prefs.groupSizePreference = "small";
            else if (cap > 25) prefs.groupSizePreference = "large";
          }
          if (wave?.eco_impact_target) {
            const hasEco = wave.eco_impact_target.trees_planted > 0 ||
              wave.eco_impact_target.water_collected_liters > 0 ||
              wave.eco_impact_target.meals_shared > 0;
            prefs.ecoInterestScore = ema(prefs.ecoInterestScore, hasEco ? 1 : 0, AI.ALPHA_ECO_POS);
          }
        }
        commitCount++;
        break;

      case "wave_impression":
        if (theme) {
          // Weak negative signal for seen-but-not-acted
          prefs.themeAffinities[theme] = ema(prefs.themeAffinities[theme] ?? 0, 0.0, AI.ALPHA_SKIP);
        }
        browseCount++;
        break;

      case "clip_post":
        createCount++;
        break;

      case "app_session_start": {
        const d = new Date(event.created_at);
        sessionHours.push(d.getHours());
        sessionDays.push(d.getDay());
        break;
      }

      case "notification_tap":
        notifTaps++;
        notifTotal++;
        notifTapHours.push(new Date(event.created_at).getHours());
        break;

      case "notification_dismiss":
        notifTotal++;
        break;
    }
  }

  // Normalize theme affinities
  const affTotal = Object.values(prefs.themeAffinities).reduce((s, v) => s + v, 0) || 1;
  for (const k of Object.keys(prefs.themeAffinities)) {
    prefs.themeAffinities[k] = prefs.themeAffinities[k] / affTotal;
  }

  // Time preferences (merge with existing)
  if (sessionHours.length > 0) {
    const hourCounts: Record<number, number> = {};
    [...(current.timePreferences.preferredHours || []), ...sessionHours].forEach((h) => {
      hourCounts[h] = (hourCounts[h] ?? 0) + 1;
    });
    prefs.timePreferences.preferredHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([h]) => parseInt(h));
  }

  if (sessionDays.length > 0) {
    const dayCounts: Record<number, number> = {};
    [...(current.timePreferences.preferredDays || []), ...sessionDays].forEach((d) => {
      dayCounts[d] = (dayCounts[d] ?? 0) + 1;
    });
    prefs.timePreferences.preferredDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([d]) => parseInt(d));
  }

  // Engagement type
  const total = browseCount + commitCount + createCount || 1;
  if (createCount / total > 0.15) prefs.engagementType = "creator";
  else if (commitCount / total > 0.3) prefs.engagementType = "committer";
  else prefs.engagementType = "browser";

  // Exploration decay
  prefs.totalEventsProcessed += events.length;
  prefs.explorationRate = Math.max(
    AI.EXPLORATION_MIN,
    AI.EXPLORATION_INITIAL * Math.exp(-prefs.totalEventsProcessed / AI.EXPLORATION_DECAY)
  );

  // Notification responsiveness
  if (notifTotal > 0) {
    prefs.notificationResponsiveness = ema(
      prefs.notificationResponsiveness,
      notifTaps / notifTotal,
      0.1
    );
  }
  if (notifTapHours.length > 0) {
    prefs.notificationOptimalHours = [...new Set(notifTapHours)].slice(0, 4);
  }

  return prefs;
}

export async function loadPreferences(userId: string): Promise<UserPreferenceVector | null> {
  // Try AsyncStorage first (fast)
  try {
    const stored = await AsyncStorage.getItem(PREFS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}

  // Fall back to Supabase
  try {
    const { data } = await supabase
      .from("user_ai_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) {
      const prefs: UserPreferenceVector = {
        themeAffinities: data.theme_affinities ?? {},
        timePreferences: data.time_preferences ?? { preferredHours: [], preferredDays: [] },
        distanceComfortKm: data.distance_comfort_km ?? 10,
        groupSizePreference: data.group_size_preference ?? "medium",
        ecoInterestScore: data.eco_interest_score ?? 0.5,
        engagementType: data.engagement_type ?? "browser",
        explorationRate: data.exploration_rate ?? 0.3,
        notificationOptimalHours: data.notification_optimal_hours ?? [],
        notificationResponsiveness: data.notification_responsiveness ?? 0.5,
        totalEventsProcessed: data.total_events_processed ?? 0,
        modelVersion: data.model_version ?? 1,
      };
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      return prefs;
    }
  } catch {}

  return null;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export async function savePreferences(userId: string, prefs: UserPreferenceVector) {
  // Immediate local save
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));

  // Debounced Supabase save
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await supabase.from("user_ai_profiles").upsert({
        user_id: userId,
        theme_affinities: prefs.themeAffinities,
        time_preferences: prefs.timePreferences,
        distance_comfort_km: prefs.distanceComfortKm,
        group_size_preference: prefs.groupSizePreference,
        eco_interest_score: prefs.ecoInterestScore,
        engagement_type: prefs.engagementType,
        exploration_rate: prefs.explorationRate,
        notification_optimal_hours: prefs.notificationOptimalHours,
        notification_responsiveness: prefs.notificationResponsiveness,
        total_events_processed: prefs.totalEventsProcessed,
        model_version: prefs.modelVersion,
        updated_at: new Date().toISOString(),
      });
    } catch {}
  }, AI.SAVE_DEBOUNCE_MS);
}
