import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Organization, Wave } from "../types";

export function useOrganization(id: string | undefined) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const [orgRes, wavesRes] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", id).single(),
      supabase
        .from("waves")
        .select("*")
        .eq("organizer_id", id)
        .order("date", { ascending: false })
        .limit(20),
    ]);

    if (orgRes.error) {
      setError(orgRes.error.message);
    } else {
      setOrganization(orgRes.data as Organization);
    }

    setWaves((wavesRes.data ?? []) as Wave[]);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { organization, waves, loading, error, refetch: fetch };
}
