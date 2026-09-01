# Deploying to Vercel

A step-by-step checklist for the first deployment.

## One-time setup (Vercel account)

1. Sign in to https://vercel.com using your **GitHub account `cabizaresroelcezar-se`**.
2. Accept the GitHub OAuth permission to read your repos.

## Create the project

1. Visit https://vercel.com/new
2. Select **Import** next to `cabizaresroelcezar-se/rescue8ph`
3. Vercel auto-detects Next.js. Verify:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm ci`
   - Root Directory: `./`
4. **Do NOT click Deploy yet** — first add env vars (next step)
5. Click **Environment Variables** and add each one from the table below

## Environment variables

Required for the app to boot:

| Key | Value | Sensitive? | Source |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | No | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (long JWT) | **Yes** | Same page as above |
| `SUPABASE_SERVICE_ROLE_KEY` | (long JWT) | **Yes — strict** | Same page as above. This bypasses RLS; never expose client-side. |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-vercel-domain>.vercel.app` (or custom domain if you set one up first) | No | The URL Vercel assigns you on first preview deploy |

Recommended for CI (used by `.github/workflows/supabase-migrate.yml`):

| Key | Value |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | from https://supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | from your dashboard URL |
| `SUPABASE_DB_PASSWORD` | from Project Settings → Database |

These last three are **GitHub repo secrets**, not Vercel env vars. Set them at https://github.com/cabizaresroelcezar-se/rescue8ph/settings/secrets/actions.

Optional — add only when you have real provider accounts:

| Key | When |
|---|---|
| `XENDIT_SECRET_KEY` | When integrating Xendit payment adapter |
| `PAYMONGO_SECRET_KEY` | When integrating PayMongo payment adapter |
| `LALAMOVE_API_KEY` / `LALAMOVE_API_SECRET` | When integrating Lalamove shipping adapter |
| `JNT_API_KEY` | When integrating J&T shipping adapter |
| `LBC_API_KEY` | When integrating LBC shipping adapter |
| `RESEND_API_KEY` | When wiring transactional email |

Until these are set, the app uses MANUAL payment + MANUAL shipping, which is the default codepath and works for COD orders.

## First deploy

1. Click **Deploy** in Vercel
2. Wait ~2-3 minutes for the build
3. Visit the preview URL Vercel assigns (looks like `rescue8ph-<hash>-<your-name>.vercel.app`)
4. Verify `/api/health` returns:
   ```json
   {"status":"ok","missing":[],"warnings":[...]}
   ```
   - `missing: []` → all required env vars are set correctly
   - `warnings: [...]` → only optional ones not yet configured (expected)

## Make it your primary deploy

If this is the main project (not a preview), in Vercel Project Settings → Git:

1. Production Branch: `main`
2. Auto-deploy on push to main: enabled (default)

Then every merge to `main` triggers a production redeploy automatically.

## Custom domain (optional)

1. Buy a domain (Namecheap, Cloudflare Registrar, etc.)
2. Vercel → Project → Settings → Domains → Add
3. Update your DNS with the records Vercel gives you
4. Wait ~5 min for SSL provisioning
5. Update `NEXT_PUBLIC_SITE_URL` env var to your new domain
6. Redeploy

## Region choice

`vercel.json` is set to `hnd1` (Tokyo) — the closest Vercel hobby-tier region to the Philippines. Sub-100ms latency to Manila. Singapore (`sin1`) is closer but Pro/Enterprise only.

## Smoke test after deploy

In order:

- [ ] `/api/health` → 200, `missing: []`
- [ ] `/` → home page renders
- [ ] `/products` → list renders
- [ ] `/blog` → list renders
- [ ] `/sitemap.xml` → XML renders
- [ ] Sign in as `customer@rescue8ph.com` → can browse /account
- [ ] Place a COD test order → order shows up in /admin/orders (as admin user)
- [ ] Sign in as `admin@rescue8ph.com` → admin dashboard loads
- [ ] `/admin/audit-logs` → shows the new audit rows (login, placeOrder, etc.)

## What to do if things break

| Symptom | Likely cause | Fix |
|---|---|---|
| 500 on every page | Missing `NEXT_PUBLIC_SUPABASE_URL` | Check Vercel env vars |
| `api/health` reports `missing: ["NEXT_PUBLIC_SUPABASE_URL"]` | Same | Same |
| Login redirects to error | Wrong anon key | Re-copy from Supabase dashboard |
| Orders not saving | Missing service-role key | Add it (Sensitive) |
| Build fails with `@/` cannot resolve | Old Node | Vercel auto-picks Node 20 — check Project Settings → General |
| Build fails with ESLint errors | (rare) | Run `npm run lint` locally first to catch |

## Rolling back

If a deploy breaks production:

1. Vercel → Deployments → find the last good one
2. Click ⋯ → Promote to Production
3. Optional: revert the bad commit on main to stop auto-redeploys