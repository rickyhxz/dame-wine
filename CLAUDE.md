@AGENTS.md

# Dame Wine — Claude Code Guide

## Project Overview

A private wine tracking app for a friend group. Next.js 16 (App Router) + Prisma 7 + Turso (libSQL) + Tailwind v4. All server actions in `app/actions.ts`. No API routes — server components read from DB directly, server actions handle all mutations.

See `README.md` for features, `ARCHITECTURE.md` for technical design, `DEVOPS.md` for ops tasks.

---

## Running Locally

```bash
npm install
# ensure .env has TURSO_DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run db:seed   # only needed once on a fresh DB
npm run dev       # http://localhost:3000
```

---

## Key Conventions

### Prisma 7 — Driver Adapter Pattern (breaking change)
Do NOT pass `datasourceUrl` to `PrismaClient`. Use the adapter:
```ts
import { PrismaLibSql } from '@prisma/adapter-libsql'  // note: PrismaLibSql, not PrismaLibSQL
const adapter = new PrismaLibSql({ url, authToken })
const db = new PrismaClient({ adapter })
```
Client is generated to `app/generated/prisma/client` (not the usual `@prisma/client` path).
Import: `import { PrismaClient } from '@/app/generated/prisma/client'`

### Next.js 16 — async params and cookies
`params`, `searchParams`, and `cookies()` are all Promises — always await them:
```ts
// In page components:
const { id } = await params
const { q } = await searchParams

// In server actions / lib/auth.ts:
const cookieStore = await cookies()
```

### Auth
Session is a JWT in an HttpOnly cookie named `token`. Payload: `{ userId, name }`.
- `getSession()` → `SessionPayload | null`
- `createSession(payload)` → sets cookie
- `deleteSession()` → clears cookie

The `(main)/layout.tsx` auth guard calls `getSession()` and redirects to `/login` if null. All server actions also call `getSession()` to verify the user.

### Server Actions
All mutations are in `app/actions.ts` with `'use server'`. They all return `Promise<{ error: string } | null>` — `null` on success, `{ error }` on failure. Client components use `useActionState(action, null)` to handle the result.

### Tailwind v4
No `tailwind.config.js`. All configuration is in `app/globals.css` via `@theme {}`. Custom tokens: `--color-wine`, `--color-gold`, `--color-cream`, `--color-brown`. Use as `bg-wine`, `text-gold`, etc.

---

## Common Tasks

### Add a new field to a model
1. Edit `prisma/schema.prisma`
2. `npx prisma migrate dev --name your-description`
3. Update relevant server actions in `app/actions.ts`
4. Update the page/component that reads or displays the field

### Add a new page
Pages go in `app/(main)/your-route/page.tsx` (protected, requires login) or `app/(auth)/your-route/page.tsx` (public). Server components by default — add `'use client'` only if you need browser APIs, event handlers, or hooks.

### Add a new server action
Add to `app/actions.ts` with `'use server'` at the top of the file. Follow the existing pattern:
```ts
export async function myAction(formData: FormData): Promise<{ error: string } | null> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }
  // ... db mutation
  revalidatePath('/affected-route')
  return null
}
```

### Add a new wine type or filter
The wine `type` field is a plain string (not a Prisma enum). Valid values: `RED`, `WHITE`, `ROSE`, `SPARKLING`, `DESSERT`, `FORTIFIED`. CSS badge classes for each are defined in `globals.css`.

---

## What to Watch Out For

- **Prisma generate on Vercel**: build script must be `prisma generate && next build` — already set in `package.json`.
- **Seeding**: `prisma/seed.ts` must have `import 'dotenv/config'` as the first line — tsx doesn't auto-load `.env`.
- **react-simple-maps**: targets React 16–18, project uses 19. The `.npmrc` has `legacy-peer-deps=true` to handle this on Vercel.
- **No database sessions**: JWT is stateless. Can't force-logout a single user without a token blocklist (acceptable trade-off for a private friend app).
- **Turso auth token**: leave `TURSO_AUTH_TOKEN` out of `.env` (or set to empty string) only when using a `file:` URL for local dev. Always required for production.
