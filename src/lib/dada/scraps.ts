// Algorithmic placement of poem-word scraps on the poster.
// Each scrap is a small "newspaper cutout" with its own font, paper tone,
// rotation, and torn-edge clip path. Users can drag them after generation.

import { makeRNG, type RNG } from "./rng";
import type { PoemToken } from "./cutup";

export type Scrap = {
  id: string;
  text: string;
  x: number; // center, in poster units (same as W/H)
  y: number;
  rotation: number; // degrees
  fontFamily: string;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  fontSize: number; // px in poster units
  paperTone: string; // background hex
  inkTone: string;
  struck: boolean;
  caps: boolean;
  letterSpacing: number;
  clipPath: string; // CSS polygon(...)
  shadow: string;
  tilt: number; // small additional skew
};

// Mix of newspaper-y and incongruous fonts — feels cut from many sources.
const FONT_SET: { f: string; w: number; s: "normal"|"italic" }[] = [
  { f: '"DM Serif Display", Georgia, serif', w: 400, s: "normal" },
  { f: '"DM Serif Display", Georgia, serif', w: 400, s: "italic" },
  { f: '"Playfair Display", Georgia, serif', w: 700, s: "normal" },
  { f: '"Playfair Display", Georgia, serif', w: 900, s: "italic" },
  { f: '"Anton", Impact, sans-serif', w: 900, s: "normal" },
  { f: '"Bebas Neue", Impact, sans-serif', w: 700, s: "normal" },
  { f: '"Special Elite", "Courier Prime", monospace', w: 400, s: "normal" },
  { f: '"Courier Prime", monospace', w: 700, s: "normal" },
  { f: 'Georgia, "Times New Roman", serif', w: 700, s: "normal" },
  { f: '"Times New Roman", Times, serif', w: 400, s: "italic" },
  { f: '"Abril Fatface", serif', w: 400, s: "normal" },
  { f: '"Major Mono Display", monospace', w: 400, s: "normal" },
];

const PAPER_TONES = [
  "#f3ead0","#efe2c0","#e8d9b0","#dcc998","#f5ecd6","#e9dab7","#d8c189","#f0e2b9","#fbf3d4","#d3b777","#e1d2a3","#ece1ba"
];

const INK_TONES = [
  "#1a1612","#221d18","#0e0a07","#3a2820","#1a1612","#1a1612"
];

function tornEdgePolygon(rng: RNG): string {
  // 8-12 anchor points around a rectangle, each jittered slightly outward/inward
  const pts: string[] = [];
  const segs = rng.rangeInt(10, 16);
  for (let i = 0; i < segs; i++) {
    const t = i / segs;
    // walk around perimeter
    let x = 0, y = 0;
    if (t < 0.25) { x = t*4*100; y = 0; }
    else if (t < 0.5) { x = 100; y = (t-0.25)*4*100; }
    else if (t < 0.75) { x = 100 - (t-0.5)*4*100; y = 100; }
    else { x = 0; y = 100 - (t-0.75)*4*100; }
    // jitter — torn edges
    const jx = rng.range(-3, 3);
    const jy = rng.range(-3, 3);
    pts.push(`${(x+jx).toFixed(1)}% ${(y+jy).toFixed(1)}%`);
  }
  return `polygon(${pts.join(",")})`;
}

export function layoutScraps(
  tokens: PoemToken[],
  W: number,
  H: number,
  seedKey: string,
): Scrap[] {
  const rng = makeRNG("scraps:" + seedKey);
  const scraps: Scrap[] = [];

  // Define a "safe" zone: avoid the headline area roughly H*0.13..H*0.4
  const isInHeadline = (x: number, y: number) => y > H*0.13 && y < H*0.42 && x > W*0.05 && x < W*0.95;

  // Try to spread scraps across both the upper-margin area and lower 2/3.
  const placed: Array<{x: number; y: number; w: number; h: number}> = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const font = rng.pick(FONT_SET);
    const baseSize = rng.range(W*0.018, W*0.045);
    // Make occasional emphatic words bigger
    const fontSize = rng.maybe(0.12) ? baseSize * rng.range(1.5, 2.4) : baseSize;
    const text = tok.caps || rng.maybe(0.18) ? tok.text.toUpperCase() : tok.text;
    const approxW = text.length * fontSize * 0.55 + 18;
    const approxH = fontSize * 1.3 + 12;

    // Try a few placements; accept first that doesn't overlap too much and isn't in headline.
    let x = 0, y = 0;
    let tries = 0;
    while (tries < 25) {
      x = rng.range(W*0.04, W*0.96);
      y = rng.range(H*0.06, H*0.96);
      if (isInHeadline(x, y)) { tries++; continue; }
      const overlap = placed.some((p) =>
        Math.abs(p.x - x) < (p.w + approxW)/2 - 8 &&
        Math.abs(p.y - y) < (p.h + approxH)/2 - 6
      );
      if (!overlap) break;
      tries++;
    }
    placed.push({ x, y, w: approxW, h: approxH });

    scraps.push({
      id: `s${i}`,
      text,
      x, y,
      rotation: rng.range(-18, 18),
      fontFamily: font.f,
      fontWeight: font.w,
      fontStyle: font.s,
      fontSize,
      paperTone: rng.pick(PAPER_TONES),
      inkTone: rng.pick(INK_TONES),
      struck: !!tok.struck,
      caps: !!tok.caps,
      letterSpacing: rng.range(-0.5, 1.5),
      clipPath: tornEdgePolygon(rng),
      shadow: `${rng.range(1,4).toFixed(1)}px ${rng.range(2,6).toFixed(1)}px ${rng.range(2,6).toFixed(1)}px rgba(0,0,0,${rng.range(0.25, 0.5).toFixed(2)})`,
      tilt: rng.range(-2, 2),
    });
  }

  return scraps;
}
