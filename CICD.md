# CI/CD on Vercel — Easy Quick Form

This is the continuous-integration / continuous-deployment guide. For the **initial**
project setup (creating the two Vercel projects + env vars), do
[DEPLOYMENT.md](./DEPLOYMENT.md) first — this doc builds on top of it.

---

## How Vercel CI/CD actually works

**Vercel's Git integration _is_ your CI/CD — there is no separate pipeline to run.**
Once each project is connected to your GitHub repo:

| Git event                         | What Vercel does automatically                          |
| --------------------------------- | ------------------------------------------------------- |
| Push to `main`                    | Builds + deploys to **Production** (your live URL)      |
| Push to any other branch          | Builds + deploys a **Preview** (unique throwaway URL)   |
| Open / update a Pull Request      | Posts a Preview URL + status check on the PR            |
| Revert / rollback                 | One-click promote any previous deployment to Production |

Each deploy = `install → build (per vercel.json) → deploy`, fully isolated and
immutable. You don't need Jenkins or GitHub Actions to deploy. (An **optional**
GitHub Actions quality-gate is in §6 — it runs tests/typecheck _before_ code can
merge, which Vercel alone doesn't do.)

Because this repo has **two** Vercel projects (`eqf-api`, `eqf-web`), each push
triggers both — §4 shows how to make each project skip builds when its code didn't
change.

---

## 1. One-time wiring (CI/CD prerequisites)

In **each** project (`eqf-api` and `eqf-web`):

1. **Settings → Git** → confirm the GitHub repo is connected and **Root Directory**
   is set (`server` for the API, `client` for the web).
2. **Settings → Git → Production Branch** → `main`.
3. **Settings → Environment Variables** → make sure vars exist for **both**
   `Production` **and** `Preview` (see §2). Without Preview vars, preview deploys
   build but fail at runtime.

That's the entire CI/CD setup. From here, **push = deploy**.

---

## 2. Environments & environment variables

Vercel scopes every variable to one or more of: **Production**, **Preview**,
**Development**. Set the scope when you add each var.

### `eqf-api` (backend)

| Variable               | Production | Preview | Notes                                  |
| ---------------------- | :--------: | :-----: | -------------------------------------- |
| `DATABASE`             |     ✓      |   ✓¹    | ¹ ideally a **separate** staging DB    |
| `ACCESS_TOKEN_SECRET`  |     ✓      |   ✓     |                                        |
| `REFRESH_TOKEN_SECRET` |     ✓      |   ✓     |                                        |
| `SMTP_*`               |     ✓      |   ✓     |                                        |
| `GOOGLE_CLIENT_ID`     |     ✓      |   ✓     |                                        |
| `GOOGLE_CLIENT_SECRET` |     ✓      |   ✓     |                                        |
| `CLIENT_URL`           |     ✓      |   ✓     | prod = web prod URL; preview → see §5  |

### `eqf-web` (frontend)

| Variable                    | Production | Preview | Value                                       |
| --------------------------- | :--------: | :-----: | ------------------------------------------- |
| `VITE_BACKEND_BASE_URL`     |     ✓      |   ✓     | prod: `https://eqf-api.vercel.app/api/v1`   |
| `VITE_SECRET_KEY`           |     ✓      |   ✓     |                                             |
| `VITE_GOOGLE_CLIENT_ID`     |     ✓      |   ✓     |                                             |
| `VITE_GOOGLE_CLIENT_SECRET` |     ✓      |   ✓     |                                             |

> **Preview tip:** preview API URLs are dynamic, so the simplest reliable setup is to
> point the **Preview** `VITE_BACKEND_BASE_URL` at the **Production** API (or a
> dedicated staging API project). Then preview frontends talk to a stable backend.

---

## 3. The deploy pipeline (what runs on every push)

```
git push
   │
   ▼
Vercel detects commit (per project)
   │
   ├─ Ignored Build Step?  ──► no relevant changes ──► skip (saves build minutes)
   │
   ▼ relevant changes
Install:  pnpm install            (whole workspace, native deps built)
   │
   ▼
Build:    eqf-api  → pnpm --filter @form-builder/validation build, then bundle api/
          eqf-web  → build validation + client (tsc && vite build)
   │
   ▼
Deploy:   immutable URL
          • main branch   → aliased to Production domain
          • other branch  → unique Preview URL + PR status check
```

---

