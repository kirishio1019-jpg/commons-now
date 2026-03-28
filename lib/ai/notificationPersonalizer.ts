import { UserPreferenceVector } from "./types";
import { User, Wave, NotificationType } from "../../types";
import { AI } from "./constants";

interface PersonalizedNotification {
  title: string;
  body: string;
  scheduledHour: number;
  tone: "gentle" | "encouraging" | "urgent" | "informational";
  recommendedWaveIds: string[];
}

export function personalizeNotification(
  base: { type: NotificationType; waveId?: string; title: string; body: string },
  prefs: UserPreferenceVector,
  user: User,
  waves: Wave[]
): PersonalizedNotification {
  // Optimal send time
  const hours = prefs.notificationOptimalHours.length > 0
    ? prefs.notificationOptimalHours
    : AI.DEFAULT_HOURS;
  const scheduledHour = hours[0] ?? 9;

  // Tone
  let tone: PersonalizedNotification["tone"] = "informational";
  if (user.isolation_score > AI.HIGH_ISOLATION && base.type === "isolation_nudge") {
    tone = "gentle";
  } else if (prefs.engagementType === "committer" && base.type === "wave_nearby") {
    tone = "encouraging";
  } else if (base.type === "reminder") {
    tone = "informational";
  }

  // Find recommended waves based on user's top affinities
  const topThemes = Object.entries(prefs.themeAffinities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  const recommended = waves
    .filter((w) => topThemes.includes(w.theme))
    .slice(0, 3)
    .map((w) => w.id);

  // Adapt body text based on tone
  let body = base.body;
  if (tone === "gentle") {
    body = body.replace(/行きましょう|参加しよう/g, "ふらっと覗いてみませんか");
  } else if (tone === "encouraging") {
    body = body.replace(/近くで/g, "あなたの好きなテーマで");
  }

  return {
    title: base.title,
    body,
    scheduledHour,
    tone,
    recommendedWaveIds: recommended,
  };
}
