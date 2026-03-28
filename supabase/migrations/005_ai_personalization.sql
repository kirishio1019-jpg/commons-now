-- Commons Now AI Personalization Schema

-- 1. User behavioral events
CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'wave_impression', 'wave_dwell', 'wave_detail_view', 'wave_commit_change',
    'clip_view', 'clip_post', 'notification_tap', 'notification_dismiss',
    'map_interaction', 'tab_switch', 'search_filter', 'app_session_start', 'app_session_end'
  )),
  wave_id UUID REFERENCES waves(id) ON DELETE SET NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_events_user ON user_events(user_id, created_at DESC);
CREATE INDEX idx_user_events_type ON user_events(event_type, created_at DESC);
CREATE INDEX idx_user_events_wave ON user_events(wave_id) WHERE wave_id IS NOT NULL;

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own events" ON user_events
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can read own events" ON user_events
  FOR SELECT USING (user_id = auth.uid());

-- 2. Learned preference vectors
CREATE TABLE user_ai_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme_affinities JSONB DEFAULT '{}',
  time_preferences JSONB DEFAULT '{}',
  distance_comfort_km NUMERIC DEFAULT 10,
  group_size_preference TEXT DEFAULT 'medium' CHECK (group_size_preference IN ('small', 'medium', 'large')),
  eco_interest_score NUMERIC DEFAULT 0.5,
  engagement_type TEXT DEFAULT 'browser' CHECK (engagement_type IN ('browser', 'committer', 'creator')),
  exploration_rate NUMERIC DEFAULT 0.3,
  notification_optimal_hours JSONB DEFAULT '[]',
  notification_responsiveness NUMERIC DEFAULT 0.5,
  total_events_processed INTEGER DEFAULT 0,
  model_version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_ai_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own AI profile" ON user_ai_profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own AI profile" ON user_ai_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own AI profile" ON user_ai_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- 3. Wave interaction aggregates (public read)
CREATE TABLE wave_interaction_aggregates (
  wave_id UUID PRIMARY KEY REFERENCES waves(id) ON DELETE CASCADE,
  total_impressions INTEGER DEFAULT 0,
  total_detail_views INTEGER DEFAULT 0,
  total_commits INTEGER DEFAULT 0,
  avg_dwell_ms INTEGER DEFAULT 0,
  commit_rate NUMERIC DEFAULT 0,
  theme TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wave_interaction_aggregates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read wave aggregates" ON wave_interaction_aggregates
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can upsert wave aggregates" ON wave_interaction_aggregates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update wave aggregates" ON wave_interaction_aggregates
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Add AI columns to existing tables
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_personalization_enabled BOOLEAN DEFAULT TRUE;
