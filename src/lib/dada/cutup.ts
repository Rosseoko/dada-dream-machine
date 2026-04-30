// Tzara cut-up: shuffle the user's words and reassemble into lines of chance.

export type Poem = {
  lines: PoemToken[][];
  headlineWord: string;
};

export type PoemToken = {
  text: string;
  caps?: boolean;
  struck?: boolean;
};

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PUNCT = [".", ",", ";", "—", "!", "?", ":"];

function maybe(prob: number) {
  return Math.random() < prob;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function tokenize(input: string): string[] {
  return input
    .replace(/[\r\n]+/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}\-']/gu, ""))
    .filter(Boolean);
}

export function generatePoem(input: string): Poem {
  const words = tokenize(input);
  if (words.length < 6) {
    throw new Error("Need at least 6 words to perform the ritual.");
  }

  // Pick a headline word — favor longer, distinctive words.
  const sorted = [...new Set(words)].sort((a, b) => b.length - a.length);
  const headlinePool = sorted.slice(0, Math.max(3, Math.ceil(sorted.length * 0.3)));
  const headlineWord = pick(headlinePool).toUpperCase();

  // Build a long shuffled stream — repeat words a few times for richer cut-up.
  const repetitions = Math.max(2, Math.ceil(20 / words.length));
  const stream: string[] = [];
  for (let i = 0; i < repetitions; i++) {
    stream.push(...fisherYates(words));
  }

  const numLines = 8 + Math.floor(Math.random() * 7); // 8-14
  const lines: PoemToken[][] = [];
  let cursor = 0;

  for (let i = 0; i < numLines && cursor < stream.length; i++) {
    const lineLen = 2 + Math.floor(Math.random() * 6); // 2-7 words
    const slice = stream.slice(cursor, cursor + lineLen);
    cursor += lineLen;
    if (slice.length === 0) break;

    const tokens: PoemToken[] = slice.map((w) => ({
      text: w,
      caps: maybe(0.08),
      struck: false,
    }));

    // Maybe trailing punctuation
    if (tokens.length && maybe(0.55)) {
      const last = tokens[tokens.length - 1];
      last.text = last.text + pick(PUNCT);
    }

    lines.push(tokens);
  }

  // Sprinkle 1-2 struck-through words across the whole poem
  const flat = lines.flat();
  const strikeCount = Math.min(flat.length, 1 + Math.floor(Math.random() * 2));
  for (let i = 0; i < strikeCount; i++) {
    pick(flat).struck = true;
  }

  return { lines, headlineWord };
}
