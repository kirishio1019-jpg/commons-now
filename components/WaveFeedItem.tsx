import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Wave, CommitLevel } from "../types";
import { getOrgForWave } from "../data/mock";
import { Colors } from "../lib/colors";
import { AnimatedBackground } from "./AnimatedBackground";
import { TrustBadge } from "./TrustBadge";

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
  { label: string; emoji: string; color: string; bg: string }
> = {
  none: { label: "気になる", emoji: "👀", color: "#fff", bg: "rgba(255,255,255,0.12)" },
  curious: { label: "たぶん", emoji: "🤔", color: Colors.maybe, bg: Colors.curious + "40" },
  maybe: { label: "行く！", emoji: "🙌", color: Colors.going, bg: Colors.maybe + "40" },
  going: { label: "参加中", emoji: "✅", color: Colors.going, bg: Colors.going + "40" },
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
  const org = getOrgForWave(wave);
  const commit = COMMIT_CONFIG[commitLevel];

  return (
    <View style={[styles.container, { width: itemWidth, height: itemHeight }]}>
      {/* Animated background */}
      <AnimatedBackground theme={wave.theme} isActive={isActive} />

      {/* Bottom gradient overlay for readability */}
      <View style={styles.gradientBottom} />
      <View style={styles.gradientTop} />

      {/* Tap to open detail */}
      <Pressable
        style={styles.tapArea}
        onPress={() => router.push(`/wave/${wave.id}`)}
      />

      {/* Top: Personalized badge */}
      {wave.is_personalized && (
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>✨ あなた向け</Text>
        </View>
      )}

      {/* Right side actions (TikTok style) */}
      <View style={styles.rightActions}>
        {/* Org avatar */}
        {org && (
          <Pressable
            style={styles.actionItem}
            onPress={() => router.push(`/org/${org.id}`)}
          >
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>{org.name[0]}</Text>
            </View>
          </Pressable>
        )}

        {/* Commit button */}
        <Pressable style={styles.actionItem} onPress={onCommit}>
          <View style={[styles.actionCircle, { backgroundColor: commit.bg }]}>
            <Text style={styles.actionEmoji}>{commit.emoji}</Text>
          </View>
          <Text style={[styles.actionLabel, commitLevel !== "none" && { color: commit.color }]}>
            {commit.label}
          </Text>
        </Pressable>

        {/* Participants */}
        <Pressable
          style={styles.actionItem}
          onPress={() => router.push(`/wave/${wave.id}`)}
        >
          <View style={styles.actionCircle}>
            <Text style={styles.actionEmoji}>👥</Text>
          </View>
          <Text style={styles.actionLabel}>
            {wave.current_participants}
          </Text>
        </Pressable>

        {/* Share */}
        <Pressable style={styles.actionItem}>
          <View style={styles.actionCircle}>
            <Text style={styles.actionEmoji}>↗</Text>
          </View>
          <Text style={styles.actionLabel}>共有</Text>
        </Pressable>
      </View>

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        {/* Clip caption */}
        {clipCaption && (
          <Text style={styles.clipCaption}>「{clipCaption}」</Text>
        )}

        {/* Wave title */}
        <Text style={styles.waveTitle} numberOfLines={2}>
          {wave.title}
        </Text>

        {/* Meta chips */}
        <View style={styles.metaRow}>
          {wave.distance_km != null && (
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>📍 {wave.distance_km}km</Text>
            </View>
          )}
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>📅 {wave.date}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{wave.time_start}〜</Text>
          </View>
        </View>

        {/* Org info */}
        {org && (
          <View style={styles.orgRow}>
            <Text style={styles.orgName}>@{org.name}</Text>
            <TrustBadge rank={org.trust_rank} size="small" />
          </View>
        )}

        {/* Theme tags */}
        <View style={styles.themeRow}>
          <View style={styles.themeTag}>
            <Text style={styles.themeText}>#{wave.theme}</Text>
          </View>
          {wave.eco_impact_target.trees_planted > 0 && (
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>
                🌳{wave.eco_impact_target.trees_planted}本
              </Text>
            </View>
          )}
          {wave.eco_impact_target.meals_shared > 0 && (
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>
                🍽️{wave.eco_impact_target.meals_shared}食
              </Text>
            </View>
          )}
          {wave.eco_impact_target.water_collected_liters > 0 && (
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>
                💧{wave.eco_impact_target.water_collected_liters}L
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Scrolling marquee-style text at very bottom */}
      <View style={styles.marquee}>
        <Text style={styles.marqueeText} numberOfLines={1}>
          🌊 {wave.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  // Gradient overlays
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: "transparent",
    // Web-compatible gradient via layered shadows
    zIndex: 2,
    // @ts-ignore
    backgroundImage: "linear-gradient(transparent, rgba(0,0,0,0.8))",
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 2,
    // @ts-ignore
    backgroundImage: "linear-gradient(rgba(0,0,0,0.4), transparent)",
  },
  topBadge: {
    position: "absolute",
    top: 56,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    zIndex: 10,
    // @ts-ignore
    backdropFilter: "blur(8px)",
  },
  topBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  // Right side actions
  rightActions: {
    position: "absolute",
    right: 10,
    bottom: 160,
    alignItems: "center",
    gap: 18,
    zIndex: 10,
  },
  actionItem: {
    alignItems: "center",
    gap: 3,
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 4,
  },
  orgAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Bottom overlay
  bottomOverlay: {
    position: "absolute",
    bottom: 96,
    left: 14,
    right: 68,
    gap: 6,
    zIndex: 10,
  },
  clipCaption: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    fontWeight: "300",
    fontStyle: "italic",
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  waveTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  metaChip: {
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    // @ts-ignore
    backdropFilter: "blur(4px)",
  },
  metaText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 11,
    fontWeight: "500",
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orgName: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  themeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  themeTag: {
    backgroundColor: "rgba(255,255,255,0.13)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    // @ts-ignore
    backdropFilter: "blur(4px)",
  },
  themeText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 11,
    fontWeight: "600",
  },
  // Marquee description
  marquee: {
    position: "absolute",
    bottom: 72,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    zIndex: 10,
  },
  marqueeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "400",
  },
});
