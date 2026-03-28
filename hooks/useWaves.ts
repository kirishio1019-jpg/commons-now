import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Wave } from "../types";
import { AppState } from "react-native";

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
      setWaves((data ?? []) as Wave[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchWaves(); }, [fetchWaves]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") fetchWaves();
    });
    return () => sub.remove();
  }, [fetchWaves]);

  useEffect(() => {
    const interval = setInterval(fetchWaves, 30000);
    return () => clearInterval(interval);
  }, [fetchWaves]);

  return { waves, loading, error, refetch: fetchWaves };
}
