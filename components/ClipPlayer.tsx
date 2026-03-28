import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Clip } from "../types";
import { Colors } from "../lib/colors";

interface ClipPlayerProps {
  clip: Clip;
  onPress?: () => void;
}

export function ClipPlayer({ clip, onPress }: ClipPlayerProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Placeholder for video thumbnail */}
      <View style={styles.thumbnail}>
        <Text style={styles.playIcon}>▶</Text>
        <Text style={styles.duration}>{clip.duration_sec}秒</Text>
      </View>
      <Text style={styles.caption} numberOfLines={2}>
        「{clip.caption}」
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 12,
  },
  thumbnail: {
    width: 140,
    height: 200,
    backgroundColor: Colors.bgDark,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    color: "#fff",
    fontSize: 28,
    opacity: 0.8,
  },
  duration: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 4,
  },
  caption: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
});
