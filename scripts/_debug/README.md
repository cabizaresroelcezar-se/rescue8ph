# Debug scripts

These are one-off debug / verification utilities, not production code. They were written during development to diagnose specific issues and verify specific migrations.

They use the **service role** key from `.env.local` to bypass RLS. Don't run these against production databases you don't control.

| Script | Original purpose |
|---|---|
| `debug-admin-edit.py` | Sign in via Supabase and access `/admin/pages/<uuid>` to debug the admin page editor 404s |
| `dump-products.py` | Read all products + product_images + storage files from local Supabase (for DB inspection) |
| `test-admin-pages.py` | Sign in via the dev server and hit `/admin/pages/<uuid>` to capture the actual server response |
| `verify-reviews.py` | One-shot verification that the `20260825000404_product_reviews.sql` migration was applied |

If you need to run one:

```bash
cd scripts/_debug
python3 <script>.py
```

If you don't need them, delete the folder — nothing depends on it.

## Why aren't these in the repo root?

The `scripts/` directory at the repo root is reserved for tools the build / deploy pipeline might use. These one-off debug utilities don't fit that bar; keeping them there signaled "production tool" when they're really "leftovers from a specific debugging session."