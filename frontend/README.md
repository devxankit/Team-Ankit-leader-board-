# TA frontend — web app

React 19 + Vite + Tailwind CSS web app for **TA (Team Ankit)**, the team performance leaderboard.
It talks to the API in [`../backend`](../backend/README.md).

## Run it

Start the backend first (`cd backend && npm run dev`), then:

```bash
cd frontend
npm install
cp .env.example .env     # defaults work for local development
npm run dev              # http://localhost:5173
```

In development Vite proxies `/api` and `/socket.io` to the backend (`VITE_API_PROXY_TARGET`), so the session
cookie and live updates work without any CORS setup.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |
| `npm run format` | Prettier |

## Environment (`.env`)

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Keep `/api` unless the API is on another domain |
| `VITE_SOCKET_URL` | same origin | Socket.io server, if it's on another domain |
| `VITE_API_PROXY_TARGET` | `http://localhost:5000` | Where the dev server proxies API and socket traffic |
| `VITE_PORT` | `5173` | Dev server port |

## What's inside

**For everyone — no login**
- **Leaderboard** (`/`): open to anyone with the link. Podium for the top 3 (#1 crowned in the centre), full standings with rank, ▲/▼ movement vs 7 days ago,
  level badge, progress to the next level, points and reward/penalty counts.
  Period filter: All time / This month / This week (weeks start Monday). Updates live over Socket.io.
- **Awards** that move live with the scores: 👑 Leader, 🚀 Top climber, 🎯 Most rewards, 🛡️ Clean sheet,
  ⚡ Next level-up, 🌱 Rising star (logic in `src/lib/awards.js`).
- **Live feed**: the last 40 entries. Click any member (podium, row, award or feed) to open their drawer with rank,
  points, counts, level and full history.
- **Level road**: everyone's avatar placed on the journey from Warning to Legend.
- **Celebrations**: numbers count up, a floating +10 / −5 appears on live changes, and a "New leader!" or
  "Level up!" banner with confetti fires when it happens. All motion respects the OS "reduce motion" setting.
- Light and dark mode, and a layout that works on phones.

**Admin** (`/admin` — sign in with the small **Admin** button in the top bar)

A standard sidebar dashboard:
- **Overview**: this week's key numbers, top 5 and the latest entries.
- **Give points**: one form — members dropdown (search, select all), reason (rewards / penalties / custom), optional note.
- **Members**: table with search and status filter; add (just name, designation and colour — no account), edit, deactivate.
- **Rules**: table; create, edit, archive and restore.
- **Activity log**: every entry with filters (member, reason, type, status, dates), pagination and **Reverse**.
- **Account**: change the admin password.

## Structure

```
src/
  pages/        Leaderboard, Login (admin), NotFound, admin/{Overview, GivePoints, Members, Rules, ActivityLog, Account}
  components/   ui/ (buttons, dialogs, fields…), layout/, leaderboard/, admin/
  hooks/        useAuth, useTheme, useSocket, useBoard (leaderboard/activity/history), useAdmin, useLiveChanges, useNow
  services/     axios instance + auth, board and admin API calls
  context/      Auth, Theme and Socket providers
  routes/       AppRoutes, RequireAdmin
  lib/          formatting, awards, level styles, constants, query client
  index.css     design tokens (light + dark) and Tailwind theme
```

Level thresholds and names come from the API (`backend/src/config/gamification.js`). Only the colours live here, in `src/lib/levels.js`.
