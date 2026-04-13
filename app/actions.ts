'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession, deleteSession, getSession } from '@/lib/auth'

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const name = (formData.get('name') as string)?.trim()
  const password = formData.get('password') as string

  if (!name || !password) return { error: 'Please fill in all fields' }

  const user = await db.user.findUnique({ where: { name } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: 'Invalid name or password' }
  }

  await createSession({ userId: user.id, name: user.name })
  redirect('/home')
}

export async function registerAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const name = (formData.get('name') as string)?.trim()
  const password = formData.get('password') as string

  if (!name || !password) return { error: 'Please fill in all fields' }
  if (name.length < 2) return { error: 'Name must be at least 2 characters' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters' }

  const existing = await db.user.findUnique({ where: { name } })
  if (existing) return { error: 'That name is already taken' }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await db.user.create({ data: { name, passwordHash } })

  await createSession({ userId: user.id, name: user.name })
  redirect('/home')
}

export async function logoutAction() {
  await deleteSession()
  redirect('/login')
}

// ─── Wine catalog ─────────────────────────────────────────────────────────────

export async function addWineAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await getSession()
  if (!session) redirect('/login')

  const name = (formData.get('name') as string)?.trim()
  const variety = (formData.get('variety') as string)?.trim()
  const type = formData.get('type') as string
  const region = (formData.get('region') as string)?.trim()
  const country = (formData.get('country') as string)?.trim()
  const yearStr = formData.get('year') as string
  const description = (formData.get('description') as string)?.trim()

  if (!name || !variety || !type || !region || !country) {
    return { error: 'Please fill in all required fields' }
  }

  const wine = await db.wine.create({
    data: {
      name,
      variety,
      type,
      region,
      country,
      year: yearStr ? parseInt(yearStr) : null,
      description: description || null,
      createdBy: session.userId,
    },
  })

  revalidatePath('/wines')
  redirect(`/wines/${wine.id}`)
}

// ─── Tastings ─────────────────────────────────────────────────────────────────

export async function addToWishlistAction(wineId: number) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.tasting.upsert({
    where: { userId_wineId: { userId: session.userId, wineId } },
    create: { userId: session.userId, wineId, status: 'WISHLIST' },
    update: {},
  })

  revalidatePath('/wines')
  revalidatePath(`/wines/${wineId}`)
  revalidatePath('/my-list')
  revalidatePath('/home')
}

export async function markTastedAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await getSession()
  if (!session) redirect('/login')

  const wineId = parseInt(formData.get('wineId') as string)
  const ratingStr = formData.get('rating') as string
  const comment = (formData.get('comment') as string)?.trim()

  if (!wineId) return { error: 'Invalid wine' }

  await db.tasting.upsert({
    where: { userId_wineId: { userId: session.userId, wineId } },
    create: {
      userId: session.userId,
      wineId,
      status: 'TASTED',
      rating: ratingStr ? parseInt(ratingStr) : null,
      comment: comment || null,
      tastedAt: new Date(),
    },
    update: {
      status: 'TASTED',
      rating: ratingStr ? parseInt(ratingStr) : null,
      comment: comment || null,
      tastedAt: new Date(),
    },
  })

  revalidatePath('/wines')
  revalidatePath(`/wines/${wineId}`)
  revalidatePath('/my-list')
  revalidatePath('/home')
  return null
}

