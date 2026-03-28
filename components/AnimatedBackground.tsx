import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Platform, Dimensions, Easing } from "react-native";

const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;
const H = Platform.OS === "web" ? 844 : Dimensions.get("window").height;

interface AnimatedBackgroundProps {
  theme: string;
  isActive: boolean;
  description?: string;
  title?: string;
}

// --- Scene generation engine ---

interface SceneConfig {
  palette: string[];        // 5 colors: bg dark, bg mid, bg light, accent1, accent2
  shapes: ShapeConfig[];    // Geometric shapes to render
  atmosphere: "warm" | "cool" | "neutral" | "mystical" | "energetic";
  lightAngle: number;       // 0-360 degrees
  depth: number;            // 1-5 layer count
  motion: "slow" | "medium" | "fast";
}

interface ShapeConfig {
  type: "circle" | "line" | "rect" | "wave" | "dot";
  layer: number;     // 0=back, 4=front
  x: number;         // 0-1 relative
  y: number;
  size: number;
  color: string;
  opacity: number;
}

const THEME_PALETTES: Record<string, string[]> = {
  植樹:     ["#071A0F", "#0E2D18", "#1B4332", "#40916C", "#74C69D"],
  食:       ["#2A0E05", "#4A1A0A", "#7C2D12", "#D97706", "#FCD34D"],
  物語:     ["#0F0E24", "#1E1B4B", "#3730A3", "#7C3AED", "#C4B5FD"],
  雨水収集: ["#061B26", "#0C3547", "#155E75", "#06B6D4", "#67E8F9"],
  音楽:     ["#1A0529", "#3B0764", "#7C3AED", "#A78BFA", "#E9D5FF"],
  ヨガ:     ["#0C1929", "#1E3A5F", "#3B6EA5", "#93C5FD", "#DBEAFE"],
  アート:   ["#1F0A2E", "#4A1942", "#9333EA", "#F472B6", "#FBCFE8"],
  対話:     ["#0E0E24", "#1A1A3E", "#4040A0", "#60A5FA", "#BFDBFE"],
  DIY:      ["#1A1008", "#3D2B1F", "#78350F", "#D97706", "#FDE68A"],
  ハイキング:["#071A0F", "#1B4332", "#2D6A4F", "#6EE7B7", "#D1FAE5"],
  焚き火:   ["#1A0A02", "#3C1106", "#7C2D12", "#EA580C", "#FED7AA"],
  農業:     ["#0A1A0A", "#1B3A1B", "#3D7A3D", "#86EFAC", "#F0FDF4"],
  瞑想:     ["#060D17", "#0D1B2A", "#1E3A5F", "#475569", "#94A3B8"],
  星空:     ["#030712", "#0F172A", "#1E293B", "#6366F1", "#E0E7FF"],
  子どもと: ["#0F1A12", "#1B4332", "#40916C", "#34D399", "#A7F3D0"],
};

const DEFAULT_PALETTE = ["#0A0A14", "#141428", "#1E1E3C", "#4F46E5", "#A5B4FC"];

