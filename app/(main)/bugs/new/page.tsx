'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createBugReportAction } from '@/app/actions'

export default function NewBugPage() {
  const [state, action, pending] = useActionState(createBugReportAction, null)

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/bugs" className="text-muted hover:text-wine text-sm">← Bug Reports</Link>
        <span className="text-muted">/</span>
        <h1 className="text-2xl font-bold text-brown">Report a Bug to Ricky</h1>
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
              What went wrong? <span className="text-wine">*</span>
            </label>
            <textarea
              name="description"
              rows={5}
              required
              placeholder="Describe the bug as clearly as you can. What did you do? What happened? What did you expect?"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown mb-2">
              Urgency <span className="text-wine">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'LOW', label: 'Low', hint: 'Minor annoyance', color: 'peer-checked:border-blue-400 peer-checked:bg-blue-50' },
                { value: 'MEDIUM', label: 'Medium', hint: 'Affects usability', color: 'peer-checked:border-amber-400 peer-checked:bg-amber-50' },
                { value: 'HIGH', label: 'High', hint: 'Broken / data loss', color: 'peer-checked:border-red-400 peer-checked:bg-red-50' },
              ].map(({ value, label, hint, color }) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" name="urgency" value={value} className="peer sr-only" required />
                  <div className={`rounded-lg border-2 border-border p-3 text-center transition-all ${color}`}>
                    <p className="text-sm font-semibold text-brown">{label}</p>
                    <p className="text-xs text-muted mt-0.5">{hint}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-wine text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-wine-dark transition-colors disabled:opacity-60"
          >
            {pending ? 'Submitting…' : 'Submit Bug Report'}
          </button>
        </form>
      </div>
    </div>
  )
}
