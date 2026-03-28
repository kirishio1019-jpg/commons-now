-- Allow authenticated users to insert waves
CREATE POLICY "Authenticated users can insert waves" ON waves
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to insert organizations
CREATE POLICY "Authenticated users can insert organizations" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
