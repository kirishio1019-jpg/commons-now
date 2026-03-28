import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Wave, CommitLevel } from "../types";
import { Colors } from "../lib/colors";
import { AnimatedBackground } from "./AnimatedBackground";

interface WaveFeedItemProps {
  wave: Wave;
  clipCaption?: string;
  isActive: boolean;
  commitLevel: CommitLevel;
  onCommit: () => void;
  itemHeight: number;
  itemWidth: number;
}

const COMMIT_CONFIG: Record<
  CommitLevel,
  { label: string; icon: string; color: string; bg: string }
> = {
  none: { label: "興味あり", icon: "+", color: "#fff", bg: "rgba(255,255,255,0.12)" },
  curious: { label: "検討中", icon: "?", color: Colors.maybe, bg: Colors.curious + "30" },
  maybe: { label: "参加", icon: "!", color: Colors.going, bg: Colors.maybe + "30" },
  going: { label: "参加中", icon: "✓", color: Colors.going, bg: Colors.going + "30" },
};

export function WaveFeedItem({
  wave,
  clipCaption,
  isActive,
  commitLevel,
  onCommit,
  itemHeight,
  itemWidth,
}: WaveFeedItemProps) {
  const commit = COMMIT_CONFIG[commitLevel];

  return (
    <View style={[styles.container, { width: itemWidth, height: itemHeight }]}>
      <AnimatedBackground theme={wave.theme} isActive={isActive} description={wave.description} title={wave.title} />

      <View style={styles.gradientBottom} />
      <View style={styles.gradientTop} />

      <Pressable
        style={styles.tapArea}
        onPress={() => router.push(`/wave/${wave.id}`)}
      />

      {/* Personalized indicator */}
      {wave.is_personalized && (
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>For You</Text>
        </View>
      )}

      {/* Right side actions */}
      <View style={styles.rightActions}>
        <Pressable style={styles.actionItem} onPress={onCommit}>
          <View style={[styles.actionCircle, { backgroundColor: commit.bg }]}>
            <Text style={[styles.actionIcon, commitLevel !== "none" && { color: commit.color }]}>
              {commit.icon}
            </Text>
          </View>
          <Text style={[styles.actionLabel, commitLevel !== "none" && { color: commit.color }]}>
            {commit.label}
          </Text>
        </Pressable>

        <Pressable
          style={styles.actionItem}
          onPress={() => router.push(`/wave/${wave.id}`)}
        >
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

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        {clipCaption && (
          <Text style={styles.clipCaption}>"{clipCaption}"</Text>
        )}

        <Text style={styles.waveTitle} numberOfLines={2}>
          {wave.title}
        </Text>

        <View style={styles.metaRow}>
          {wave.distance_km != null && (
            <Text style={styles.metaText}>{wave.distance_km}km</Text>
          )}
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{wave.date}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{wave.time_start}</Text>
        </View>

        <View style={styles.themeRow}>
          <View style={styles.themeTag}>
            <Text style={styles.themeText}>#{wave.theme}</Text>
          </View>
          {wave.eco_impact_target.trees_planted > 0 && (
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>{wave.eco_impact_target.trees_planted}本植樹</Text>
            </View>
          )}
          {wave.eco_impact_target.meals_shared > 0 && (
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>{wave.eco_impact_target.meals_shared}食共有</Text>
            </View>
          )}
          {wave.eco_impact_target.water_collected_liters > 0 && (
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>{wave.eco_impact_target.water_collected_liters}L雨水</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={1}>
          {wave.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#000" },
  tapArea: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  gradientBottom: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 320,
    backgroundColor: "transparent", zIndex: 2,
    // @ts-ignore
    backgroundImage: "linear-gradient(transparent, rgba(0,0,0,0.85))",
  },
  gradientTop: {
    position: "absolute", top: 0, left: 0, right: 0, height: 100,
    zIndex: 2,
    // @ts-ignore
    backgroundImage: "linear-gradient(rgba(0,0,0,0.3), transparent)",
  },
  topBadge: {
    position: "absolute", top: 54, left: 16,
    backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 4, zIndex: 10,
  },
  topBadgeText: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  rightActions: { position: "absolute", right: 10, bottom: 150, alignItems: "center", gap: 20, zIndex: 10 },
  actionItem: { alignItems: "center", gap: 4 },
  actionCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  actionIcon: { color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: "700" },
  actionLabel: {
    color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  bottomOverlay: { position: "absolute", bottom: 88, left: 16, right: 66, gap: 6, zIndex: 10 },
  clipCaption: {
    color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: "300", fontStyle: "italic", lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.6)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  waveTitle: {
    color: "#fff", fontSize: 17, fontWeight: "700", lineHeight: 22, letterSpacing: -0.3,
    textShadowColor: "rgba(0,0,0,0.6)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "500" },
  metaDot: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  themeRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  themeTag: {
    backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
  },
  themeText: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600" },
  description: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: "400", marginTop: 2 },
});
