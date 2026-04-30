// Tzara cut-up: shuffle the user's words and reassemble into lines of chance.
// Now seeded — same input + seed reproduces the same poem.

import { makeRNG, type RNG } from "./rng";

export type Poem = {
  lines: PoemToken[][];
  headlineWord: string;
  allWords: PoemToken[]; // flat sequence for the draggable scrap layer
};

export type PoemToken = {
  text: string;
  caps?: boolean;
  struck?: boolean;
};

const PUNCT = [".", ",", ";", "—", "!", "?", ":"];

export function tokenize(input: string): string[] {
  return input
    .replace(/[\r\n]+/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}\-']/gu, ""))
    .filter(Boolean);
}

export function generatePoem(input: string, seedKey: string): Poem {
  const words = tokenize(input);
  if (words.length < 6) {
    throw new Error("NEED_MORE_WORDS");
  }
  const rng: RNG = makeRNG("poem:" + seedKey);

  // Headline — favour longer, distinctive words.
  const sorted = [...new Set(words)].sort((a, b) => b.length - a.length);
  const headlinePool = sorted.slice(0, Math.max(3, Math.ceil(sorted.length * 0.3)));
  const headlineWord = rng.pick(headlinePool).toUpperCase();

  // Build a long shuffled stream — repeat words a few times for richer cut-up.
  const repetitions = Math.max(2, Math.ceil(20 / words.length));
  const stream: string[] = [];
  for (let i = 0; i < repetitions; i++) {
    stream.push(...rng.shuffle(words));
  }

  const numLines = 8 + rng.rangeInt(0, 6); // 8-14
  const lines: PoemToken[][] = [];
  let cursor = 0;

  for (let i = 0; i < numLines && cursor < stream.length; i++) {
    const lineLen = 2 + rng.rangeInt(0, 5); // 2-7 words
    const slice = stream.slice(cursor, cursor + lineLen);
    cursor += lineLen;
    if (slice.length === 0) break;

    const tokens: PoemToken[] = slice.map((w) => ({
      text: w,
      caps: rng.maybe(0.1),
      struck: false,
    }));

    if (tokens.length && rng.maybe(0.5)) {
      const last = tokens[tokens.length - 1];
      last.text = last.text + rng.pick(PUNCT);
    }

    lines.push(tokens);
  }

  // Sprinkle 1-2 struck-through words across the whole poem
  const flat = lines.flat();
  const strikeCount = Math.min(flat.length, 1 + rng.rangeInt(0, 1));
  for (let i = 0; i < strikeCount; i++) {
    flat[rng.rangeInt(0, flat.length - 1)].struck = true;
  }

  return { lines, headlineWord, allWords: flat };
}
