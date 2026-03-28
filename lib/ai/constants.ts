export const AI = {
  // Event tracking
  MEMORY_FLUSH_MS: 5000,
  SUPABASE_SYNC_MS: 60000,
  EVENT_RETENTION_DAYS: 90,
  MAX_QUEUE_SIZE: 500,

  // Preference learning (EMA alpha values)
  ALPHA_DETAIL_VIEW: 0.10,
  ALPHA_DWELL: 0.05,
  ALPHA_COMMIT: 0.20,
  ALPHA_SKIP: 0.02,
  ALPHA_DISTANCE: 0.15,
  ALPHA_ECO_POS: 0.10,
  ALPHA_ECO_NEG: 0.02,

  // Exploration
  EXPLORATION_INITIAL: 0.30,
  EXPLORATION_DECAY: 200,
  EXPLORATION_MIN: 0.05,
  EXPLORATION_SLOTS: [3, 7, 12] as number[],

  // Scoring max points
  CONTENT_MAX: 30,
  COLLAB_MAX: 15,
  CONTEXT_MAX: 15,
  PROXIMITY_MAX: 15,
  POPULARITY_MAX: 10,
  RECENCY_MAX: 10,
  COMMITTED_PENALTY: -30,

  // Diversity
  SAME_THEME_THRESHOLD: 2,

  // Notifications
  DEFAULT_HOURS: [9, 18] as number[],
  HIGH_ISOLATION: 60,

  // Preference save
  SAVE_DEBOUNCE_MS: 30000,

  // Dwell threshold
  DWELL_MIN_MS: 1500,

  // Tag → Theme mapping
  TAG_TO_THEMES: {
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
  } as Record<string, string[]>,
} as const;
