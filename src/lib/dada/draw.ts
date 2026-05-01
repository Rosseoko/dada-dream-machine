// Rich SVG background for the Dada manifesto.
// Draggable word scraps live as separate HTML, layered on top of this SVG.

import { makeRNG, type RNG } from "./rng";

export type BgOptions = {
  width: number;
  height: number;
  seedKey: string;
  headlineWord: string;
  edition: number;
  seedCode: string;
  langDir: "ltr" | "rtl";
  lang: string;
  manifestoLabel: string;
  editionLabel: string;
  seedLabel: string;
  animalsMode?: boolean;
  isLandscape?: boolean;
};

const PAPER = "#efe7d3";
const PAPER_2 = "#e8dcb9";
const PAPER_3 = "#d9c79b";
const INK = "#1a1612";
const RED = "#a51d1d";
const BLUE = "#1d3a6b";
const OCHRE = "#b8862a";

// Palette C — vintage risograph, tuned for cream paper #efe7d3 + INK outlines
const CRAYON_RED    = "#D95B4A";   // tomato — warm, not aggressive
const CRAYON_BLUE   = "#4A8EC4";   // cornflower — clear mid-blue
const CRAYON_YELLOW = "#C9A020";   // golden amber — actually visible on cream
const CRAYON_GREEN  = "#5A9E6F";   // forest mint — friendly, readable
const CRAYON_ORANGE = "#C97A38";   // burnt sienna — harmonizes with paper
const CRAYON_PURPLE = "#9560C0";   // grape — rich enough to pop

