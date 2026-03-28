import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { Wave } from "../types";
import { getOrgForWave } from "../data/mock";
import { Colors } from "../lib/colors";
import { TrustBadge } from "./TrustBadge";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface WaveCardProps {
  wave: Wave;
  clipCaption?: string;
}

// Placeholder gradient backgrounds for waves without images
const THEME_COLORS: Record<string, string[]> = {
  植樹: ["#1B4332", "#2D6A4F"],
  食: ["#7C2D12", "#B45309"],
  物語: ["#312E81", "#4338CA"],
  雨水収集: ["#164E63", "#0E7490"],
};

export function WaveCard({ wave, clipCaption }: WaveCardProps) {
  const org = getOrgForWave(wave);
  const colors = THEME_COLORS[wave.theme] ?? ["#374151", "#6B7280"];

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/wave/${wave.id}`)}
    >
      <View style={[styles.background, { backgroundColor: colors[0] }]}>
        {/* Content overlay */}
        <View style={styles.overlay}>
          {/* Top: personalized label */}
          {wave.is_personalized && (
            <View style={styles.personalizedBadge}>
              <Text style={styles.personalizedText}>あなた向け</Text>
            </View>
          )}

          {/* Center: clip caption */}
          {clipCaption && (
            <View style={styles.captionContainer}>
              <Text style={styles.captionText}>「{clipCaption}」</Text>
            </View>
          )}

          {/* Bottom: wave info */}
          <View style={styles.infoContainer}>
            <Text style={styles.theme}>{wave.theme}</Text>
            <Text style={styles.title}>{wave.title}</Text>

            <View style={styles.metaRow}>
              {wave.distance_km && (
                <Text style={styles.meta}>📍 {wave.distance_km}km先</Text>
              )}
              <Text style={styles.meta}>
                📅 {wave.date} {wave.time_start}〜
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.meta}>
                👥 {wave.current_participants}/{wave.capacity}人
              </Text>
              {org && (
                <View style={styles.orgRow}>
                  <Text style={styles.orgName}>{org.name}</Text>
                  <TrustBadge rank={org.trust_rank} size="small" />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT - 180,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  personalizedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  personalizedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  captionContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  captionText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 30,
  },
  infoContainer: {
    gap: 6,
  },
  theme: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  meta: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orgName: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
});
