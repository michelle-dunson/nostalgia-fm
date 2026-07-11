# nostalgia-fm

A nostalgic playlist generator based on birth year. Enter your birth year and Nostalgia.FM builds a Spotify playlist from Billboard Hot 100 hits across the chapters of your life.

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Add your [Spotify Developer](https://developer.spotify.com/dashboard) credentials to `.env.local`.

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Stack

- Next.js (App Router)
- TypeScript
- CSS Modules (no Tailwind)
