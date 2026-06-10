# GO Football AI

Monorepo with separate frontend and backend.

## Structure

```
├── frontend/   # Next.js app
├── backend/    # Express API (JWT auth + PostgreSQL)
└── .gitignore
```

## Setup

### PostgreSQL

The backend creates the `gofootball_ai` database automatically on startup.

**Option A — pgAdmin:** Right-click **Databases** → **Create** → **Database…** → name it `gofootball_ai`.

**Option B — SQL in pgAdmin Query Tool:**

```sql
CREATE DATABASE gofootball_ai;
```

**Option C — setup script:**

```bash
cd backend
npm run db:setup
```

**Option D — Docker:**

```bash
docker compose up -d
```

Make sure `DATABASE_URL` in `backend/.env` uses your real PostgreSQL username and password (not necessarily `postgres` / `postgres`).

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Set `DATABASE_URL` in `.env`, for example:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gofootball_ai
```

Runs on `http://localhost:4000`. Tables are created automatically on startup.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Runs on `http://localhost:3000`.

## Auth & roles

| Page | Sign up role | Login |
|------|--------------|-------|
| `/member` | `member` | Members only |
| `/admin` | `admin` | Admins only |

- `POST /api/auth/signup` — `{ username, password, role, acceptedTerms }`
- `POST /api/auth/login` — `{ username, password, role? }`
- `POST /api/auth/logout` — Bearer JWT
- `GET /api/auth/me` — Bearer JWT

## Records

- `GET /api/records/public` — public feed (Home page)
- `GET /api/records` — member/admin (Records page)
- `POST /api/records` — admin only (upload photo/video/text)
- `DELETE /api/records/:id` — admin only
