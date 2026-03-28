import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Wave } from "../types";

export function useWaves() {
  const [waves, setWaves] = useState<Wave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch all upcoming waves (no hard date filter — AI handles ranking)
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

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { waves, loading, error, refetch: fetch };
}