// Keywords that affect the scene
const KEYWORD_ATMOSPHERE: Record<string, { atmosphere: SceneConfig["atmosphere"]; accentOverride?: string }> = {
  "朝": { atmosphere: "warm", accentOverride: "#FCD34D" },
  "夜": { atmosphere: "mystical", accentOverride: "#6366F1" },
  "森": { atmosphere: "cool", accentOverride: "#34D399" },
  "海": { atmosphere: "cool", accentOverride: "#06B6D4" },
  "山": { atmosphere: "neutral", accentOverride: "#6EE7B7" },
  "火": { atmosphere: "warm", accentOverride: "#EA580C" },
  "水": { atmosphere: "cool", accentOverride: "#38BDF8" },
  "風": { atmosphere: "cool", accentOverride: "#94A3B8" },
  "雨": { atmosphere: "cool", accentOverride: "#67E8F9" },
  "春": { atmosphere: "warm", accentOverride: "#F9A8D4" },
  "夏": { atmosphere: "energetic", accentOverride: "#FBBF24" },
  "秋": { atmosphere: "warm", accentOverride: "#D97706" },
  "冬": { atmosphere: "cool", accentOverride: "#CBD5E1" },
  "静": { atmosphere: "neutral" },
  "祭": { atmosphere: "energetic", accentOverride: "#F43F5E" },
  "音": { atmosphere: "mystical", accentOverride: "#A78BFA" },
  "光": { atmosphere: "warm", accentOverride: "#FDE68A" },
  "土": { atmosphere: "warm", accentOverride: "#A16207" },
  "花": { atmosphere: "warm", accentOverride: "#EC4899" },
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateScene(theme: string, title: string = "", description: string = ""): SceneConfig {
  const text = title + description;
  const seed = hashString(text || theme);
  const rand = seededRandom(seed);

  const palette = [...(THEME_PALETTES[theme] ?? DEFAULT_PALETTE)];

  // Detect atmosphere from keywords
  let atmosphere: SceneConfig["atmosphere"] = "neutral";
  for (const [keyword, config] of Object.entries(KEYWORD_ATMOSPHERE)) {
    if (text.includes(keyword)) {
      atmosphere = config.atmosphere;
      if (config.accentOverride) {
        palette[3] = config.accentOverride;
      }
      break;
    }
  }

  const depth = 3 + Math.floor(rand() * 3);
  const motion = atmosphere === "energetic" ? "fast" : atmosphere === "neutral" || atmosphere === "mystical" ? "slow" : "medium";
  const lightAngle = rand() * 360;

  // Generate shapes deterministically from content
  const shapeCount = 8 + Math.floor(rand() * 12);
  const shapes: ShapeConfig[] = [];

  for (let i = 0; i < shapeCount; i++) {
    const layer = Math.floor(rand() * depth);
    const types: ShapeConfig["type"][] = ["circle", "line", "rect", "wave", "dot"];
    const type = types[Math.floor(rand() * types.length)];
    const colorIdx = 2 + Math.floor(rand() * 3); // use lighter colors

    shapes.push({
      type,
      layer,
      x: rand(),
      y: rand(),
      size: 20 + rand() * 180,
      color: palette[Math.min(colorIdx, palette.length - 1)],
      opacity: 0.03 + rand() * 0.12,
    });
  }

  return { palette, shapes, atmosphere, lightAngle, depth, motion };
}

// --- Animated layer components ---

function LightOrb({
  x, y, size, color, opacity, delay, duration,
}: {
  x: number; y: number; size: number; color: string;
  opacity: number; delay: number; duration: number;
}) {
  const animX = useRef(new Animated.Value(x * W)).current;
  const animY = useRef(new Animated.Value(y * H)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const fadeIn = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: opacity,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
        Animated.timing(animScale, {
          toValue: 1,
          duration: duration * 0.3,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    const drift = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(animX, {
            toValue: x * W + (Math.random() - 0.5) * 60,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animY, {
            toValue: y * H + (Math.random() - 0.5) * 40,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(animOpacity, {
              toValue: opacity * 1.3,
              duration: duration * 0.5,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(animOpacity, {
              toValue: opacity * 0.6,
              duration: duration * 0.5,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(animX, {
            toValue: x * W,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animY, {
            toValue: y * H,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    fadeIn.start(() => drift.start());

    return () => {
      fadeIn.stop();
      drift.stop();
    };
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: animOpacity,
        transform: [
          { translateX: Animated.subtract(animX, new Animated.Value(size / 2)) },
          { translateY: Animated.subtract(animY, new Animated.Value(size / 2)) },
          { scale: animScale },
        ],
        // @ts-ignore web blur
        filter: `blur(${Math.round(size * 0.4)}px)`,
      }}
    />
  );
}

function FloatingLine({
  x, y, length, angle, color, opacity, delay, duration,
}: {
  x: number; y: number; length: number; angle: number;
  color: string; opacity: number; delay: number; duration: number;
}) {
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animX = useRef(new Animated.Value(x * W)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animOpacity, {
        toValue: opacity,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]);

    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(animX, {
          toValue: x * W + 30,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animX, {
          toValue: x * W - 30,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    anim.start(() => drift.start());
    return () => { anim.stop(); drift.stop(); };
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: length,
        height: 1,
        backgroundColor: color,
        opacity: animOpacity,
        top: y * H,
        transform: [
          { translateX: animX },
          { rotate: `${angle}deg` },
        ],
      }}
    />
  );
}

function RisingParticle({
  startX, size, color, opacity, delay, duration,
}: {
  startX: number; size: number; color: string;
  opacity: number; delay: number; duration: number;
}) {
  const animY = useRef(new Animated.Value(H + 20)).current;
  const animX = useRef(new Animated.Value(startX)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animY, {
            toValue: -size,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animX, {
            toValue: startX + (Math.random() - 0.5) * 100,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(animOpacity, {
              toValue: opacity,
              duration: duration * 0.15,
              useNativeDriver: true,
            }),
            Animated.timing(animOpacity, {
              toValue: opacity,
              duration: duration * 0.55,
              useNativeDriver: true,
            }),
            Animated.timing(animOpacity, {
              toValue: 0,
              duration: duration * 0.3,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(animY, { toValue: H + 20, duration: 0, useNativeDriver: true }),
        Animated.timing(animX, { toValue: startX, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: animOpacity,
        transform: [{ translateX: animX }, { translateY: animY }],
      }}
    />
  );
}

// --- Main component ---

export function AnimatedBackground({ theme, isActive, description, title }: AnimatedBackgroundProps) {
  const scene = useMemo(
    () => generateScene(theme, title, description),
    [theme, title, description]
  );

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(-W * 0.5)).current;

  useEffect(() => {
    if (!isActive) return;

    const speed = scene.motion === "fast" ? 3000 : scene.motion === "slow" ? 6000 : 4500;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    pulse.start();

    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, { toValue: W * 1.5, duration: 8000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.delay(3000),
        Animated.timing(sweepAnim, { toValue: -W * 0.5, duration: 0, useNativeDriver: true }),
      ])
    );
    sweep.start();

    return () => { pulse.stop(); sweep.stop(); };
  }, [isActive]);

  const bgColor = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [scene.palette[0], scene.palette[1], scene.palette[2]],
  });

  if (!isActive) {
    return <View style={[styles.container, { backgroundColor: scene.palette[1] }]} />;
  }

  // Separate shapes by type for rendering
  const orbs = scene.shapes.filter((s) => s.type === "circle" || s.type === "dot");
  const lines = scene.shapes.filter((s) => s.type === "line" || s.type === "wave");
  const particles = scene.shapes.filter((s) => s.type === "rect");

  const motionMultiplier = scene.motion === "fast" ? 0.6 : scene.motion === "slow" ? 1.8 : 1;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Light sweep */}
      <Animated.View
        style={[styles.sweep, {
          transform: [{ translateX: sweepAnim }, { rotate: `${scene.lightAngle % 30 - 15}deg` }],
          backgroundColor: scene.palette[3] + "06",
        }]}
      />

      {/* Orbs - soft glowing circles */}
      {orbs.map((shape, i) => (
        <LightOrb
          key={`orb-${i}`}
          x={shape.x}
          y={shape.y}
          size={shape.type === "dot" ? shape.size * 0.3 : shape.size}
          color={shape.color}
          opacity={shape.opacity}
          delay={i * 400}
          duration={(4000 + i * 800) * motionMultiplier}
        />
      ))}

      {/* Lines - thin floating lines */}
      {lines.map((shape, i) => (
        <FloatingLine
          key={`line-${i}`}
          x={shape.x}
          y={shape.y}
          length={shape.size * 0.8}
          angle={scene.lightAngle + i * 30}
          color={shape.color}
          opacity={shape.opacity * 0.7}
          delay={i * 600}
          duration={(5000 + i * 1000) * motionMultiplier}
        />
      ))}

      {/* Rising particles */}
      {particles.map((shape, i) => (
        <RisingParticle
          key={`particle-${i}`}
          startX={shape.x * W}
          size={4 + shape.size * 0.04}
          color={scene.palette[3]}
          opacity={0.15 + shape.opacity}
          delay={i * 700}
          duration={(5000 + i * 500) * motionMultiplier}
        />
      ))}

      {/* Additional accent particles for depth */}
      {Array.from({ length: 6 }, (_, i) => (
        <RisingParticle
          key={`accent-${i}`}
          startX={(hashString((title || theme) + i.toString()) % W)}
          size={2 + (i % 3) * 2}
          color={scene.palette[4]}
          opacity={0.08 + (i % 4) * 0.04}
          delay={i * 1200 + 2000}
          duration={(7000 + i * 600) * motionMultiplier}
        />
      ))}

      {/* Vignette */}
      <View style={styles.vignette} />

      {/* Film grain texture overlay */}
      <View style={styles.grain} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  sweep: {
    position: "absolute",
    top: -H * 0.2,
    bottom: -H * 0.2,
    width: W * 0.6,
    // @ts-ignore
    filter: "blur(40px)",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    // @ts-ignore
    backgroundImage: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    // @ts-ignore
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
    backgroundSize: "128px 128px",
  },
});
