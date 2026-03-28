// Cinematic Scene Generator v4
// 1 content-matched image → deep motion + atmosphere → continuous 60fps "video"
// NO clip stitching. Single shot, evolving storyline.

import React, { useEffect, useRef, useMemo } from "react";

interface Props {
  waveId: string;
  theme: string;
  title: string;
  description: string;
  isActive: boolean;
  width: number;
  height: number;
}

// Theme → LoremFlickr keywords + atmosphere config
const THEME_CONFIG: Record<string, {
  keywords: string;
  atmosphere: "warm" | "cool" | "dark" | "bright" | "golden";
  particleColor: string;
  particleType: "rise" | "fall" | "float" | "streak";
  fogColor: string;
  fogOpacity: number;
  lightColor: string;
  displacement: number;  // SVG turbulence intensity
  displaceSpeed: number; // Animation speed
}> = {
  植樹:     { keywords: "planting trees forest nature", atmosphere: "warm", particleColor: "#86efac", particleType: "fall", fogColor: "#1B4332", fogOpacity: 0.15, lightColor: "#fde68a", displacement: 12, displaceSpeed: 10 },
  食:       { keywords: "cooking food kitchen community", atmosphere: "golden", particleColor: "#fef3c7", particleType: "rise", fogColor: "#78350F", fogOpacity: 0.1, lightColor: "#fbbf24", displacement: 8, displaceSpeed: 12 },
  物語:     { keywords: "campfire night storytelling people", atmosphere: "dark", particleColor: "#fca5a5", particleType: "rise", fogColor: "#1E1B4B", fogOpacity: 0.2, lightColor: "#c4b5fd", displacement: 14, displaceSpeed: 8 },
  雨水収集: { keywords: "rain nature water green leaves", atmosphere: "cool", particleColor: "#93c5fd", particleType: "streak", fogColor: "#0C3547", fogOpacity: 0.2, lightColor: "#67e8f9", displacement: 18, displaceSpeed: 6 },
  音楽:     { keywords: "concert music guitar outdoor people", atmosphere: "golden", particleColor: "#ddd6fe", particleType: "float", fogColor: "#3B0764", fogOpacity: 0.12, lightColor: "#a78bfa", displacement: 10, displaceSpeed: 10 },
  ヨガ:     { keywords: "yoga sunrise peaceful outdoor nature", atmosphere: "warm", particleColor: "#bfdbfe", particleType: "float", fogColor: "#1E3A5F", fogOpacity: 0.1, lightColor: "#fde68a", displacement: 6, displaceSpeed: 14 },
  アート:   { keywords: "art painting creative colorful studio", atmosphere: "bright", particleColor: "#f5d0fe", particleType: "float", fogColor: "#4A1942", fogOpacity: 0.08, lightColor: "#f0abfc", displacement: 14, displaceSpeed: 8 },
  対話:     { keywords: "people conversation cafe community", atmosphere: "golden", particleColor: "#fef3c7", particleType: "float", fogColor: "#1A1A2E", fogOpacity: 0.1, lightColor: "#fbbf24", displacement: 6, displaceSpeed: 14 },
  DIY:      { keywords: "workshop tools woodworking crafting hands", atmosphere: "warm", particleColor: "#fde68a", particleType: "float", fogColor: "#3D2B1F", fogOpacity: 0.12, lightColor: "#d97706", displacement: 8, displaceSpeed: 12 },
  ハイキング:{ keywords: "hiking mountain trail nature scenic", atmosphere: "bright", particleColor: "#d1fae5", particleType: "float", fogColor: "#065F46", fogOpacity: 0.15, lightColor: "#6ee7b7", displacement: 10, displaceSpeed: 10 },
  焚き火:   { keywords: "bonfire campfire flames night warm", atmosphere: "dark", particleColor: "#fed7aa", particleType: "rise", fogColor: "#7C2D12", fogOpacity: 0.15, lightColor: "#f97316", displacement: 20, displaceSpeed: 5 },
  農業:     { keywords: "farming harvest vegetables field garden", atmosphere: "bright", particleColor: "#dcfce7", particleType: "float", fogColor: "#166534", fogOpacity: 0.1, lightColor: "#86efac", displacement: 8, displaceSpeed: 12 },
  瞑想:     { keywords: "meditation zen garden peaceful morning", atmosphere: "cool", particleColor: "#cbd5e1", particleType: "float", fogColor: "#0F172A", fogOpacity: 0.2, lightColor: "#94a3b8", displacement: 5, displaceSpeed: 16 },
  星空:     { keywords: "night sky stars landscape dark", atmosphere: "dark", particleColor: "#e0e7ff", particleType: "float", fogColor: "#0F172A", fogOpacity: 0.1, lightColor: "#818cf8", displacement: 4, displaceSpeed: 18 },
  子どもと: { keywords: "children playing park outdoor family", atmosphere: "bright", particleColor: "#a7f3d0", particleType: "float", fogColor: "#047857", fogOpacity: 0.08, lightColor: "#fde68a", displacement: 8, displaceSpeed: 12 },
};

