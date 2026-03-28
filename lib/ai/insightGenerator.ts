import { UserPreferenceVector } from "./types";
import { Commitment, Wave } from "../../types";

const DAY_NAMES = ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"];

export function generateInsights(
  prefs: UserPreferenceVector,
  commitments: Commitment[],
  waves: Wave[]
): string[] {
  const insights: string[] = [];

  // Top theme affinity
  const topThemes = Object.entries(prefs.themeAffinities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  if (topThemes.length > 0 && topThemes[0][1] > 0.15) {
    insights.push(
      `${topThemes[0][0]}テーマの波に特に関心が高い傾向があります` +
      (topThemes[1] && topThemes[1][1] > 0.1 ? `（次いで${topThemes[1][0]}）` : "")
    );
  }

  // Time preference
  const hours = prefs.timePreferences.preferredHours;
  if (hours.length > 0) {
    const morningCount = hours.filter((h) => h < 12).length;
    const eveningCount = hours.filter((h) => h >= 17).length;
    if (morningCount > eveningCount) {
      insights.push("午前中のイベントに参加する傾向があります");
    } else if (eveningCount > morningCount) {
      insights.push("夕方以降のイベントに惹かれる傾向があります");
    }
  }

  // Day preference
  const days = prefs.timePreferences.preferredDays;
  if (days.length > 0) {
    const weekendCount = days.filter((d) => d === 0 || d === 6).length;
    if (weekendCount >= 2) {
      insights.push("週末に活動することが多いです");
    } else if (days.length > 0) {
      insights.push(`${DAY_NAMES[days[0]]}に活動することが多いです`);
    }
  }

  // Distance comfort
  if (prefs.distanceComfortKm < 5) {
    insights.push("近場のイベント（5km以内）を好む傾向があります");
  } else if (prefs.distanceComfortKm > 20) {
    insights.push("遠方のイベントにも積極的に参加しています");
  }

  // Group size
  if (prefs.groupSizePreference === "small") {
    insights.push("少人数（10人以下）のイベントを好む傾向があります");
  } else if (prefs.groupSizePreference === "large") {
    insights.push("大規模なイベントに惹かれる傾向があります");
  }

  // Eco interest
  if (prefs.ecoInterestScore > 0.7) {
    insights.push("環境インパクトのあるイベントに関心が高いです");
  }

  // Engagement type
  if (prefs.engagementType === "creator") {
    insights.push("波を作る側として積極的に活動しています");
  } else if (prefs.engagementType === "committer") {
    insights.push("気になった波にはすぐに参加を決める傾向があります");
  }

  return insights.slice(0, 3);
}
