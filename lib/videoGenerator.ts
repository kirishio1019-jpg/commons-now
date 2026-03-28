// Canvas-based video generator — renders themed animation and records as WebM
// Works in modern browsers via MediaRecorder API. No external API needed.

const PALETTES: Record<string, { bg: string[]; accent: string; particle: string }> = {
  植樹:     { bg: ["#071A0F", "#1B4332"], accent: "#40916C", particle: "#74C69D" },
  食:       { bg: ["#2A0E05", "#7C2D12"], accent: "#D97706", particle: "#FCD34D" },
  物語:     { bg: ["#0F0E24", "#3730A3"], accent: "#7C3AED", particle: "#C4B5FD" },
  雨水収集: { bg: ["#061B26", "#155E75"], accent: "#06B6D4", particle: "#67E8F9" },
  音楽:     { bg: ["#1A0529", "#7C3AED"], accent: "#A78BFA", particle: "#E9D5FF" },
  ヨガ:     { bg: ["#0C1929", "#3B6EA5"], accent: "#93C5FD", particle: "#DBEAFE" },
  アート:   { bg: ["#1F0A2E", "#9333EA"], accent: "#F472B6", particle: "#FBCFE8" },
  対話:     { bg: ["#0E0E24", "#4040A0"], accent: "#60A5FA", particle: "#BFDBFE" },
  DIY:      { bg: ["#1A1008", "#78350F"], accent: "#D97706", particle: "#FDE68A" },
  ハイキング:{ bg: ["#071A0F", "#2D6A4F"], accent: "#6EE7B7", particle: "#D1FAE5" },
  焚き火:   { bg: ["#1A0A02", "#7C2D12"], accent: "#EA580C", particle: "#FED7AA" },
  農業:     { bg: ["#0A1A0A", "#3D7A3D"], accent: "#86EFAC", particle: "#F0FDF4" },
  瞑想:     { bg: ["#060D17", "#1E3A5F"], accent: "#475569", particle: "#94A3B8" },
  星空:     { bg: ["#030712", "#1E293B"], accent: "#6366F1", particle: "#E0E7FF" },
  子どもと: { bg: ["#0F1A12", "#40916C"], accent: "#34D399", particle: "#A7F3D0" },
};

const DEFAULT_PALETTE = { bg: ["#0A0A14", "#1E1E3C"], accent: "#4F46E5", particle: "#A5B4FC" };

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export async function generateVideo(
  theme: string,
  title: string,
  description: string,
  date: string,
  location: string,
): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  if (!("MediaRecorder" in window)) return null;

  const W = 390;
  const H = 844;
  const FPS = 30;
  const DURATION = 5; // seconds
  const TOTAL_FRAMES = FPS * DURATION;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const palette = PALETTES[theme] ?? DEFAULT_PALETTE;

  // Setup MediaRecorder
  const stream = canvas.captureStream(FPS);
  const chunks: Blob[] = [];

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 2500000 });
  } catch {
    try {
      recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    } catch {
      return null;
    }
  }

  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  // Initialize particles
  const particles: Particle[] = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * W,
      y: H + Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(1 + Math.random() * 2),
      size: 2 + Math.random() * 4,
      opacity: 0,
      life: 0,
      maxLife: 80 + Math.random() * 120,
    });
  }

  function drawFrame(frame: number) {
    const t = frame / TOTAL_FRAMES; // 0 to 1

    // Background gradient (shifts over time)
    const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
    const shift = Math.sin(t * Math.PI * 2) * 0.15;
    grad.addColorStop(0, palette.bg[0]);
    grad.addColorStop(0.5 + shift, palette.bg[1]);
    grad.addColorStop(1, palette.bg[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Light sweep
    const sweepX = (t * 2 - 0.5) * W * 1.5;
    const sweepGrad = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0);
    sweepGrad.addColorStop(0, "rgba(255,255,255,0)");
    sweepGrad.addColorStop(0.5, "rgba(255,255,255,0.03)");
    sweepGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(0, 0, W, H);

    // Update and draw particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      const lifeRatio = p.life / p.maxLife;
      if (lifeRatio < 0.2) p.opacity = lifeRatio / 0.2;
      else if (lifeRatio > 0.7) p.opacity = (1 - lifeRatio) / 0.3;
      else p.opacity = 1;

      if (p.life >= p.maxLife) {
        p.x = Math.random() * W;
        p.y = H + 10;
        p.life = 0;
        p.maxLife = 80 + Math.random() * 120;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = palette.particle + Math.round(p.opacity * 0.4 * 255).toString(16).padStart(2, "0");
      ctx.fill();
    }

    // Soft orbs
    for (let i = 0; i < 3; i++) {
      const orbX = W * (0.2 + i * 0.3) + Math.sin(t * Math.PI * 2 + i) * 30;
      const orbY = H * (0.3 + i * 0.15) + Math.cos(t * Math.PI * 2 + i * 2) * 20;
      const orbR = 60 + i * 20;
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbR);
      orbGrad.addColorStop(0, palette.accent + "15");
      orbGrad.addColorStop(1, palette.accent + "00");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vignette
    const vigGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.8);
    vigGrad.addColorStop(0, "rgba(0,0,0,0)");
    vigGrad.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, W, H);

    // Bottom gradient for text
    const btmGrad = ctx.createLinearGradient(0, H * 0.5, 0, H);
    btmGrad.addColorStop(0, "rgba(0,0,0,0)");
    btmGrad.addColorStop(1, "rgba(0,0,0,0.85)");
    ctx.fillStyle = btmGrad;
    ctx.fillRect(0, 0, W, H);

    // Text appears with fade-in
    const textOpacity = Math.min(1, t * 3); // fade in over first 1/3

    // Theme tag
    ctx.globalAlpha = textOpacity * 0.6;
    ctx.font = "600 12px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`#${theme}`, 24, H - 180);

    // Title
    ctx.globalAlpha = textOpacity;
    ctx.font = "800 22px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    wrapText(ctx, title, 24, H - 145, W - 48, 28);

    // Date + location
    ctx.globalAlpha = textOpacity * 0.5;
    ctx.font = "500 13px system-ui, sans-serif";
    ctx.fillText(`${date}  ·  ${location}`, 24, H - 80);

    // Description
    ctx.globalAlpha = textOpacity * 0.4;
    ctx.font = "400 12px system-ui, sans-serif";
    const descLine = description.length > 60 ? description.slice(0, 60) + "..." : description;
    ctx.fillText(descLine, 24, H - 55);

    ctx.globalAlpha = 1;

    // Film grain
    if (frame % 2 === 0) {
      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 16) {
        const noise = (Math.random() - 0.5) * 8;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
    const chars = text.split("");
    let line = "";
    let currentY = y;
    for (const char of chars) {
      const test = line + char;
      if (ctx.measureText(test).width > maxW) {
        ctx.fillText(line, x, currentY);
        line = char;
        currentY += lineH;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // Record
  return new Promise<Blob | null>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      resolve(blob);
    };

    recorder.start();

    let frame = 0;
    const interval = setInterval(() => {
      drawFrame(frame);
      frame++;
      if (frame >= TOTAL_FRAMES) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / FPS);
  });
}
