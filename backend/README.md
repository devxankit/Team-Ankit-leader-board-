# TA backend — API

Express 5 + MongoDB (Mongoose) + Socket.io API for **TA (Team Ankit)**, the team performance leaderboard.
Anyone with the link sees the live leaderboard — teammates never sign in. Only the admin signs in, to manage members, rules and points.

The web app lives in [`../frontend`](../frontend/README.md).

## Run it

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed              # creates the admin + 12 starter rules (safe to re-run)
npm run dev               # http://localhost:5000 (restarts on file changes)
```

Then start the frontend (`cd frontend && npm run dev`) and open http://localhost:5173.

| Script | What it does |
| --- | --- |
| `npm run dev` | API with auto-restart (`node --watch`) |
| `npm start` | API for production |
| `npm run seed` | Admin from `ADMIN_*` + starter rules. Never overwrites existing data |
| `npm run seed -- --reset-admin-password` | Also resets the admin password to `ADMIN_PASSWORD` |
| `npm run seed:demo` | Adds 8 demo members (marked `isDemo`) with ~6 weeks of history |
| `npm run seed:demo -- --reset` | Deletes the demo members and their entries, then recreates them |
| `npm test` | Unit + API tests on a throwaway in-memory MongoDB (never touches your database) |

To remove the demo members for good, deactivate them in **Admin → Members** (they show a *Demo* badge), or delete the users with `isDemo: true` from the database.

## Environment (`.env`)

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | Atlas or local connection string |
| `JWT_SECRET` | yes | Long random string (32+ characters in production) |
| `JWT_EXPIRES_IN` | | Session length, default `7d` |
| `CLIENT_URL` | | Allowed browser origin(s), comma-separated. Default `http://localhost:5173` |
| `PORT` | | Default `5000` |
| `HOST` | | Interface to listen on. Default all; `127.0.0.1` behind a reverse proxy |
| `APP_TIMEZONE` | | Timezone for "This week" (starts Monday) / "This month". Default `Asia/Kolkata` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | for seeding | The admin account `npm run seed` creates |
| `TRUST_PROXY` | | Number of reverse proxies in front of the API (for rate limiting). Default `0` |
| `SERVE_CLIENT` | | Serve `../frontend/dist` from Express (single-origin deploy). Default `true` in production |
| `COOKIE_SAMESITE`, `COOKIE_SECURE` | | Only for cross-site deploys: `none` + `true` (HTTPS required) |

## How scoring works

- **Ledger, not counters.** Every give/take is a `PointEvent`. A score is the sum of a member's non-voided events.
  Each event stores a snapshot of the rule's label and points, so editing or archiving a rule never changes history.
- **Reversing** an entry marks it voided (kept for the audit trail); every total skips it, so scores correct themselves.
- **Leaderboard** totals come from one MongoDB aggregation (`services/leaderboard.service.js`): match non-voided events → group by member → conditional sums for the period, all-time points, reward/penalty counts, the standings 7 days ago and the last 7 days.
- **Game rules** are pure functions in `services/gamification.js`: levels, "X pts to next level", ranking (ties share a rank: 1, 2, 2, 4, then by name), trend (▲/▼ vs the same board 7 days ago), 🔥 on fire (3+ rewards and no penalties in 7 days).
- **Tuning** (level thresholds, 🔥 rule, trend window, feed size) lives in one file: `src/config/gamification.js`.
- Only active members are ranked. The admin is not ranked.

## API

All routes are under `/api`. Every response is `{ success, data, message }`. Errors add `code` and, for forms, `fieldErrors`.

| Method & path | Access | Purpose |
| --- | --- | --- |
| `POST /auth/login` | public, rate-limited | Admin sign-in; sets the httpOnly `ta_session` cookie |
| `POST /auth/logout` | anyone | Clears the cookie |
| `GET /auth/me` | anyone | The signed-in admin, or `user: null` for visitors |
| `POST /auth/change-password` | admin | Change the admin password (signs out other devices) |
| `GET /leaderboard?period=all\|month\|week` | public | Ranked rows with points, level, trend, 🔥 |
| `GET /activity?limit=40` | public | Latest non-reversed entries |
| `GET /members/:id/history?page=` | public | One member's entries, paginated |
| `GET /admin/members?status=active\|inactive\|all` | admin | List members |
| `POST /admin/members` | admin | Add member: `{ name, designation, avatarColor? }` — no account needed |
| `PATCH /admin/members/:id` | admin | Edit name, designation, avatar colour |
| `PATCH /admin/members/:id/status` | admin | `{ isActive }` — deactivate / reactivate |
| `GET /admin/rules?status=active\|archived\|all` | admin | List rules |
| `POST /admin/rules` | admin | `{ label, type: reward\|penalty, points, category, icon }` |
| `PATCH /admin/rules/:id` | admin | Edit, or restore with `{ isActive: true }` |
| `DELETE /admin/rules/:id` | admin | Archive (soft delete) |
| `POST /admin/points` | admin | `{ memberIds[], ruleId }` or `{ memberIds[], custom: { label, points } }`, plus optional `note` |
| `GET /admin/events` | admin | Activity log. Filters: `member`, `rule` (id or `custom`), `type`, `status`, `from`, `to`, `page`, `limit` |
| `PATCH /admin/events/:id/void` | admin | Reverse an entry |
| `GET /health` | public | Liveness + database status |

**Real-time:** after any change that affects scores (points, reverse, member added/edited/deactivated) the server emits
`leaderboard:updated` `{ reason, at }` over Socket.io. Every open leaderboard refetches what it's showing.
Sockets are public like the board, but only our own site (or `CLIENT_URL`) may connect.

## Security

- The leaderboard, activity feed and member history are read-only and public. Everything that changes data is under `/admin`.
- Only the admin can sign in: JWT in an httpOnly, SameSite=Lax cookie (Secure in production), password hashed with bcrypt.
  Teammates have no email or password at all.
- Every admin request re-checks the account, so a password change ends other sessions immediately.
- `requireAuth` + `requireAdmin` guard the whole `/admin` router on the server, not just in the UI.
- Zod validation on every write and query, helmet, CORS allow-list, origin check on writes (CSRF), rate limits on login and the API.

## Structure

```
src/
  config/       env, db, constants, gamification (tuning)
  models/       User, Rule, PointEvent
  routes/       auth, board (leaderboard/activity/history), admin
  controllers/  thin HTTP handlers
  services/     business logic: auth, leaderboard (aggregation), gamification, points, members, rules, activity
  middleware/   auth + role guard, validation, rate limits, errors
  validation/   Zod schemas
  sockets/      Socket.io setup + leaderboard:updated
  scripts/      seed, seed-demo
  utils/        ApiError, response helpers, serializers
tests/          Vitest (gamification, leaderboard, points, API)
```

## Deploying

Socket.io needs a long-running Node server (Render, Railway, a VPS…), not serverless functions.
Simplest setup: build the frontend (`cd frontend && npm run build`), run this API with `NODE_ENV=production`,
and it serves the app and the API from one origin, so cookies and sockets work with no extra config.