export async function removeTastingAction(wineId: number) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.tasting.deleteMany({
    where: { userId: session.userId, wineId },
  })

  revalidatePath('/wines')
  revalidatePath(`/wines/${wineId}`)
  revalidatePath('/my-list')
  revalidatePath('/home')
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function createEventAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await getSession()
  if (!session) redirect('/login')

  const name = (formData.get('name') as string)?.trim()
  const location = (formData.get('location') as string)?.trim()
  const scheduledAt = formData.get('scheduledAt') as string
  const notes = (formData.get('notes') as string)?.trim()
  const tastingTheme = (formData.get('tastingTheme') as string)?.trim()
  const mainVariable = (formData.get('mainVariable') as string)?.trim()
  const attendeeIds = formData.getAll('attendees').map((v) => parseInt(v as string))

  // Bottle slots: parallel arrays of category + description
  const slotCategories = formData.getAll('slotCategory') as string[]
  const slotDescriptions = formData.getAll('slotDescription') as string[]

  if (!name || !scheduledAt) return { error: 'Name and date are required' }

  const event = await db.tastingEvent.create({
    data: {
      name,
      location: location || null,
      scheduledAt: new Date(scheduledAt),
      notes: notes || null,
      tastingTheme: tastingTheme || null,
      mainVariable: mainVariable || null,
      createdBy: session.userId,
      attendees: {
        create: [
          { userId: session.userId },
          ...attendeeIds
            .filter((id) => id !== session.userId)
            .map((userId) => ({ userId })),
        ],
      },
      bottleSlots: {
        create: slotCategories
          .map((category, i) => ({
            slotNumber: i + 1,
            category: category.trim(),
            description: (slotDescriptions[i] ?? '').trim() || null,
          }))
          .filter((s) => s.category.length > 0),
      },
    },
  })

  revalidatePath('/events')
  redirect(`/events/${event.id}`)
}

export async function claimBottleSlotAction(
  slotId: number,
  wineName: string
): Promise<{ error: string } | null> {
  const session = await getSession()
  if (!session) redirect('/login')

  const slot = await db.eventBottleSlot.findUnique({ where: { id: slotId } })
  if (!slot) return { error: 'Slot not found' }
  if (slot.signedUpBy !== null && slot.signedUpBy !== session.userId) {
    return { error: 'This slot is already claimed by someone else' }
  }

  await db.eventBottleSlot.update({
    where: { id: slotId },
    data: { signedUpBy: session.userId, wineName: wineName.trim() || null },
  })

  revalidatePath(`/events/${slot.eventId}`)
  return null
}

export async function unclaimBottleSlotAction(slotId: number): Promise<{ error: string } | null> {
  const session = await getSession()
  if (!session) redirect('/login')

  const slot = await db.eventBottleSlot.findUnique({ where: { id: slotId } })
  if (!slot) return { error: 'Slot not found' }
  if (slot.signedUpBy !== session.userId) return { error: 'You did not claim this slot' }

  await db.eventBottleSlot.update({
    where: { id: slotId },
    data: { signedUpBy: null, wineName: null },
  })

  revalidatePath(`/events/${slot.eventId}`)
  return null
}

// ─── Bug Reports ──────────────────────────────────────────────────────────────

export async function createBugReportAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await getSession()
  if (!session) redirect('/login')

  const description = (formData.get('description') as string)?.trim()
  const urgency = formData.get('urgency') as string

  if (!description) return { error: 'Please describe the bug' }
  if (!['LOW', 'MEDIUM', 'HIGH'].includes(urgency)) return { error: 'Please select an urgency level' }

  await db.bugReport.create({
    data: { userId: session.userId, description, urgency },
  })

  revalidatePath('/bugs')
  redirect('/bugs')
}

export async function resolveBugAction(bugId: number): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.name !== 'Ricky') return

  await db.bugReport.update({
    where: { id: bugId },
    data: { status: 'FIXED', resolvedAt: new Date() },
  })

  revalidatePath('/bugs')
}

export async function reopenBugAction(bugId: number): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.name !== 'Ricky') return

  await db.bugReport.update({
    where: { id: bugId },
    data: { status: 'OPEN', resolvedAt: null },
  })

  revalidatePath('/bugs')
}

export async function deleteEventAction(eventId: number) {
  const session = await getSession()
  if (!session) redirect('/login')

  const event = await db.tastingEvent.findUnique({ where: { id: eventId } })
  if (!event || event.createdBy !== session.userId) return

  await db.tastingEvent.delete({ where: { id: eventId } })
  revalidatePath('/events')
  redirect('/events')
}
