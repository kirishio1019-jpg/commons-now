import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CommitLevel } from "../types";
import { Colors } from "../lib/colors";

interface CommitButtonProps {
  level: CommitLevel;
  onPress: (nextLevel: CommitLevel) => void;
}

const LEVELS: { key: CommitLevel; label: string; color: string }[] = [
  { key: "curious", label: "興味あり", color: Colors.curious },
  { key: "maybe", label: "検討中", color: Colors.maybe },
  { key: "going", label: "参加する", color: Colors.going },
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
      {/* Progress */}
      <View style={styles.progressRow}>
        {LEVELS.map((l, i) => {
          const isActive = i < currentIndex;
          const isCurrent = ORDER[currentIndex] === l.key;
          return (
            <View
              key={l.key}
              style={[
                styles.dot,
                { backgroundColor: isActive || isCurrent ? l.color : Colors.border },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.buttonRow}>
        {level !== "none" && (
          <Pressable style={styles.arrowButton} onPress={() => onPress(getPrevLevel(level))}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
        )}

        <Pressable
          style={[
            styles.button,
            {
              backgroundColor:
                level === "going"
                  ? Colors.going
                  : level === "none"
                    ? Colors.primary
                    : (LEVELS.find((l) => l.key === getNextLevel(level))?.color ?? Colors.primary),
            },
          ]}
          onPress={() => onPress(getNextLevel(level))}
        >
          <Text style={styles.buttonText}>
            {level === "none"
              ? "興味あり"
              : level === "going"
                ? "参加予定"
                : LEVELS.find((l) => l.key === getNextLevel(level))?.label ?? "次へ"}
          </Text>
        </Pressable>

        {level === "going" && (
          <Pressable style={styles.arrowButton} onPress={() => onPress("none")}>
            <Text style={styles.arrowText}>×</Text>
          </Pressable>
        )}
      </View>

      {level !== "none" && (
        <Text style={styles.currentLabel}>
          {LEVELS.find((l) => l.key === level)?.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 8 },
  progressRow: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  arrowButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.border, justifyContent: "center", alignItems: "center",
  },
  arrowText: { fontSize: 18, color: Colors.textSecondary, fontWeight: "400" },
  button: {
    paddingVertical: 14, paddingHorizontal: 36, borderRadius: 8, minWidth: 160, alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },
  currentLabel: { fontSize: 12, color: Colors.textSecondary },
});
