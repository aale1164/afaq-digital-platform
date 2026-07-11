# AFAQ Digital Platform

Production-oriented Arabic RTL full-stack tools platform built with Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS 4, Supabase Auth/PostgreSQL/RLS, Zod and Cloudflare Turnstile integration points.

## Commands

```bash
npm install
npm run dev
npm run type-check
npm run lint
npm test
npm run build
```

## Architecture

- `src/app`: App Router pages, route handlers and protected areas.
- `src/features`: auth, admin and real tool implementations.
- `src/lib`: environment parsing, Supabase clients, permissions, quota and security helpers.
- `database`: atomic migration, RLS policies and seed notes.
- `scripts/bootstrap-owner.mjs`: one-time safe OWNER role assignment.
- `tests`: quota, permission, registry and image processing tests.

Anonymous quota is enforced server-side using an HMAC IP-derived fingerprint plus a signed HttpOnly visitor cookie. A signed, short-lived permit is issued before a tool run and consumed only after successful processing. Database RPCs provide atomic/idempotent consumption in production; a clearly documented in-memory fallback is used in demo mode.

See `README-AR.md` for the complete Arabic setup guide and `PROJECT-STATUS.md` for the exact implementation status.

## Security

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `VISITOR_HMAC_SECRET`, `TURNSTILE_SECRET_KEY`, or provider keys to the browser. Public variables are the only variables prefixed with `NEXT_PUBLIC_`.

Copyright: programming and development by Adnani. No commercial license is granted by this README.
