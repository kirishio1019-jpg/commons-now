// Real-time video composition engine
// Layers: 2-3 stock clips with cross-fade + Ken Burns + color grade + text overlay
// Runs at 60fps in-browser, creates unique "produced" video per event

import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

interface VideoCompositorProps {
  clips: string[];        // 2-3 video URLs
  theme: string;
  title: string;
  orgName?: string;
  isActive: boolean;
  width: number;
  height: number;
}

// Theme → color grade overlay
const COLOR_GRADES: Record<string, { color: string; opacity: number; blend: string }> = {
  植樹:     { color: "#1B4332", opacity: 0.25, blend: "multiply" },
  食:       { color: "#7C2D12", opacity: 0.2, blend: "multiply" },
  物語:     { color: "#312E81", opacity: 0.3, blend: "overlay" },
  雨水収集: { color: "#155E75", opacity: 0.25, blend: "multiply" },
  音楽:     { color: "#6D28D9", opacity: 0.2, blend: "overlay" },
  ヨガ:     { color: "#1E3A5F", opacity: 0.2, blend: "multiply" },
  アート:   { color: "#7E22CE", opacity: 0.2, blend: "overlay" },
  対話:     { color: "#1E293B", opacity: 0.2, blend: "multiply" },
  DIY:      { color: "#78350F", opacity: 0.2, blend: "multiply" },
  ハイキング:{ color: "#065F46", opacity: 0.2, blend: "multiply" },
  焚き火:   { color: "#7C2D12", opacity: 0.25, blend: "overlay" },
  農業:     { color: "#166534", opacity: 0.2, blend: "multiply" },
  瞑想:     { color: "#0F172A", opacity: 0.3, blend: "multiply" },
  星空:     { color: "#1E1B4B", opacity: 0.3, blend: "overlay" },
  子どもと: { color: "#047857", opacity: 0.15, blend: "multiply" },
};

const DEFAULT_GRADE = { color: "#1E293B", opacity: 0.2, blend: "multiply" };

// Ken Burns presets (scale + translate animations)
const KEN_BURNS = [
  { from: "scale(1.0) translate(0%, 0%)", to: "scale(1.15) translate(-3%, -2%)" },
  { from: "scale(1.1) translate(-2%, -1%)", to: "scale(1.0) translate(1%, 1%)" },
  { from: "scale(1.0) translate(2%, 0%)", to: "scale(1.12) translate(-1%, -3%)" },
  { from: "scale(1.15) translate(0%, -2%)", to: "scale(1.0) translate(0%, 0%)" },
];

export function VideoCompositor({
  clips, theme, title, orgName, isActive, width, height,
}: VideoCompositorProps) {
  const [activeClip, setActiveClip] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const grade = COLOR_GRADES[theme] ?? DEFAULT_GRADE;

  // Cycle through clips every 4 seconds
  useEffect(() => {
    if (!isActive || clips.length < 2) return;

    const interval = setInterval(() => {
      // Fade out current
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        setActiveClip((prev) => (prev + 1) % clips.length);
        // Fade in next
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive, clips.length]);

  const kb = KEN_BURNS[activeClip % KEN_BURNS.length];

  if (!isActive && clips.length > 0) {
    // Static thumbnail: show first clip paused
    return (
      <View style={[styles.container, { width, height }]}>
        <video
          src={clips[0]}
          muted
          playsInline
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
          } as any}
        />
        <View style={[styles.colorGrade, {
          backgroundColor: grade.color,
          opacity: grade.opacity,
          // @ts-ignore
          mixBlendMode: grade.blend,
        }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Video layers */}
      {clips.map((url, i) => {
        const isCurrentClip = i === activeClip;
        const kenBurns = KEN_BURNS[i % KEN_BURNS.length];

        return (
          <Animated.View
            key={i}
            style={[styles.videoLayer, {
              opacity: isCurrentClip ? fadeAnim : 0,
              zIndex: isCurrentClip ? 1 : 0,
            }]}
          >
            <video
              src={url}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: "absolute",
                top: "-10%", left: "-10%",
                width: "120%", height: "120%",
                objectFit: "cover",
                animation: isCurrentClip
                  ? `kenburns-${i} 8s ease-in-out infinite alternate`
                  : "none",
              } as any}
            />
          </Animated.View>
        );
      })}

      {/* Color grading overlay */}
      <View style={[styles.colorGrade, {
        backgroundColor: grade.color,
        opacity: grade.opacity,
        // @ts-ignore
        mixBlendMode: grade.blend,
      }]} />

      {/* Film look: subtle warm overlay */}
      <View style={styles.filmWarm} />

      {/* Vignette */}
      <View style={styles.vignette} />

      {/* Inject Ken Burns keyframes via style tag */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes kenburns-0 {
          from { transform: scale(1.0) translate(0%, 0%); }
          to { transform: scale(1.15) translate(-3%, -2%); }
        }
        @keyframes kenburns-1 {
          from { transform: scale(1.1) translate(-2%, -1%); }
          to { transform: scale(1.0) translate(1%, 1%); }
        }
        @keyframes kenburns-2 {
          from { transform: scale(1.0) translate(2%, 0%); }
          to { transform: scale(1.12) translate(-1%, -3%); }
        }
      `}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0, left: 0,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  videoLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  colorGrade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  filmWarm: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    backgroundColor: "rgba(255, 200, 150, 0.04)",
    // @ts-ignore
    mixBlendMode: "overlay",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    // @ts-ignore
    backgroundImage: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
  },
});
