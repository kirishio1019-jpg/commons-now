import React, { useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, Animated, Platform, Dimensions, Easing } from "react-native";

const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;
const H = Platform.OS === "web" ? 844 : Dimensions.get("window").height;

interface AnimatedBackgroundProps {
  theme: string;
  isActive: boolean;
  description?: string;
}

// Base theme configs
const THEME_CONFIGS: Record<
  string,
  { colors: string[]; particles: string[]; particleCount: number }
> = {
  植樹: {
    colors: ["#0B3D0B", "#1B4332", "#2D6A4F"],
    particles: ["🌿", "🍃", "🌱", "🌳", "✨"],
    particleCount: 12,
  },
  食: {
    colors: ["#4A1A0A", "#7C2D12", "#9A3412"],
    particles: ["🍚", "🫘", "🧂", "💨", "✨"],
    particleCount: 10,
  },
  物語: {
    colors: ["#1E1B4B", "#312E81", "#3730A3"],
    particles: ["🔥", "✨", "💫", "🌙", "⭐"],
    particleCount: 14,
  },
  雨水収集: {
    colors: ["#0C3547", "#164E63", "#155E75"],
    particles: ["💧", "🌧️", "💦", "🌊", "✨"],
    particleCount: 16,
  },
  音楽: {
    colors: ["#3B0764", "#581C87", "#7C3AED"],
    particles: ["🎵", "🎶", "🎸", "🎤", "✨"],
    particleCount: 12,
  },
  ヨガ: {
    colors: ["#1E3A5F", "#2E4A6F", "#4A6FA5"],
    particles: ["🧘", "☯️", "💫", "🌸", "✨"],
    particleCount: 10,
  },
  アート: {
    colors: ["#4A1942", "#6B2FA0", "#9333EA"],
    particles: ["🎨", "🖌️", "✨", "💜", "🌈"],
    particleCount: 14,
  },
  対話: {
    colors: ["#1A1A3E", "#2D2D6E", "#4040A0"],
    particles: ["💬", "🗣️", "✨", "💡", "🤝"],
    particleCount: 10,
  },
  DIY: {
    colors: ["#3D2B1F", "#5C4033", "#8B6914"],
    particles: ["🔧", "🪵", "🪚", "✨", "🏗️"],
    particleCount: 12,
  },
  ハイキング: {
    colors: ["#1B4332", "#2D6A4F", "#52796F"],
    particles: ["⛰️", "🥾", "🌲", "🦅", "✨"],
    particleCount: 12,
  },
  焚き火: {
    colors: ["#2D1506", "#5C2D0E", "#8B4513"],
    particles: ["🔥", "✨", "🪵", "🌙", "💫"],
    particleCount: 16,
  },
  農業: {
    colors: ["#1B3A1B", "#2D5A2D", "#3D7A3D"],
    particles: ["🌾", "🚜", "🌻", "🥕", "✨"],
    particleCount: 12,
  },
  瞑想: {
    colors: ["#0D1B2A", "#1B2838", "#2B3A4A"],
    particles: ["🧘", "✨", "🕯️", "💫", "🌙"],
    particleCount: 8,
  },
  星空: {
    colors: ["#0A0A1A", "#0D1B2A", "#1B2838"],
    particles: ["⭐", "🌟", "✨", "🌙", "💫"],
    particleCount: 20,
  },
  子どもと: {
    colors: ["#1B4332", "#2D6A4F", "#40916C"],
    particles: ["🧒", "🎈", "🎪", "✨", "🌈"],
    particleCount: 12,
  },
};

const DEFAULT_CONFIG = {
  colors: ["#1A1A2E", "#16213E", "#0F3460"],
  particles: ["✨", "💫", "🌟", "🌊"],
  particleCount: 10,
};

