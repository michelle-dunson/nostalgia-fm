# nostalgia-fm

A nostalgic playlist generator based on birth year. Enter your birth year and Nostalgia.FM builds a Spotify playlist from Billboard Hot 100 hits across the chapters of your life.

## How it works

Nostalgia.FM maps your birth year to life stages and pulls top Billboard hits from those years:

| Stage | Ages |
|---|---|
| Early years | 7–8 |
| Middle school | 13–14 |
| Prom | 17–18 |
| College | 20–21 |
| Entering adulthood | 24–25 |

A stage is included only if you're at least 5 years past its upper age (e.g. at 27, entering adulthood is excluded).

Each included stage contributes 5 songs, plus 6 bonus songs split between the two stages below your highest eligible stage. Tracks are shuffled before preview and save.

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
