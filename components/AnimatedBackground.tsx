import React, { useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, Animated, Platform, Dimensions, Easing } from "react-native";

const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;
const H = Platform.OS === "web" ? 844 : Dimensions.get("window").height;

interface AnimatedBackgroundProps {
  theme: string;
  isActive: boolean;
  description?: string;
  title?: string;
}

const PALETTES: Record<string, string[]> = {
  植樹:     ["#071A0F", "#0E2D18", "#1B4332"],
  食:       ["#2A0E05", "#4A1A0A", "#7C2D12"],
  物語:     ["#0F0E24", "#1E1B4B", "#3730A3"],
  雨水収集: ["#061B26", "#0C3547", "#155E75"],
  音楽:     ["#1A0529", "#3B0764", "#7C3AED"],
  ヨガ:     ["#0C1929", "#1E3A5F", "#3B6EA5"],
  アート:   ["#1F0A2E", "#4A1942", "#9333EA"],
  対話:     ["#0E0E24", "#1A1A3E", "#4040A0"],
  DIY:      ["#1A1008", "#3D2B1F", "#78350F"],
  ハイキング:["#071A0F", "#1B4332", "#2D6A4F"],
  焚き火:   ["#1A0A02", "#3C1106", "#7C2D12"],
  農業:     ["#0A1A0A", "#1B3A1B", "#3D7A3D"],
  瞑想:     ["#060D17", "#0D1B2A", "#1E3A5F"],
  星空:     ["#030712", "#0F172A", "#1E293B"],
  子どもと: ["#0F1A12", "#1B4332", "#40916C"],
};

const DEFAULT_PALETTE = ["#0A0A14", "#141428", "#1E1E3C"];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface Particle {
  startX: number;
  size: number;
  color: string;
  opacity: number;
  delay: number;
  duration: number;
  animY: Animated.Value;
  animOpacity: Animated.Value;
}

export function AnimatedBackground({ theme, isActive, description, title }: AnimatedBackgroundProps) {
  const palette = PALETTES[theme] ?? DEFAULT_PALETTE;
  const seed = hashStr((title || "") + (description || "") + theme);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(-W)).current;

  // Generate particles deterministically
  const particles = useMemo(() => {
    let rng = seed;
    const next = () => { rng = (rng * 16807) % 2147483647; return rng / 2147483647; };

    const count = 8 + Math.floor(next() * 6);
    const result: Particle[] = [];
    for (let i = 0; i < count; i++) {
      result.push({
        startX: next() * W,
        size: 3 + next() * 5,
        color: palette[1 + Math.floor(next() * 2)],
        opacity: 0.1 + next() * 0.2,
        delay: i * 500 + next() * 1000,
        duration: 4000 + next() * 4000,
        animY: new Animated.Value(H + 10),
        animOpacity: new Animated.Value(0),
      });
    }
    return result;
  }, [seed]);

  useEffect(() => {
    if (!isActive) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    pulse.start();

    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, { toValue: W * 1.5, duration: 8000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(sweepAnim, { toValue: -W, duration: 0, useNativeDriver: true }),
      ])
    );
    sweep.start();

    const particleAnims = particles.map((p) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.parallel([
            Animated.timing(p.animY, { toValue: -10, duration: p.duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(p.animOpacity, { toValue: p.opacity, duration: p.duration * 0.2, useNativeDriver: true }),
              Animated.timing(p.animOpacity, { toValue: p.opacity, duration: p.duration * 0.5, useNativeDriver: true }),
              Animated.timing(p.animOpacity, { toValue: 0, duration: p.duration * 0.3, useNativeDriver: true }),
            ]),
          ]),
          Animated.timing(p.animY, { toValue: H + 10, duration: 0, useNativeDriver: true }),
        ])
      );
    });
    particleAnims.forEach((a) => a.start());

    return () => {
      pulse.stop();
      sweep.stop();
      particleAnims.forEach((a) => a.stop());
    };
  }, [isActive]);

  const bgColor = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: palette,
  });

  if (!isActive) {
    return <View style={[styles.container, { backgroundColor: palette[1] }]} />;
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Light sweep */}
      <Animated.View style={[styles.sweep, { transform: [{ translateX: sweepAnim }] }]} />

      {/* Rising particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: p.startX,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: p.color,
            opacity: p.animOpacity,
            transform: [{ translateY: p.animY }],
          }}
        />
      ))}

      {/* Vignette via CSS gradient (web) */}
      <View style={styles.vignette} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  sweep: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: W * 0.4,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    // @ts-ignore
    backgroundImage: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
  },
});
