import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Organization, Wave } from "../types";

interface DashboardStats {
  totalEvents: number;
  totalParticipants: number;
  treesPlanted: number;
  waterCollected: number;
  mealsShared: number;
  repeatRate: number;
}

export function useOrganizerDashboard() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalParticipants: 0,
    treesPlanted: 0,
    waterCollected: 0,
    mealsShared: 0,
    repeatRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // Find org (for now, fetch first available org)
    const { data: orgData, error: orgErr } = await supabase
      .from("organizations")
      .select("*")
      .limit(1)
      .single();

    if (orgErr) {
      setError(orgErr.message);
      setLoading(false);
      return;
    }

    const org = orgData as Organization;
    setOrganization(org);

    // Fetch waves for this org
    const { data: wavesData } = await supabase
      .from("waves")
      .select("*")
      .eq("organizer_id", org.id)
      .order("date", { ascending: false });

    const parsedWaves = (wavesData ?? []) as Wave[];
    setWaves(parsedWaves);

    // Aggregate stats
    const waveIds = parsedWaves.map((w) => w.id);
    if (waveIds.length > 0) {
      const [impactRes, commitRes] = await Promise.all([
        supabase.from("eco_impacts").select("*").in("wave_id", waveIds),
        supabase
          .from("commitments")
          .select("user_id, wave_id")
          .in("wave_id", waveIds)
          .eq("level", "going"),
      ]);

      const impacts = impactRes.data ?? [];
      let trees = 0,
        water = 0,
        meals = 0;
      impacts.forEach((i: any) => {
        trees += i.trees_planted ?? 0;
        water += i.water_collected_liters ?? 0;
        meals += i.meals_shared ?? 0;
      });

      const commits = commitRes.data ?? [];
      const uniqueUsers = new Set(commits.map((c: any) => c.user_id));
      const userWaveCounts: Record<string, number> = {};
      commits.forEach((c: any) => {
        userWaveCounts[c.user_id] = (userWaveCounts[c.user_id] || 0) + 1;
      });
      const repeaters = Object.values(userWaveCounts).filter(
        (count) => count > 1
      ).length;

      setStats({
        totalEvents: parsedWaves.length,
        totalParticipants: uniqueUsers.size,
        treesPlanted: trees,
        waterCollected: water,
        mealsShared: meals,
        repeatRate:
          uniqueUsers.size > 0
            ? Math.round((repeaters / uniqueUsers.size) * 100)
            : 0,
      });
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { organization, waves, stats, loading, error, refetch: fetch };
}
