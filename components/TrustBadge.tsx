import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrustRank } from "../types";
import { Colors } from "../lib/colors";

interface TrustBadgeProps {
  rank: TrustRank;
  score?: number;
  size?: "small" | "medium" | "large";
}

const RANK_CONFIG: Record<TrustRank, { label: string; color: string; letter: string }> = {
  bronze: { label: "Bronze", color: Colors.bronze, letter: "B" },
  silver: { label: "Silver", color: Colors.silver, letter: "S" },
  gold: { label: "Gold", color: Colors.gold, letter: "G" },
  platinum: { label: "Platinum", color: "#8B5CF6", letter: "P" },
};

export function TrustBadge({ rank, score, size = "small" }: TrustBadgeProps) {
  const config = RANK_CONFIG[rank];
  const fontSize = size === "small" ? 10 : size === "medium" ? 12 : 14;

  return (
    <View style={[styles.badge, { borderColor: config.color + "60" }]}>
      <View style={[styles.letterWrap, { backgroundColor: config.color + "20" }]}>
        <Text style={[styles.letter, { fontSize: fontSize - 1, color: config.color }]}>
          {config.letter}
        </Text>
      </View>
      {size !== "small" && (
        <Text style={[styles.label, { fontSize, color: config.color }]}>
          {config.label}
          {score !== undefined && ` ${score}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  letterWrap: { width: 16, height: 16, borderRadius: 3, justifyContent: "center", alignItems: "center" },
  letter: { fontWeight: "800" },
  label: { fontWeight: "600" },
});
