# DADA Dream Machine

A web-based Dada manifesto generator inspired by Tristan Tzara's cut-up technique. Type your words, and chance will fracture them into a one-of-a-kind Dada manifesto that you can drag, rearrange, and print.

## Features

- **Cut-Up Engine**: Transforms your input into a randomized Dada manifesto using Tzara's chance-based cut-up method
- **Draggable Scraps**: All word scraps are draggable and rotatable - rearrange the accident
- **Animals Mode**: Playful mode with animal silhouettes, crayon-like scribbles, and vintage risograph colors
- **Landscape/Portrait Toggle**: Switch between vertical (1200×1600) and horizontal (1600×1200) canvas orientations
- **7 Languages**: Full support for English, Spanish, Italian, Portuguese, French, Arabic, and Chinese
- **Print & Download**: Export your manifesto as a high-quality PNG image
- **Responsive Design**: Works on desktop and mobile with a language switcher
- **Seeded Randomness**: Each manifesto has a unique seed code for reproducibility

## Tech Stack

- **Framework**: TanStack Start (React + Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS
- **UI Components**: Radix UI
- **SVG Generation**: Procedural SVG backgrounds with Dada-style aesthetics
- **Image Export**: html-to-image for poster generation
- **Deployment**: Cloudflare Workers support

## Installation

```bash
# Install dependencies
bun install
# or
npm install
```

## Development

```bash
# Start development server
bun run dev
# or
npm run dev

# Build for production
bun run build
# or
npm run build

# Preview production build
bun run preview
# or
npm run preview

# Lint code
bun run lint
# or
npm run lint

# Format code
bun run format
# or
npm run format
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/
│   └── dada/       # Core Dada logic
│       ├── cutup.ts      # Poem generation and tokenization
│       ├── draw.ts       # SVG background generation
│       ├── i18n.ts       # Internationalization
│       ├── rng.ts       # Seeded random number generation
│       └── scraps.ts     # Word scrap layout algorithm
├── routes/          # TanStack Start routes
├── router.tsx       # Router configuration
└── styles.css       # Global styles
```

## How It Works

1. **Input**: User types text in any supported language
2. **Tokenization**: Text is split into words/tokens
3. **Cut-Up**: Words are randomly rearranged using seeded RNG
4. **Layout**: Scraps are positioned algorithmically on the canvas
5. **Background**: Procedural SVG generates Dada-style newspaper aesthetic
6. **Interaction**: User can drag, rotate, and rearrange scraps
7. **Export**: Manifesto is exported as a high-resolution image

## Animals Mode

When enabled, Animals Mode adds:
- Animal silhouettes (14 different animals)
- Child-like geometric scribbles
- Vintage risograph color palette (cream paper + primary colors)
- Playful, crayon-like aesthetic matching the Dada spirit

## Language Support

The app supports 7 languages with full UI translations:
- English (en)
- Spanish (es)
- Italian (it)
- Portuguese (pt)
- French (fr)
- Arabic (ar)
- Chinese (zh)

Arabic and Chinese have adjusted word-count rules to accommodate their linguistic structures.

## Deployment

The project is configured for Cloudflare Workers deployment via `wrangler.jsonc`. To deploy:

```bash
# Build the project
bun run build

# Deploy to Cloudflare (requires wrangler CLI)
npx wrangler deploy
```

## License

This project is private and proprietary.

## Inspiration

Based on Tristan Tzara's 1920 Dada cut-up technique and the Dada movement's embrace of chance, accident, and anti-art. The aesthetic draws from newspaper collage, constructivist design, and vintage risograph printing.
