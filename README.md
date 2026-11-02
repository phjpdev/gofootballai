# GO Football AI

A bilingual (Traditional Chinese / English) web app that turns Hong Kong Jockey Club (HKJC) football odds into structured, AI-written match analyses. It has a public match list, a member area with VIP access, and an admin panel for publishing picks, results and media.

## What it does

- **Match list** – pulls upcoming, in-play and past football matches with their odds from HKJC's football data feed, with team logos and match status.
- **AI match analysis** – sends each match's odds to the xAI Grok API using a versioned prompt, validates the JSON reply with zod and stores it in PostgreSQL. A queue with per-user rate limits runs the requests, and Redis (optional) caches popular results.
- **Pick tracking and win rate** – settles each AI pick (home/away, handicap, over/under) against HKJC results once a match ends and reports win rates by date.
- **Members and VIP** – username/password accounts with JWT sessions and bcrypt-hashed passwords, member and admin roles, and VIP expiry dates that unlock the full analysis.
- **Admin tools** – edit home page sections, featured matches, top match previews and pick overrides; manage users; publish photo and video records. Uploaded videos are probed and transcoded to H.264 with ffmpeg, and large files use resumable chunked uploads.
- **Two languages** – Traditional Chinese by default, with an English version of the interface and the analyses.

## Who it's for

Football fans in Hong Kong who follow HKJC football markets and want a quick, structured read on each match, and the person running the site who publishes picks, results and updates. Analyses are for reference only; the app doesn't place bets, and the member page carries a responsible-gambling notice.

## Built with

| Part | Stack |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, lucide-react |
| Backend | Node.js, Express 5, TypeScript, PostgreSQL 16 (`pg`), Redis 7 (optional), zod, jsonwebtoken, bcryptjs, multer |
| Media | ffmpeg / ffprobe for video checks and transcoding |
| Data and AI | HKJC football GraphQL feed (via `hkjc-api` and a small custom client), xAI Grok chat completions API |

## Project structure

```
├── frontend/          Next.js app (pages, components, i18n messages)
│   └── src/
│       ├── app/       routes: /home, /analysis, /records, /member, /admin
│       ├── components/
│       └── lib/       API clients, HKJC helpers, i18n
├── backend/           Express API
│   ├── src/
│   │   ├── routes/    auth, analyses, hkjc, records, users, featured, …
│   │   └── lib/       Grok client, analysis queue, pick settlement, uploads
│   └── scripts/       database setup and one-off maintenance scripts
├── deploy/            example Nginx config for the API
└── docker-compose.yml PostgreSQL + Redis for local development
```

## Running it locally

### Requirements

- Node.js 20.9 or newer and npm
- Docker (or your own PostgreSQL 16 and, optionally, Redis 7)
- ffmpeg and ffprobe on your `PATH` if you want to upload videos
- An xAI API key to generate analyses
- Network access to HKJC. Its endpoints are often unreachable from servers outside Hong Kong; if so, point `HKJC_GRAPHQL_URL` at a Hong Kong proxy (see `backend/.env.example`).

### 1. Start the database and cache

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 (database `gofootball_ai`, user and password `postgres`) and Redis on port 6379. Without Docker, create the database yourself or run `npm run db:setup` from `backend/`.

### 2. Start the backend

```bash
cd backend
cp .env.example .env     # then set JWT_SECRET and XAI_API_KEY
npm install
npm run dev
```

The API runs on `http://localhost:4000` and creates its tables on startup.

### 3. Start the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The site runs on `http://localhost:3000`.

### Production build

```bash
cd backend && npm run build && npm start
cd frontend && npm run build && npm start
```

`deploy/nginx-api.conf.example` shows an Nginx setup for the API, including the upload size limit and the headers video playback needs.

## Configuration

The main backend settings (all in `backend/.env.example`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Signing key and lifetime for login tokens |
| `CORS_ORIGIN` | Frontend origin allowed to call the API |
| `XAI_API_KEY`, `XAI_MODEL` | Grok credentials and model for analyses |
| `ANALYSIS_*` | Prompt version, queue concurrency and timeouts for analyses |
| `REDIS_URL` | Optional Redis cache |
| `HKJC_GRAPHQL_URL`, `HKJC_*` | Optional HKJC proxy URL, timeouts and retries |

The frontend needs `NEXT_PUBLIC_API_URL` (and `API_URL` for server-side calls in production), see `frontend/.env.example`.

## API overview

All routes are under `/api`.

| Area | Routes |
| --- | --- |
| Auth | `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Matches | `GET /hkjc/matches`, `GET /hkjc/matches/:id` |
| Analyses | `GET /analyses/:matchId`, `GET /analyses/:matchId/status`, `POST /analyses/:matchId/generate`, `POST /analyses/scores`, `POST /analyses/prewarm` |
| Records | `GET /records/public`, `GET /records`, admin `POST`/`PATCH`/`DELETE`, `POST /records/upload-sessions` |
| Admin content | `/featured`, `/home-sections`, `/top-match-previews`, `/match-pick-overrides`, `/users`, `/win-rate-stats` |

## Roadmap

Planned work is listed in [ROADMAP.md](ROADMAP.md).

## License

[MIT](LICENSE)
