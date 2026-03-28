// Cinematic motion graphics video generator
// 3-act structure: Intro (zoom-in) → Main (content reveal) → Outro (settle)
// Theme-aware visuals: bokeh, geometric patterns, flow fields, kinetic typography

const W = 390;
const H = 844;
const FPS = 30;
const DURATION = 6;
const TOTAL = FPS * DURATION;

interface Palette {
  bg: [string, string, string];
  accent: string;
  accent2: string;
  particle: string;
  text: string;
}

const PALETTES: Record<string, Palette> = {
  植樹:     { bg: ["#040F08", "#0E2D18", "#1B4332"], accent: "#40916C", accent2: "#74C69D", particle: "#95D5B2", text: "#D8F3DC" },
  食:       { bg: ["#1A0800", "#4A1A0A", "#7C2D12"], accent: "#D97706", accent2: "#F59E0B", particle: "#FCD34D", text: "#FEF3C7" },
  物語:     { bg: ["#080620", "#1E1B4B", "#3730A3"], accent: "#7C3AED", accent2: "#A78BFA", particle: "#C4B5FD", text: "#EDE9FE" },
  雨水収集: { bg: ["#041520", "#0C3547", "#155E75"], accent: "#06B6D4", accent2: "#22D3EE", particle: "#67E8F9", text: "#CFFAFE" },
  音楽:     { bg: ["#0D0320", "#3B0764", "#6D28D9"], accent: "#8B5CF6", accent2: "#A78BFA", particle: "#DDD6FE", text: "#EDE9FE" },
  ヨガ:     { bg: ["#081020", "#1E3A5F", "#2563EB"], accent: "#60A5FA", accent2: "#93C5FD", particle: "#BFDBFE", text: "#DBEAFE" },
  アート:   { bg: ["#150820", "#4A1942", "#7E22CE"], accent: "#D946EF", accent2: "#F0ABFC", particle: "#F5D0FE", text: "#FAE8FF" },
  対話:     { bg: ["#080818", "#1A1A3E", "#3B3B8F"], accent: "#6366F1", accent2: "#818CF8", particle: "#A5B4FC", text: "#E0E7FF" },
  DIY:      { bg: ["#0D0800", "#3D2B1F", "#78350F"], accent: "#D97706", accent2: "#FBBF24", particle: "#FDE68A", text: "#FEF9C3" },
  ハイキング:{ bg: ["#040F08", "#1B4332", "#065F46"], accent: "#10B981", accent2: "#34D399", particle: "#6EE7B7", text: "#D1FAE5" },
  焚き火:   { bg: ["#100500", "#3C1106", "#991B1B"], accent: "#EF4444", accent2: "#F97316", particle: "#FCA5A5", text: "#FEE2E2" },
  農業:     { bg: ["#060D06", "#1B3A1B", "#166534"], accent: "#22C55E", accent2: "#4ADE80", particle: "#86EFAC", text: "#DCFCE7" },
  瞑想:     { bg: ["#050810", "#0F172A", "#1E293B"], accent: "#64748B", accent2: "#94A3B8", particle: "#CBD5E1", text: "#E2E8F0" },
  星空:     { bg: ["#020308", "#0F172A", "#1E1B4B"], accent: "#6366F1", accent2: "#818CF8", particle: "#E0E7FF", text: "#F5F3FF" },
  子どもと: { bg: ["#060F0A", "#1B4332", "#047857"], accent: "#34D399", accent2: "#6EE7B7", particle: "#A7F3D0", text: "#D1FAE5" },
};

const DEFAULT: Palette = { bg: ["#08080F", "#141428", "#1E1E3C"], accent: "#6366F1", accent2: "#818CF8", particle: "#A5B4FC", text: "#E0E7FF" };