const DEFAULT_CONFIG = THEME_CONFIG["植樹"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function getImageUrl(theme: string, title: string, waveId: string): string {
  const cfg = THEME_CONFIG[theme] ?? DEFAULT_CONFIG;
  // Extract title keywords for more specific image
  const titleWords = title.replace(/[—\-「」（）。、：]/g, " ").split(/\s+/).filter(w => w.length > 1).slice(0, 2).join(",");
  const kw = titleWords ? `${cfg.keywords},${titleWords}` : cfg.keywords;
  const lock = hash(waveId) % 100000;
  return `https://loremflickr.com/720/1280/${encodeURIComponent(kw)}?lock=${lock}`;
}

export function VideoCompositor({ waveId, theme, title, description, isActive, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgLoaded = useRef(false);
  const startTime = useRef(0);

  const cfg = THEME_CONFIG[theme] ?? DEFAULT_CONFIG;
  const imageUrl = useMemo(() => getImageUrl(theme, title, waveId), [theme, title, waveId]);

  // Particle system
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; s: number; o: number; life: number; max: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;
    startTime.current = performance.now();

    // Load the content-matched image
    imgLoaded.current = false;
    const img = new Image();
    img.onload = () => { imgLoaded.current = true; };
    img.onerror = () => { imgLoaded.current = false; };
    img.src = imageUrl;
    imgRef.current = img;

    // Init particles
    const pCount = cfg.particleType === "streak" ? 40 : 25;
    particles.current = Array.from({ length: pCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: cfg.particleType === "rise" ? -(0.3 + Math.random() * 1.5)
        : cfg.particleType === "fall" ? (0.2 + Math.random() * 1)
        : cfg.particleType === "streak" ? (3 + Math.random() * 6)
        : (Math.random() - 0.5) * 0.4,
      s: cfg.particleType === "streak" ? 1 : (1 + Math.random() * 3),
      o: 0, life: Math.random() * 100, max: 100 + Math.random() * 200,
    }));

    function render() {
      if (!isActive) return;
      const t = (performance.now() - startTime.current) / 1000; // seconds

      // Clear
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      // Draw base image with slow cinematic camera drift
      if (imgLoaded.current) {
        ctx.save();

        // Camera: slow drift + gentle zoom over time
        const driftX = Math.sin(t * 0.08) * width * 0.03;
        const driftY = Math.cos(t * 0.06) * height * 0.02;
        const zoom = 1.15 + Math.sin(t * 0.04) * 0.05;

        const iw = width * zoom;
        const ih = height * zoom;
        const ix = (width - iw) / 2 + driftX;
        const iy = (height - ih) / 2 + driftY;

        ctx.drawImage(img, ix, iy, iw, ih);

        // Atmosphere overlay tint
        const atmoAlpha = cfg.fogOpacity + Math.sin(t * 0.15) * 0.03;
        ctx.globalAlpha = atmoAlpha;
        ctx.fillStyle = cfg.fogColor;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;

        ctx.restore();
      } else {
        // Image not loaded yet or failed: rich theme gradient
        const g = ctx.createRadialGradient(width * 0.4, height * 0.35, 0, width / 2, height / 2, width);
        g.addColorStop(0, cfg.lightColor + "30");
        g.addColorStop(0.5, cfg.fogColor);
        g.addColorStop(1, "#000");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      // Evolving light ray (moves across the scene over time)
      const rayX = (Math.sin(t * 0.1) + 1) * 0.5 * width;
      const rayGrad = ctx.createRadialGradient(rayX, height * 0.3, 0, rayX, height * 0.3, width * 0.5);
      rayGrad.addColorStop(0, cfg.lightColor + "15");
      rayGrad.addColorStop(0.5, cfg.lightColor + "08");
      rayGrad.addColorStop(1, "transparent");
      ctx.fillStyle = rayGrad;
      ctx.fillRect(0, 0, width, height);

      // Fog layer that moves
      const fogX = Math.sin(t * 0.05) * 50;
      ctx.save();
      ctx.globalAlpha = 0.06 + Math.sin(t * 0.2) * 0.02;
      const fogGrad = ctx.createLinearGradient(fogX, height * 0.6, fogX + width, height);
      fogGrad.addColorStop(0, "transparent");
      fogGrad.addColorStop(0.5, cfg.fogColor);
      fogGrad.addColorStop(1, "transparent");
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, height * 0.5, width, height * 0.5);
      ctx.restore();

      // Particles
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const lr = p.life / p.max;
        p.o = lr < 0.1 ? lr / 0.1 : lr > 0.8 ? (1 - lr) / 0.2 : 1;

        if (p.life >= p.max || p.y > height + 10 || p.y < -10 || p.x > width + 10 || p.x < -10) {
          p.x = Math.random() * width;
          p.y = cfg.particleType === "rise" || cfg.particleType === "float" ? height + 5
            : cfg.particleType === "streak" ? -5
            : Math.random() * height;
          p.life = 0;
        }

        ctx.globalAlpha = p.o * 0.5;
        if (cfg.particleType === "streak") {
          ctx.strokeStyle = cfg.particleColor;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 0.3, p.y - 6);
          ctx.stroke();
        } else {
          ctx.fillStyle = cfg.particleColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Vignette
      const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.85);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);

      // Bottom darkening for text readability
      const btm = ctx.createLinearGradient(0, height * 0.5, 0, height);
      btm.addColorStop(0, "transparent");
      btm.addColorStop(0.6, "rgba(0,0,0,0.3)");
      btm.addColorStop(1, "rgba(0,0,0,0.8)");
      ctx.fillStyle = btm;
      ctx.fillRect(0, 0, width, height);

      // Film grain (skip if canvas is tainted by cross-origin image)
      try {
        if (Math.random() > 0.7) {
          const imgData = ctx.getImageData(0, 0, width, height);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 60) {
            const n = (Math.random() - 0.5) * 4;
            d[i] += n; d[i+1] += n; d[i+2] += n;
          }
          ctx.putImageData(imgData, 0, 0);
        }
      } catch {}

      rafRef.current = requestAnimationFrame(render);
    }

    // Start rendering immediately (gradient bg shown while image loads)
    rafRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, imageUrl, width, height, cfg]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", top: 0, left: 0,
        width, height,
      }}
    />
  );
}
