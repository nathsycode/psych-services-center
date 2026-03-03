# Psych Services Center (Portfolio Demo)

A React + Vite mental health service portfolio website built for demonstration purposes.

> Important: This project is **not** a real clinical service. Any booking, contact, and chat flows shown in portfolio mode are sample/demo behavior only.

## Project Focus

This repository includes both `client` and `server`, but the primary application is in:

- `client/`: frontend portfolio site (React, Vite, Tailwind, React Router)
- `server/`: optional Supabase seeding utility for article-related data

## Client Features

- Multi-page SPA with routes:
  - `/` Home
  - `/booking`
  - `/about`
  - `/articles`
  - `/articles/:slug`
  - `/contact`
- Floating chat widget with:
  - guided booking flow
  - appointment lookup/cancel/reschedule flow
  - general Q&A handoff flow
- Portfolio mode safeguards:
  - landing disclaimer modal
  - booking/contact/chat integrations are intentionally non-live or restricted
- Articles and resources:
  - Supabase-backed article listing + detail pages
  - fuzzy search (Fuse.js)
  - filters by tag, author, and date presets
- Responsive UI with Tailwind CSS and Vercel SPA rewrite config (`client/vercel.json`)

## Tech Stack (Client)

- React 18
- Vite 7
- React Router 6
- Tailwind CSS
- Supabase JS client
- Fuse.js
- Lucide React icons

## Local Development (Client)

### 1. Install dependencies

```bash
npm --prefix client install
```

### 2. Configure environment variables

Create/update `client/.env` with the values for your environment.

```env
VITE_APP_MODE=portfolio

VITE_CHAT_API_URL=http://localhost:5678/webhook/chat
VITE_CALENDAR_AVAILABILITY_URL=http://localhost:5678/webhook/calendar/availability
VITE_BOOKING_URL=http://localhost:5678/webhook/calendar/booking
VITE_LOOKUP_URL=http://localhost:5678/webhook/calendar/lookup
VITE_MANAGE_CANCEL_URL=http://localhost:5678/webhook/calendar/cancel
VITE_MANAGE_RESCHEDULE_URL=http://localhost:5678/webhook/calendar/reschedule
VITE_CONTACT_WEBHOOK_URL=http://localhost:5678/webhook/contact

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Notes:
- In production builds, default behavior is portfolio mode unless explicitly configured otherwise.
- If required webhook/Supabase env vars are missing, related features fail gracefully in the UI.

### 3. Run development server

```bash
npm --prefix client run dev
```

### 4. Build for production

```bash
npm --prefix client run build
```

### 5. Preview production build

```bash
npm --prefix client run preview
```

## Optional Server Utility (Supabase Seeding)

`server/seed.js` can seed article, author, and tag data into Supabase.

1. Configure server env vars:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_service_role_key
```

2. Install and run seed script:

```bash
npm --prefix server install
node server/seed.js
```

The seed script uses JSON sources in `server/data/`.

## Deployment Notes

- `client/vercel.json` rewrites all routes to `/` for SPA routing.
- Configure the same `VITE_*` variables in your hosting platform (for example, Vercel project env vars).

## Disclaimer

This codebase is intended for portfolio/demo presentation only and should not be used as-is for real clinical operations, emergency response, or live patient care workflows.
