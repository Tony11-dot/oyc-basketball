# OYC NAZARETH — Basketball Website & Admin Platform

A premium **single-page, scroll-based** site for the Orthodox Youth Club Nazareth
basketball club, plus a full admin dashboard. Built with **Next.js 16 (App
Router) · React 19 · Tailwind v4 · Framer Motion**.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Build & run production:

```bash
npm run build
npm start
```

## What's included

### Public site (`/`) — one page, navigated by scrolling through tabs
- Sticky navbar with scroll-spy active highlighting + smooth anchor scrolling and
  a morphing active-tab indicator
- **Home** — hero with a photo + minimal welcome text (parallax entrance)
- **Teams** — a grid of team cards; tapping one opens a full-screen detail sheet
  with the team's **players**, **matches** (opponent · date+weekday · where · IBBA
  link) and a link to the team's **IBBA** page
- **Highlights** — video reels that cycle horizontally "like a train" (uploaded
  videos autoplay muted/looping; YouTube/Instagram links are embedded)
- **Gallery** — auto-advancing photo carousel
- **Register** — name / last name / phone / email → opens a **DocuSign
  PowerForm** (prefilled) to complete signing; the registration is recorded
- **Footer** — logo, address, contact, and an **Instagram** button →
  [oyc.nazareth](https://instagram.com/oyc.nazareth) (no opening hours)
- Scroll progress bar, toasts, modals, hover/morph micro-interactions

### Tri-lingual (ar / he / en)
- **Arabic is the default** and right-to-left; Hebrew is RTL; English is LTR
- Navbar language switcher, preference saved to `localStorage`
- `dir`/`lang` swap on `<html>`; Arabic renders in **Cairo**, Hebrew/Latin in
  **Rubik**
- UI strings live in `src/lib/i18n/dictionary.ts`; page *content* is localized in
  the data layer and edited per-language in the admin

### Admin dashboard (`/admin`)
- **Login** — default password `oyc-nazareth` (set `ADMIN_PASSWORD` to change)
- **Overview** — registrations / this-month / teams / players stat cards
- **Registrations** — table with search + status filter, details modal, mark
  signed / archived, delete
- **Teams** — create teams; per team: logo upload with **drag-to-reposition +
  frame-shape** tools, name/description (per language), **IBBA link**, a
  **Players** panel (attach an existing player from a dropdown *or* add a new one
  instantly — name, number, position, photo), and a **Matches** panel (opponent,
  date/time, where, IBBA link). Players are a shared roster reusable across teams.
- **Content** — tabbed editor (Home / Highlights / Gallery / Blocks / Footer /
  Backgrounds) with image & video uploads, per-language fields, font & text-style
  tools, and a live preview
- **Sections** — show/hide and reorder the page sections (and nav tabs)
- **Settings** — change the admin password

> The admin UI itself is in Arabic/Hebrew/English (follows the switcher); the
> public site is fully tri-lingual.

## Architecture

```
src/
  app/
    page.tsx              public single-page site (server component, reads data)
    layout.tsx            Rubik + Cairo fonts + Language/Toast providers
    admin/                login, overview, registrations, teams, content, sections, settings
    api/                  route handlers (Next 16 async params/cookies)
      registrations, teams, players, highlights, content, auth, upload
  components/
    site/   Navbar, Hero, Teams, Highlights, Gallery, Register, Footer, …
    admin/  AdminShell, ImageUpload, ImagePositioner, StyleToolbar,
            LocalizedField, GalleryEditor, HighlightsEditor, BlockBuilder
    ui/     Button, Modal, Toast, Logo, ImageBlock
  lib/
    db.ts          storage (Upstash Redis in prod, JSON files locally)
    seed.ts        default teams / players / highlights / content
    api.ts         shared API parsing helpers
    i18n/          dictionary (ar/he/en) + LanguageProvider
    auth.ts        cookie session + changeable password
    config.ts      docusignUrl() prefill helper
    validation.ts  shared form/API validation
data/              runtime JSON store (gitignored; reseeds from seed.ts)
public/uploads/    uploaded images & videos (gitignored)
```

## Configuration

| Var | Default | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `oyc-nazareth` | Admin login password |
| `ADMIN_TOKEN` | `oyc-session-ok` | Session cookie value |
| `NEXT_PUBLIC_DOCUSIGN_URL` | demo PowerForm | DocuSign PowerForm signing link |
| `NEXT_PUBLIC_DOCUSIGN_ROLE` | `Member` | PowerForm recipient role (for prefill) |
| `BLOB_READ_WRITE_TOKEN` | — | Vercel Blob (uploads in production) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | — | Upstash Redis (data in production) |

Locally, uploads fall back to `/public/uploads` and data to `/data` — no tokens
needed.

## Next steps (drop-in replacements)
- **Logo** (`src/components/ui/Logo.tsx`) — placeholder SVG wordmark; replace with
  the real OYC asset (drop it in `/public`).
- **DocuSign** — paste the real PowerForm URL into `NEXT_PUBLIC_DOCUSIGN_URL`.
- **Colors** — the club palette lives in `src/app/globals.css` (`@theme`).
