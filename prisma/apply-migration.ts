import 'dotenv/config'
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
if (!url) throw new Error('TURSO_DATABASE_URL is not set')

const client = createClient({ url, authToken })

const sql = readFileSync(
  join(process.cwd(), 'prisma/migrations/20260413191256_add_slot_terroir_vintage/migration.sql'),
  'utf8'
)

// Split on statement boundaries, strip comment lines, run each one
const statements = sql
  .split(';')
  .map((s) =>
    s
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .trim()
  )
  .filter((s) => s.length > 0)

async function main() {
  console.log(`Applying ${statements.length} statements to Turso…`)
  for (const stmt of statements) {
    try {
      await client.execute(stmt)
      console.log(`  ✓ ${stmt.split('\n')[0].slice(0, 60)}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('duplicate column') || msg.includes('already exists')) {
        console.log(`  ~ skipped (already applied): ${stmt.split('\n')[0].slice(0, 60)}`)
      } else {
        throw err
      }
    }
  }
  console.log('Done.')
}

main().catch(console.error).finally(() => client.close())
