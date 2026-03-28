import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Wave } from "../types";
import { AppState } from "react-native";
import { generateAIVideo } from "../lib/aiVideo";

export function useWaves() {
  const [waves, setWaves] = useState<Wave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWaves = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("waves")
      .select("*")
      .order("date", { ascending: true })
      .limit(100);

    if (err) {
      setError(err.message);
    } else {
      const waves = (data ?? []) as Wave[];
      // Auto-assign videos to waves that don't have one
      for (const w of waves) {
        if (!w.image_url) {
          try {
            const url = await generateAIVideo(w.theme, w.title, w.description);
            w.image_url = url;
            // Save to DB in background
            supabase.from("waves").update({ image_url: url }).eq("id", w.id).then(() => {});
          } catch {}
        }
      }
      setWaves(waves);
    }
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchWaves();
  }, [fetchWaves]);

  // Refetch when app comes to foreground (covers back-navigation from create screen)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") fetchWaves();
    });
    return () => sub.remove();
  }, [fetchWaves]);

  // Also poll every 30s to keep feed fresh
  useEffect(() => {
    const interval = setInterval(fetchWaves, 30000);
    return () => clearInterval(interval);
  }, [fetchWaves]);

  return { waves, loading, error, refetch: fetchWaves };
}
