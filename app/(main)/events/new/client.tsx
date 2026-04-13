'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createEventAction } from '@/app/actions'

interface User { id: number; name: string }

interface Slot { category: string; description: string }

export default function NewEventClient({ users }: { users: User[] }) {
  const [state, action, pending] = useActionState(createEventAction, null)
  const [slots, setSlots] = useState<Slot[]>([{ category: '', description: '' }])

  function addSlot() {
    setSlots((prev) => [...prev, { category: '', description: '' }])
  }

  function removeSlot(i: number) {
    setSlots((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateSlot(i: number, field: keyof Slot, value: string) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }

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

          {/* Tasting theme */}
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Tasting Theme</label>
            <input
              name="tastingTheme"
              type="text"
              placeholder="e.g. Old World vs New World Pinot Noir"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown mb-1">Main Variable</label>
            <input
              name="mainVariable"
              type="text"
              placeholder="e.g. terroir, vintage, producer"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
            />
          </div>

          {/* Bottle slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-brown">
                Bottle Slots
              </label>
              <button
                type="button"
                onClick={addSlot}
                className="text-xs text-wine hover:underline font-medium"
              >
                + Add Slot
              </button>
            </div>
            <p className="text-xs text-muted mb-3">
              Describe what each bottle should be — friends will sign up to bring them.
            </p>
            <div className="space-y-3">
              {slots.map((slot, i) => (
                <div key={i} className="rounded-lg border border-border bg-cream p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-wine text-white text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    <input
                      name="slotCategory"
                      value={slot.category}
                      onChange={(e) => updateSlot(i, 'category', e.target.value)}
                      placeholder="Category (e.g. Burgundy Pinot Noir, 2018+)"
                      className="flex-1 rounded-md border border-border px-3 py-1.5 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-wine/30"
                    />
                    {slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(i)}
                        className="text-muted hover:text-red-500 text-lg leading-none shrink-0"
                        title="Remove slot"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <input
                    name="slotDescription"
                    value={slot.description}
                    onChange={(e) => updateSlot(i, 'description', e.target.value)}
                    placeholder="Extra notes for this slot (optional)"
                    className="w-full rounded-md border border-border px-3 py-1.5 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-wine/30"
                  />
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
            {pending ? 'Creating…' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  )
}
