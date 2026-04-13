'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createEventAction } from '@/app/actions'

interface User { id: number; name: string }
interface Wine { id: number; name: string; variety: string; region: string; year: number | null }

// These props come from a server component wrapper
export default function NewEventClient({
  users,
  wines,
}: {
  users: User[]
  wines: Wine[]
}) {
  const [state, action, pending] = useActionState(createEventAction, null)

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/events" className="text-muted hover:text-wine text-sm">← Events</Link>
        <span className="text-muted">/</span>
        <h1 className="text-2xl font-bold text-brown">New Tasting Event</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        {state?.error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {state.error}
          </p>
        )}

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brown mb-1">
              Event Name <span className="text-wine">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Friday Night Tasting"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Date & Time <span className="text-wine">*</span>
              </label>
              <input
                name="scheduledAt"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">Location</label>
              <input
                name="location"
                type="text"
                placeholder="e.g. Rick's place"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown mb-2">
              Attendees
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto rounded-lg border border-border p-3 bg-cream">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="attendees"
                    value={user.id}
                    className="accent-wine"
                  />
                  <span className="text-sm text-brown">{user.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted mt-1">You are automatically included.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown mb-2">
              Wines to Taste
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto rounded-lg border border-border p-3 bg-cream">
              {wines.map((wine) => (
                <label key={wine.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="wines"
                    value={wine.id}
                    className="accent-wine"
                  />
                  <span className="text-sm text-brown leading-tight">
                    {wine.name}
                    <span className="text-muted ml-1">
                      · {wine.variety} · {wine.region}
                      {wine.year ? ` · ${wine.year}` : ''}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown mb-1">Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Anything to note about this event…"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-wine text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-wine-dark transition-colors disabled:opacity-60"
          >
            {pending ? 'Creating…' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  )
}
