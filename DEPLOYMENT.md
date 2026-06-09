# Deploying Easy Quick Form to Vercel

This app deploys as **two Vercel projects from the same GitHub repo**:

| Project        | Root Directory | What it is                          |
| -------------- | -------------- | ----------------------------------- |
| `eqf-api`      | `server`       | Express API as a Serverless Function |
| `eqf-web`      | `client`       | Vite React SPA (static)             |

All the config (`vercel.json`, the serverless entry, build commands) is already in
the repo. You mainly click through the Vercel dashboard and set environment variables.

---

## Step 0 — A note on secrets (recommended, not required to deploy)

`server/.env` and `client/.env` are currently **committed to GitHub**, so every secret
in them is public. You can still deploy as-is for now (the `.env` files stay in the
repo), but **for any real/public deployment you should rotate them** and move the real
values into Vercel's environment-variable UI:

- **MongoDB Atlas** – create a new DB user / password, update the connection string.
- **JWT secrets** – generate new `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`
  (e.g. `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`).
- **SMTP password** – regenerate the Gmail app password.
- **Google OAuth** – rotate the client secret in Google Cloud Console.

When you're ready to stop tracking the env files so they aren't committed again:

```bash
git rm --cached client/.env server/.env
git commit -m "Stop tracking .env files"
```

Either way, you set the values below in **Vercel's env-var UI** — committed `.env`
files are not used by the Vercel build.

---

## Step 1 — Deploy the backend (`eqf-api`)

1. Push this branch to GitHub (the new `vercel.json` / `api/` files must be on the
   branch you deploy).
2. Vercel dashboard → **Add New… → Project** → import `devSahinur/easy-quick-form`.
3. **Configure project:**
   - **Root Directory:** `server`
   - Framework Preset: **Other** (leave as detected; `vercel.json` handles it)
   - Build / Output / Install commands: leave default — `server/vercel.json` already
     sets the build command (`pnpm --filter @form-builder/validation build`).
4. **Environment Variables** (Settings → Environment Variables) — add these:

   | Name                   | Value                                             |
   | ---------------------- | ------------------------------------------------- |
   | `DATABASE`             | your MongoDB Atlas connection string              |
   | `ACCESS_TOKEN_SECRET`  | (rotated) long random hex                          |
   | `REFRESH_TOKEN_SECRET` | (rotated) long random hex                          |
   | `SMTP_HOST`            | `smtp.gmail.com`                                  |
   | `SMTP_PORT`            | `587`                                             |
   | `SMTP_USERNAME`        | your sending email                                |
   | `SMTP_PASSWORD`        | (rotated) Gmail app password                       |
   | `GOOGLE_CLIENT_ID`     | your Google OAuth client id                        |
   | `GOOGLE_CLIENT_SECRET` | (rotated) Google OAuth client secret               |
   | `CLIENT_URL`           | _fill in after Step 2_ (the frontend URL)          |

   > Do **not** set `PORT` — Vercel manages that. Leave `CLIENT_URL` blank for now;
   > you'll add it once the frontend has a URL.

5. **Deploy.** When it finishes you'll get a URL like `https://eqf-api.vercel.app`.
6. Smoke-test it: open `https://eqf-api.vercel.app/test` — you should see
   `{"message":"This is Easy Quick Form API", ...}`.

> In MongoDB Atlas → Network Access, make sure `0.0.0.0/0` is allowed (Vercel's
> function IPs are dynamic), or the DB connection will fail.

---

## Step 2 — Deploy the frontend (`eqf-web`)

1. Vercel dashboard → **Add New… → Project** → import the **same** repo again.
2. **Configure project:**
   - **Root Directory:** `client`
   - Framework Preset: **Vite** (auto-detected)
   - Build/Output commands: leave default — `client/vercel.json` already sets them.
3. **Environment Variables:**

   | Name                       | Value                                              |
   | -------------------------- | -------------------------------------------------- |
   | `VITE_BACKEND_BASE_URL`    | `https://eqf-api.vercel.app/api/v1`  ← your API URL |
   | `VITE_SECRET_KEY`          | same value as before (used to encrypt local state)  |
   | `VITE_GOOGLE_CLIENT_ID`    | your Google OAuth client id                         |
   | `VITE_GOOGLE_CLIENT_SECRET`| your Google OAuth client secret                     |

4. **Deploy.** You'll get a URL like `https://eqf-web.vercel.app`.

---

## Step 3 — Wire the two together (CORS + cookies)

The API only accepts requests / sets auth cookies for known origins.

1. Go back to the **`eqf-api`** project → Environment Variables.
2. Set **`CLIENT_URL`** = your frontend URL (e.g. `https://eqf-web.vercel.app`,
   no trailing slash).
3. **Redeploy `eqf-api`** (Deployments → ⋯ → Redeploy) so the new env var takes effect.

That's it — the frontend (`withCredentials`) and backend (`sameSite:'none'; secure:true`
cookies) are already configured for cross-domain auth.

---

## Step 4 — Update Google OAuth allowed origins

In Google Cloud Console → your OAuth client → **Authorized JavaScript origins**, add
your frontend URL (`https://eqf-web.vercel.app`). Otherwise Google login is blocked.

---

## Verify

- Visit the frontend URL → sign up / log in → create a form → submit a response.
- If login fails with a CORS error, double-check `CLIENT_URL` on the API matches the
  frontend origin exactly and that you redeployed the API.

## Known limitation

- **Profile-picture upload is disabled in production.** Vercel's serverless filesystem
  is read-only/ephemeral, so the disk-based image storage can't persist there (the
  upload silently no-ops via the `VERCEL` env guard in `userController.ts`). To enable
  it in prod later, switch the upload to a cloud store like Cloudinary or S3.

## Custom domains (optional)

Add a domain to each project under Settings → Domains. If you do, update
`CLIENT_URL` (API) and `VITE_BACKEND_BASE_URL` (web) to the custom domains and redeploy.
