# Backend — Vrushahi Group API

Express 4 (ESM) serving the Contact and Career form endpoints.

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5000
```

## Endpoints

| Method | Path           | Body                | Notes |
|--------|----------------|---------------------|-------|
| GET    | `/api/health`  | —                   | uptime probe |
| POST   | `/api/contact` | JSON                | name, email, phone, message |
| POST   | `/api/career`  | multipart/form-data | contact fields + address, designation, resume |

Success is `{ success: true, message }`. Failures are
`{ success: false, message, fieldErrors?, code? }`, where `fieldErrors` is a
`{ field: message }` map the frontend drops onto the matching inputs.

## Layout

```
src/
  config/env.js       all configuration, with warnings for anything unset
  config/mailer.js    cached SMTP transport
  routes/             health + form routes
  controllers/        form.controller.js
  services/           mail.service.js, captcha.service.js
  validation/         formSchemas.js (Zod)
  middleware/         validate, honeypot, rateLimiter, upload, errorHandler
  templates/          formEmail.js — HTML + text email bodies
  utils/              ApiError, html escaping
```

## Email

`MAIL_PROVIDER` picks the transport:

- `console` (default) — logs the message instead of sending it, so the forms work
  end to end with no mail account. Startup warns while this is active.
- `smtp` — Nodemailer; set `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`.
  Credentials are verified at boot.
- `resend` — the Resend HTTP API; set `RESEND_API_KEY`. Uses global `fetch`, no SDK.

`MAIL_TO` is where submissions land. It currently defaults to `info@vrushahi.com`
— **confirm the real inbox before launch** (PRD B11.5). The legacy PHP mailed
`techdeshpande@gmail.com`, which looks like a developer's personal address, so it
is deliberately not the default.

## Spam protection

Four layers, none of which asks the user to solve anything:

1. **Rate limiting** — 5 submissions per IP per 15 minutes (`express-rate-limit`).
2. **Honeypot** — a hidden `website` field; any value rejects the submission.
   The rejection message is deliberately vague, and the Zod schema deliberately
   does *not* validate this field, so the response never names the trap.
3. **Timing** — `formStartedAt` is stamped when the form mounts; anything
   completed under `MIN_FORM_FILL_MS` (3s) or over `MAX_FORM_AGE_MS` (6h) is rejected.
4. **Turnstile** — written and dormant. Set `TURNSTILE_SECRET_KEY` plus the
   frontend's `VITE_TURNSTILE_SITE_KEY` and verification activates. It fails
   closed: if Cloudflare is unreachable the submission is refused, not waved through.

This replaces the legacy math-captcha image (`form/img.php` + a bundled TTF) and
its PHP-session lockout, which a bot defeated simply by not sending the cookie.

## Resume uploads

Held in memory and attached directly to the outgoing email — applicant CVs are
never written to disk. PDF and Word only, checked on both extension and MIME
type, capped at `MAX_UPLOAD_BYTES` (5 MB).

## Deployment note

Set `TRUST_PROXY` to the real number of reverse proxies in front of the app.
`express-rate-limit` needs an accurate client IP and rejects a blanket `true`,
because that would let any caller spoof `X-Forwarded-For` and bypass the limiter.
