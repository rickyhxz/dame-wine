import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { resolveBugAction, reopenBugAction } from '@/app/actions'

const URGENCY_LABEL: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

const URGENCY_CLASS: Record<string, string> = {
  LOW: 'bg-blue-50 text-blue-700 border-blue-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-red-50 text-red-700 border-red-200',
}

export default async function BugsPage() {
  const session = await getSession()
  const isAdmin = session?.name === 'Ricky'

  const bugs = await db.bugReport.findMany({
    include: { user: true },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  const open = bugs.filter((b) => b.status === 'OPEN')
  const fixed = bugs.filter((b) => b.status === 'FIXED')

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brown">Report a Bug to Ricky</h1>
          <p className="text-sm text-muted mt-0.5">
            {open.length} open · {fixed.length} fixed
          </p>
        </div>
        <Link
          href="/bugs/new"
          className="bg-wine text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-wine-dark transition-colors"
        >
          Report a Bug
        </Link>
      </div>

      {open.length === 0 && fixed.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-10 text-center text-muted text-sm">
          No bug reports yet. If something&apos;s broken, let Ricky know!
        </div>
      )}

      {open.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wide">Open ({open.length})</h2>
          {open.map((bug) => (
            <BugCard key={bug.id} bug={bug} isAdmin={isAdmin} />
          ))}
        </section>
      )}

      {fixed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wide">Fixed ({fixed.length})</h2>
          {fixed.map((bug) => (
            <BugCard key={bug.id} bug={bug} isAdmin={isAdmin} />
          ))}
        </section>
      )}
    </div>
  )
}

function BugCard({
  bug,
  isAdmin,
}: {
  bug: {
    id: number
    description: string
    urgency: string
    status: string
    createdAt: Date
    resolvedAt: Date | null
    user: { name: string }
  }
  isAdmin: boolean
}) {
  const isFixed = bug.status === 'FIXED'

  return (
    <div className={`bg-card rounded-xl border p-5 ${isFixed ? 'border-border opacity-70' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${URGENCY_CLASS[bug.urgency] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {URGENCY_LABEL[bug.urgency] ?? bug.urgency} priority
            </span>
            {isFixed && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                Fixed
              </span>
            )}
          </div>
          <p className="text-sm text-brown">{bug.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
            <span>Reported by {bug.user.name}</span>
            <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
            {bug.resolvedAt && (
              <span>Fixed {new Date(bug.resolvedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="shrink-0">
            {!isFixed ? (
              <form action={resolveBugAction.bind(null, bug.id)}>
                <button
                  type="submit"
                  className="text-xs bg-green-600 text-white rounded-lg px-3 py-1.5 font-semibold hover:bg-green-700 transition-colors"
                >
                  Mark Fixed
                </button>
              </form>
            ) : (
              <form action={reopenBugAction.bind(null, bug.id)}>
                <button
                  type="submit"
                  className="text-xs text-muted hover:text-brown transition-colors"
                >
                  Reopen
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
