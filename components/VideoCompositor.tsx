import React from "react";
import { View, Image, StyleSheet } from "react-native";

interface Props {
  waveId: string;
  theme: string;
  title: string;
  description: string;
  isActive: boolean;
  width: number;
  height: number;
}

const THEMES: Record<string, { keywords: string; tint: string }> = {
  植樹:     { keywords: "forest,trees,nature", tint: "rgba(27,67,50,0.25)" },
  食:       { keywords: "cooking,food,kitchen", tint: "rgba(120,53,15,0.2)" },
  物語:     { keywords: "campfire,night,story", tint: "rgba(30,27,75,0.3)" },
  雨水収集: { keywords: "rain,water,nature", tint: "rgba(12,53,71,0.25)" },
  音楽:     { keywords: "concert,music,guitar", tint: "rgba(59,7,100,0.2)" },
  ヨガ:     { keywords: "yoga,sunrise,peaceful", tint: "rgba(30,58,95,0.2)" },
  アート:   { keywords: "art,painting,colorful", tint: "rgba(74,25,66,0.2)" },
  対話:     { keywords: "people,cafe,conversation", tint: "rgba(26,26,46,0.2)" },
  DIY:      { keywords: "workshop,tools,woodwork", tint: "rgba(61,43,31,0.2)" },
  ハイキング:{ keywords: "hiking,mountain,trail", tint: "rgba(6,95,70,0.2)" },
  焚き火:   { keywords: "bonfire,campfire,flames", tint: "rgba(124,45,18,0.25)" },
  農業:     { keywords: "farming,harvest,garden", tint: "rgba(22,101,52,0.2)" },
  瞑想:     { keywords: "meditation,zen,peaceful", tint: "rgba(15,23,42,0.3)" },
  星空:     { keywords: "stars,night,sky", tint: "rgba(15,23,42,0.3)" },
  子どもと: { keywords: "children,park,playing", tint: "rgba(4,120,87,0.15)" },
};

function fnv(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function VideoCompositor({ waveId, theme, title }: Props) {
  const cfg = THEMES[theme] ?? THEMES["植樹"];
  const seed = `${cfg.keywords}-${fnv(waveId)}`;
  const imgUrl = `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/1400`;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={{ uri: imgUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: cfg.tint }]} />
    </View>
  );
}
