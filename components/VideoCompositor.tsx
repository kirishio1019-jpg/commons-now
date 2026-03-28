// Cinematic scene from content-matched image
// Pure React Native components (no raw HTML divs)

import React, { useMemo, useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated, Easing, Platform } from "react-native";

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
  植樹:     { keywords: "planting trees forest nature", tint: "rgba(27,67,50,0.25)" },
  食:       { keywords: "cooking food kitchen community", tint: "rgba(120,53,15,0.2)" },
  物語:     { keywords: "campfire night storytelling", tint: "rgba(30,27,75,0.3)" },
  雨水収集: { keywords: "rain nature water green", tint: "rgba(12,53,71,0.25)" },
  音楽:     { keywords: "concert music guitar outdoor", tint: "rgba(59,7,100,0.2)" },
  ヨガ:     { keywords: "yoga sunrise peaceful outdoor", tint: "rgba(30,58,95,0.2)" },
  アート:   { keywords: "art painting creative colorful", tint: "rgba(74,25,66,0.2)" },
  対話:     { keywords: "people conversation cafe", tint: "rgba(26,26,46,0.2)" },
  DIY:      { keywords: "workshop tools woodworking", tint: "rgba(61,43,31,0.2)" },
  ハイキング:{ keywords: "hiking mountain trail nature", tint: "rgba(6,95,70,0.2)" },
  焚き火:   { keywords: "bonfire campfire flames night", tint: "rgba(124,45,18,0.25)" },
  農業:     { keywords: "farming harvest vegetables garden", tint: "rgba(22,101,52,0.2)" },
  瞑想:     { keywords: "meditation zen garden peaceful", tint: "rgba(15,23,42,0.3)" },
  星空:     { keywords: "starry sky night landscape", tint: "rgba(15,23,42,0.3)" },
  子どもと: { keywords: "children playing park outdoor", tint: "rgba(4,120,87,0.15)" },
};

function fnv(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function VideoCompositor({ waveId, theme, title, description, isActive, width, height }: Props) {
  const cfg = THEMES[theme] ?? THEMES["植樹"];
  const lock = fnv(waveId) % 100000;

  const titleWords = title.replace(/[—\-「」（）。、：]/g, " ").split(/\s+/).filter(w => w.length > 1).slice(0, 2).join(",");
  const kw = titleWords ? `${cfg.keywords},${titleWords}` : cfg.keywords;
  const imgUrl = `https://loremflickr.com/800/1400/${encodeURIComponent(kw)}?lock=${lock}`;

  // Animated values for Ken Burns
  const scaleAnim = useRef(new Animated.Value(1.0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) return;

    const zoom = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 12000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 12000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    const driftX = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: -15, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(translateX, { toValue: 15, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    const driftY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -10, duration: 10000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(translateY, { toValue: 10, duration: 10000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );

    zoom.start();
    driftX.start();
    driftY.start();

    return () => { zoom.stop(); driftX.stop(); driftY.stop(); };
  }, [isActive]);

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Content-matched image with Ken Burns animation */}
      <Animated.Image
        source={{ uri: imgUrl }}
        style={[styles.image, {
          width: width * 1.3,
          height: height * 1.3,
          transform: [
            { scale: scaleAnim },
            { translateX: translateX },
            { translateY: translateY },
          ],
        }]}
        resizeMode="cover"
      />

      {/* Theme tint overlay */}
      <View style={[styles.overlay, { backgroundColor: cfg.tint }]} />

      {/* Vignette */}
      {Platform.OS === "web" && (
        <View style={[styles.overlay, {
          // @ts-ignore
          backgroundImage: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.55) 100%)",
          backgroundColor: "transparent",
        }]} />
      )}
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
  image: {
    position: "absolute",
    top: "-15%",
    left: "-15%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
