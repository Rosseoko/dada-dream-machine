// Seeded RNG (mulberry32) + seed code helpers.

export type RNG = {
  next: () => number; // [0,1)
  range: (min: number, max: number) => number;
  rangeInt: (min: number, max: number) => number;
  pick: <T>(arr: readonly T[]) => T;
  maybe: (p: number) => boolean;
  shuffle: <T>(arr: readonly T[]) => T[];
};

function xfnv1a(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRNG(seedKey: string): RNG {
  const next = mulberry32(xfnv1a(seedKey));
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    rangeInt: (min, max) => Math.floor(min + next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    maybe: (p) => next() < p,
    shuffle: (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
}

const SEED_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Generate a short human-friendly seed code: DADA-XXXX
export function newSeedCode(): string {
  let s = "DADA-";
  for (let i = 0; i < 4; i++) {
    s += SEED_ALPHABET[Math.floor(Math.random() * SEED_ALPHABET.length)];
  }
  return s;
}

// Deterministic edition number derived from seed key (1..9999).
export function editionFromSeed(seedKey: string): number {
  return (xfnv1a("ed:" + seedKey) % 9999) + 1;
}