// Easing functions
function easeOutCubic(t: number): number { return 1 - Math.pow(1 - t, 3); }
function easeInOutQuad(t: number): number { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeOutExpo(t: number): number { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

// Bokeh circle
function drawBokeh(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, opacity: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color + hex(opacity * 0.6));
  g.addColorStop(0.6, color + hex(opacity * 0.2));
  g.addColorStop(1, color + "00");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function hex(a: number): string { return Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, "0"); }

// Flow field particle
interface FlowParticle { x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; delay: number; }

function createParticles(count: number, spread: "full" | "bottom" | "center"): FlowParticle[] {
  return Array.from({ length: count }, () => {
    const y = spread === "bottom" ? H + Math.random() * 50 : spread === "center" ? H * 0.3 + Math.random() * H * 0.4 : Math.random() * H;
    return {
      x: Math.random() * W, y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: spread === "bottom" ? -(0.8 + Math.random() * 2.5) : (Math.random() - 0.5) * 0.8,
      size: 1.5 + Math.random() * 3.5,
      life: 0, maxLife: 60 + Math.random() * 140,
      delay: Math.random() * 60,
    };
  });
}

// Geometric shapes (theme-specific background patterns)
function drawGeometricLayer(ctx: CanvasRenderingContext2D, t: number, palette: Palette, theme: string) {
  ctx.save();
  ctx.globalAlpha = 0.06 + Math.sin(t * Math.PI * 2) * 0.02;

  const cx = W / 2;
  const cy = H * 0.4;
  const scale = 0.8 + easeInOutQuad((Math.sin(t * Math.PI) + 1) / 2) * 0.4;

  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.rotate(t * Math.PI * 0.3);

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1;

  if (["植樹", "農業", "ハイキング"].includes(theme)) {
    // Organic circles
    for (let i = 0; i < 5; i++) {
      const r = 40 + i * 35;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (["音楽", "アート"].includes(theme)) {
    // Sound waves
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      for (let x = -200; x <= 200; x += 4) {
        const y = Math.sin((x + t * 400) * 0.03 + i * 0.8) * (20 + i * 10);
        if (x === -200) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (["物語", "焚き火", "星空"].includes(theme)) {
    // Constellation lines
    const points: [number, number][] = [];
    let rng = 42 + theme.charCodeAt(0);
    for (let i = 0; i < 12; i++) {
      rng = (rng * 16807) % 2147483647;
      const px = (rng / 2147483647 - 0.5) * 300;
      rng = (rng * 16807) % 2147483647;
      const py = (rng / 2147483647 - 0.5) * 300;
      points.push([px, py]);
    }
    ctx.beginPath();
    for (let i = 0; i < points.length - 1; i++) {
      if (Math.abs(points[i][0] - points[i + 1][0]) < 200) {
        ctx.moveTo(points[i][0], points[i][1]);
        ctx.lineTo(points[i + 1][0], points[i + 1][1]);
      }
    }
    ctx.stroke();
    for (const [px, py] of points) {
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = palette.accent + "40";
      ctx.fill();
    }
  } else if (["DIY", "対話"].includes(theme)) {
    // Grid pattern
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 50, -200);
      ctx.lineTo(i * 50, 200);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-200, i * 50);
      ctx.lineTo(200, i * 50);
      ctx.stroke();
    }
  } else {
    // Diamond / hexagonal
    for (let i = 0; i < 4; i++) {
      const r = 50 + i * 40;
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const a = (j / 6) * Math.PI * 2;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  ctx.restore();
}

// Kinetic typography
function drawKineticText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number, color: string, t: number, staggerDelay: number) {
  ctx.font = `800 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = color;

  let offsetX = x;
  for (let i = 0; i < text.length; i++) {
    const charT = Math.max(0, Math.min(1, (t - staggerDelay - i * 0.015) / 0.3));
    if (charT <= 0) continue;

    const ease = easeOutExpo(charT);
    const charY = y + (1 - ease) * 30;
    const charAlpha = ease;

    ctx.globalAlpha = charAlpha;
    ctx.fillText(text[i], offsetX, charY);
    offsetX += ctx.measureText(text[i]).width;
  }
  ctx.globalAlpha = 1;
}

// Main wrapped text with animation
function drawAnimatedTitle(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number, fontSize: number, color: string, t: number) {
  ctx.font = `800 ${fontSize}px system-ui, -apple-system, sans-serif`;

  const lines: string[] = [];
  let line = "";
  for (const char of text) {
    if (ctx.measureText(line + char).width > maxW) {
      lines.push(line);
      line = char;
    } else {
      line += char;
    }
  }
  if (line) lines.push(line);

  for (let li = 0; li < lines.length; li++) {
    drawKineticText(ctx, lines[li], x, y + li * lineH, fontSize, color, t, 0.15 + li * 0.08);
  }
}

export async function generateVideo(
  theme: string, title: string, description: string, date: string, location: string,
): Promise<Blob | null> {
  if (typeof document === "undefined" || !("MediaRecorder" in window)) return null;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const stream = canvas.captureStream(FPS);
  const chunks: Blob[] = [];
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 3000000 });
  } catch {
    try { recorder = new MediaRecorder(stream, { mimeType: "video/webm" }); } catch { return null; }
  }
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const p = PALETTES[theme] ?? DEFAULT;
  const particles = createParticles(50, "bottom");
  const ambientParticles = createParticles(20, "full");
  const bokehCount = 8;
  const bokehs = Array.from({ length: bokehCount }, (_, i) => ({
    x: Math.random() * W, y: Math.random() * H,
    r: 30 + Math.random() * 60,
    speed: 0.3 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
  }));

  function render(frame: number) {
    const t = frame / TOTAL; // 0..1
    const act = t < 0.2 ? 0 : t < 0.75 ? 1 : 2; // intro, main, outro

    // --- Background ---
    const bgGrad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    const shift = Math.sin(t * Math.PI * 4) * 0.1;
    bgGrad.addColorStop(0, p.bg[0]);
    bgGrad.addColorStop(0.4 + shift, p.bg[1]);
    bgGrad.addColorStop(1, p.bg[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // --- Geometric patterns ---
    drawGeometricLayer(ctx, t, p, theme);

    // --- Bokeh layer ---
    for (const b of bokehs) {
      const bx = b.x + Math.sin(t * Math.PI * 2 * b.speed + b.phase) * 40;
      const by = b.y + Math.cos(t * Math.PI * 2 * b.speed + b.phase * 1.3) * 25;
      const fadeIn = Math.min(1, t * 4);
      drawBokeh(ctx, bx, by, b.r, p.accent, fadeIn * 0.25);
    }

    // --- Rising particles ---
    for (const pt of particles) {
      if (frame < pt.delay) continue;
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life++;
      const lr = pt.life / pt.maxLife;
      let alpha = lr < 0.15 ? lr / 0.15 : lr > 0.7 ? (1 - lr) / 0.3 : 1;
      if (pt.life >= pt.maxLife) { pt.y = H + 10; pt.x = Math.random() * W; pt.life = 0; }

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fillStyle = p.particle + hex(alpha * 0.5);
      ctx.fill();
    }

    // --- Ambient floating particles ---
    for (const pt of ambientParticles) {
      if (frame < pt.delay) continue;
      pt.x += pt.vx * 0.3;
      pt.y += Math.sin(frame * 0.02 + pt.delay) * 0.3;
      pt.life++;
      const lr = pt.life / pt.maxLife;
      let alpha = lr < 0.2 ? lr / 0.2 : lr > 0.8 ? (1 - lr) / 0.2 : 1;
      if (pt.life >= pt.maxLife) { pt.x = Math.random() * W; pt.y = Math.random() * H; pt.life = 0; }

      ctx.beginPath();
      ctx.arc(pt.x % W, pt.y, pt.size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = p.accent2 + hex(alpha * 0.15);
      ctx.fill();
    }

    // --- Light sweep ---
    const sweepPhase = (t * 1.5) % 1;
    const sweepX = (sweepPhase - 0.3) * W * 2;
    const sweepW = W * 0.5;
    const sg = ctx.createLinearGradient(sweepX, 0, sweepX + sweepW, 0);
    sg.addColorStop(0, "rgba(255,255,255,0)");
    sg.addColorStop(0.5, `rgba(255,255,255,${0.04 + Math.sin(t * Math.PI) * 0.02})`);
    sg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);

    // --- Vignette ---
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.9);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // --- Bottom gradient for text readability ---
    const btm = ctx.createLinearGradient(0, H * 0.45, 0, H);
    btm.addColorStop(0, "rgba(0,0,0,0)");
    btm.addColorStop(0.5, "rgba(0,0,0,0.4)");
    btm.addColorStop(1, "rgba(0,0,0,0.9)");
    ctx.fillStyle = btm;
    ctx.fillRect(0, 0, W, H);

    // --- Accent line (animated) ---
    const lineY = H - 210;
    const lineProgress = easeOutCubic(Math.min(1, Math.max(0, (t - 0.12) / 0.25)));
    ctx.strokeStyle = p.accent + hex(0.4);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(28, lineY);
    ctx.lineTo(28 + lineProgress * 60, lineY);
    ctx.stroke();

    // --- Text content ---
    // Theme tag (fade in early)
    const tagAlpha = easeOutCubic(Math.min(1, Math.max(0, (t - 0.08) / 0.2)));
    ctx.globalAlpha = tagAlpha * 0.5;
    ctx.font = "700 11px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = p.accent2;
    ctx.letterSpacing = "1px";
    ctx.fillText(`#${theme}`.toUpperCase(), 28, H - 220);
    ctx.globalAlpha = 1;

    // Title (kinetic typography)
    drawAnimatedTitle(ctx, title, 28, H - 175, W - 56, 30, 24, p.text, t);

    // Date + location (slide in)
    const metaT = easeOutCubic(Math.min(1, Math.max(0, (t - 0.35) / 0.25)));
    ctx.globalAlpha = metaT * 0.5;
    ctx.font = "500 12px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = p.text;
    const metaX = 28 + (1 - metaT) * 20;
    ctx.fillText(`${date}  ·  ${location}`, metaX, H - 95);
    ctx.globalAlpha = 1;

    // Description (fade in late)
    const descT = easeOutCubic(Math.min(1, Math.max(0, (t - 0.45) / 0.3)));
    ctx.globalAlpha = descT * 0.35;
    ctx.font = "400 12px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = p.text;
    const desc = description.length > 70 ? description.slice(0, 70) + "..." : description;
    ctx.fillText(desc, 28, H - 68);
    ctx.globalAlpha = 1;

    // --- Film grain (subtle) ---
    const imgData = ctx.getImageData(0, 0, W, H);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 20) {
      const n = (Math.random() - 0.5) * 6;
      d[i] = Math.min(255, Math.max(0, d[i] + n));
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return new Promise<Blob | null>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    recorder.start();
    let frame = 0;
    const interval = setInterval(() => {
      render(frame);
      frame++;
      if (frame >= TOTAL) { clearInterval(interval); recorder.stop(); }
    }, 1000 / FPS);
  });
}