// Extract additional emojis from description keywords
const KEYWORD_EMOJIS: Record<string, string> = {
  "朝": "🌅", "夜": "🌙", "海": "🌊", "川": "🏞️", "山": "⛰️",
  "花": "🌸", "桜": "🌸", "雪": "❄️", "雨": "🌧️", "風": "🍃",
  "犬": "🐕", "猫": "🐱", "鳥": "🐦", "魚": "🐟", "虫": "🦋",
  "本": "📖", "歌": "🎵", "踊": "💃", "走": "🏃", "泳": "🏊",
  "飲": "☕", "食べ": "🍱", "作": "🔨", "描": "🎨", "撮": "📸",
  "友": "👫", "家族": "👨‍👩‍👧‍👦", "仲間": "🤝", "笑": "😊",
  "土": "🌍", "苗": "🌱", "種": "🌰", "収穫": "🌽", "味噌": "🫘",
};

function getConfigFromContent(theme: string, description?: string) {
  const base = THEME_CONFIGS[theme] ?? DEFAULT_CONFIG;

  if (!description) return base;

  // Extract extra emojis from description
  const extraEmojis: string[] = [];
  for (const [keyword, emoji] of Object.entries(KEYWORD_EMOJIS)) {
    if (description.includes(keyword) && !base.particles.includes(emoji)) {
      extraEmojis.push(emoji);
    }
  }

  if (extraEmojis.length === 0) return base;

  // Mix extra emojis into particles
  const mixed = [...base.particles];
  extraEmojis.slice(0, 3).forEach((e, i) => {
    mixed.splice(Math.min(i * 2 + 1, mixed.length), 0, e);
  });

  return {
    ...base,
    particles: mixed.slice(0, 8),
    particleCount: Math.min(base.particleCount + extraEmojis.length * 2, 20),
  };
}

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  emoji: string;
  size: number;
}

export function AnimatedBackground({ theme, isActive, description }: AnimatedBackgroundProps) {
  const config = useMemo(
    () => getConfigFromContent(theme, description),
    [theme, description]
  );

  const pulseAnim = useRef(new Animated.Value(0)).current;

  const particles = useRef<Particle[]>(
    Array.from({ length: config.particleCount }, (_, i) => ({
      x: new Animated.Value(Math.random() * W),
      y: new Animated.Value(Math.random() * H),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.3 + Math.random() * 0.7),
      emoji: config.particles[i % config.particles.length],
      size: 16 + Math.random() * 20,
    }))
  ).current;

  const sweepAnim = useRef(new Animated.Value(-W)).current;

  useEffect(() => {
    if (!isActive) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();

    const particleAnims = particles.map((p, i) => {
      const delay = i * 250 + Math.random() * 800;
      const duration = 3000 + Math.random() * 4000;
      const startX = Math.random() * W;
      const startY = H + 20;
      const endX = startX + (Math.random() - 0.5) * 200;
      const endY = -50;

      p.x.setValue(startX);
      p.y.setValue(startY);
      p.opacity.setValue(0);

      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(p.y, {
              toValue: endY,
              duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(p.x, {
              toValue: endX,
              duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(p.opacity, {
                toValue: 0.8,
                duration: duration * 0.2,
                useNativeDriver: true,
              }),
              Animated.timing(p.opacity, {
                toValue: 0.8,
                duration: duration * 0.5,
                useNativeDriver: true,
              }),
              Animated.timing(p.opacity, {
                toValue: 0,
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(p.y, {
            toValue: startY,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });
    particleAnims.forEach((a) => a.start());

    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, {
          toValue: W * 1.5,
          duration: 6000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(sweepAnim, {
          toValue: -W,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    sweep.start();

    return () => {
      pulse.stop();
      particleAnims.forEach((a) => a.stop());
      sweep.stop();
    };
  }, [isActive]);

  const bgColor = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: config.colors,
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.vignette} />

      <Animated.View
        style={[
          styles.sweep,
          { transform: [{ translateX: sweepAnim }] },
        ]}
      />

      {particles.map((p, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.particle,
            {
              fontSize: p.size,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
            },
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  sweep: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: W * 0.4,
    backgroundColor: "rgba(255,255,255,0.03)",
    transform: [{ skewX: "-15deg" }],
  },
  particle: {
    position: "absolute",
  },
});
