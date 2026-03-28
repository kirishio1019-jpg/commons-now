import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrustRank } from "../types";
import { Colors } from "../lib/colors";

interface TrustBadgeProps {
  rank: TrustRank;
  score?: number;
  size?: "small" | "medium" | "large";
}

const RANK_CONFIG: Record<TrustRank, { label: string; color: string; icon: string }> = {
  bronze: { label: "Bronze", color: Colors.bronze, icon: "🥉" },
  silver: { label: "Silver", color: Colors.silver, icon: "🥈" },
  gold: { label: "Gold", color: Colors.gold, icon: "🥇" },
  platinum: { label: "Platinum", color: "#8B5CF6", icon: "💎" },
};

export function TrustBadge({ rank, score, size = "small" }: TrustBadgeProps) {
  const config = RANK_CONFIG[rank];
  const fontSize = size === "small" ? 11 : size === "medium" ? 13 : 15;

  return (
    <View style={[styles.badge, { borderColor: config.color }]}>
      <Text style={{ fontSize: fontSize - 2 }}>{config.icon}</Text>
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontWeight: "600",
  },
});
