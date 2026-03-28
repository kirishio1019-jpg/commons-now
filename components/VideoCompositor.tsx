// Cinematic Video Compositor v3
// Multi-layer: media + SVG motion filters + particle canvas + color grading
// SVG feTurbulence makes images "breathe" and "flow" like real video

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import {
  generateStoryboard, Storyboard, Segment, SVGFilterType, ParticleType,
} from "../lib/storyboardGenerator";

interface Props {
  waveId: string;
  theme: string;
  title: string;
  description: string;
  isActive: boolean;
  width: number;
  height: number;
}

export function VideoCompositor({ waveId, theme, title, description, isActive, width, height }: Props) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<any>(null);

  const sb = useMemo(
    () => generateStoryboard(waveId, theme, title, description),
    [waveId, theme, title, description]
  );

  // Auto-advance
  useEffect(() => {
    if (!isActive || sb.segments.length < 2) return;
    timerRef.current = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((p) => (p + 1) % sb.segments.length);
        setFading(false);
      }, 1500);
    }, (sb.segments[idx]?.duration ?? 5) * 1000);
    return () => clearTimeout(timerRef.current);
  }, [isActive, idx, sb]);

  const seg = sb.segments[idx];
  const nextSeg = sb.segments[(idx + 1) % sb.segments.length];
  const grade = sb.colorGrade;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000" }}>
      {/* SVG filter definitions */}
      <SVGFilters />

      {/* Current segment */}
      <MediaSegment seg={seg} isActive={isActive} opacity={fading ? 0 : 1} index={idx} width={width} height={height} />

      {/* Next segment (visible during fade) */}
      {fading && <MediaSegment seg={nextSeg} isActive={isActive} opacity={1} index={idx + 1} width={width} height={height} />}

      {/* Particle overlay canvas */}
      {isActive && sb.globalParticle && (
        <ParticleCanvas type={sb.globalParticle} width={width} height={height} />
      )}

      {/* Color grading */}
      <div style={{
        position: "absolute", inset: 0,
        background: `hsla(${grade.hue}, 40%, 25%, 0.12)`,
        mixBlendMode: "overlay" as any,
        zIndex: 20, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        filter: `saturate(${grade.saturation}) brightness(${grade.brightness})`,
        zIndex: 21, pointerEvents: "none",
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)",
        zIndex: 22, pointerEvents: "none",
      }} />

      {/* Film grain */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04, zIndex: 23, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* CSS keyframes for Ken Burns */}
      <style dangerouslySetInnerHTML={{ __html: buildKeyframes(sb.segments) }} />
    </div>
  );
}

// --- SVG Motion Filters ---
function SVGFilters() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        {/* Liquid: organic flowing motion */}
        <filter id="svgf-liquid">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" result="turb">
            <animate attributeName="baseFrequency" values="0.012;0.018;0.012" dur="8s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="22" />
        </filter>
        {/* Ripple: water surface */}
        <filter id="svgf-ripple">
          <feTurbulence type="turbulence" baseFrequency="0.025" numOctaves="2" result="turb">
            <animate attributeName="baseFrequency" values="0.025;0.035;0.025" dur="5s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="15" />
        </filter>
        {/* Heat: shimmer/fire */}
        <filter id="svgf-heat">
          <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="4" result="turb">
            <animate attributeName="baseFrequency" values="0.008;0.015;0.008" dur="4s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="30" />
        </filter>
        {/* Breathe: ultra-subtle pulse */}
        <filter id="svgf-breathe">
          <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="2" result="turb">
            <animate attributeName="baseFrequency" values="0.005;0.009;0.005" dur="10s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="10" />
        </filter>
      </defs>
    </svg>
  );
}

