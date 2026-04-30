// Render a Dada manifesto broadside to a canvas.
// Constructivist geometry + stamped manifesto texture, all chance-driven.

import type { Poem, PoemToken } from "./cutup";

const PAPER = "#efe7d3";
const INK = "#1a1612";
const RED = "#a51d1d";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function randi(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function maybe(p: number) {
  return Math.random() < p;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const STAMP_WORDS = [
  "DADA",
  "REFUSÉ",
  "ZÜRICH 1916",
  "MANIFESTE",
  "CABARET VOLTAIRE",
  "ANTI-ART",
  "N° " + randi(3, 99),
  "APPROUVÉ",
  "HASARD",
  "VU",
  "EXEMPLAIRE",
  "SANS TITRE",
];

export type DrawOptions = {
  width: number;
  height: number;
  scale?: number; // pixel density multiplier (e.g. 2 for retina)
};

export function drawManifesto(
  canvas: HTMLCanvasElement,
  poem: Poem,
  opts: DrawOptions,
) {
  const scale = opts.scale ?? 2;
  const W = opts.width;
  const H = opts.height;

  canvas.width = Math.floor(W * scale);
  canvas.height = Math.floor(H * scale);
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // 1. Paper
  drawPaper(ctx, W, H);

  // 2. Masthead
  drawMasthead(ctx, W, H);

  // 3. Geometry pass (background slabs)
  drawGeometry(ctx, W, H);

  // 4. Headline
  drawHeadline(ctx, W, H, poem.headlineWord);

  // 5. Poem columns
  drawPoem(ctx, W, H, poem);

  // 6. Stamps
  drawStamps(ctx, W, H);

  // 7. Ink artifacts
  drawInk(ctx, W, H);

  // 8. Footer marks
  drawFooter(ctx, W, H);
}

function drawPaper(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Grain
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  // Vignette / aged edges
  const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(60,40,20,0.25)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawMasthead(ctx: CanvasRenderingContext2D, W: number, _H: number) {
  const margin = W * 0.05;
  ctx.fillStyle = INK;
  ctx.font = `900 ${W * 0.04}px "Anton", "Bebas Neue", Impact, sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText("DADA", margin, margin);

  ctx.font = `400 ${W * 0.012}px "Special Elite", "Courier Prime", monospace`;
  const issue = `N° ${randi(1, 99).toString().padStart(2, "0")}`;
  const date = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  ctx.fillText(`${issue}   ·   ${date}   ·   PRIX: HASARD`, margin + W * 0.13, margin + W * 0.022);

  // Double rule line
  ctx.fillStyle = INK;
  ctx.fillRect(margin, margin + W * 0.055, W - margin * 2, 4);
  ctx.fillRect(margin, margin + W * 0.055 + 8, W - margin * 2, 1);
}

function drawGeometry(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const count = randi(3, 5);
  for (let i = 0; i < count; i++) {
    const kind = pick(["bar", "circle", "ring", "triangle", "arrow"] as const);
    const color = maybe(0.55) ? RED : INK;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    switch (kind) {
      case "bar": {
        const x = rand(W * 0.05, W * 0.6);
        const y = rand(H * 0.15, H * 0.85);
        const w = rand(W * 0.4, W * 0.9);
        const h = rand(W * 0.015, W * 0.05);
        ctx.translate(x, y);
        ctx.rotate((rand(-25, 25) * Math.PI) / 180);
        ctx.fillRect(-w / 2, -h / 2, w, h);
        break;
      }
      case "circle": {
        const r = rand(W * 0.04, W * 0.13);
        ctx.beginPath();
        ctx.arc(rand(r, W - r), rand(H * 0.2, H - r), r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "ring": {
        const r = rand(W * 0.05, W * 0.15);
        ctx.lineWidth = rand(W * 0.005, W * 0.012);
        ctx.beginPath();
        ctx.arc(rand(r, W - r), rand(H * 0.2, H - r), r, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case "triangle": {
        const s = rand(W * 0.08, W * 0.18);
        const cx = rand(s, W - s);
        const cy = rand(H * 0.2, H - s);
        ctx.translate(cx, cy);
        ctx.rotate((rand(0, 360) * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(s / 2, s / 2);
        ctx.lineTo(-s / 2, s / 2);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "arrow": {
        const len = rand(W * 0.15, W * 0.35);
        const cx = rand(len / 2, W - len / 2);
        const cy = rand(H * 0.25, H * 0.9);
        ctx.translate(cx, cy);
        ctx.rotate((rand(-30, 30) * Math.PI) / 180);
        ctx.lineWidth = W * 0.008;
        ctx.beginPath();
        ctx.moveTo(-len / 2, 0);
        ctx.lineTo(len / 2, 0);
        ctx.stroke();
        // arrowhead
        ctx.beginPath();
        ctx.moveTo(len / 2, 0);
        ctx.lineTo(len / 2 - W * 0.025, -W * 0.018);
        ctx.lineTo(len / 2 - W * 0.025, W * 0.018);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }
    ctx.restore();
  }
}

function drawHeadline(ctx: CanvasRenderingContext2D, W: number, H: number, word: string) {
  const margin = W * 0.05;
  const maxWidth = W - margin * 2;
  // Fit font size to width
  let size = W * 0.22;
  ctx.font = `900 ${size}px "Anton", "Bebas Neue", Impact, sans-serif`;
  while (ctx.measureText(word).width > maxWidth && size > W * 0.08) {
    size *= 0.92;
    ctx.font = `900 ${size}px "Anton", "Bebas Neue", Impact, sans-serif`;
  }
  const y = H * 0.18 + size * 0.85;

  // Red diagonal slab behind
  if (maybe(0.7)) {
    ctx.save();
    ctx.translate(W / 2, y - size * 0.35);
    ctx.rotate((rand(-6, 6) * Math.PI) / 180);
    ctx.fillStyle = RED;
    ctx.fillRect(-W * 0.55, -size * 0.18, W * 1.1, size * 0.55);
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = INK;
  ctx.translate(W / 2, y);
  ctx.rotate((rand(-3, 1) * Math.PI) / 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `900 ${size}px "Anton", "Bebas Neue", Impact, sans-serif`;
  ctx.fillText(word, 0, 0);
  ctx.restore();
}

function drawPoem(ctx: CanvasRenderingContext2D, W: number, H: number, poem: Poem) {
  const margin = W * 0.07;
  const top = H * 0.48;
  const bottom = H * 0.88;
  const cols = maybe(0.6) ? 2 : 1;
  const gutter = W * 0.04;
  const colWidth = (W - margin * 2 - gutter * (cols - 1)) / cols;

  const fontSize = W * 0.018;
  const lineHeight = fontSize * 1.55;
  ctx.font = `400 ${fontSize}px "Special Elite", "Courier Prime", monospace`;
  ctx.fillStyle = INK;
  ctx.textBaseline = "top";

  // Distribute lines across columns
  const linesPerCol = Math.ceil(poem.lines.length / cols);
  for (let c = 0; c < cols; c++) {
    const x = margin + c * (colWidth + gutter);
    const colLines = poem.lines.slice(c * linesPerCol, (c + 1) * linesPerCol);
    ctx.save();
    ctx.translate(x, top);
    ctx.rotate((rand(-0.8, 0.8) * Math.PI) / 180);
    let y = 0;
    for (const line of colLines) {
      drawPoemLine(ctx, line, 0, y, colWidth, fontSize);
      y += lineHeight;
      if (y > bottom - top) break;
    }
    ctx.restore();
  }
}

function drawPoemLine(
  ctx: CanvasRenderingContext2D,
  line: PoemToken[],
  x: number,
  y: number,
  _maxWidth: number,
  fontSize: number,
) {
  let cursor = x;
  const spaceW = ctx.measureText(" ").width;
  for (const tok of line) {
    const text = tok.caps ? tok.text.toUpperCase() : tok.text;
    ctx.fillStyle = INK;
    ctx.fillText(text, cursor, y);
    const w = ctx.measureText(text).width;
    if (tok.struck) {
      ctx.fillStyle = INK;
      ctx.fillRect(cursor - 1, y + fontSize * 0.55, w + 2, Math.max(1.5, fontSize * 0.09));
    }
    cursor += w + spaceW;
  }
}

function drawStamps(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const count = randi(3, 6);
  for (let i = 0; i < count; i++) {
    const isCircle = maybe(0.55);
    const color = maybe(0.5) ? RED : INK;
    const x = rand(W * 0.08, W * 0.92);
    const y = rand(H * 0.08, H * 0.95);
    const rot = (rand(-25, 25) * Math.PI) / 180;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = rand(0.55, 0.85);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(2, W * 0.004);

    const text = pick(STAMP_WORDS);

    if (isCircle) {
      const r = rand(W * 0.045, W * 0.075);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `700 ${r * 0.32}px "Anton", "Bebas Neue", Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 0, 0);
    } else {
      ctx.font = `700 ${W * 0.022}px "Anton", "Bebas Neue", Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const tw = ctx.measureText(text).width;
      const pad = W * 0.012;
      ctx.strokeRect(-tw / 2 - pad, -W * 0.018, tw + pad * 2, W * 0.036);
      ctx.fillText(text, 0, 0);
    }

    // Grain over the stamp — speckle by erasing random bits
    ctx.globalCompositeOperation = "destination-out";
    for (let s = 0; s < 60; s++) {
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(rand(-W * 0.08, W * 0.08), rand(-W * 0.04, W * 0.04), rand(0.5, 2), rand(0.5, 2));
    }
    ctx.restore();
  }
}

function drawInk(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const count = randi(1, 3);
  for (let i = 0; i < count; i++) {
    const cx = rand(W * 0.05, W * 0.95);
    const cy = rand(H * 0.1, H * 0.95);
    const r = rand(W * 0.01, W * 0.04);
    ctx.save();
    ctx.fillStyle = INK;
    ctx.globalAlpha = rand(0.5, 0.9);
    ctx.beginPath();
    const points = randi(8, 14);
    for (let p = 0; p <= points; p++) {
      const a = (p / points) * Math.PI * 2;
      const rr = r * rand(0.6, 1.3);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (p === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    // Splatter
    for (let s = 0; s < randi(3, 8); s++) {
      ctx.beginPath();
      ctx.arc(cx + rand(-r * 3, r * 3), cy + rand(-r * 3, r * 3), rand(0.5, 2.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const margin = W * 0.05;
  ctx.fillStyle = INK;
  ctx.font = `400 ${W * 0.011}px "Special Elite", "Courier Prime", monospace`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const serial = `SÉR. ${randi(1000, 9999)}-${String.fromCharCode(65 + randi(0, 25))}${String.fromCharCode(65 + randi(0, 25))}`;
  ctx.fillText(serial, margin, H - margin * 0.6);

  ctx.textAlign = "right";
  ctx.fillText("IMPRIMÉ PAR LE HASARD", W - margin, H - margin * 0.6);

  // Footer rule
  ctx.fillRect(margin, H - margin, W - margin * 2, 1);
}
