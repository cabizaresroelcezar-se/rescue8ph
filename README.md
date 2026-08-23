# Rescue 8 Philippines

A modern Philippine marketing, CMS, and e-commerce platform built with Next.js 16, Supabase, and TypeScript.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui, Lucide icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions, RLS)
- **Validation**: Zod
- **Hosting**: Vercel
- **Payments**: Xendit, PayMongo, Manual/COD (via provider abstraction)
- **Shipping**: Manual, Lalamove, J&T, LBC (via provider abstraction)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
4. Run the Supabase migration:
   ```bash
   # Install Supabase CLI first: https://supabase.com/docs/guides/cli
   supabase db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required environment variables.

**Never commit `.env.local` to git.**

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # React components (ui/, marketing/, shop/, admin/)
  features/     # Domain-specific modules
  lib/           # Utilities (supabase/, auth/, payments/, shipping/, seo/, validation/)
  types/         # TypeScript type definitions

supabase/
  migrations/    # SQL migrations
  seed.sql        # Seed data

ai/              # AI project memory
  PROJECT_CONTEXT.yaml
  ARCHITECTURE.md
  DEVELOPMENT_RULES.md
  CURRENT_TASK.md
  CHANGELOG.md
```

## Security

- RLS on every database table
- RBAC with granular permissions
- Server-side authorization for all mutations
- Never expose service role key or secrets to the client
- Audit logging for privileged actions

## Development Phases

See `/ai/PROJECT_CONTEXT.yaml` for the full development roadmap.

## License

MIT