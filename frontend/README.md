# Frontend — Vrushahi Group

React 19 + Vite 8, plain JavaScript (JSDoc for typing, no TypeScript), Tailwind
CSS v4, React Router 7, Framer Motion, React Hook Form + Zod.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
npm run smoke    # server-renders all 27 routes and checks page structure
```

## Layout

```
src/
  config/
    site.js          all company facts in one place — phone, address, socials,
                     map. Items marked TODO(B11) await client confirmation.
    env.js           VITE_* access; nothing else reads import.meta.env
  data/
    businessUnits.js THE source of truth for the 15 divisions (PRD B4).
                     Drives the home grid, mega-menu, drawer, footer, /group
                     and every /group/:slug page.
    aboutContent.js  About-page copy, verbatim from the legacy site
    contractFarming.js
    navigation.js    nav tree composed from the two above
  components/
    layout/          TopBar, Header, MegaMenu, MobileDrawer, PageHero, Footer,
                     BackToTop, Logo
    motion/          Reveal, StaggerGroup/Item, PageTransition, variants.js
    ui/              Container, Button, Icon, Badge, SectionHeading, Prose,
                     PlaceholderImage, ContentPendingNotice, SocialIcons
    forms/           FloatingField, FileField, SubmitButton, FormStatus,
                     HoneypotField, TurnstileWidget, ContactForm, CareerForm
    home/            Hero, ValueProps, ExperienceBlock, BusinessUnitGrid/Card,
                     CtaBand
    seo/Seo.jsx      per-page title + meta
  pages/  routes/  layouts/  hooks/  lib/  services/
```

## Styling

Tailwind **v4** — the theme lives in `src/index.css` inside an `@theme` block,
not in a `tailwind.config.js` (v4 moved configuration into CSS). The brand
palette from the legacy site (`#FF090F`, `#FF9900`, `#FF6600`, `#474747`,
`#EEEEEE`) is seeded there, expanded into full ramps so there are shades with
enough contrast for body text — the raw brand red only reaches 3.96:1 on white,
so `brand-700` is the one to use for small text.

## Motion

Framer Motion throughout; GSAP was not needed. Reduced motion is handled in two
places: `<MotionConfig reducedMotion="user">` in `App.jsx` strips transform and
layout animations tree-wide, and a media query in `index.css` neutralises CSS
keyframes and transitions. Components owning a continuous effect (hero Ken
Burns, parallax) also check `useReducedMotion()` and skip it entirely.

Animations are transform/opacity only, so they stay on the GPU.

## Forms

React Hook Form + Zod, posting to the Express API. `src/lib/schemas.js` mirrors
`backend/src/validation/formSchemas.js` — they cannot share a module across
packages, so a rule changed in one must be changed in the other. The server
revalidates everything and is the authority; its `fieldErrors` response maps
straight back onto the inputs.

Spam protection is a honeypot plus a form-fill timing check, with Cloudflare
Turnstile wired but dormant — set `VITE_TURNSTILE_SITE_KEY` (and the matching
secret on the API) and the widget mounts itself.