// Animal silhouettes: 3-layer system for sticker-like clarity.
// body = filled+outlined silhouette, dots = solid features (eyes/nose),
// lines = open strokes (whiskers/tails/mouth). Coords centered at (0,0), ~70u span.
const ANIMAL_PATHS: Record<string, { body: string; dots: string; lines: string }> = {

  cat: {
    body:  "M-16,30 Q-22,18 -22,6 Q-22,-8 -18,-14 L-22,-32 L-6,-18 Q0,-20 6,-18 L22,-32 L18,-14 Q22,-8 22,6 Q22,18 16,30 Q0,34 -16,30 Z",
    dots:  "M-8,-6 Q-6,-9 -3,-6 Q-6,-3 -8,-6 Z M3,-6 Q6,-9 8,-6 Q6,-3 3,-6 Z M-2,2 L0,5 L2,2 Z",
    lines: "M22,16 Q36,10 38,-6 Q36,-18 26,-18 M-14,-2 L-4,-2 M-14,2 L-4,1 M14,-2 L4,-2 M14,2 L4,1 M-3,8 Q0,10 3,8",
  },

  dog: {
    body:  "M-12,32 Q-24,28 -24,16 Q-26,8 -22,2 Q-32,-2 -32,-14 Q-28,-26 -18,-26 Q-14,-22 -10,-22 Q0,-26 10,-22 Q14,-22 18,-26 Q28,-26 32,-14 Q32,-2 22,2 Q26,8 24,16 Q24,28 12,32 Q0,34 -12,32 Z",
    dots:  "M-8,-12 Q-6,-15 -3,-12 Q-6,-9 -8,-12 Z M3,-12 Q6,-15 8,-12 Q6,-9 3,-12 Z M-3,-2 Q0,-5 3,-2 Q0,1 -3,-2 Z",
    lines: "M22,16 Q34,8 36,-4 Q36,-14 28,-16 M-3,5 Q0,8 3,5 M0,1 L0,5",
  },

  bird: {
    body:  "M0,-22 Q-22,-20 -24,-4 Q-22,12 -8,16 Q0,18 8,16 Q22,12 24,-4 Q22,-20 0,-22 Z M22,-6 L34,-4 L22,2 Z M-22,-2 L-30,-8 L-30,0 L-30,8 L-22,4 Z",
    dots:  "M14,-12 Q16,-15 18,-12 Q16,-9 14,-12 Z",
    lines: "M-8,-8 Q4,-14 16,-6 Q14,2 4,4 Q-6,2 -8,-8 M-4,16 L-6,24 M4,16 L6,24",
  },

  fish: {
    body:  "M-2,0 Q4,-18 22,-16 Q34,-12 36,0 Q34,12 22,16 Q4,18 -2,0 Z M-2,0 L-22,-12 L-14,0 L-22,12 Z M10,-16 Q16,-26 24,-22 Q22,-16 16,-14 Z",
    dots:  "M26,-4 Q28,-6 30,-4 Q28,-2 26,-4 Z",
    lines: "M14,-8 Q12,0 14,8 M32,-2 Q36,0 32,2 M14,4 Q22,6 28,4",
  },

  rabbit: {
    body:  "M0,28 Q-20,26 -22,10 Q-24,-4 -16,-12 Q-18,-14 -16,-18 Q-14,-38 -8,-38 Q-2,-38 -4,-12 Q0,-14 4,-12 Q2,-38 8,-38 Q14,-38 16,-18 Q18,-14 16,-12 Q24,-4 22,10 Q20,26 0,28 Z M-18,22 Q-26,20 -24,12 Q-18,12 -16,18 Z",
    dots:  "M-7,-2 Q-5,-5 -3,-2 Q-5,1 -7,-2 Z M3,-2 Q5,-5 7,-2 Q5,1 3,-2 Z M-2,4 L0,7 L2,4 Z",
    lines: "M-12,5 L-4,4 M-12,8 L-4,7 M12,5 L4,4 M12,8 L4,7",
  },

  turtle: {
    body:  "M0,10 Q-26,8 -28,-4 Q-26,-22 0,-24 Q26,-22 28,-4 Q26,10 0,10 Z M28,-4 Q36,-6 38,0 Q36,6 28,4 Q24,2 24,-2 Z M-14,8 Q-18,18 -22,22 Q-26,20 -22,12 Q-18,8 -14,6 Z M14,8 Q18,18 22,22 Q26,20 22,12 Q18,8 14,6 Z M-14,-12 Q-18,-22 -22,-22 Q-22,-16 -18,-12 Z M14,-12 Q18,-22 22,-22 Q22,-16 18,-12 Z M-28,-4 L-34,-2 L-32,2 Z",
    dots:  "M32,-2 Q34,-4 36,-2 Q34,0 32,-2 Z",
    lines: "M0,-20 L0,-2 M-12,-18 L-10,-2 M12,-18 L10,-2 M-22,-8 L-8,-4 M22,-8 L8,-4",
  },

  butterfly: {
    body:  "M0,0 Q-12,-6 -22,-20 Q-30,-32 -18,-32 Q-8,-30 0,-12 Z M0,0 Q12,-6 22,-20 Q30,-32 18,-32 Q8,-30 0,-12 Z M0,2 Q-22,6 -26,18 Q-22,28 -10,26 Q-2,22 0,8 Z M0,2 Q22,6 26,18 Q22,28 10,26 Q2,22 0,8 Z M0,-14 Q-2,-4 -2,12 Q0,16 2,12 Q2,-4 0,-14 Z",
    dots:  "M-14,-22 Q-12,-25 -10,-22 Q-12,-19 -14,-22 Z M14,-22 Q16,-25 18,-22 Q16,-19 14,-22 Z M-16,16 Q-14,13 -12,16 Q-14,19 -16,16 Z M16,16 Q18,13 20,16 Q18,19 16,16 Z",
    lines: "M0,-14 Q-4,-22 -8,-30 M0,-14 Q4,-22 8,-30",
  },

  snail: {
    body:  "M-30,16 Q-36,14 -36,8 Q-30,4 -20,6 L20,6 Q26,8 24,14 Q18,18 0,18 Q-20,18 -30,16 Z M-2,4 Q-16,2 -16,-8 Q-14,-18 0,-18 Q14,-18 16,-8 Q14,2 -2,4 Z M-30,12 Q-38,10 -42,4 Q-42,2 -38,2 Q-32,4 -28,8 Z",
    dots:  "M-44,-2 Q-46,-2 -46,0 Q-44,2 -42,0 Q-42,-2 -44,-2 Z M-40,-4 Q-42,-4 -42,-2 Q-40,0 -38,-2 Q-38,-4 -40,-4 Z",
    lines: "M-40,4 L-44,-2 M-36,4 L-40,-4 M0,-2 Q-6,-4 -4,-10 Q2,-14 6,-8 Q4,-2 0,-2",
  },

  elephant: {
    body:  "M-22,-8 Q-26,-22 -8,-24 Q0,-26 10,-24 Q22,-22 26,-8 Q28,8 22,16 Q12,18 -10,18 Q-22,18 -26,12 Q-28,2 -22,-8 Z M16,-20 Q30,-20 32,-8 Q32,2 26,4 Q20,4 16,-2 Q14,-12 16,-20 Z M30,-2 Q34,6 32,16 Q30,24 22,24 Q22,20 26,18 Q24,12 22,14 Z M-8,-18 Q-22,-16 -24,-2 Q-22,8 -10,8 Q-6,2 -6,-10 Z M-20,16 L-22,28 L-14,28 L-14,16 Z M-6,18 L-8,30 L0,30 L0,18 Z M8,18 L8,30 L16,30 L16,18 Z M18,14 L18,28 L24,28 L22,14 Z M-26,2 Q-32,4 -34,-2 L-32,-4 Z",
    dots:  "M22,-12 Q24,-14 26,-12 Q24,-10 22,-12 Z",
    lines: "M22,4 Q28,12 24,16",
  },

  lion: {
    body:  "M0,4 Q-32,-2 -34,-18 Q-32,-36 -14,-38 Q0,-40 14,-38 Q32,-36 34,-18 Q32,-2 0,4 Z M0,-2 Q-16,-4 -18,-16 Q-16,-28 0,-30 Q16,-28 18,-16 Q16,-4 0,-2 Z M-12,-30 L-16,-38 L-6,-32 Z M12,-30 L16,-38 L6,-32 Z M-12,4 Q-14,16 0,18 Q14,16 12,4 Z",
    dots:  "M-8,-18 Q-6,-21 -3,-18 Q-6,-15 -8,-18 Z M3,-18 Q6,-21 8,-18 Q6,-15 3,-18 Z M-2,-10 L0,-7 L2,-10 Z",
    lines: "M-6,-6 Q0,-2 6,-6 M0,-32 L0,-38 M-14,-26 L-22,-32 M14,-26 L22,-32 M-18,-12 L-30,-12 M18,-12 L30,-12",
  },

  frog: {
    body:  "M0,16 Q-26,12 -28,-2 Q-26,-14 -14,-16 Q-12,-22 -6,-18 L-2,-12 L2,-12 L6,-18 Q12,-22 14,-16 Q26,-14 28,-2 Q26,12 0,16 Z M-12,-18 Q-18,-24 -16,-12 Q-12,-8 -8,-10 Q-6,-16 -12,-18 Z M12,-18 Q18,-24 16,-12 Q12,-8 8,-10 Q6,-16 12,-18 Z M-26,4 Q-36,8 -38,14 Q-32,18 -28,12 Q-24,8 -26,4 Z M26,4 Q36,8 38,14 Q32,18 28,12 Q24,8 26,4 Z M-18,16 Q-22,26 -28,28 Q-34,28 -32,20 Q-26,18 -22,14 Z M18,16 Q22,26 28,28 Q34,28 32,20 Q26,18 22,14 Z",
    dots:  "M-12,-16 Q-10,-18 -10,-15 Q-12,-13 -12,-16 Z M12,-16 Q14,-18 14,-15 Q12,-13 12,-16 Z",
    lines: "M-10,4 Q0,12 10,4",
  },

  duck: {
    body:  "M-2,-12 Q-22,-10 -24,4 Q-22,16 0,18 Q22,16 24,4 Q22,-10 -2,-12 Z M16,-12 Q24,-14 24,-4 Q22,4 14,4 Q8,2 8,-6 Q10,-12 16,-12 Z M22,-6 L34,-4 L22,2 L24,-2 Z M-4,-4 Q6,-12 16,-6 Q18,-2 14,4 Q4,4 -4,-4 Z M-22,2 L-32,-4 L-30,2 L-32,8 L-22,6 Z",
    dots:  "M18,-8 Q20,-10 22,-8 Q20,-6 18,-8 Z",
    lines: "M22,-2 L34,-4 M-2,18 L-2,26 M6,18 L6,26",
  },

  jellyfish: {
    body:  "M0,4 Q-28,4 -30,-8 Q-26,-26 -12,-32 Q0,-36 12,-32 Q26,-26 30,-8 Q28,4 0,4 Z M-30,-2 Q-26,4 -22,-1 Q-18,4 -14,-1 Q-10,4 -6,-1 Q-2,4 2,-1 Q6,4 10,-1 Q14,4 18,-1 Q22,4 26,-1 Q30,4 30,-2 L-30,-2 Z",
    dots:  "M-10,-14 Q-8,-16 -6,-14 Q-8,-12 -10,-14 Z M6,-18 Q8,-20 10,-18 Q8,-16 6,-18 Z M14,-8 Q16,-10 18,-8 Q16,-6 14,-8 Z M-18,-8 Q-16,-10 -14,-8 Q-16,-6 -18,-8 Z",
    lines: "M-22,4 Q-26,16 -20,28 Q-16,40 -22,50 M-14,4 Q-16,18 -12,30 Q-8,42 -14,52 M-6,4 Q-6,20 -4,32 Q-2,44 -6,54 M4,4 Q6,20 4,32 Q4,44 6,54 M12,4 Q14,16 12,28 Q10,40 14,50 M20,4 Q24,14 20,26 Q16,38 22,48",
  },

  axolotl: {
    // A wider, flatter head for that classic "chonky" axolotl look
    body: [
      "M-35,0 Q-35,-25 0,-25 Q35,-25 35,0 Q35,20 0,20 Q-35,20 -35,0 Z", 
      // Left stubby leg
      "M-25,15 Q-30,25 -25,30 Q-20,30 -18,20",
      // Right stubby leg
      "M25,15 Q30,25 25,30 Q20,30 18,20",
      // Paddle tail peeking from behind
      "M-10,20 Q0,40 10,20 Z"
    ].join(" "),

    // Wide-set eyes and a tiny boop-able nose
    dots: [
      "M-22,-5 A3,3 0 1,0 -16,-5 A3,3 0 1,0 -22,-5", // Left eye
      "M16,-5 A3,3 0 1,0 22,-5 A3,3 0 1,0 16,-5",   // Right eye
      "M-2,2 L-1,3 M1,3 L2,2"                      // Tiny nostrils
    ].join(" "),

    // Lateral gill stalks and the signature "derpy" smile
    lines: [
      // The "I have no thoughts, only vibes" smile
      "M-12,8 Q0,16 12,8",
      // LEFT GILLS (Top, Middle, Bottom)
      "M-32,-10 Q-50,-15 -55,-5", "M-55,-5 L-50,-8 M-55,-5 L-52,-2",
      "M-35,0 Q-55,0 -60,10", "M-60,10 L-55,8 M-60,10 L-57,13",
      "M-32,10 Q-50,15 -55,25", "M-55,25 L-50,22 M-55,25 L-52,28",
      // RIGHT GILLS (Top, Middle, Bottom)
      "M32,-10 Q50,-15 55,-5", "M55,-5 L50,-8 M55,-5 L52,-2",
      "M35,0 Q55,0 60,10", "M60,10 L55,8 M60,10 L57,13",
      "M32,10 Q50,15 55,25", "M55,25 L50,22 M55,25 L52,28"
    ].join(" "),
  }

  
};

