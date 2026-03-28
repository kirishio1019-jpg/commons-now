-- Commons Now - Initial Database Schema
-- Supabase (PostgreSQL)

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------------------------------------
-- Users (id = auth.uid() directly)
----------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  location_zone TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  isolation_score INTEGER DEFAULT 0 CHECK (isolation_score >= 0 AND isolation_score <= 100),
  age_range TEXT,
  bio TEXT,
  is_onboarded BOOLEAN DEFAULT FALSE,
  ai_companion_heavy_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

----------------------------------------------
-- Organizations
----------------------------------------------
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('npo', 'community', 'corporate', 'individual_steward')),
  description TEXT NOT NULL DEFAULT '',
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  trust_rank TEXT DEFAULT 'bronze' CHECK (trust_rank IN ('bronze', 'silver', 'gold', 'platinum')),
  active_zones TEXT[] DEFAULT '{}',
  logo_url TEXT,
  event_count INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  themes TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

----------------------------------------------
-- Waves (Events)
----------------------------------------------
CREATE TABLE waves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location JSONB NOT NULL DEFAULT '{}',
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  organizer_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  capacity INTEGER NOT NULL DEFAULT 20,
  current_participants INTEGER DEFAULT 0,
  eco_impact_target JSONB DEFAULT '{}',
  image_url TEXT,
  is_personalized BOOLEAN DEFAULT FALSE,
  is_auto_generated BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

----------------------------------------------
-- Commitments
----------------------------------------------
CREATE TABLE commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wave_id UUID NOT NULL REFERENCES waves(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'curious' CHECK (level IN ('curious', 'maybe', 'going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wave_id)
);

----------------------------------------------
-- Clips
----------------------------------------------
CREATE TABLE clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wave_id UUID NOT NULL REFERENCES waves(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT NOT NULL DEFAULT '' CHECK (char_length(caption) <= 40),
  duration_sec INTEGER CHECK (duration_sec >= 0 AND duration_sec <= 15),
  feed_score INTEGER DEFAULT 0,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

----------------------------------------------
-- Region Voids
----------------------------------------------
CREATE TABLE region_voids (
  zone_id TEXT PRIMARY KEY,
  void_score NUMERIC DEFAULT 0,
  last_event_date DATE,
  user_density INTEGER DEFAULT 0,
  isolation_density INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

----------------------------------------------
-- Eco Impacts (per wave)
----------------------------------------------
CREATE TABLE eco_impacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wave_id UUID NOT NULL REFERENCES waves(id) ON DELETE CASCADE,
  trees_planted INTEGER DEFAULT 0,
  water_collected_liters INTEGER DEFAULT 0,
  meals_shared INTEGER DEFAULT 0,
  contributor_count INTEGER DEFAULT 0,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

----------------------------------------------
-- Notifications
----------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('wave_nearby', 'reminder', 'isolation_nudge', 'contribution_report', 'continuation_nudge')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  wave_id UUID REFERENCES waves(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

----------------------------------------------
-- Indexes
----------------------------------------------
CREATE INDEX idx_waves_date ON waves(date);
CREATE INDEX idx_waves_organizer ON waves(organizer_id);
CREATE INDEX idx_commitments_user ON commitments(user_id);
CREATE INDEX idx_commitments_wave ON commitments(wave_id);
CREATE INDEX idx_clips_wave ON clips(wave_id);
CREATE INDEX idx_clips_feed_score ON clips(feed_score DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

----------------------------------------------
-- Row Level Security
----------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_impacts ENABLE ROW LEVEL SECURITY;

-- Users: read own, insert own, update own
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Waves: anyone can read
CREATE POLICY "Anyone can read waves" ON waves
  FOR SELECT USING (true);

-- Organizations: anyone can read
CREATE POLICY "Anyone can read organizations" ON organizations
  FOR SELECT USING (true);

-- Commitments: users can manage their own
CREATE POLICY "Users can read own commitments" ON commitments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own commitments" ON commitments
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own commitments" ON commitments
  FOR UPDATE USING (user_id = auth.uid());

-- Clips: anyone can read approved, users can insert own
CREATE POLICY "Anyone can read approved clips" ON clips
  FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Users can insert own clips" ON clips
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications: users can read and update own
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Eco impacts: anyone can read
CREATE POLICY "Anyone can read eco impacts" ON eco_impacts
  FOR SELECT USING (true);

----------------------------------------------
-- Participant count view
----------------------------------------------
CREATE VIEW wave_participant_counts AS
SELECT
  wave_id,
  COUNT(*) FILTER (WHERE level = 'going') AS going_count,
  COUNT(*) FILTER (WHERE level = 'maybe') AS maybe_count,
  COUNT(*) FILTER (WHERE level = 'curious') AS curious_count,
  COUNT(*) AS total_count
FROM commitments
GROUP BY wave_id;

----------------------------------------------
-- Function: update current_participants on commitment change
----------------------------------------------
CREATE OR REPLACE FUNCTION update_wave_participants()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE waves SET current_participants = (
    SELECT COUNT(*) FROM commitments WHERE wave_id = COALESCE(NEW.wave_id, OLD.wave_id) AND level = 'going'
  ) WHERE id = COALESCE(NEW.wave_id, OLD.wave_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wave_participants
AFTER INSERT OR UPDATE OR DELETE ON commitments
FOR EACH ROW EXECUTE FUNCTION update_wave_participants();

----------------------------------------------
-- Enable Realtime
----------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE commitments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE clips;
