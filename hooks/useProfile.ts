import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";

interface ProfileStats {
  eventsJoined: number;
  treesPlanted: number;
  clipsPosted: number;
}

export function useProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    eventsJoined: 0,
    treesPlanted: 0,
    clipsPosted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (err) {
      if (err.code === "PGRST116") {
        // User row doesn't exist yet — create it
        const { data: newUser, error: insertErr } = await supabase
          .from("users")
          .insert({
            id: authUser.id,
            nickname: authUser.user_metadata?.full_name ?? "名前未設定",
            avatar_url: authUser.user_metadata?.avatar_url,
            location_zone: "",
            tags: [],
            isolation_score: 50,
            is_onboarded: false,
            ai_companion_heavy_user: false,
          })
          .select()
          .single();

        if (insertErr) {
          setError(insertErr.message);
        } else {
          setProfile(newUser as User);
        }
      } else {
        setError(err.message);
      }
    } else {
      setProfile(data as User);
    }

    // Fetch stats
    const [commitRes, clipsRes] = await Promise.all([
      supabase
        .from("commitments")
        .select("wave_id")
        .eq("user_id", authUser.id)
        .eq("level", "going"),
      supabase
        .from("clips")
        .select("id", { count: "exact", head: true })
        .eq("user_id", authUser.id),
    ]);

    const eventsJoined = commitRes.data?.length ?? 0;

    // Fetch eco impact for participated waves
    let treesPlanted = 0;
    if (commitRes.data && commitRes.data.length > 0) {
      const waveIds = commitRes.data.map((c: any) => c.wave_id);
      const { data: impacts } = await supabase
        .from("eco_impacts")
        .select("trees_planted")
        .in("wave_id", waveIds);
      (impacts ?? []).forEach((i: any) => {
        treesPlanted += i.trees_planted ?? 0;
      });
    }

    setStats({
      eventsJoined,
      treesPlanted,
      clipsPosted: clipsRes.count ?? 0,
    });

    setLoading(false);
  }, [authUser?.id]);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!authUser) return;

      const { error: err } = await supabase
        .from("users")
        .update(updates)
        .eq("id", authUser.id);

      if (!err && profile) {
        setProfile({ ...profile, ...updates });
      }
      return err;
    },
    [authUser?.id, profile]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { profile, stats, loading, error, updateProfile, refetch: fetch };
}
