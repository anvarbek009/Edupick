# Edupick — Verified Learning Centers & Tutors Directory for Uzbekistan

> **Positioning:** Choose the right learning center or tutor using real student results, not ads.

Edupick is a mobile-first directory, verified-outcomes analytics, comparison, and trial-lesson booking platform tailored for Uzbekistan (Tashkent districts + Samarkand, Bukhara, Andijan, Namangan, Fergana, and Nukus). The brand name is isolated in a single config constant (`BRAND_CONFIG.name` in `src/config/brand.ts`) so it can be rebranded in one edit.

## Quick Start

```bash
npm install
npm run dev
```

The Express + Vite dev server runs on **http://localhost:3000** (and serves both the React SPA and the `/api/ai/*` server-side Gemini endpoints).

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts `server.ts` with Vite middleware on port 3000 |
| `npm run build` | Builds the production Vite bundle + PWA service worker into `dist/` |
| `npm start` | Runs `node server.ts` in production mode serving `dist/` |
| `npm run lint` | Runs `tsc --noEmit` across the TypeScript codebase |
| `npm test` | Runs unit tests for UZS formatting, phone masking, distance math, filtering, and `.ics` export |

### Environment Variables

See `.env.example`:
- `GEMINI_API_KEY`: Server-side Gemini API key used exclusively by `server.ts` (`/api/ai/*`). Never exposed to the browser bundle.
- `PORT`: Defaults to `3000`.

## Architecture & Folder Structure

```text
├── server.ts                      # Express server + Vite middleware + 6 Gemini API routes
├── public/                        # PWA icons, robots.txt, sitemap.xml
└── src/
    ├── config/brand.ts            # Single brand constant, Uzbekistan cities/districts, subject taxonomy
    ├── types/domain.ts            # TypeScript models & enums for centers, tutors, courses, results, reviews, leads
    ├── i18n/                      # Full UZ (Latin, default), RU, EN dictionaries + switcher
    ├── utils/                     # Pure formatting/filtering/scoring/ICS helpers + node:test unit tests
    ├── data/seed.ts               # Deterministic Uzbek seed dataset (32 centers, 42 tutors, 96 courses, 168 results, 212 reviews)
    ├── services/                  # Swappable service layer (storage, directoryService, aiService, analyticsService)
    ├── store/useAppStore.ts       # Zustand state persisted to localStorage
    ├── hooks/                     # Dynamic SEO meta/JSON-LD, PWA install prompt, online status
    ├── components/                # VerifiedBadge, ListingCard, CompareTray, MapView (Leaflet), BookingWizardModal, AuthModal
    └── pages/                     # Landing, Search, Compare, Center/Tutor Profiles, AI Matchmaker, Student/B2B/Admin Dashboards
```

## Key Features

- **Verified Outcomes (3-Tier Trust Model):** Every outcome carries an interactive verification badge (`Unverified`, `Document verified`, `Student confirmed`), methodology explanation, cohort filters, Recharts distribution/trend graphs, and a "Report an incorrect claim" workflow.
- **Discovery & Interactive Map:** Centers / Tutors / Courses switcher, full Uzbekistan city/district & attribute filters, mobile filter bottom sheet, URL-synced shareable queries, Leaflet + OpenStreetMap clustering, and browser geolocation ("Near me").
- **Side-by-Side Comparison:** Floating compare tray (up to 4 items), sticky table with best-value highlights, "differences only" toggle, Recharts RadarChart, and server-side Gemini AI recommendation.
- **Trial Lesson Booking:** 4-step mobile wizard with Uzbekistan phone masking (`+998 XX XXX XX XX`), `.ics` calendar export, simulated SMS/Telegram notifications, optional Payme/Click/Uzum deposit selector, and persistent booking management.
- **Role Dashboards:** Student/Parent dashboard (bookings, favorites, IELTS progress tracker, multi-child profiles), B2B Center/Tutor CRM (lead pipeline, results manager, QR review requests, AI description writer, competitor benchmark), and Admin panel (verification queue with Gemini AI document checker assist, review moderation, audit log).
- **Gemini AI Assistant Suite:** AI Matchmaker wizard, AI Compare verdict, AI Review Summarizer, AI Natural-Language Search, AI Certificate Consistency Checker, and AI Course Description Writer.

## Mocked / Stubbed Integrations (MVP)

The following external services are intentionally mocked behind clean service boundaries so the MVP works end-to-end out of the box:

1. **Persistence (`src/services/storage.ts` & `directoryService.ts`):** Backed by `localStorage` + deterministic seed data. All UI reads/writes pass through the service layer and store so Firebase Firestore or Supabase PostgreSQL can be dropped in without modifying UI components.
2. **SMS OTP Auth (`AuthModal.tsx`):** Accepts any valid `+998 XX XXX XX XX` number with mock OTP code `123456` and quick demo role buttons. Structured for drop-in replacement with **Eskiz.uz** or **PlayMobile** SMS gateways.
3. **Telegram Login & Notifications:** Telegram sign-in button and booking confirmation notifications are simulated in-app with toast/notification records.
4. **Local Payments (Payme / Click / Uzum):** Checkout options in the trial booking wizard and B2B billing tabs are UI/flow stubs without real merchant credentials.
5. **Certificate File Upload:** Stores uploaded certificate filenames and metadata locally in browser state rather than S3/Cloud Storage.

## Production Roadmap (Next Real Connections)

1. **Database & Auth Backend:** Swap `src/services/storage.ts` to Firebase Firestore or PostgreSQL (Cloud SQL / Supabase) with server-verified JWT sessions.
2. **Eskiz.uz SMS & Telegram Bot:** Connect OTP dispatch and real-time trial-booking lead alerts to a Telegram Bot for center managers and parents.
3. **Payme / Click / Uzum Merchant APIs:** Activate paid trial deposits and automated Pro/Featured B2B subscriptions.
4. **Object Storage & OCR Pipeline:** Upload IELTS/DTM/SAT certificates to private cloud storage with signed URLs and automated TRF / certificate verification checks.
5. **Real Center Onboarding & SEO Indexing:** Migrate seeded listings to verified partner centers across Tashkent and regional capitals with dynamic SSR/edge meta tags.
