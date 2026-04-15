# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Commands

```bash
npm run dev          # start dev server at http://localhost:3000
npm run build        # prisma generate && next build
npm run lint         # eslint
npm run db:migrate   # prisma migrate dev (local SQLite only)
npm run db:seed      # seed 35 WSET Level 2 wines into the DB
npm run db:reset     # migrate reset --force + seed (destructive, local only)
```

**Required `.env` variables:**
```
TURSO_DATABASE_URL=libsql://...   # or file:dev.db for local SQLite
TURSO_AUTH_TOKEN=eyJ...           # omit when using file: URL
JWT_SECRET=any-long-secret
BLOB_READ_WRITE_TOKEN=...         # required for wine label image uploads (Vercel Blob)
```

---

## Architecture

**No API routes.** Server components read from the DB directly via `db.*` (Prisma). All mutations go through `app/actions.ts` (`'use server'`). Client components call server actions via `<form action={...}>` or `useActionState`.

**Route groups:**
- `app/(auth)/` — public routes (login, register), no auth check
- `app/(main)/` — protected routes; `layout.tsx` runs `getSession()` and redirects to `/login` if null

**Key files:**
- `app/actions.ts` — every server action in the codebase
- `lib/db.ts` — Prisma singleton with libSQL adapter
- `lib/auth.ts` — `getSession()`, `createSession()`, `deleteSession()` using JWT + HttpOnly cookie
- `prisma/schema.prisma` — all models
- `prisma.config.ts` — Prisma config; reads `TURSO_DATABASE_URL` for migrations
- `prisma/apply-migration.ts` — script to push a migration SQL file to the live Turso DB
- `app/globals.css` — Tailwind v4 `@theme {}` tokens: `wine`, `wine-dark`, `gold`, `cream`, `brown`, `muted`, `card`, `border`

**Admin check:** `session.name === 'Ricky'` — used in bug report resolution. No roles table.

---

## Critical Conventions

### Prisma 7 — Driver Adapter
Do NOT pass `datasourceUrl` to `PrismaClient`. Always use the adapter:
```ts
import { PrismaLibSql } from '@prisma/adapter-libsql'  // PrismaLibSql, not PrismaLibSQL
const adapter = new PrismaLibSql({ url, authToken })
const db = new PrismaClient({ adapter })
```
Generated client path: `app/generated/prisma/client` (gitignored, rebuilt on every `prisma generate`).

### Next.js 16 — async params and cookies
`params`, `searchParams`, and `cookies()` are all **Promises**:
```ts
const { id } = await params          // in page components
const cookieStore = await cookies()  // in lib/auth.ts and server actions
```

### Server Actions — two signatures

**With `useActionState`** (client form with error state):
```ts
export async function myAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null>
```
Pass extra IDs via hidden inputs, not closures — inline async wrappers around server actions **break** in Next.js 16/React 19:
```tsx
// ✅ correct
<input type="hidden" name="slotId" value={slotId} />
const [state, action] = useActionState(myAction, null)

// ❌ breaks serialization
const [state, action] = useActionState(
  async (_prev, fd) => myAction(slotId, fd),  // do not do this
  null
)
```

**Without `useActionState`** (fire-and-forget, e.g. wishlist toggle):
```ts
export async function myAction(id: number): Promise<void>
// called as: <form action={myAction.bind(null, id)}>
```

### Server/Client boundary
Event handlers (`onClick`, `onChange`, etc.) cannot be passed from server components to client components. If a server component needs a confirm dialog or interactive button, extract it into a small `'use client'` component (see `components/DeleteEventButton.tsx`).

---

## Migration Workflow

`prisma migrate dev` requires a `file:` URL. The production database is on Turso (`libsql://`). The workflow for every schema change:

1. Temporarily set `prisma.config.ts` datasource url to `"file:./dev.db"`
2. `npx prisma migrate dev --name describe-change` — generates SQL in `prisma/migrations/`
3. Restore `prisma.config.ts` url to `process.env["TURSO_DATABASE_URL"]`
4. Update `prisma/apply-migration.ts` to point at the new migration file
5. `npx tsx prisma/apply-migration.ts` — applies the SQL to production Turso
6. `npx prisma generate` — rebuilds the client

---

## Adding Features

### New DB field
1. Edit `prisma/schema.prisma`
2. Run migration workflow above
3. Update `app/actions.ts` (create/update data)
4. Update pages/components that display the field

### New protected page
Create `app/(main)/your-route/page.tsx` as a server component. Auth is handled by the layout — no per-page auth check needed. Add `'use client'` only when you need hooks, event handlers, or browser APIs.

### New server action
Add to `app/actions.ts`. Always call `getSession()` first and redirect if null. Call `revalidatePath()` for every route whose cached data changes.

### New client component needing a server action
Use `useActionState(serverAction, null)` directly — never wrap in an inline async function. Pass non-form data (record IDs, etc.) via `<input type="hidden">`.

---

## Known Gotchas

- **`legacy-peer-deps=true`** in `.npmrc` — required because `react-simple-maps` declares peer deps on React 16–18 but works fine with 19. Vercel reads `.npmrc` automatically.
- **`import 'dotenv/config'`** must be the first line of `prisma/seed.ts` — `tsx` does not auto-load `.env`.
- **Vercel Blob** requires `BLOB_READ_WRITE_TOKEN` env var. Create a Blob store in the Vercel dashboard (Storage tab) to get the token; Vercel injects it automatically after that.
- **`prisma generate` on Vercel** — build command is `prisma generate && next build` (set in `package.json`). Do not change this.
- **JWT is stateless** — rotating `JWT_SECRET` logs out all users immediately.
