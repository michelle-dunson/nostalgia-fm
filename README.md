# nostalgia-fm

A nostalgic playlist generator based on birth year. Enter your birth year and Nostalgia.FM builds a Spotify playlist from Billboard Hot 100 hits across the chapters of your life.

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Add your [Spotify Developer](https://developer.spotify.com/dashboard) credentials to `.env.local`, and register this redirect URI in your Spotify app settings:

```
http://127.0.0.1:3001/api/auth/callback
```

Spotify does not allow `localhost` — you must use `127.0.0.1`.

3. Run the development server:

```bash
npm run dev
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001) to see the app (use this URL, not `localhost`).

## Stack

- Next.js (App Router)
- TypeScript
- CSS Modules (no Tailwind)
