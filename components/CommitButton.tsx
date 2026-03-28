import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CommitLevel } from "../types";
import { Colors } from "../lib/colors";

interface CommitButtonProps {
  level: CommitLevel;
  onPress: (nextLevel: CommitLevel) => void;
}

const LEVELS: { key: CommitLevel; label: string; color: string; emoji: string }[] = [
  { key: "curious", label: "気になる", color: Colors.curious, emoji: "👀" },
  { key: "maybe", label: "たぶん行く", color: Colors.maybe, emoji: "🤔" },
  { key: "going", label: "行く", color: Colors.going, emoji: "🙌" },
];

function getNextLevel(current: CommitLevel): CommitLevel {
  if (current === "none") return "curious";
  if (current === "curious") return "maybe";
  if (current === "maybe") return "going";
  return "going"; // already at max
}

export function CommitButton({ level, onPress }: CommitButtonProps) {
  const nextLevel = getNextLevel(level);
  const nextConfig = LEVELS.find((l) => l.key === nextLevel)!;

  if (level === "going") {
    return (
      <View style={[styles.button, styles.buttonDone, { backgroundColor: Colors.going }]}>
        <Text style={styles.buttonText}>🙌 参加予定です</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressRow}>
        {LEVELS.map((l, i) => {
          const levelIndex = LEVELS.findIndex((x) => x.key === level);
          const isActive = i <= levelIndex;
          return (
            <View
              key={l.key}
              style={[
                styles.dot,
                { backgroundColor: isActive ? l.color : Colors.border },
              ]}
            />
          );
        })}
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: nextConfig.color }]}
        onPress={() => onPress(nextLevel)}
      >
        <Text style={styles.buttonText}>
          {nextConfig.emoji} {nextConfig.label}
        </Text>
      </Pressable>

      {level !== "none" && (
        <Text style={styles.currentLabel}>
          現在: {LEVELS.find((l) => l.key === level)?.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
    minWidth: 200,
    alignItems: "center",
  },
  buttonDone: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  currentLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
