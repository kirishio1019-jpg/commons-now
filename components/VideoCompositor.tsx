// Simple themed background for feed items
// If wave has image_url (user-uploaded), show that. Otherwise themed gradient.

import React from "react";
import { View, Image, StyleSheet } from "react-native";

interface Props {
  waveId: string;
  theme: string;
  title: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  width: number;
  height: number;
}

const THEME_COLORS: Record<string, [string, string]> = {
  植樹:     ["#0E2D18", "#1B4332"],
  食:       ["#4A1A0A", "#7C2D12"],
  物語:     ["#1E1B4B", "#3730A3"],
  雨水収集: ["#0C3547", "#155E75"],
  音楽:     ["#3B0764", "#7C3AED"],
  ヨガ:     ["#1E3A5F", "#3B6EA5"],
  アート:   ["#4A1942", "#9333EA"],
  対話:     ["#1A1A3E", "#4040A0"],
  DIY:      ["#3D2B1F", "#78350F"],
  ハイキング:["#1B4332", "#2D6A4F"],
  焚き火:   ["#3C1106", "#7C2D12"],
  農業:     ["#1B3A1B", "#3D7A3D"],
  瞑想:     ["#0D1B2A", "#1E3A5F"],
  星空:     ["#0F172A", "#1E293B"],
  子どもと: ["#1B4332", "#40916C"],
};

export function VideoCompositor({ theme, imageUrl, width, height }: Props) {
  const colors = THEME_COLORS[theme] ?? ["#1A1A2E", "#2D2D5E"];

  if (imageUrl) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.15)" }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height, backgroundColor: colors[0] }]}>
      <View style={[StyleSheet.absoluteFill, {
        backgroundColor: colors[1],
        opacity: 0.6,
        borderRadius: 999,
        // @ts-ignore
        transform: [{ scale: 1.5 }],
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
    backgroundColor: "#000",
  },
});