// Procedural Dada-style stamp phrases — much wider variety.
const STAMP_BANK = [
  "DADA","ANTI-ART","ANTI-ORDER","PRINT ERROR","CERTIFIED ACCIDENT",
  "HASARD","REFUSÉ","APPROUVÉ","CENSORED","NOISE",
  "VOID","SANS RAISON","VU","EXEMPLAIRE","SANS TITRE",
  "MANIFESTE","CABARET","ZÜRICH","BERLIN","PARIS",
  "NOT FOR SALE","FRAGILE","RETURN TO SENDER","FILE No.",
  "LOST PROOF","PROOF #","ARCHIVE","REJECTED","SUSPECT",
  "DO NOT FOLD","DUPLICATE","ORIGINAL","COPY OF COPY","TRUE FAKE",
  "ANTI-LOGIC","CHANCE","BRUIT","SCANDALE","MERZ",
  "SECTION 7B","BOX 14","DOSSIER","CONFIDENTIEL","NON CLASSÉ",
  "BAD PRINT","SLIPPAGE","OFFSET","INK BLEED","OVERPRINT",
];

const ARCHIVE_PREFIX = ["ARC","DOC","REF","FILE","BOX","SÉR","LOT","REG","FOLIO","CASE"];

function rint(rng: RNG, a: number, b: number) { return rng.rangeInt(a, b); }
function rng2(rng: RNG, a: number, b: number) { return rng.range(a, b); }

