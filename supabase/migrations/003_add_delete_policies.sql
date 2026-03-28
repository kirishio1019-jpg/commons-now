-- Allow users to delete their own commitments (for reverting to "none")
CREATE POLICY "Users can delete own commitments" ON commitments
  FOR DELETE USING (user_id = auth.uid());
