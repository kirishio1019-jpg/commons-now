import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Clip } from "../types";

export function useClips(waveId?: string) {
  const { user } = useAuth();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("clips")
      .select("*")
      .eq("moderation_status", "approved")
      .order("feed_score", { ascending: false })
      .limit(20);

    if (waveId) {
      query = query.eq("wave_id", waveId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setClips((data ?? []) as Clip[]);
    }
    setLoading(false);
  }, [waveId]);

  const postClip = useCallback(
    async (params: {
      waveId: string;
      caption: string;
      mediaUri: string;
      durationSec: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Upload media to Supabase Storage
      const fileExt = params.mediaUri.split(".").pop() ?? "mp4";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const response = await globalThis.fetch(params.mediaUri);
      const blob = await response.blob();

      const { error: uploadErr } = await supabase.storage
        .from("clips")
        .upload(fileName, blob, {
          contentType: `video/${fileExt}`,
        });

      if (uploadErr) throw uploadErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("clips").getPublicUrl(fileName);

      // Insert clip record
      const { data, error: insertErr } = await supabase
        .from("clips")
        .insert({
          wave_id: params.waveId,
          user_id: user.id,
          media_url: publicUrl,
          thumbnail_url: publicUrl,
          caption: params.caption,
          duration_sec: params.durationSec,
          moderation_status: "pending",
          feed_score: 0,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      return data as Clip;
    },
    [user?.id]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { clips, loading, error, postClip, refetch: fetch };
}
