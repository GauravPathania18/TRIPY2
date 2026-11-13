# 🤝 Contributing to Trippy

Thanks for your interest in improving Trippy! This guide covers everything you need to know to get from a fresh clone to a merged pull request.

---

## Table of contents

- [Getting started](#getting-started)
- [Development workflow](#development-workflow)
- [Project structure at a glance](#project-structure-at-a-glance)
- [Coding conventions](#coding-conventions)
- [Manual test checklist](#manual-test-checklist)
- [Pull request checklist](#pull-request-checklist)
- [Reporting bugs](#reporting-bugs)

---

## Getting started

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Fork the repo, then clone your fork
git clone https://github.com/<your-username>/TRIPY2.git
cd TRIPY2
npm install

# 2. Configure environment (optional — the app runs in fallback mode without keys)
cp .env.example .env
# add at least GEMINI_API_KEY for real AI responses (see docs/DEPLOYMENT.md)

# 3. Start developing (frontend + API together with HMR)
npm run dev
# → http://localhost:3000
```

**Demo admin** (for admin-panel work): `pathaniagaurav1818@gmail.com` / `admin123`.

Before writing code, skim:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the layers fit together
- [docs/API.md](docs/API.md) — the 37-endpoint contract

---

## Development workflow

1. **Create a branch** from `main`:

   ```bash
   git checkout -b fix/short-description     # bug fixes
   git checkout -b feat/short-description    # new features
   git checkout -b docs/short-description    # documentation
   ```

2. **Make focused changes** — one concern per PR.
3. **Verify before pushing:**

   ```bash
   npm run lint     # tsc --noEmit — must be clean
   npm run build    # vite + esbuild — must exit 0
   ```

4. **Push and open a PR** against `main` with a clear description of *what* changed and *why*.

### Commit messages

Prefer short, imperative subjects:

```
fix: allow booking owner to cancel from dashboard
feat: add reviews to destination modal
docs: document Vercel env var setup
```

---

## Project structure at a glance

```
server.ts            # thin local entry (do not add logic here)
api/index.ts         # Vercel serverless entry
vercel.json          # deployment wiring
server/
  app.ts             # Express factory
  config/env.ts      # the ONLY place reading process.env
  lib/               # auth middleware · gemini client/fallbacks
  routes/            # 14 HTTP routers (thin!)
  services/          # business logic, prompts, provider chains
  db.ts              # local-first store + Firestore mirror
src/
  App.tsx            # tab navigation root
  components/
    X.tsx            # orchestrator (stable path — keep it)
    x/               # feature-private subcomponents + hooks
    ui/              # shared primitives (Modal, SectionHeader)
  utils/             # fetchWithRetry · renderMarkdown
```

Full detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Coding conventions

### TypeScript

- `npm run lint` must pass — no `any` unless truly unavoidable (and comment why).
- Prefer explicit prop interfaces; keep types in `src/types.ts` when shared across features.

### Backend

- **Routes stay thin:** parse input → call a service/lib function → send a response. Business logic, prompts, and provider fallbacks belong in `server/services/` or `server/lib/`.
- **All env access goes through `server/config/env.ts`** — never read `process.env` elsewhere.
- **Errors are `{ "error": "message" }`** with an appropriate status code.
- **Never remove or rename an endpoint** without updating [docs/API.md](docs/API.md) and checking frontend usage.
- External providers must have a **graceful fallback** (missing key → degraded data, not a 500).

### Frontend

- **Feature folders:** new subcomponents for a page go in that page's folder (`components/<page>/`), not in the root.
- **Orchestrator paths are stable** — `components/X.tsx` is imported by `App.tsx`; don't move it.
- **Shared primitives** (truly used by 3+ features) go in `components/ui/`.
- **No global store** — colocate state in the feature's hooks and pass props down.
- **API calls use relative paths** (`/api/...`) and, for flaky externals, `fetchWithRetry` from `src/utils/api.ts`.
- Styling is Tailwind utility-first:
  - accent = `amber-500`, surfaces = `slate-*`, dark surfaces = `bg-[#040613]` / `bg-[#0b0e20]`
  - always include `dark:` variants where a surface appears in both themes
  - keep the mono labels (`font-mono text-[10px] uppercase tracking-widest`) for section eyebrows

### Dependencies

- **No new npm dependencies** without prior discussion in the issue/PR — the bundle is already ~2 MB and every addition must justify itself.
- Prefer native APIs or the existing stack (motion, lucide-react, three.js, recharts).

### Documentation

- Endpoint changes → update `docs/API.md`.
- Deployment-affecting changes (env vars, build, routing) → update `docs/DEPLOYMENT.md`.
- Structural changes → update `docs/ARCHITECTURE.md`.

---

## Manual test checklist

There is no automated test suite yet — verify manually before a PR:

**Backend** (use `curl` or the browser console):

```bash
curl localhost:3000/api/destinations        # 200 + array
curl localhost:3000/api/packages            # 200 + array
curl localhost:3000/api/blogs               # 200 + array
curl localhost:3000/api/weather?city=Goa    # 200 + conditions
curl localhost:3000/api/firebase-config     # 200 + Firebase config
```

**Auth flows:** register → logout → login → session persists after refresh.

**Key UI flows:**

- [ ] Landing page renders; globe loads (or radar fallback if WebGL is off)
- [ ] Destinations: filters work, modal opens, weather loads, review can be posted (logged in)
- [ ] Packages: itinerary modal opens, booking completes, booking appears in Dashboard
- [ ] Dashboard: booking can be cancelled; budget chart renders
- [ ] AI planner: generate → results render (simulated fallback is acceptable without a key) → save/delete trip
- [ ] Blogs: reader opens a post (fetches by id), comment posts when logged in
- [ ] Footer: contact modal submits; newsletter form submits
- [ ] Admin panel (admin account): booking status change, contact inbox, create forms
- [ ] Notification drawer: clicking a bulletin marks it read and decrements the bell badge

---

## Pull request checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` exits 0
- [ ] No secrets, `.env` files, or service-account JSON committed
- [ ] All 37 endpoints still present (no accidental deletions)
- [ ] Relevant docs updated (`API.md` / `DEPLOYMENT.md` / `ARCHITECTURE.md`)
- [ ] Manual test checklist above exercised for affected areas
- [ ] PR description explains **what** and **why**

---

## Reporting bugs

Open an issue and include:

1. **What happened** vs. **what you expected**
2. **Steps to reproduce** (URL, endpoint, account role)
3. **Environment** — local (`npm run dev`) or production (tripy-2.vercel.app), browser, OS
4. **Console/network errors** — paste the exact response body and status code
5. Whether required env vars are configured (AI/Google login/weather symptoms differ without them)

Feature requests are welcome too — please open an issue for discussion before investing in a large PR.