## 4. Monorepo optimization — only build what changed

By default **both** projects rebuild on **every** push, even a README edit. Add an
**Ignored Build Step** so each project builds only when its own code changes.

**Settings → Git → Ignored Build Step** (per project), paste the matching command:

**`eqf-web`:**
```bash
git diff --quiet HEAD^ HEAD -- client packages package.json pnpm-lock.yaml pnpm-workspace.yaml
```

**`eqf-api`:**
```bash
git diff --quiet HEAD^ HEAD -- server packages package.json pnpm-lock.yaml pnpm-workspace.yaml
```

How it works: Vercel **skips** the build when the command exits `0` and **builds**
when it exits `1`. `git diff --quiet` exits `0` when there are **no** changes in the
listed paths — exactly when we want to skip. Shared paths (`packages`, lockfile,
workspace config) are included so a shared-package change rebuilds both.

---

## 5. Preview deployments & CORS (making PR previews fully work)

Preview frontends get dynamic URLs like
`https://eqf-web-git-<branch>-<scope>.vercel.app`. The API's CORS allowlist won't
know them, so cross-origin auth from a preview frontend is blocked **unless** you
either:

**Option A (simplest):** point Preview `VITE_BACKEND_BASE_URL` at the Production API
**and** add each long-lived preview/staging frontend URL to the API's `CLIENT_URL`.
Good enough if you only need a couple of stable preview environments.

**Option B (allow all preview origins, preview-only):** make CORS accept any
`*.vercel.app` origin **only when** the API itself is running as a Preview deploy
(`VERCEL_ENV === 'preview'`). Production stays locked to the exact allowlist.

Optional code change in `server/src/app.ts` — replace:

```ts
app.use(cors({ origin: allowedOrigins }));
```

with:

```ts
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin / curl
      const isAllowed =
        allowedOrigins.includes(origin) ||
        (process.env.VERCEL_ENV === 'preview' && /\.vercel\.app$/.test(origin));
      callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
  }),
);
```

(Ask and I'll apply this for you.) Note Vercel also offers **Deployment Protection**,
which puts preview URLs behind auth — if that's enabled, only logged-in team members
can reach previews.

---

## 6. Optional: GitHub Actions quality gate (catch breakage before merge)

Vercel deploys whatever you push; it does **not** block a merge when code is broken.
Add a CI check that runs typecheck + build on every PR so bad code can't reach `main`.

A ready-to-use workflow is already in this repo at **`.github/workflows/ci.yml`**.
It runs on PRs and pushes to `main`:

1. Install with the pinned pnpm (`packageManager` field).
2. Build the shared `validation` package.
3. Typecheck the server (`tsc --noEmit`).
4. Build the client (`tsc && vite build`).

Then enforce it (§7) so the check must pass before merging.

---

## 7. Branch protection (require checks before merge)

GitHub repo → **Settings → Branches → Add branch ruleset / protection rule** for
`main`:

- ✅ Require a pull request before merging.
- ✅ Require status checks to pass — select **`CI`** (the Actions workflow) and the
  **Vercel** deployment checks (`eqf-api`, `eqf-web`).
- ✅ Require branches to be up to date before merging.

Now the flow is: PR → CI + preview deploys must go green → review → merge → auto
Production deploy.

---

## 8. Rollbacks, promotion & deploy hooks

- **Instant rollback:** project → **Deployments** → pick a known-good one →
  **⋯ → Promote to Production**. Because deployments are immutable, this is instant
  and safe.
- **Promote a preview:** the same **Promote to Production** action works on any
  preview deployment.
- **Deploy Hooks** (Settings → Git → Deploy Hooks): a URL that triggers a deploy on
  `POST` — handy for cron or CMS-driven rebuilds without a git push.
- **Redeploy:** **⋯ → Redeploy** re-runs the pipeline for the same commit (e.g. after
  changing an env var).

---

## 9. Recommended day-to-day workflow

```
feature branch  ──►  PR
                       │
                       ├─ GitHub Actions CI  (typecheck + build)   ─┐
                       ├─ eqf-web preview deploy                    ├─ all must pass
                       └─ eqf-api preview deploy                   ─┘
                       │
                     review + click the preview URL to test
                       │
                     merge to main
                       │
                       └─►  automatic Production deploy of both projects
```

That's the whole CI/CD loop — no servers to manage, previews on every PR, and a
quality gate guarding `main`.
