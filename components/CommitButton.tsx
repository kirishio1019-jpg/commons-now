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
  { key: "going", label: "行く！", color: Colors.going, emoji: "🙌" },
];

const ORDER: CommitLevel[] = ["none", "curious", "maybe", "going"];

function getNextLevel(current: CommitLevel): CommitLevel {
  const idx = ORDER.indexOf(current);
  return idx < ORDER.length - 1 ? ORDER[idx + 1] : ORDER[0];
}

function getPrevLevel(current: CommitLevel): CommitLevel {
  const idx = ORDER.indexOf(current);
  return idx > 0 ? ORDER[idx - 1] : ORDER[ORDER.length - 1];
}

export function CommitButton({ level, onPress }: CommitButtonProps) {
  const currentIndex = ORDER.indexOf(level);

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {LEVELS.map((l, i) => {
          const isActive = i < currentIndex;
          const isCurrent = ORDER[currentIndex] === l.key;
          return (
            <View
              key={l.key}
              style={[
                styles.dot,
                {
                  backgroundColor: isActive || isCurrent ? l.color : Colors.border,
                  transform: [{ scale: isCurrent ? 1.3 : 1 }],
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.buttonRow}>
        {/* Down button */}
        {level !== "none" && (
          <Pressable
            style={styles.arrowButton}
            onPress={() => onPress(getPrevLevel(level))}
          >
            <Text style={styles.arrowText}>←</Text>
          </Pressable>
        )}

        {/* Main button */}
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor:
                level === "going"
                  ? Colors.going
                  : level === "none"
                    ? Colors.curious
                    : (LEVELS.find((l) => l.key === getNextLevel(level))?.color ?? Colors.curious),
            },
          ]}
          onPress={() => onPress(getNextLevel(level))}
        >
          <Text style={styles.buttonText}>
            {level === "none"
              ? "👀 気になる"
              : level === "going"
                ? "✅ 参加予定"
                : `${LEVELS.find((l) => l.key === getNextLevel(level))?.emoji} ${LEVELS.find((l) => l.key === getNextLevel(level))?.label}`}
          </Text>
        </Pressable>

        {/* Up button (when going, allow cycling to none) */}
        {level === "going" && (
          <Pressable
            style={styles.arrowButton}
            onPress={() => onPress("none")}
          >
            <Text style={styles.arrowText}>✕</Text>
          </Pressable>
        )}
      </View>

      {level !== "none" && (
        <Text style={styles.currentLabel}>
          {LEVELS.find((l) => l.key === level)?.emoji}{" "}
          {LEVELS.find((l) => l.key === level)?.label ?? "未設定"}
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
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "700",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
    minWidth: 180,
    alignItems: "center",
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
