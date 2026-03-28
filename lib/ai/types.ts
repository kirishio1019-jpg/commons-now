import { CommitLevel, NotificationType } from "../../types";

export interface UserPreferenceVector {
  themeAffinities: Record<string, number>;
  timePreferences: {
    preferredHours: number[];
    preferredDays: number[];
  };
  distanceComfortKm: number;
  groupSizePreference: "small" | "medium" | "large";
  ecoInterestScore: number;
  engagementType: "browser" | "committer" | "creator";
  explorationRate: number;
  notificationOptimalHours: number[];
  notificationResponsiveness: number;
  totalEventsProcessed: number;
  modelVersion: number;
}

export interface WaveScore {
  waveId: string;
  totalScore: number;
  breakdown: {
    contentMatch: number;
    collaborative: number;
    contextual: number;
    proximity: number;
    popularity: number;
    recency: number;
    diversity: number;
    exploration: number;
  };
  isExploration: boolean;
  isPersonalized: boolean;
}

export interface AIEvent {
  event_type: string;
  wave_id?: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface WaveInteractionAggregate {
  wave_id: string;
  total_impressions: number;
  total_detail_views: number;
  total_commits: number;
  avg_dwell_ms: number;
  commit_rate: number;
  theme: string;
}

export interface ScoringContext {
  currentHour: number;
  currentDay: number;
  userLat?: number;
  userLng?: number;
}
