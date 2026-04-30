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
};

const PAPER = "#efe7d3";
const PAPER_2 = "#e8dcb9";
const PAPER_3 = "#d9c79b";
const INK = "#1a1612";
const RED = "#a51d1d";
const BLUE = "#1d3a6b";
const OCHRE = "#b8862a";

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
  const { width: W, height: H, seedKey } = opts;
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
  const colCount = rint(rng,2,4);
  for (let i = 0; i < colCount; i++) {
    const x = rng2(rng, W*0.05, W*0.85);
    const y = rng2(rng, H*0.55, H*0.85);
    const w = rng2(rng, W*0.08, W*0.18);
    const h = rng2(rng, H*0.06, H*0.18);
    const rot = rng2(rng,-3,3);
    parts.push(`<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${rng2(rng,0.25,0.5).toFixed(2)}">
      <rect width="${w}" height="${h}" fill="url(#newscol)"/>
    </g>`);
  }

  // 2. Hidden grid → broken grid composition (anchor points)
  const gridX = rint(rng, 4, 6);
  const gridY = rint(rng, 5, 7);
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
    parts.push(`<g transform="translate(${cx} ${cy}) rotate(${angle})">
      <rect x="${-W*0.6}" y="${-H*0.07}" width="${W*1.2}" height="${H*0.14}" fill="${RED}"/>
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
  const geoCount = rint(rng, 9, 14);
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
  for (let i = 0; i < rint(rng,3,6); i++) {
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
  }

  // 6. Barcode fragments
  for (let i = 0; i < rint(rng,1,3); i++) {
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
  for (let i = 0; i < rint(rng,3,6); i++) {
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
  for (let i = 0; i < rint(rng,4,9); i++) {
    const x1 = rng2(rng,0,W), y1 = rng2(rng,0,H);
    const len = rng2(rng, W*0.05, W*0.25);
    const ang = rng2(rng,0,Math.PI*2);
    parts.push(`<line x1="${x1}" y1="${y1}" x2="${x1+Math.cos(ang)*len}" y2="${y1+Math.sin(ang)*len}" stroke="${INK}" stroke-width="${rng2(rng,0.3,1).toFixed(2)}" opacity="${rng2(rng,0.15,0.4).toFixed(2)}"/>`);
  }

  // 9. Procedural stamps — circular & rectangular & archive labels
  const stampCount = rint(rng, 5, 8);
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

  // 10. Top & bottom mastheads, seed + edition
  parts.push(`<g>
    <rect x="${W*0.05}" y="${W*0.075}" width="${W*0.9}" height="3" fill="${INK}"/>
    <rect x="${W*0.05}" y="${W*0.082}" width="${W*0.9}" height="1" fill="${INK}"/>
    <text x="${W*0.05}" y="${W*0.06}" font-family="Anton, sans-serif" font-weight="900" font-size="${W*0.04}" fill="${INK}">DADA</text>
    <text x="${W*0.18}" y="${W*0.06}" font-family="Courier Prime, monospace" font-size="${W*0.013}" fill="${INK}">${escapeXml(opts.editionLabel)} ${opts.edition.toString().padStart(4,"0")}  ·  ${escapeXml(opts.manifestoLabel)}  ·  ${escapeXml(opts.seedLabel)} ${escapeXml(opts.seedCode)}  ·  LANG ${opts.lang.toUpperCase()}</text>
  </g>`);

  // Footer rule and serial
  parts.push(`<g>
    <rect x="${W*0.05}" y="${H - W*0.05}" width="${W*0.9}" height="1" fill="${INK}"/>
    <text x="${W*0.05}" y="${H - W*0.025}" font-family="Courier Prime, monospace" font-size="${W*0.012}" fill="${INK}">SÉR. ${rint(rng,1000,9999)}-${String.fromCharCode(65+rint(rng,0,25))}${String.fromCharCode(65+rint(rng,0,25))}  ·  IMPRIMÉ PAR LE HASARD</text>
    <text x="${W*0.95}" y="${H - W*0.025}" text-anchor="end" font-family="Anton, sans-serif" font-weight="900" font-size="${W*0.018}" fill="${RED}">${escapeXml(opts.seedCode)}</text>
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
