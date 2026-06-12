# Deploying OYC Nazareth — free tier, no credit card

Everything below is free and needs **no payment method**. Code already lives on
GitHub: `Tony11-dot/oyc-basketball` (private).

## 1. Host on Vercel (free Hobby plan)

1. Go to <https://vercel.com> → **Sign up with GitHub** (no card required).
2. **Add New… → Project** → import `oyc-basketball`.
3. Framework preset auto-detects **Next.js** — leave build settings default.
4. Add the environment variables below (Settings → Environment Variables), then
   **Deploy**. You get a free `*.vercel.app` URL.

## 2. Environment variables

| Variable | Value | Needed for |
|---|---|---|
| `ADMIN_PASSWORD` | a strong password | admin login |
| `ADMIN_TOKEN` | any long random string | admin session |
| `SMTP_HOST` | `smtp-mail.outlook.com` | email |
| `SMTP_PORT` | `587` | email |
| `SMTP_USER` | `said_abu_a@hotmail.com` | email |
| `SMTP_PASS` | **app password** (see §4) | email |
| `MAIL_FROM` | `OYC Nazareth <said_abu_a@hotmail.com>` | email |
| `MAIL_TO` | `said_abu_a@hotmail.com` | email |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | from Upstash (§3) | saving data |
| `BLOB_READ_WRITE_TOKEN` | from Vercel Blob (§3) | image/video uploads |

## 3. Persistent storage (required for the admin to save in production)

On Vercel the filesystem is read-only, so the local `/data` + `/public/uploads`
fallback **won't persist**. Wire up these free stores:

- **Data → Upstash Redis** (free, no card): create a database at
  <https://upstash.com>, copy the **REST URL** + **REST token** into
  `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
- **Uploads → Vercel Blob** (free allowance on Hobby): Vercel project →
  **Storage → Create → Blob**, then copy `BLOB_READ_WRITE_TOKEN`.

Until these are set the public site still renders (seeded content), but admin
edits, registrations, and uploads won't be saved.

## 4. Email app password (Hotmail/Outlook)

Microsoft blocks plain password SMTP, so create an **app password**:

1. <https://account.microsoft.com/security> → **Advanced security options**.
2. Turn on **Two-step verification** (required to unlock app passwords).
3. **Create a new app password** → paste the generated value into `SMTP_PASS`.

Leave `SMTP_PASS` blank to disable email — registrations still save.

## 5. Redeploys

Every `git push` to `main` auto-deploys. Locally: `npm run dev`.
