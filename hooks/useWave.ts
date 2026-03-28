import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Wave, Organization, Clip, Participant } from "../types";

interface WaveDetail {
  wave: Wave | null;
  organization: Organization | null;
  clips: Clip[];
  participants: Participant[];
}

export function useWave(id: string | undefined) {
  const [data, setData] = useState<WaveDetail>({
    wave: null,
    organization: null,
    clips: [],
    participants: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const { data: waveData, error: waveErr } = await supabase
      .from("waves")
      .select("*")
      .eq("id", id)
      .single();

    if (waveErr) {
      setError(waveErr.message);
      setLoading(false);
      return;
    }

    const wave = waveData as Wave;

    // Fetch org, clips, participants in parallel
    const [orgRes, clipsRes, participantsRes] = await Promise.all([
      supabase
        .from("organizations")
        .select("*")
        .eq("id", wave.organizer_id)
        .single(),
      supabase
        .from("clips")
        .select("*")
        .eq("wave_id", id)
        .eq("moderation_status", "approved")
        .order("feed_score", { ascending: false })
        .limit(10),
      supabase
        .from("commitments")
        .select("user_id, users(id, nickname, age_range, bio)")
        .eq("wave_id", id)
        .eq("level", "going")
        .limit(20),
    ]);

    const participants: Participant[] = (participantsRes.data ?? []).map(
      (c: any) => ({
        id: c.users?.id ?? c.user_id,
        nickname: c.users?.nickname ?? "匿名",
        age_range: c.users?.age_range,
        bio: c.users?.bio,
        is_first_time: false,
        has_kids: false,
        is_repeat: false,
      })
    );

    setData({
      wave,
      organization: orgRes.data as Organization | null,
      clips: (clipsRes.data ?? []) as Clip[],
      participants,
    });
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetch();

    if (!id) return;
    const channel = supabase
      .channel(`wave-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "commitments", filter: `wave_id=eq.${id}` },
        () => {
          fetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetch]);

  return { ...data, loading, error, refetch: fetch };
}
