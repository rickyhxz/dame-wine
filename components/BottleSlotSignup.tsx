'use client'

import { useActionState } from 'react'
import { claimBottleSlotAction, unclaimBottleSlotAction } from '@/app/actions'

interface Props {
  slotId: number
  slotNumber: number
  category: string
  description: string | null
  signedUpBy: number | null
  signedUpName: string | null
  wineName: string | null
  currentUserId: number
}

function ClaimForm({ slotId }: { slotId: number }) {
  const [state, action, pending] = useActionState(claimBottleSlotAction, null)

  return (
    <form action={action} className="flex gap-2 mt-2">
      <input type="hidden" name="slotId" value={slotId} />
      <input
        name="wineName"
        type="text"
        placeholder="Wine you'll bring (optional)"
        className="flex-1 rounded-md border border-border px-3 py-1.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 bg-wine text-white rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-wine-dark transition-colors disabled:opacity-60"
      >
        {pending ? '…' : 'Sign Up'}
      </button>
      {state?.error && (
        <span className="text-xs text-red-600 self-center">{state.error}</span>
      )}
    </form>
  )
}

function UnclaimForm({ slotId }: { slotId: number }) {
  const [, action, pending] = useActionState(unclaimBottleSlotAction, null)

  return (
    <form action={action} className="mt-1">
      <input type="hidden" name="slotId" value={slotId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-muted hover:text-red-500 transition-colors disabled:opacity-60"
      >
        {pending ? '…' : 'Release slot'}
      </button>
    </form>
  )
}

export function BottleSlotSignup({
  slotId,
  slotNumber,
  category,
  description,
  signedUpBy,
  signedUpName,
  wineName,
  currentUserId,
}: Props) {
  const isMine = signedUpBy === currentUserId
  const isClaimed = signedUpBy !== null

  return (
    <div className="flex gap-3 py-3">
      {/* Slot number badge */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          isClaimed ? 'bg-wine text-white' : 'bg-cream border border-border text-muted'
        }`}
      >
        {slotNumber}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brown">{category}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}

        {isClaimed ? (
          <div className="mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-wine/10 text-wine text-xs flex items-center justify-center font-bold">
                {signedUpName!.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-brown font-medium">{signedUpName}</span>
              {isMine && <span className="text-xs text-muted">(you)</span>}
            </div>
            {wineName && (
              <p className="text-xs text-muted italic mt-0.5">Bringing: {wineName}</p>
            )}
            {isMine && <UnclaimForm slotId={slotId} />}
          </div>
        ) : (
          <ClaimForm slotId={slotId} />
        )}
      </div>
    </div>
  )
}
