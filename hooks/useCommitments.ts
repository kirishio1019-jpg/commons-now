import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Commitment, CommitLevel } from "../types";

export function useCommitments() {
  const { user } = useAuth();
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error: err } = await supabase
      .from("commitments")
      .select("*")
      .eq("user_id", user.id);

    if (err) {
      setError(err.message);
    } else {
      setCommitments((data ?? []) as Commitment[]);
    }
    setLoading(false);
  }, [user?.id]);

  const getCommitLevel = useCallback(
    (waveId: string): CommitLevel => {
      const c = commitments.find((cm) => cm.wave_id === waveId);
      return c?.level ?? "none";
    },
    [commitments]
  );

  const updateCommitLevel = useCallback(
    async (waveId: string, level: CommitLevel) => {
      if (!user) return;

      const existing = commitments.find((cm) => cm.wave_id === waveId);
      const now = new Date().toISOString();

      // Optimistic update
      setCommitments((prev) => {
        if (existing) {
          return prev.map((cm) =>
            cm.wave_id === waveId ? { ...cm, level, updated_at: now } : cm
          );
        }
        return [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            user_id: user.id,
            wave_id: waveId,
            level,
            created_at: now,
            updated_at: now,
          },
        ];
      });

      if (existing) {
        const { error: err } = await supabase
          .from("commitments")
          .update({ level, updated_at: now })
          .eq("id", existing.id);
        if (err) fetch(); // revert on error
      } else {
        const { data, error: err } = await supabase
          .from("commitments")
          .insert({
            user_id: user.id,
            wave_id: waveId,
            level,
          })
          .select()
          .single();

        if (err) {
          fetch(); // revert
        } else if (data) {
          // Replace temp ID with real ID
          setCommitments((prev) =>
            prev.map((cm) =>
              cm.wave_id === waveId && cm.id.startsWith("temp-")
                ? (data as Commitment)
                : cm
            )
          );
        }
      }
    },
    [user?.id, commitments, fetch]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { commitments, loading, error, getCommitLevel, updateCommitLevel, refetch: fetch };
}
