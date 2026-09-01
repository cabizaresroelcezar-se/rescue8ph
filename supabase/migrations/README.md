# Supabase migrations

This directory holds the SQL migrations for the Rescue8 PH database schema.

## Files

Each `<timestamp>_<name>.sql` file is a numbered migration, run in order by timestamp prefix. These are the source of truth — the production database schema should match what these files collectively define.

## Apply migrations

Two ways to apply these to your Supabase project:

### Option A: GitHub Actions (preferred, if secrets are configured)

The workflow at `.github/workflows/supabase-migrate.yml` runs `supabase db push` whenever migrations change on `main`. Requires three repo secrets:

- `SUPABASE_ACCESS_TOKEN` — from https://supabase.com/dashboard/account/tokens
- `SUPABASE_PROJECT_REF` — from your project URL: `https://supabase.com/dashboard/project/<REF>`
- `SUPABASE_DB_PASSWORD` — from Project Settings → Database

Once those are set, just `git push origin main` and the workflow handles the rest.

### Option B: Paste-ready bundle (manual, for free-plan / single-project setups)

If you can't run the workflow (free plan, missing secrets, or you want full control over what runs), use the bundled SQL:

1. Open `BUNDLE_pending_migrations.sql` — it's all 12 pending migrations concatenated, separated by `>>> BEGIN MIGRATION` / `<<< END MIGRATION` headers
2. Open Supabase SQL Editor on your project
3. Paste the entire contents
4. Click "Run"

The bundle is generated from this directory's files via:

```bash
{
  for f in $(ls supabase/migrations/*.sql | grep -v BUNDLE | sort); do
    echo "-- >>> BEGIN MIGRATION: $(basename $f)"
    cat "$f"
    echo "-- <<< END MIGRATION: $(basename $f)"
  done
} > BUNDLE.sql
```

Re-generate after any new migration is added: the script picks up everything in the directory in sorted order.

## What's in this directory

```
20260824000100_initial_rescue8_schema.sql     — initial schema (assumed already applied)
20260824000200_storage_buckets_and_wishlist.sql
20260825000100_seed_blog_posts.sql
20260825000200_pages_body.sql
20260825000300_cart_coupon.sql
20260825000400_product_reviews.sql
20260825000500_seed_products_and_categories.sql
20260825000600_recently_viewed.sql
20260825000700_review_helpful_votes.sql
20260825000800_add_pages_body_column.sql
20260825000900_order_notes.sql
20260825001000_cms_enhancements.sql
20260825001100_wishlist_share_links.sql
BUNDLE_pending_migrations.sql                 — concat of the 12 above, for manual apply
README.md                                     — this file
```

The bundle does NOT include `20260824000100_initial_rescue8_schema.sql` — that's the baseline schema and assumed to already be in place.