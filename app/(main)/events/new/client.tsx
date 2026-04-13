'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createEventAction } from '@/app/actions'

interface User { id: number; name: string }

export default function NewEventClient({ users }: { users: User[] }) {
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

          {/* Basic info */}
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

          {/* Tasting design */}
          <div className="rounded-lg border border-border bg-cream/50 p-4 space-y-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">Tasting Design</p>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">Theme</label>
              <input
                name="tastingTheme"
                type="text"
                placeholder="e.g. Old World vs New World Pinot Noir"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-wine/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">Main Variable</label>
              <input
                name="mainVariable"
                type="text"
                placeholder="e.g. terroir, vintage, producer"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-wine/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Grape Varieties
              </label>
              <input
                name="varieties"
                type="text"
                placeholder="e.g. Pinot Noir, Chardonnay (comma-separated)"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-wine/30"
              />
              <p className="text-xs text-muted mt-1">
                Bottles will be distributed evenly across varieties.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Number of Bottles <span className="text-wine">*</span>
              </label>
              <input
                name="bottleCount"
                type="number"
                min="1"
                max="20"
                required
                placeholder="6"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-wine/30"
              />
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-brown mb-2">Attendees</label>
            <div className="space-y-2 max-h-40 overflow-y-auto rounded-lg border border-border p-3 bg-cream">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="attendees" value={user.id} className="accent-wine" />
                  <span className="text-sm text-brown">{user.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted mt-1">You are automatically included.</p>
          </div>

          {/* Notes */}
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
