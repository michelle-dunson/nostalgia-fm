# nostalgia-fm

A nostalgic playlist generator based on birth year. Enter your birth year and Nostalgia.FM builds a Spotify playlist from Billboard Hot 100 hits across the chapters of your life.

## How it works

Nostalgia.FM maps your birth year to life stages and pulls top Billboard hits from every year in each range:

| Stage | Ages |
|---|---|
| Childhood | 8–10 |
| Middle school | 12–14 |
| High school | 16–18 |
| College | 20–22 |
| Post-grad | 24–26 |

A stage is included only if you're at least 5 years past its upper age (e.g. at 27, post-grad is excluded).

Each playlist has **50 songs**, weighted by how many stages you have:

| Stages | Distribution |
|---|---|
| 1 | 50 |
| 2 | 25 each |
| 3 | Childhood 15 · Middle school 20 · High school 15 |
| 4 | Childhood 10 · Middle school 15 · High school 15 · College 10 |
| 5 | 10 each |

Songs are drawn from multiple Billboard charts throughout each calendar year (not just one mid-year snapshot), then shuffled before preview and save.

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

## Usage

1. Enter your birth year and click **Generate Playlist**
2. Preview the shuffled track list
3. **Connect Spotify to Save** (if not already connected)
4. **Save to Spotify** — opens your new public playlist

## Scripts

```bash
npm test              # Unit tests
npm run verify-flows  # End-to-end generation checks (requires .env.local)
npm run build         # Production build
```

## Stack

- Next.js (App Router)
- TypeScript
- CSS Modules (no Tailwind)
- Billboard chart data ([mhollingshead/billboard-hot-100](https://github.com/mhollingshead/billboard-hot-100))
- Spotify Web API
