# 🚢 Deployment Guide — Trippy

Trippy deploys to [Vercel](https://vercel.com) as a **single project** that serves both:

1. **The static frontend** (`dist/`) — served by Vercel's CDN.
2. **The Express API** — deployed as a serverless function and reached through `/api/*`.

This document explains how that wiring works, where every environment variable lives, and how to verify a deployment.

---

## Table of contents

- [How the Vercel wiring works](#how-the-vercel-wiring-works)
- [Environment variables](#environment-variables)
- [Deploying](#deploying)
- [Verifying a deployment](#verifying-a-deployment)
- [Troubleshooting](#troubleshooting)
- [Local production build](#local-production-build)
- [Firebase & Firestore setup](#firebase--firestore-setup)
- [Fallback matrix](#fallback-matrix)

---

## How the Vercel wiring works

Three pieces make the single-project deployment work:

| File | Role |
|---|---|
| [`vercel.json`](../vercel.json) | Pins the build (`npm run build`), the static output directory (`dist/`), disables framework auto-detection, and **rewrites every `/api/*` request to the serverless function**. |
| [`api/index.ts`](../api/index.ts) | The serverless entry point. It creates the Express app **once per warm lambda** and hands each request to it (`app(req, res)`). |
| [`server.ts`](../server.ts) | The local/dev entry point (`npm run dev`, `npm start`). Unchanged by the deployment wiring. |

Request flow on Vercel:

```
Browser
  │
  ├─ /  and  /assets/*  ──► Vercel CDN (static files from dist/)
  │
  └─ /api/*  ──► vercel.json rewrite ──► api/index.ts (lambda)
                                            │
                                            └─► Express app
                                                  ├─ feature routers (14)
                                                  └─ dev: Vite middleware · prod: static no-op
```

Notes:

- `NODE_ENV` is `production` on Vercel, so the Express app skips Vite and serves API + SPA fallback only (the CDN handles static assets).
- The serverless bundle never loads Vite — it is imported dynamically and only in dev mode.
- The app is **local-first**: data reads/writes go to `server/db.json` inside the lambda, mirrored asynchronously to Firestore when `FIREBASE_SERVICE_ACCOUNT_JSON` is configured. Without Firestore, data is seeded fresh on each cold start (fine for demos, not for production data).

---

## Environment variables

**All secrets live in the Vercel dashboard — never in source code.**

Set them here: **Vercel → your project → Settings → Environment Variables**.

| Variable | Required | Purpose | Behavior if missing |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ for AI features | Powers `/api/gemini/*` (itineraries, chat, discovery, recommendations) | AI endpoints return **simulated** fallback data (HTTP 200) |
| `FIREBASE_API_KEY` | ✅ for Google login | Served to the browser via `GET /api/firebase-config` | Google sign-in fails; email/password login still works |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ⚠️ recommended for prod | firebase-admin → Firestore mirror | Local-JSON-only mode (data resets on cold start) |
| `OPENWEATHER_API_KEY` | ⚠️ optional | OpenWeatherMap current conditions | Graceful fallback to keyless **Open-Meteo** |
| `NODE_ENV` | ⚠️ set automatically | Vercel injects `production` | — |
| `PORT` | ⚠️ set automatically | Host-injected | — |

### Getting each key

1. **`GEMINI_API_KEY`** — [Google AI Studio → Get API key](https://aistudio.google.com/apikey). Free tier is sufficient.
2. **`FIREBASE_API_KEY`** — [Firebase Console](https://console.firebase.google.com) → Project settings → General → *Your apps* → Web app → **Web API Key**.
3. **`FIREBASE_SERVICE_ACCOUNT_JSON`** — Firebase Console → Project settings → Service accounts → **Generate new private key**. Then flatten the downloaded JSON into a **single line**, e.g. in PowerShell:

   ```powershell
   (Get-Content .\serviceAccount.json -Raw).Replace("`r`n", "").Replace("`n", "")
   ```

   Paste the result as the variable value. Keep the file itself out of git.
4. **`OPENWEATHER_API_KEY`** — [openweathermap.org/api](https://openweathermap.org/api) (Current Weather Data).

### Rules

- Set variables for the **Production** (and optionally Preview) scope.
- **Re-deploy after changing env vars** — existing deployments keep the values they were built with.
- Never commit `.env` (git-ignored; use [`.env.example`](../.env.example) as the template).

---

## Deploying

### Automatic (recommended)

1. Push to the `main` branch of [GauravPathania18/TRIPY2](https://github.com/GauravPathania18/TRIPY2).
2. Vercel auto-deploys using the settings in `vercel.json` (`npm run build` → `dist/`).
3. Live at **https://tripy-2.vercel.app/**.

### Manual (Vercel CLI)

```bash
npm install -g vercel
vercel login
vercel            # first run: link the project
vercel --prod     # deploy to production
```

### Build output

`npm run build` produces:

| Artifact | Used by |
|---|---|
| `dist/index.html` + `dist/assets/*` | Vercel CDN (frontend) |
| `dist/server.cjs` | Local `npm start` (not used by Vercel — the function is built from `api/index.ts`) |

---

## Verifying a deployment

After every deploy, run these checks:

```bash
# API alive? (expect HTTP 200 + JSON array)
curl -i https://tripy-2.vercel.app/api/destinations

# Firebase config served with injected key? (expect HTTP 200 + "apiKey")
curl -i https://tripy-2.vercel.app/api/firebase-config

# SPA loads? (expect the HTML document)
curl -i https://tripy-2.vercel.app/
```

**Symptoms → causes:**

| Check | Result | Meaning |
|---|---|---|
| `/api/destinations` | `404 NOT_FOUND` + `X-Vercel-Error: NOT_FOUND` | Infrastructure has no function — `vercel.json` / `api/index.ts` missing or not deployed (this was the state before the wiring was added) |
| `/api/destinations` | `5xx` | Function crashed — check **Deployments → Functions → Runtime logs** |
| `/api/firebase-config` | `apiKey` missing | `FIREBASE_API_KEY` not set (or needs redeploy) |
| `/api/gemini/chat` | 200 but `_fallback: true` / simulated text | `GEMINI_API_KEY` missing |
| AI endpoints | `504` / timeout | Model call exceeded the function's max duration — raise **Settings → Functions → Max Duration** (the Gemini search-grounded chat is the slowest endpoint) |

---

## Troubleshooting

**Google login fails on the live site**
→ Confirm `FIREBASE_API_KEY` is set for Production and re-deployed. Also verify the Firebase Console has your Vercel domain under **Authentication → Settings → Authorized domains**.

**Data disappears between visits (serverless)**
→ Without `FIREBASE_SERVICE_ACCOUNT_JSON`, each cold start re-seeds `server/db.json`. Configure Firestore to persist data, or accept the demo-level behavior.

**Firestore sync errors in logs**
→ The service-account JSON must be a single line and valid JSON. The server logs a warning and continues in local mode if it is malformed.

**Weather shows different values than OpenWeatherMap**
→ Expected: without `OPENWEATHER_API_KEY` the chain falls back to Open-Meteo (check the `source` field in the response: `openweathermap` → `open-meteo` → `fallback`).

**Port already in use locally**
→ Another process owns port 3000. `PORT=3100 npm run dev` overrides it.

---

## Local production build

```bash
npm run build     # vite build → dist/ + esbuild → dist/server.cjs
NODE_ENV=production npm start   # or: npm start (falls back to Vite middleware if NODE_ENV unset)
```

The handler path used by Vercel can be exercised locally:

```bash
npx esbuild api/index.ts --bundle --platform=node --format=cjs --outfile=api-index-test.cjs --external:vite
node -e "process.env.NODE_ENV='production'; const h=require('./api-index-test.cjs'); const s=require('http').createServer((q,r)=>(h.default||h)(q,r)); s.listen(3199,()=>console.log('ready on :3199'));"
```

---

## Firebase & Firestore setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Sign-in method → Google → Enable** (needed for popup login).
3. **Project settings → Your apps → Web app** → copy the Web API Key → `FIREBASE_API_KEY`.
4. **Service accounts → Generate new private key** → flatten to one line → `FIREBASE_SERVICE_ACCOUNT_JSON`.
5. **Firestore Database → Create database** (production mode) — the admin SDK mirrors `db.json` writes here and rehydrates on boot.
6. [`firestore.rules`](../firestore.rules) ships in the repo; deploy them with the Firebase CLI if you manage rules from source.

Without steps 4–6 the app still runs fully — it simply stays in local-JSON mode.

---

## Fallback matrix

| Capability | Fully configured | Missing credentials |
|---|---|---|
| AI itineraries / chat / discovery / recommendations | Real Gemini responses (+ Search grounding for chat) | Structured **simulated** data, HTTP 200, `_fallback: true` |
| Google Sign-In | Firebase popup flow | Email/password login only |
| Data persistence | Local JSON + async Firestore mirror | Local JSON only — **resets on each serverless cold start** |
| Weather | OpenWeatherMap | Open-Meteo (keyless, slightly less detail) |
| Globe country dataset | REST Countries via `/api/proxy/countries` | Built-in static country catalog |
| Globe rendering | WebGL three.js scene | 2D radar fallback UI |
| Backend-down UX | Normal responses | `fetchWithRetry` retries with backoff, then user-visible error states |

> The application is designed to **never hard-fail** because of a missing key: every external dependency has a tested degradation path.
