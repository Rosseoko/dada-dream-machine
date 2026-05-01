# DADA Dream Machine

A web-based Dada manifesto generator inspired by Tristan Tzara's cut-up technique.

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

## Deployment

To deploy to Cloudflare Workers:

```bash
# Build the project
bun run build

# Deploy to Cloudflare (requires wrangler CLI)
npx wrangler deploy
```
