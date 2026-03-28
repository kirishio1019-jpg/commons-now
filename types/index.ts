// Commons Now - 型定義

export type CommitLevel = "none" | "curious" | "maybe" | "going";

export type TrustRank = "bronze" | "silver" | "gold" | "platinum";

export type OrgType = "npo" | "community" | "corporate" | "individual_steward";

export type NotificationType =
  | "wave_nearby"
  | "reminder"
  | "isolation_nudge"
  | "contribution_report"
  | "continuation_nudge";

export interface User {
  id: string;
  nickname: string;
  avatar_url?: string;
  location_zone: string;
  tags: string[];
  isolation_score: number;
  age_range?: string;
  bio?: string;
  is_onboarded: boolean;
  ai_companion_heavy_user: boolean;
  created_at: string;
}

export interface Wave {
  id: string;
  title: string;
  theme: string;
  description: string;
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  date: string;
  time_start: string;
  time_end: string;
  organizer_id: string;
  capacity: number;
  current_participants: number;
  eco_impact_target: EcoImpact;
  image_url: string;
  distance_km?: number;
  is_personalized: boolean;
  created_at: string;
}

export interface Commitment {
  id: string;
  user_id: string;
  wave_id: string;
  level: CommitLevel;
  created_at: string;
  updated_at: string;
}

export interface Clip {
  id: string;
  wave_id: string;
  user_id: string;
  media_url: string;
  thumbnail_url: string;
  caption: string;
  duration_sec: number;
  feed_score: number;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  description: string;
  trust_score: number;
  trust_rank: TrustRank;
  active_zones: string[];
  logo_url: string;
  event_count: number;
  member_count: number;
  themes: string[];
  created_at: string;
}

export interface RegionVoid {
  zone_id: string;
  void_score: number;
  last_event_date: string | null;
  user_density: number;
  isolation_density: number;
}

export interface EcoImpact {
  trees_planted: number;
  water_collected_liters: number;
  meals_shared: number;
  contributor_count: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  wave_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Participant {
  id: string;
  nickname: string;
  age_range?: string;
  bio?: string;
  is_first_time: boolean;
  has_kids: boolean;
  is_repeat: boolean;
}
