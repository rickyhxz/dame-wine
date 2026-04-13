# DevOps Guide

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm

### First-time setup

```bash
cd dame-wine
npm install
cp .env.example .env   # or create .env manually (see Environment Variables below)
npx prisma migrate dev
npm run db:seed
npm run dev
```

App runs at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `TURSO_DATABASE_URL` | Yes | `libsql://dame-wine-yourname.aws-us-east-1.turso.io` | Database URL — use `file:dev.db` for a local SQLite file instead |
| `TURSO_AUTH_TOKEN` | Prod only | `eyJ...` | Turso auth token (omit or leave blank when using `file:` URL) |
| `JWT_SECRET` | Yes | any long random string | Signs session JWTs — change in production |

For local dev with a pure local file (no Turso account needed):
```env
TURSO_DATABASE_URL="file:dev.db"
JWT_SECRET="any-local-secret"
```

---

## Database

### Turso CLI

Install:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
```

Common commands:
```bash
turso db list                          # list all databases
turso db show dame-wine                # show DB info + URL
turso db tokens create dame-wine       # create/rotate auth token
turso db shell dame-wine               # open interactive SQL shell
turso db shell dame-wine < query.sql   # run a SQL file
```

### Running migrations

```bash
# Apply pending migrations to local DB
npm run db:migrate

# Reset local DB and re-seed (destructive — local only)
npm run db:reset
```

To apply a new migration to **production Turso**, generate the SQL first:

```bash
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > migration.sql
```

Then apply via Turso CLI:
```bash
turso db shell dame-wine < migration.sql
```

> Note: `prisma migrate dev` targets your local `TURSO_DATABASE_URL`. For production migrations, use `migrate diff` + `turso db shell` — never run `migrate dev` against the production URL.

### Seeding

```bash
npm run db:seed
```

Seeds 35 WSET Level 2 reference wines. Safe to run on an empty database. Will fail with a unique constraint error if wines already exist (idempotent by design — just don't run it twice).

### Adding a new user manually (via SQL shell)

```bash
turso db shell dame-wine
```

```sql
-- Generate a bcrypt hash first (use https://bcrypt-generator.com or a local script)
INSERT INTO User (name, passwordHash, createdAt)
VALUES ('Alice', '$2a$10$...', datetime('now'));
```

Or register via `/register` in the app — it uses the same bcryptjs hashing.

---

## Deployment (Vercel)

### Initial setup

1. Push the repo to GitHub
2. Import the project in Vercel
3. Set environment variables in Vercel project settings:
   - `TURSO_DATABASE_URL` → production libsql URL
   - `TURSO_AUTH_TOKEN` → production auth token
   - `JWT_SECRET` → a long random secret (different from local)
4. Set build command: `prisma generate && next build` (already in `package.json`)
5. Deploy

### Deploy on every push

Vercel auto-deploys on push to `main`. No manual steps needed.

### Rotating secrets

1. Generate a new Turso token: `turso db tokens create dame-wine`
2. Update in Vercel: Settings → Environment Variables → `TURSO_AUTH_TOKEN`
3. Redeploy (Vercel → Deployments → Redeploy latest)

Rotating `JWT_SECRET` invalidates all active sessions — all users will be logged out.

---

## Prisma

### Regenerating the client

```bash
npx prisma generate
```

Run this after any schema change. The build script does it automatically on Vercel (`prisma generate && next build`).

### Adding a new model or field

1. Edit `prisma/schema.prisma`
2. `npx prisma migrate dev --name describe-change` (creates migration + regenerates client)
3. Apply migration to production (see Database → Running migrations)
4. Commit both `prisma/schema.prisma` and the new `prisma/migrations/` file

### Viewing the generated client

```
app/generated/prisma/   ← gitignored, regenerated on build
```

---

## Monitoring & Observability

### Vercel logs

- **Function logs**: Vercel dashboard → project → Functions tab → click a function
- **Build logs**: Vercel dashboard → Deployments → click a deployment

### Turso dashboard

- Turso web console shows query counts, storage, and billing at turso.tech/dashboard

### Debugging locally

Add `console.log` to Server Actions (`app/actions.ts`) or Server Components — output appears in the **terminal** running `npm run dev`, not the browser.

For client components, console output appears in the **browser devtools**.

---

## Common Issues

### `TURSO_DATABASE_URL is not set`
The `.env` file is missing or not loaded. Check the file exists and contains `TURSO_DATABASE_URL`. In `seed.ts`, make sure `import 'dotenv/config'` is the first line.

### `Module not found: '@/app/generated/prisma/client'`
Prisma client hasn't been generated. Run `npx prisma generate`. On Vercel, ensure build command is `prisma generate && next build`.

### `Table 'main.Wine' does not exist`
Migrations haven't been applied. Run `npm run db:migrate` locally.

### React peer dependency conflict on Vercel build
`react-simple-maps` targets React 16–18. The `.npmrc` with `legacy-peer-deps=true` resolves this. If the file is missing, create it:
```
legacy-peer-deps=true
```

### `cookies()` must be awaited
In Next.js 16, `cookies()` returns a Promise. Always `await cookies()` before calling `.get()`, `.set()`, or `.delete()`.

### `params` must be awaited
In Next.js 16, `params` and `searchParams` in page components are Promises. Always destructure after `await`:
```ts
const { id } = await params
const { type } = await searchParams
```

### JWT verify fails / users get logged out
Check `JWT_SECRET` is set and consistent. If you rotated the secret, all old tokens are invalid — users must log in again.

### Prisma `PrismaLibSql` import error
The correct casing is `PrismaLibSql` (not `PrismaLibSQL`). Import from `@prisma/adapter-libsql`.

---

## Routine Maintenance

| Task | How often | Command |
|---|---|---|
| Rotate Turso auth token | Quarterly or on compromise | `turso db tokens create dame-wine` + update Vercel env var |
| Review Vercel function logs | After user reports errors | Vercel dashboard → Functions |
| Check Turso storage quota | Monthly | Turso dashboard |
| Update dependencies | As needed | `npm update` + test locally |
| Backup production data | As needed | `turso db shell dame-wine` + export SQL |
