'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction } from '@/app/actions'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-wine mb-1">Dame Wine</h1>
          <p className="text-muted text-sm">Track wines with your crew</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <h2 className="text-xl font-semibold text-brown mb-6">Create account</h2>

          {state?.error && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {state.error}
            </p>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brown mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="username"
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-brown text-sm focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine bg-cream"
                placeholder="Your first name or nickname"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-brown text-sm focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine bg-cream"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-wine text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-wine-dark transition-colors disabled:opacity-60 mt-2"
            >
              {pending ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-wine font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
