# Architecture

## Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack, server components, server actions, single deploy unit |
| Language | TypeScript 5 | End-to-end type safety |
| Database | Turso (libSQL / SQLite) | Serverless-compatible SQLite, free tier generous for small groups |
| ORM | Prisma 7 | Type-safe queries, migrations, driver adapter model |
| DB Adapter | @prisma/adapter-libsql | Bridges Prisma 7 to the libSQL client |
| Auth | bcryptjs + jose (JWT) | Passwords hashed with bcrypt, session stored as HttpOnly JWT cookie |
| Styling | Tailwind CSS v4 | Utility-first, mobile-first, configured via `@theme` in CSS |
| Map | react-simple-maps | Lightweight SVG world map for the profile dashboard |
| Hosting | Vercel | Zero-config Next.js deployment, auto HTTPS, CDN |

---

## Directory Structure

```
dame-wine/
├── app/
│   ├── layout.tsx              # Root HTML shell
│   ├── page.tsx                # Root redirect (/ → /home or /login)
│   ├── globals.css             # Tailwind v4 imports + wine theme tokens
│   ├── actions.ts              # All server actions (auth, wines, tastings, events)
│   ├── generated/
│   │   └── prisma/             # Auto-generated Prisma client (gitignored)
│   ├── (auth)/
│   │   ├── login/page.tsx      # Login form (client component)
│   │   └── register/page.tsx   # Register form (client component)
│   └── (main)/
│       ├── layout.tsx          # Auth guard + Nav wrapper for all app routes
│       ├── home/page.tsx       # Profile dashboard — stats, world map
│       ├── wines/
│       │   ├── page.tsx        # Wine catalog browser
│       │   ├── add/page.tsx    # Add wine form
│       │   └── [id]/page.tsx   # Wine detail + all friends' tastings
│       ├── my-list/page.tsx    # Personal wishlist + tasted wines
│       └── events/
│           ├── page.tsx        # Events list
│           ├── new/
│           │   ├── page.tsx    # Server wrapper (fetches users + wines)
│           │   └── client.tsx  # Create event form (client component)
│           └── [id]/page.tsx   # Event detail + cross-user tasting notes
├── components/
│   ├── Nav.tsx                 # Top navigation bar (server component)
│   ├── FilterBar.tsx           # Wine browse filters (client, uses URL params)
│   ├── TastingActions.tsx      # Wishlist/tasted buttons + rating form (client)
│   └── WorldMap.tsx            # SVG world map (client, react-simple-maps)
├── lib/
│   ├── db.ts                   # Prisma client singleton with libSQL adapter
│   └── auth.ts                 # JWT create/read/delete session helpers
├── prisma/
│   ├── schema.prisma           # Data models
│   ├── seed.ts                 # 35 WSET Level 2 wines seed script
│   └── migrations/             # SQL migration history
└── public/                     # Static assets
```

---

## Authentication Flow

```
User submits login form
        │
        ▼
loginAction() [server action]
        │
        ├─ Hash comparison via bcrypt.compare()
        │
        ├─ On success: SignJWT({ userId, name }) → 30-day token
        │
        ├─ Set HttpOnly cookie "token" (secure in prod, lax same-site)
        │
        └─ redirect('/home')

Every protected request:
        │
        ▼
(main)/layout.tsx [server component]
        │
        ├─ getSession() → reads "token" cookie → jwtVerify()
        │
        ├─ null → redirect('/login')
        │
        └─ valid → render children with Nav
```

Session payload stored in JWT: `{ userId: number, name: string }`.
No database lookup on every request — the JWT is self-contained.

---

## Data Flow

### Reading data (Server Components)
Pages in `(main)/` are server components. They call `db.*` directly — no API routes needed.

```
Browser request
      │
      ▼
Next.js server renders page.tsx
      │
      ├─ getSession() — reads JWT cookie
      │
      ├─ db.wine.findMany({ ... }) — Prisma → libSQL → Turso
      │
      └─ Returns HTML with data already embedded
```

### Writing data (Server Actions)
All mutations go through `app/actions.ts` using `'use server'`. Client components call them via form `action=` or event handlers.

```
User clicks "Add to Wishlist"
      │
      ▼
TastingActions.tsx (client)
      │  form action={addToWishlistAction.bind(null, wineId)}
      ▼
addToWishlistAction() [server action in actions.ts]
      │
      ├─ getSession() — auth check
      │
      ├─ db.tasting.upsert() — Prisma mutation
      │
      └─ revalidatePath('/wines') — Next.js cache invalidation
             → Next.js re-renders affected server components
```

No separate REST API. Server Actions post to Next.js internal endpoints automatically.

---

## Database Schema

```
User ──────────────────────────────────────────────────────────
  │ id, name, passwordHash, createdAt
  │
  ├──< Tasting >──── Wine
  │     userId, wineId (unique pair)
  │     status: WISHLIST | TASTED
  │     rating (1-5), comment, tastedAt
  │
  ├──< TastingEvent (as creator)
  │     id, name, location, scheduledAt, notes, createdBy
  │
  ├──< EventAttendee >──── TastingEvent
  │     (userId, eventId) composite PK
  │
  └── (referenced by EventAttendee)

Wine ──────────────────────────────────────────────────────────
  │ id, name, variety, type, region, country, year, description
  │
  ├──< Tasting
  │
  └──< EventWine >──── TastingEvent
        (wineId, eventId) composite PK
```

---

## Key Design Decisions

**Single `actions.ts` file** — all server actions in one place makes it easy to find mutations. If it grows large, split by domain (e.g. `actions/wines.ts`).

**No API routes** — Server Actions replace REST endpoints for mutations. Server Components replace API fetch calls for reads. Simpler mental model, fewer files.

**JWT in cookie (not database sessions)** — stateless auth means no session table to maintain. 30-day expiry. Trade-off: can't force-logout a specific user without a token blocklist (acceptable for a private friend app).

**Turso for production, `file:` URL for local** — the libSQL adapter handles both via the same `TURSO_DATABASE_URL` env var. `file:dev.db` locally, `libsql://...` in production.

**Tailwind v4** — configured entirely in `globals.css` via `@theme {}`. No `tailwind.config.js` needed. Custom wine color tokens (`--color-wine`, `--color-gold`, etc.) available as Tailwind classes (`bg-wine`, `text-gold`).

**`react-simple-maps` with `--legacy-peer-deps`** — the library targets React 16–18 but works fine with React 19. The `.npmrc` flag handles this without any runtime issues.