// --- Media Segment Renderer ---
function MediaSegment({ seg, isActive, opacity, index, width, height }: {
  seg: Segment; isActive: boolean; opacity: number; index: number; width: number; height: number;
}) {
  if (!seg) return null;
  const kb = seg.motion.kenBurns;
  const anim = `kb${index} ${seg.duration + 3}s ease-in-out infinite alternate`;
  const svgFilter = seg.motion.svgFilter !== "none" ? `url(#svgf-${seg.motion.svgFilter})` : "none";

  const mediaCSS: React.CSSProperties = {
    position: "absolute",
    top: "-15%", left: "-15%", width: "130%", height: "130%",
    objectFit: "cover" as any,
    animation: isActive ? anim : "none",
    filter: svgFilter,
  };

  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden",
      opacity, transition: "opacity 1.5s ease-in-out",
      zIndex: opacity === 1 ? 2 : 1,
    }}>
      {seg.media.type === "video" ? (
        <video src={seg.media.url} autoPlay={isActive} loop muted playsInline style={mediaCSS} />
      ) : (
        <img src={seg.media.url} alt="" style={mediaCSS} loading="eager" />
      )}
    </div>
  );
}

// --- Particle Canvas Overlay ---
function ParticleCanvas({ type, width, height }: { type: ParticleType; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; s: number; o: number; life: number; max: number }[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;

    const configs: Record<string, { count: number; color: string; sizeRange: [number, number]; vyRange: [number, number]; vxRange: [number, number] }> = {
      embers:  { count: 30, color: "#FF6B35", sizeRange: [1, 3], vyRange: [-2, -0.5], vxRange: [-0.5, 0.5] },
      leaves:  { count: 20, color: "#4ADE80", sizeRange: [2, 5], vyRange: [0.3, 1.5], vxRange: [-1, 1] },
      rain:    { count: 50, color: "#93C5FD", sizeRange: [1, 2], vyRange: [4, 8], vxRange: [-0.2, 0.2] },
      stars:   { count: 40, color: "#E0E7FF", sizeRange: [1, 3], vyRange: [-0.1, 0.1], vxRange: [-0.1, 0.1] },
      steam:   { count: 15, color: "#F1F5F9", sizeRange: [3, 8], vyRange: [-1, -0.3], vxRange: [-0.3, 0.3] },
      dust:    { count: 25, color: "#D4D4D8", sizeRange: [1, 3], vyRange: [-0.3, 0.3], vxRange: [-0.3, 0.3] },
      notes:   { count: 12, color: "#C084FC", sizeRange: [2, 4], vyRange: [-1.5, -0.5], vxRange: [-0.8, 0.8] },
      bubbles: { count: 18, color: "#A5F3FC", sizeRange: [2, 6], vyRange: [-1, -0.3], vxRange: [-0.5, 0.5] },
    };

    const cfg = configs[type ?? "dust"] ?? configs.dust;

    particles.current = Array.from({ length: cfg.count }, () => ({
      x: Math.random() * width,
      y: type === "rain" ? -10 : Math.random() * height,
      vx: cfg.vxRange[0] + Math.random() * (cfg.vxRange[1] - cfg.vxRange[0]),
      vy: cfg.vyRange[0] + Math.random() * (cfg.vyRange[1] - cfg.vyRange[0]),
      s: cfg.sizeRange[0] + Math.random() * (cfg.sizeRange[1] - cfg.sizeRange[0]),
      o: 0, life: 0,
      max: 80 + Math.random() * 200,
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const lr = p.life / p.max;
        p.o = lr < 0.15 ? lr / 0.15 : lr > 0.75 ? (1 - lr) / 0.25 : 1;

        if (p.life >= p.max || p.y > height + 10 || p.y < -10) {
          p.x = Math.random() * width;
          p.y = cfg.vyRange[0] > 0 ? -10 : (cfg.vyRange[1] < 0 ? height + 10 : Math.random() * height);
          p.life = 0;
        }

        ctx.globalAlpha = p.o * 0.6;
        ctx.beginPath();
        if (type === "rain") {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx, p.y + 8);
          ctx.strokeStyle = cfg.color;
          ctx.lineWidth = p.s * 0.5;
          ctx.stroke();
        } else {
          ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          ctx.fillStyle = cfg.color;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [type, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, zIndex: 15, pointerEvents: "none" }}
    />
  );
}

// --- Keyframe generator ---
function buildKeyframes(segments: Segment[]): string {
  return segments.map((seg, i) => {
    const kb = seg.motion.kenBurns;
    return `@keyframes kb${i} {
      from { transform: scale(${kb.fromScale}) translate(${kb.fromX}%, ${kb.fromY}%); }
      to { transform: scale(${kb.toScale}) translate(${kb.toX}%, ${kb.toY}%); }
    }`;
  }).join("\n");
}
