import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Wave, CommitLevel } from "../types";
import { getOrgForWave } from "../data/mock";
import { Colors } from "../lib/colors";
import { AnimatedBackground } from "./AnimatedBackground";
import { TrustBadge } from "./TrustBadge";

// On web, use phone frame size; on native, use actual screen
const PHONE_W = 390;
const PHONE_H = 844;

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
  { label: string; emoji: string; color: string }
> = {
  none: { label: "気になる", emoji: "👀", color: Colors.curious },
  curious: { label: "たぶん行く", emoji: "🤔", color: Colors.maybe },
  maybe: { label: "行く！", emoji: "🙌", color: Colors.going },
  going: { label: "参加予定", emoji: "✅", color: Colors.going },
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
      {/* Animated background (acts as video) */}
      <AnimatedBackground theme={wave.theme} isActive={isActive} />

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
            <Text style={styles.actionLabel} numberOfLines={1}>
              {org.name}
            </Text>
          </Pressable>
        )}

        {/* Commit button */}
        <Pressable style={styles.actionItem} onPress={onCommit}>
          <View style={[styles.actionCircle, { backgroundColor: commit.color + "30" }]}>
            <Text style={styles.actionEmoji}>{commit.emoji}</Text>
          </View>
          <Text style={styles.actionLabel}>{commit.label}</Text>
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
            {wave.current_participants}人
          </Text>
        </Pressable>

        {/* Share / Clip */}
        <Pressable style={styles.actionItem}>
          <View style={styles.actionCircle}>
            <Text style={styles.actionEmoji}>🎬</Text>
          </View>
          <Text style={styles.actionLabel}>クリップ</Text>
        </Pressable>
      </View>

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        {/* Caption from clip */}
        {clipCaption && (
          <Text style={styles.clipCaption}>「{clipCaption}」</Text>
        )}

        {/* Wave info */}
        <Text style={styles.waveTitle}>{wave.title}</Text>

        <View style={styles.metaRow}>
          {wave.distance_km && (
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>📍 {wave.distance_km}km先</Text>
            </View>
          )}
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>📅 {wave.date}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>
              🕐 {wave.time_start}〜
            </Text>
          </View>
        </View>

        {/* Org info */}
        {org && (
          <View style={styles.orgRow}>
            <Text style={styles.orgName}>主催: {org.name}</Text>
            <TrustBadge rank={org.trust_rank} size="small" />
          </View>
        )}

        {/* Theme tag */}
        <View style={styles.themeRow}>
          <View style={styles.themeTag}>
            <Text style={styles.themeText}>#{wave.theme}</Text>
          </View>
          {wave.eco_impact_target.trees_planted > 0 && (
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>
                🌳 {wave.eco_impact_target.trees_planted}本
              </Text>
            </View>
          )}
          {wave.eco_impact_target.meals_shared > 0 && (
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>
                🍽️ {wave.eco_impact_target.meals_shared}食
              </Text>
            </View>
          )}
          {wave.eco_impact_target.water_collected_liters > 0 && (
            <View style={styles.themeTag}>
              <Text style={styles.themeText}>
                💧 {wave.eco_impact_target.water_collected_liters}L
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress bar (video timer simulation) */}
      {isActive && <View style={styles.progressBar}><View style={styles.progressFill} /></View>}
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
  topBadge: {
    position: "absolute",
    top: 60,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  topBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  // Right side actions
  rightActions: {
    position: "absolute",
    right: 12,
    bottom: 180,
    alignItems: "center",
    gap: 20,
    zIndex: 10,
  },
  actionItem: {
    alignItems: "center",
    gap: 4,
  },
  orgAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  orgAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: 60,
    textAlign: "center",
  },
  // Bottom overlay
  bottomOverlay: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 80,
    gap: 8,
    zIndex: 10,
  },
  clipCaption: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    lineHeight: 26,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  waveTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaChip: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "500",
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orgName: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  themeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  themeTag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  themeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
  },
  progressBar: {
    position: "absolute",
    bottom: 84,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    zIndex: 10,
  },
  progressFill: {
    height: 2,
    width: "60%",
    backgroundColor: "#fff",
    borderRadius: 1,
  },
});
