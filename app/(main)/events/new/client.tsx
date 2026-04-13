'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createEventAction } from '@/app/actions'

interface User { id: number; name: string }

interface VarietyGroup {
  variety: string
  terroir: string
  vintage: string
  bottles: string
}

const emptyGroup = (): VarietyGroup => ({ variety: '', terroir: '', vintage: '', bottles: '1' })

export default function NewEventClient({ users }: { users: User[] }) {
  const [state, action, pending] = useActionState(createEventAction, null)
  const [groups, setGroups] = useState<VarietyGroup[]>([emptyGroup()])

  function addGroup() {
    setGroups((prev) => [...prev, emptyGroup()])
  }

  function removeGroup(i: number) {
    setGroups((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateGroup(i: number, field: keyof VarietyGroup, value: string) {
    setGroups((prev) => prev.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)))
  }

  const totalBottles = groups.reduce((sum, g) => sum + (parseInt(g.bottles) || 0), 0)

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
          </div>

          {/* Variety groups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-sm font-medium text-brown">Bottle Slots</label>
                <p className="text-xs text-muted mt-0.5">
                  {totalBottles} bottle{totalBottles !== 1 ? 's' : ''} total — each slot gets a variety, terroir, and vintage so people know exactly what to buy.
                </p>
              </div>
              <button
                type="button"
                onClick={addGroup}
                className="text-xs text-wine hover:underline font-medium shrink-0 ml-3"
              >
                + Add Row
              </button>
            </div>

            <div className="space-y-3">
              {groups.map((g, i) => (
                <div key={i} className="rounded-lg border border-border bg-white p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-wine text-white text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    <input
                      name="variety"
                      value={g.variety}
                      onChange={(e) => updateGroup(i, 'variety', e.target.value)}
                      placeholder="Grape variety (e.g. Pinot Noir)"
                      className="flex-1 rounded-md border border-border px-3 py-1.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
                    />
                    {groups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGroup(i)}
                        className="text-muted hover:text-red-500 text-lg leading-none shrink-0"
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 pl-8">
                    <input
                      name="terroir"
                      value={g.terroir}
                      onChange={(e) => updateGroup(i, 'terroir', e.target.value)}
                      placeholder="Terroir (e.g. Burgundy)"
                      className="rounded-md border border-border px-3 py-1.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
                    />
                    <input
                      name="vintage"
                      value={g.vintage}
                      onChange={(e) => updateGroup(i, 'vintage', e.target.value)}
                      placeholder="Vintage (e.g. 2018)"
                      className="rounded-md border border-border px-3 py-1.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        name="bottleCount"
                        type="number"
                        min="1"
                        max="20"
                        value={g.bottles}
                        onChange={(e) => updateGroup(i, 'bottles', e.target.value)}
                        className="w-full rounded-md border border-border px-3 py-1.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
                      />
                      <span className="text-xs text-muted shrink-0">btl</span>
                    </div>
                  </div>
                </div>
              ))}
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
            {pending ? 'Creating…' : `Create Event · ${totalBottles} bottle${totalBottles !== 1 ? 's' : ''}`}
          </button>
        </form>
      </div>
    </div>
  )
}
