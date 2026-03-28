import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";

interface Props {
  waveId: string;
  theme: string;
  title: string;
  description: string;
  isActive: boolean;
  width: number;
  height: number;
}

const THEMES: Record<string, {
  keywords: string;
  fogColor: string;
  lightColor: string;
  particleColor: string;
}> = {
  植樹:     { keywords: "planting trees forest nature", fogColor: "#1B4332", lightColor: "#fde68a", particleColor: "#86efac" },
  食:       { keywords: "cooking food kitchen community", fogColor: "#78350F", lightColor: "#fbbf24", particleColor: "#fef3c7" },
  物語:     { keywords: "campfire night storytelling people", fogColor: "#1E1B4B", lightColor: "#c4b5fd", particleColor: "#fca5a5" },
  雨水収集: { keywords: "rain nature water green leaves", fogColor: "#0C3547", lightColor: "#67e8f9", particleColor: "#93c5fd" },
  音楽:     { keywords: "concert music guitar outdoor", fogColor: "#3B0764", lightColor: "#a78bfa", particleColor: "#ddd6fe" },
  ヨガ:     { keywords: "yoga sunrise peaceful outdoor", fogColor: "#1E3A5F", lightColor: "#fde68a", particleColor: "#bfdbfe" },
  アート:   { keywords: "art painting creative colorful", fogColor: "#4A1942", lightColor: "#f0abfc", particleColor: "#f5d0fe" },
  対話:     { keywords: "people conversation cafe community", fogColor: "#1A1A2E", lightColor: "#fbbf24", particleColor: "#fef3c7" },
  DIY:      { keywords: "workshop tools woodworking crafting", fogColor: "#3D2B1F", lightColor: "#d97706", particleColor: "#fde68a" },
  ハイキング:{ keywords: "hiking mountain trail nature", fogColor: "#065F46", lightColor: "#6ee7b7", particleColor: "#d1fae5" },
  焚き火:   { keywords: "bonfire campfire flames night", fogColor: "#7C2D12", lightColor: "#f97316", particleColor: "#fed7aa" },
  農業:     { keywords: "farming harvest vegetables garden", fogColor: "#166534", lightColor: "#86efac", particleColor: "#dcfce7" },
  瞑想:     { keywords: "meditation zen garden peaceful", fogColor: "#0F172A", lightColor: "#94a3b8", particleColor: "#cbd5e1" },
  星空:     { keywords: "starry sky night landscape", fogColor: "#0F172A", lightColor: "#818cf8", particleColor: "#e0e7ff" },
  子どもと: { keywords: "children playing park outdoor", fogColor: "#047857", lightColor: "#fde68a", particleColor: "#a7f3d0" },
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function VideoCompositor({ waveId, theme, title, description, isActive, width, height }: Props) {
  const cfg = THEMES[theme] ?? THEMES["植樹"];
  const lock = hash(waveId) % 100000;
  const titleWords = title.replace(/[—\-「」（）。、：]/g, " ").split(/\s+/).filter(w => w.length > 1).slice(0, 2).join(",");
  const kw = titleWords ? `${cfg.keywords},${titleWords}` : cfg.keywords;
  const imgUrl = `https://loremflickr.com/720/1280/${encodeURIComponent(kw)}?lock=${lock}`;

  const animKey = useMemo(() => `anim-${hash(waveId) % 9999}`, [waveId]);
  const kbIdx = hash(waveId) % 4;
  const kbFrom = [
    "scale(1.0) translate(0%, 0%)",
    "scale(1.15) translate(-3%, -2%)",
    "scale(1.0) translate(3%, 0%)",
    "scale(1.2) translate(0%, -3%)",
  ][kbIdx];
  const kbTo = [
    "scale(1.2) translate(-4%, -3%)",
    "scale(1.0) translate(2%, 1%)",
    "scale(1.18) translate(-2%, -4%)",
    "scale(1.0) translate(0%, 2%)",
  ][kbIdx];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000" }}>
      {/* SVG filter for image motion */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id={`motion-${lock}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="3" result="turb">
              <animate attributeName="baseFrequency" values="0.008;0.014;0.008" dur="8s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="turb" scale="12" />
          </filter>
        </defs>
      </svg>

      {/* Main image with Ken Burns + SVG displacement */}
      <img
        src={imgUrl}
        alt=""
        style={{
          position: "absolute",
          top: "-15%", left: "-15%",
          width: "130%", height: "130%",
          objectFit: "cover" as any,
          animation: isActive ? `${animKey} 12s ease-in-out infinite alternate` : "none",
          filter: `url(#motion-${lock})`,
        }}
      />

      {/* Atmosphere fog overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: cfg.fogColor,
        opacity: 0.2,
        mixBlendMode: "multiply" as any,
      }} />

      {/* Animated light ray */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 30% 30%, ${cfg.lightColor}18, transparent 70%)`,
        animation: isActive ? "lightmove 10s ease-in-out infinite alternate" : "none",
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* Bottom gradient for text */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
        background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
      }} />

      {/* CSS keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ${animKey} {
          from { transform: ${kbFrom}; }
          to { transform: ${kbTo}; }
        }
        @keyframes lightmove {
          from { transform: translate(0%, 0%); }
          to { transform: translate(15%, 10%); }
        }
      `}} />
    </div>
  );
}
