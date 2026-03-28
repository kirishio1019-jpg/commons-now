-- Add is_public column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Allow reading public profiles
CREATE POLICY "Anyone can read public profiles" ON users
  FOR SELECT USING (is_public = true OR auth.uid() = id);