export function buildBackgroundSVG(opts: BgOptions): string {
  const { width: W, height: H, seedKey, isLandscape } = opts;
  const rng = makeRNG("bg:" + seedKey);
  const parts: string[] = [];

  // Defs: filters for grain / torn / halftone tile
  parts.push(`<defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${rint(rng,1,99)}" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="${rint(rng,1,99)}"/>
      <feDisplacementMap in="SourceGraphic" scale="6"/>
    </filter>
    <pattern id="halftone" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="2.2" fill="${INK}"/>
    </pattern>
    <pattern id="halftone-red" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.6" fill="${RED}"/>
    </pattern>
    <pattern id="newscol" x="0" y="0" width="6" height="14" patternUnits="userSpaceOnUse">
      <rect width="5" height="2" fill="${INK}" opacity="0.6"/>
      <rect y="4" width="4" height="2" fill="${INK}" opacity="0.5"/>
      <rect y="8" width="5" height="2" fill="${INK}" opacity="0.55"/>
      <rect y="12" width="3" height="1.5" fill="${INK}" opacity="0.5"/>
    </pattern>
  </defs>`);

  // 1. Paper base + warm gradient
  parts.push(`<rect width="${W}" height="${H}" fill="${PAPER}"/>`);
  parts.push(`<rect width="${W}" height="${H}" fill="url(#halftone)" opacity="0.04"/>`);

  // Subtle paper-tone patches (stained areas)
  for (let i = 0; i < 6; i++) {
    const cx = rng2(rng, 0, W), cy = rng2(rng, 0, H);
    const r = rng2(rng, W*0.15, W*0.45);
    const c = rng.pick([PAPER_2, PAPER_3]);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="${rng2(rng,0.15,0.35).toFixed(2)}"/>`);
  }

  // Folded paper crease lines
  for (let i = 0; i < rint(rng,2,4); i++) {
    const y = rng2(rng, H*0.1, H*0.9);
    const skew = rng2(rng,-20,20);
    parts.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y+skew}" stroke="${INK}" stroke-width="0.6" opacity="0.12"/>`);
  }

  // Faux newspaper text columns (background texture)
  // Landscape: fewer columns for less density
  const colCount = isLandscape ? rint(rng, 1, 2) : rint(rng, 2, 4);
  for (let i = 0; i < colCount; i++) {
    const x = rng2(rng, W*0.05, W*0.85);
    const y = rng2(rng, H*0.55, H*0.85);
    const w = rng2(rng, W*0.08, W*0.18);
    const h = rng2(rng, H*0.06, H*0.18);
    const rot = rng2(rng,-3,3);
    // In animals mode, use bright primary colors for newspaper texture
    const fillPattern = opts.animalsMode 
      ? rng.pick([CRAYON_RED, CRAYON_BLUE, CRAYON_YELLOW, CRAYON_GREEN, CRAYON_ORANGE, CRAYON_PURPLE])
      : "url(#newscol)";
    parts.push(`<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${rng2(rng,0.25,0.5).toFixed(2)}">
      <rect width="${w}" height="${h}" fill="${fillPattern}"/>
    </g>`);
  }

  // 2. Hidden grid → broken grid composition (anchor points)
  // Landscape: fewer anchors for less density
  const gridX = isLandscape ? rint(rng, 5, 7) : rint(rng, 4, 6);
  const gridY = isLandscape ? rint(rng, 3, 4) : rint(rng, 5, 7);
  const cellW = W / gridX;
  const cellH = H / gridY;
  const anchors: Array<[number, number]> = [];
  for (let gx = 0; gx < gridX; gx++) {
    for (let gy = 0; gy < gridY; gy++) {
      anchors.push([gx*cellW + cellW/2 + rng2(rng,-cellW*0.3, cellW*0.3),
                    gy*cellH + cellH/2 + rng2(rng,-cellH*0.3, cellH*0.3)]);
    }
  }
  // shuffle anchors so we pick varied spots
  const anchorPool = rng.shuffle(anchors);
  let ai = 0;
  const nextAnchor = () => anchorPool[(ai++) % anchorPool.length];

  // 3. Big constructivist headline slab — diagonal red bar
  {
    const [cx, cy] = [W/2, H*0.25];
    const angle = rng2(rng,-10,8);
    // In animals mode, use random primary color for headline strip
    const headlineColor = opts.animalsMode 
      ? rng.pick([CRAYON_RED, CRAYON_BLUE, CRAYON_YELLOW, CRAYON_GREEN, CRAYON_ORANGE, CRAYON_PURPLE])
      : RED;
    parts.push(`<g transform="translate(${cx} ${cy}) rotate(${angle})">
      <rect x="${-W*0.6}" y="${-H*0.07}" width="${W*1.2}" height="${H*0.14}" fill="${headlineColor}"/>
      <rect x="${-W*0.6}" y="${H*0.06}" width="${W*1.2}" height="${H*0.008}" fill="${INK}"/>
    </g>`);
    // Headline text — placed by SVG, big condensed face.
    const fontSize = Math.min(W * 0.22, (W*0.9) / Math.max(opts.headlineWord.length*0.6, 1));
    parts.push(`<g transform="translate(${cx} ${cy + fontSize*0.32}) rotate(${angle})">
      <text text-anchor="middle" font-family="Anton, 'Bebas Neue', Impact, sans-serif"
            font-weight="900" font-size="${fontSize}" fill="${INK}"
            letter-spacing="-2">${escapeXml(opts.headlineWord)}</text>
    </g>`);
  }

  // 4. Layered geometry — bars, circles, rings, triangles, arrows, halftone shapes
  // Landscape: fewer geometric elements for less density
  const geoCount = isLandscape ? rint(rng, 5, 9) : rint(rng, 9, 14);
  for (let i = 0; i < geoCount; i++) {
    const kind = rng.pick(["bar","circle","ring","triangle","arrow","halfcircle","halftoneRect","warpCircle"] as const);
    const color = rng.maybe(0.45) ? RED : rng.maybe(0.6) ? INK : rng.pick([BLUE, OCHRE, INK]);
    const [ax, ay] = nextAnchor();
    switch (kind) {
      case "bar": {
        const w = rng2(rng, W*0.15, W*0.55);
        const h = rng2(rng, W*0.012, W*0.04);
        const r = rng2(rng,-30,30);
        parts.push(`<rect x="${ax-w/2}" y="${ay-h/2}" width="${w}" height="${h}" fill="${color}" transform="rotate(${r} ${ax} ${ay})"/>`);
        break;
      }
      case "circle": {
        const r = rng2(rng, W*0.025, W*0.09);
        parts.push(`<circle cx="${ax}" cy="${ay}" r="${r}" fill="${color}"/>`);
        break;
      }
      case "ring": {
        const r = rng2(rng, W*0.04, W*0.12);
        const sw = rng2(rng, W*0.005, W*0.014);
        parts.push(`<circle cx="${ax}" cy="${ay}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>`);
        break;
      }
      case "triangle": {
        const s = rng2(rng, W*0.05, W*0.14);
        const rot = rng2(rng,0,360);
        parts.push(`<polygon points="0,${-s/2} ${s/2},${s/2} ${-s/2},${s/2}" fill="${color}" transform="translate(${ax} ${ay}) rotate(${rot})"/>`);
        break;
      }
      case "arrow": {
        const len = rng2(rng, W*0.12, W*0.3);
        const rot = rng2(rng,-30,30);
        const sw = W*0.008;
        parts.push(`<g transform="translate(${ax} ${ay}) rotate(${rot})" stroke="${color}" fill="${color}" stroke-width="${sw}">
          <line x1="${-len/2}" y1="0" x2="${len/2}" y2="0"/>
          <polygon points="${len/2},0 ${len/2 - W*0.025},${-W*0.018} ${len/2 - W*0.025},${W*0.018}"/>
        </g>`);
        break;
      }
      case "halfcircle": {
        const r = rng2(rng, W*0.05, W*0.13);
        const rot = rng2(rng,0,360);
        parts.push(`<path d="M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 Z" fill="${color}" transform="translate(${ax} ${ay}) rotate(${rot})"/>`);
        break;
      }
      case "halftoneRect": {
        const w = rng2(rng, W*0.08, W*0.22);
        const h = rng2(rng, W*0.05, W*0.16);
        const rot = rng2(rng,-15,15);
        const fill = rng.maybe(0.5) ? "url(#halftone)" : "url(#halftone-red)";
        parts.push(`<rect x="${ax-w/2}" y="${ay-h/2}" width="${w}" height="${h}" fill="${fill}" transform="rotate(${rot} ${ax} ${ay})" opacity="0.85"/>`);
        break;
      }
      case "warpCircle": {
        const r = rng2(rng, W*0.04, W*0.11);
        parts.push(`<circle cx="${ax}" cy="${ay}" r="${r}" fill="${color}" filter="url(#rough)" opacity="0.85"/>`);
        break;
      }
    }
  }

  // 5. Torn polygon shards
  // Landscape: fewer shards for less density
  const shardCount = isLandscape ? rint(rng, 3, 5) : rint(rng, 4, 8);
  for (let i = 0; i < shardCount; i++) {
    const [cx, cy] = nextAnchor();
    const r = rng2(rng, W*0.04, W*0.12);
    const pts: string[] = [];
    const n = rint(rng, 6, 11);
    for (let p = 0; p < n; p++) {
      const a = (p/n) * Math.PI*2;
      const rr = r * rng2(rng, 0.4, 1.4);
      pts.push(`${cx + Math.cos(a)*rr},${cy + Math.sin(a)*rr}`);
    }
    const col = rng.pick([PAPER_3, INK, RED, OCHRE]);
    parts.push(`<polygon points="${pts.join(" ")}" fill="${col}" opacity="${rng2(rng,0.5,0.85).toFixed(2)}"/>`);
    for (let s = 0; s < rint(rng,4,9); s++) {
      parts.push(`<circle cx="${cx + rng2(rng,-r*4,r*4)}" cy="${cy + rng2(rng,-r*4,r*4)}" r="${rng2(rng,0.5,2.5).toFixed(1)}" fill="${INK}" opacity="0.8"/>`);
    }
  }

  // 6. Barcode fragments
  // Landscape: fewer barcodes for less density
  const barcodeCount = isLandscape ? rint(rng, 0, 2) : rint(rng, 1, 3);
  for (let i = 0; i < barcodeCount; i++) {
    const x = rng2(rng, W*0.05, W*0.8);
    const y = rng2(rng, H*0.1, H*0.92);
    const bw = rng2(rng, W*0.08, W*0.16);
    const bh = rng2(rng, H*0.025, H*0.05);
    const rot = rng2(rng,-8,8);
    let bars = "";
    let cx = 0;
    while (cx < bw) {
      const w = rng2(rng, 1, 4);
      bars += `<rect x="${cx}" y="0" width="${w}" height="${bh}" fill="${INK}"/>`;
      cx += w + rng2(rng, 1, 3);
    }
    parts.push(`<g transform="translate(${x} ${y}) rotate(${rot})">${bars}
      <text x="0" y="${bh+10}" font-family="Courier Prime, monospace" font-size="9" fill="${INK}">${rint(rng,1000000,9999999)} ${rint(rng,10,99)}</text>
    </g>`);
  }

  // 7. Ink splatters
  // Landscape: fewer splatters for less density
  const splatterCount = isLandscape ? rint(rng, 1, 3) : rint(rng, 3, 6);
  for (let i = 0; i < splatterCount; i++) {
    const cx = rng2(rng, W*0.05, W*0.95);
    const cy = rng2(rng, H*0.08, H*0.95);
    const r = rng2(rng, W*0.008, W*0.03);
    const pts: string[] = [];
    const n = rint(rng, 8, 14);
    for (let p = 0; p < n; p++) {
      const a = (p/n)*Math.PI*2;
      const rr = r * rng2(rng, 0.6, 1.4);
      pts.push(`${cx + Math.cos(a)*rr},${cy + Math.sin(a)*rr}`);
    }
    parts.push(`<polygon points="${pts.join(" ")}" fill="${INK}" opacity="${rng2(rng,0.6,0.9).toFixed(2)}"/>`);
    for (let s = 0; s < rint(rng,4,9); s++) {
      parts.push(`<circle cx="${cx + rng2(rng,-r*4,r*4)}" cy="${cy + rng2(rng,-r*4,r*4)}" r="${rng2(rng,0.5,2.5).toFixed(1)}" fill="${INK}" opacity="0.8"/>`);
    }
  }

  // 8. Scratches
  // Landscape: fewer scratches for less density
  const scratchCount = isLandscape ? rint(rng, 2, 4) : rint(rng, 4, 7);
  for (let i = 0; i < scratchCount; i++) {
    const x1 = rng2(rng,0,W), y1 = rng2(rng,0,H);
    const len = rng2(rng, W*0.05, W*0.25);
    const ang = rng2(rng,0,Math.PI*2);
    parts.push(`<line x1="${x1}" y1="${y1}" x2="${x1+Math.cos(ang)*len}" y2="${y1+Math.sin(ang)*len}" stroke="${INK}" stroke-width="${rng2(rng,0.3,1).toFixed(2)}" opacity="${rng2(rng,0.15,0.4).toFixed(2)}"/>`);
  }

  // 9. Procedural stamps — circular & rectangular & archive labels
  // Landscape: fewer stamps for less density
  const stampCount = isLandscape ? rint(rng, 3, 5) : rint(rng, 5, 8);
  for (let i = 0; i < stampCount; i++) {
    const kind = rng.pick(["circle","rect","archive"] as const);
    const text = rng.pick(STAMP_BANK);
    const color = rng.maybe(0.55) ? RED : INK;
    const [x, y] = nextAnchor();
    const rot = rng2(rng,-28,28);
    const opacity = rng2(rng,0.55,0.85).toFixed(2);
    if (kind === "circle") {
      const r = rng2(rng, W*0.045, W*0.08);
      parts.push(`<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${opacity}" filter="url(#rough)">
        <circle cx="0" cy="0" r="${r}" fill="none" stroke="${color}" stroke-width="3"/>
        <circle cx="0" cy="0" r="${r*0.78}" fill="none" stroke="${color}" stroke-width="2"/>
        <text text-anchor="middle" dominant-baseline="middle" font-family="Anton, sans-serif" font-weight="900" font-size="${r*0.34}" fill="${color}">${escapeXml(text)}</text>
        <text text-anchor="middle" dominant-baseline="middle" y="${r*0.55}" font-family="Courier Prime, monospace" font-size="${r*0.18}" fill="${color}">N°${rint(rng,10,9999)}</text>
      </g>`);
    } else if (kind === "rect") {
      const fontSize = W*0.022;
      const tw = text.length * fontSize * 0.55;
      const pad = W*0.012;
      parts.push(`<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${opacity}" filter="url(#rough)">
        <rect x="${-tw/2-pad}" y="${-W*0.022}" width="${tw+pad*2}" height="${W*0.044}" fill="none" stroke="${color}" stroke-width="3"/>
        <text text-anchor="middle" dominant-baseline="middle" font-family="Anton, sans-serif" font-weight="900" font-size="${fontSize}" fill="${color}">${escapeXml(text)}</text>
      </g>`);
    } else {
      // archive label — small typewritten paper tag
      const code = `${rng.pick(ARCHIVE_PREFIX)}-${rint(rng,100,9999)}/${String.fromCharCode(65+rint(rng,0,25))}${String.fromCharCode(65+rint(rng,0,25))}`;
      const w = W*0.13, h = W*0.04;
      parts.push(`<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${opacity}">
        <rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
        <text text-anchor="middle" dominant-baseline="middle" y="-3" font-family="Courier Prime, monospace" font-size="${W*0.012}" fill="${INK}">${escapeXml(code)}</text>
        <text text-anchor="middle" dominant-baseline="middle" y="${W*0.013}" font-family="Courier Prime, monospace" font-size="${W*0.0095}" fill="${INK}" opacity="0.75">${escapeXml(text)}</text>
      </g>`);
    }
  }

  // 9.5. Animals mode: Add animal silhouettes and scribbles
  // Landscape: fewer animals and scribbles for less density
  if (opts.animalsMode) {
    // Add animal silhouettes
    const animalCount = isLandscape ? rint(rng, 3, 6) : rint(rng, 6, 10);
    parts.push(generateAnimals(rng, W, H, animalCount, anchors));
    
    // Add child-like scribbles
    const scribbleCount = isLandscape ? rint(rng, 4, 8) : rint(rng, 8, 15);
    parts.push(generateScribbles(rng, W, H, scribbleCount));
  }

  // 10. Top & bottom mastheads, seed + edition
  // Landscape: wider coverage for newspaper spread feel
  const mastheadWidth = isLandscape ? W*0.98 : W*0.9;
  const mastheadX = isLandscape ? W*0.01 : W*0.05;
  // Landscape: larger fonts for newspaper masthead feel
  const dadaSize = isLandscape ? W*0.06 : W*0.04;
  const metaSize = isLandscape ? W*0.018 : W*0.013;
  const metaX = isLandscape ? W*0.14 : W*0.18;
  parts.push(`<g>
    <rect x="${mastheadX}" y="${W*0.09}" width="${mastheadWidth}" height="${isLandscape ? 4 : 3}" fill="${INK}"/>
    <rect x="${mastheadX}" y="${W*0.098}" width="${mastheadWidth}" height="${isLandscape ? 2 : 1}" fill="${INK}"/>
    <text x="${mastheadX}" y="${W*0.07}" font-family="Anton, sans-serif" font-weight="900" font-size="${dadaSize}" fill="${INK}">DADA</text>
    <text x="${metaX}" y="${W*0.07}" font-family="Courier Prime, monospace" font-size="${metaSize}" fill="${INK}">${escapeXml(opts.editionLabel)} ${opts.edition.toString().padStart(4,"0")}  ·  ${escapeXml(opts.manifestoLabel)}  ·  ${escapeXml(opts.seedLabel)} ${escapeXml(opts.seedCode)}  ·  LANG ${opts.lang.toUpperCase()}</text>
  </g>`);

  // Footer rule and serial
  // Landscape: larger footer text
  const footerSize = isLandscape ? W*0.016 : W*0.012;
  const seedCodeSize = isLandscape ? W*0.024 : W*0.018;
  parts.push(`<g>
    <rect x="${mastheadX}" y="${H - W*0.06}" width="${mastheadWidth}" height="${isLandscape ? 2 : 1}" fill="${INK}"/>
    <text x="${mastheadX}" y="${H - W*0.03}" font-family="Courier Prime, monospace" font-size="${footerSize}" fill="${INK}">SÉR. ${rint(rng,1000,9999)}-${String.fromCharCode(65+rint(rng,0,25))}${String.fromCharCode(65+rint(rng,0,25))}  ·  IMPRIMÉ PAR LE HASARD</text>
    <text x="${isLandscape ? W*0.99 : W*0.95}" y="${H - W*0.03}" text-anchor="end" font-family="Anton, sans-serif" font-weight="900" font-size="${seedCodeSize}" fill="${RED}">${escapeXml(opts.seedCode)}</text>
  </g>`);

  // 11. Vignette / aged edges
  parts.push(`<rect width="${W}" height="${H}" fill="url(#vgrad)" opacity="0.25" pointer-events="none"/>`);
  parts.push(`<defs><radialGradient id="vgrad" cx="50%" cy="50%" r="75%">
    <stop offset="40%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="100%" stop-color="rgba(60,40,20,0.6)"/>
  </radialGradient></defs>`);

  // 12. Heavy grain overlay
  parts.push(`<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.6"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet">${parts.join("")}</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;","'":"&apos;"}[c]!));
}

// Generate child-like geometric scribbles for animals mode
function generateScribbles(rng: RNG, W: number, H: number, count: number): string {
  const parts: string[] = [];
  const colors = [CRAYON_RED, CRAYON_BLUE, CRAYON_YELLOW, CRAYON_GREEN, CRAYON_ORANGE, CRAYON_PURPLE];
  const shapes = ["line", "circle", "spiral", "zigzag", "triangle", "star"];
  
  for (let i = 0; i < count; i++) {
    const x = rng2(rng, W*0.05, W*0.95);
    const y = rng2(rng, H*0.05, H*0.95);
    const color = rng.pick(colors);
    const shape = rng.pick(shapes);
    const size = rng2(rng, W*0.03, W*0.12);
    const strokeWidth = rng2(rng, 3, 6);
    const opacity = rng2(rng, 0.5, 0.85);
    const rot = rng2(rng, 0, 360);
    
    switch (shape) {
      case "line": {
        const len = rng2(rng, W*0.05, W*0.25);
        const angle = rng2(rng, 0, Math.PI * 2);
        const x2 = x + Math.cos(angle) * len;
        const y2 = y + Math.sin(angle) * len;
        parts.push(`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" 
          stroke="${color}" stroke-width="${strokeWidth.toFixed(1)}" 
          stroke-linecap="round" opacity="${opacity.toFixed(2)}" filter="url(#rough)"/>`);
        break;
      }
      case "circle": {
        const r = size;
        parts.push(`<circle cx="${x}" cy="${y}" r="${r}" 
          fill="none" stroke="${color}" stroke-width="${strokeWidth.toFixed(1)}" 
          opacity="${opacity.toFixed(2)}" filter="url(#rough)"/>`);
        break;
      }
      case "spiral": {
        const points: string[] = [];
        const turns = rint(rng, 2, 4);
        const segments = turns * 20;
        for (let j = 0; j <= segments; j++) {
          const t = j / segments;
          const angle = t * turns * Math.PI * 2;
          const r = size * t;
          const px = x + Math.cos(angle) * r;
          const py = y + Math.sin(angle) * r;
          points.push(`${px},${py}`);
        }
        parts.push(`<polyline points="${points.join(" ")}" 
          fill="none" stroke="${color}" stroke-width="${strokeWidth.toFixed(1)}" 
          stroke-linecap="round" stroke-linejoin="round"
          opacity="${opacity.toFixed(2)}" filter="url(#rough)"/>`);
        break;
      }
      case "zigzag": {
        const points: string[] = [];
        const len = rng2(rng, W*0.08, W*0.2);
        const segments = rint(rng, 6, 12);
        const angle = rng2(rng, 0, Math.PI * 2);
        for (let j = 0; j <= segments; j++) {
          const t = j / segments;
          const baseX = x + Math.cos(angle) * len * t;
          const baseY = y + Math.sin(angle) * len * t;
          const offset = (j % 2 === 0 ? 1 : -1) * size * 0.5;
          const perpAngle = angle + Math.PI / 2;
          const px = baseX + Math.cos(perpAngle) * offset;
          const py = baseY + Math.sin(perpAngle) * offset;
          points.push(`${px},${py}`);
        }
        parts.push(`<polyline points="${points.join(" ")}" 
          fill="none" stroke="${color}" stroke-width="${strokeWidth.toFixed(1)}" 
          stroke-linecap="round" stroke-linejoin="round"
          opacity="${opacity.toFixed(2)}" filter="url(#rough)"/>`);
        break;
      }
      case "triangle": {
        const r = size;
        const points = [
          `${x},${y - r}`,
          `${x - r * 0.866},${y + r * 0.5}`,
          `${x + r * 0.866},${y + r * 0.5}`,
          `${x},${y - r}`
        ];
        parts.push(`<polygon points="${points.join(" ")}" 
          fill="none" stroke="${color}" stroke-width="${strokeWidth.toFixed(1)}" 
          opacity="${opacity.toFixed(2)}" filter="url(#rough)" 
          transform="rotate(${rot} ${x} ${y})"/>`);
        break;
      }
      case "star": {
        const r = size;
        const points: string[] = [];
        const pointsCount = 5;
        for (let j = 0; j < pointsCount * 2; j++) {
          const angle = (j * Math.PI) / pointsCount - Math.PI / 2;
          const radius = j % 2 === 0 ? r : r * 0.4;
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius;
          points.push(`${px},${py}`);
        }
        points.push(points[0]);
        parts.push(`<polygon points="${points.join(" ")}" 
          fill="none" stroke="${color}" stroke-width="${strokeWidth.toFixed(1)}" 
          opacity="${opacity.toFixed(2)}" filter="url(#rough)"/>`);
        break;
      }
    }
  }
  
  return parts.join("");
}

// Generate animal silhouettes for animals mode
function generateAnimals(rng: RNG, W: number, H: number, count: number, anchors: Array<[number, number]>): string {
  const parts: string[] = [];
  const colors = [CRAYON_RED, CRAYON_BLUE, CRAYON_YELLOW, CRAYON_GREEN, CRAYON_ORANGE, CRAYON_PURPLE];
  const animalNames = Object.keys(ANIMAL_PATHS);

  for (let i = 0; i < count; i++) {
    const animalType = rng.pick(animalNames);
    const animal = ANIMAL_PATHS[animalType];
    const color = rng.pick(colors);
    const [ax, ay] = rng.pick(anchors);

    // Slightly larger range now that animals read clearly
    const scale = rng2(rng, W * 0.0014, W * 0.0024);
    // Tighter rotation — animals stay recognizable, still feel hand-placed
    const rot = rng2(rng, -20, 20);
    const opacity = rng2(rng, 0.88, 1.0).toFixed(2);

    // Stroke widths in path-units. They scale with the animal so proportions stay right.
    parts.push(
      `<g transform="translate(${ax} ${ay}) rotate(${rot}) scale(${scale})" opacity="${opacity}">
        <path d="${animal.body}" fill="${color}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="${animal.dots}" fill="${INK}"/>
        <path d="${animal.lines}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`
    );
  }

  return parts.join("");
}
