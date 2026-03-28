import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Platform, Dimensions, Easing } from "react-native";

// On web inside phone frame, use frame size; on native, use screen
const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;
const H = Platform.OS === "web" ? 844 : Dimensions.get("window").height;

interface AnimatedBackgroundProps {
  theme: string;
  isActive: boolean;
}

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
};

const DEFAULT_CONFIG = {
  colors: ["#1A1A2E", "#16213E", "#0F3460"],
  particles: ["✨", "💫", "🌟"],
  particleCount: 8,
};

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  emoji: string;
  size: number;
}

export function AnimatedBackground({ theme, isActive }: AnimatedBackgroundProps) {
  const config = THEME_CONFIGS[theme] ?? DEFAULT_CONFIG;

  // Ambient color pulse
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Particles
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

  // Light sweep
  const sweepAnim = useRef(new Animated.Value(-W)).current;

  useEffect(() => {
    if (!isActive) return;

    // Ambient pulse
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

    // Particle animations
    const particleAnims = particles.map((p, i) => {
      const delay = i * 300 + Math.random() * 1000;
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

    // Light sweep
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
      {/* Vignette overlay */}
      <View style={styles.vignette} />

      {/* Light sweep */}
      <Animated.View
        style={[
          styles.sweep,
          { transform: [{ translateX: sweepAnim }] },
        ]}
      />

      {/* Floating particles */}
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
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
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
