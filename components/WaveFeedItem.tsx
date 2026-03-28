import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { Wave, CommitLevel } from "../types";
import { Colors } from "../lib/colors";
import { VideoCompositor } from "./VideoCompositor";
import { AnimatedBackground } from "./AnimatedBackground";
import { supabase } from "../lib/supabase";

interface WaveFeedItemProps {
  wave: Wave;
  clipCaption?: string;
  isActive: boolean;
  commitLevel: CommitLevel;
  onCommit: () => void;
  itemHeight: number;
  itemWidth: number;
}

const COMMIT_LABELS: Record<CommitLevel, { label: string; icon: string; color: string }> = {
  none: { label: "興味あり", icon: "+", color: "#fff" },
  curious: { label: "検討中", icon: "?", color: Colors.maybe },
  maybe: { label: "参加", icon: "!", color: Colors.going },
  going: { label: "参加中", icon: "✓", color: Colors.going },
};

export function WaveFeedItem({
  wave, clipCaption, isActive, commitLevel, onCommit, itemHeight, itemWidth,
}: WaveFeedItemProps) {
  const commit = COMMIT_LABELS[commitLevel];
  const [orgName, setOrgName] = useState<string>("");

  useEffect(() => {
    if (!wave.organizer_id) return;
    supabase.from("organizations").select("name").eq("id", wave.organizer_id).single()
      .then(({ data }) => { if (data) setOrgName(data.name); });
  }, [wave.organizer_id]);

  const isOnline = wave.location?.is_online === true;

  return (
    <View style={[styles.container, { width: itemWidth, height: itemHeight }]}>
      {/* Background: AI Video Compositor (6-segment storyboard) */}
      {Platform.OS === "web" ? (
        <VideoCompositor
          waveId={wave.id}
          theme={wave.theme}
          title={wave.title}
          description={wave.description}
          isActive={isActive}
          width={itemWidth}
          height={itemHeight}
        />
      ) : (
        <AnimatedBackground theme={wave.theme} isActive={isActive} description={wave.description} title={wave.title} />
      )}

      <View style={styles.gradientBottom} />
      <View style={styles.gradientTop} />

      <Pressable style={styles.tapArea} onPress={() => router.push(`/wave/${wave.id}`)} />

      {wave.is_personalized && (
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>FOR YOU</Text>
        </View>
      )}

      {isOnline && (
        <View style={[styles.topBadge, { left: undefined, right: 16 }]}>
          <Text style={styles.topBadgeText}>ONLINE</Text>
        </View>
      )}

      <View style={styles.rightActions}>
        <Pressable style={styles.actionItem} onPress={onCommit}>
          <View style={[styles.actionCircle, commitLevel !== "none" && { borderColor: commit.color + "60", backgroundColor: commit.color + "15" }]}>
            <Text style={[styles.actionIcon, commitLevel !== "none" && { color: commit.color }]}>{commit.icon}</Text>
          </View>
          <Text style={[styles.actionLabel, commitLevel !== "none" && { color: commit.color }]}>{commit.label}</Text>
        </Pressable>

        <Pressable style={styles.actionItem} onPress={() => router.push(`/wave/${wave.id}`)}>
          <View style={styles.actionCircle}>
            <Text style={styles.actionIcon}>{wave.current_participants}</Text>
          </View>
          <Text style={styles.actionLabel}>参加者</Text>
        </Pressable>

        <Pressable style={styles.actionItem}>
          <View style={styles.actionCircle}>
            <Text style={styles.actionIcon}>→</Text>
          </View>
          <Text style={styles.actionLabel}>共有</Text>
        </Pressable>
      </View>

      <View style={styles.bottomOverlay}>
        {clipCaption && <Text style={styles.clipCaption}>"{clipCaption}"</Text>}

        {orgName ? (
          <Pressable onPress={() => router.push(`/org/${wave.organizer_id}`)}>
            <Text style={styles.orgName}>@{orgName}</Text>
          </Pressable>
        ) : null}

        <Text style={styles.waveTitle} numberOfLines={2}>{wave.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{wave.date}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{wave.time_start}</Text>
          {!isOnline && wave.distance_km != null && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{wave.distance_km}km</Text>
            </>
          )}
          {isOnline && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>オンライン</Text>
            </>
          )}
        </View>

        <View style={styles.tagRow}>
          <View style={styles.tag}><Text style={styles.tagText}>#{wave.theme}</Text></View>
        </View>

        <Text style={styles.desc} numberOfLines={1}>{wave.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#000" },
  tapArea: { ...StyleSheet.absoluteFillObject, zIndex: 5 },
  gradientBottom: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 350,
    backgroundColor: "transparent", zIndex: 6,
    // @ts-ignore
    backgroundImage: "linear-gradient(transparent, rgba(0,0,0,0.9))",
  },
  gradientTop: {
    position: "absolute", top: 0, left: 0, right: 0, height: 100, zIndex: 6,
    // @ts-ignore
    backgroundImage: "linear-gradient(rgba(0,0,0,0.3), transparent)",
  },
  topBadge: { position: "absolute", top: 52, left: 16, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, zIndex: 10 },
  topBadgeText: { color: "rgba(255,255,255,0.8)", fontSize: 9, fontWeight: "800", letterSpacing: 1 },

  rightActions: { position: "absolute", right: 10, bottom: 150, alignItems: "center", gap: 18, zIndex: 10 },
  actionItem: { alignItems: "center", gap: 3 },
  actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  actionIcon: { color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "700" },
  actionLabel: { color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: "600" },

  bottomOverlay: { position: "absolute", bottom: 82, left: 16, right: 64, gap: 5, zIndex: 10 },
  clipCaption: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "300", fontStyle: "italic", lineHeight: 19 },
  orgName: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: -0.5, textShadowColor: "rgba(0,0,0,0.7)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  waveTitle: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600", lineHeight: 19, textShadowColor: "rgba(0,0,0,0.6)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "500" },
  metaDot: { color: "rgba(255,255,255,0.3)" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3 },
  tagText: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600" },
  desc: { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 },
});
