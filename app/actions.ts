'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { put } from '@vercel/blob'
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
  const labelImage = formData.get('labelImage') as File | null

  if (!name || !variety || !type || !region || !country) {
    return { error: 'Please fill in all required fields' }
  }

  // Upload label image to Vercel Blob if provided
  let labelImageUrl: string | null = null
  if (labelImage && labelImage.size > 0) {
    if (!labelImage.type.startsWith('image/')) {
      return { error: 'Label image must be an image file (JPG, PNG, WebP, etc.)' }
    }
    if (labelImage.size > 5 * 1024 * 1024) {
      return { error: 'Label image must be under 5 MB' }
    }
    const ext = labelImage.name.split('.').pop() ?? 'jpg'
    const blob = await put(`wine-labels/${Date.now()}-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${ext}`, labelImage, {
      access: 'public',
    })
    labelImageUrl = blob.url
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
      labelImageUrl,
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

  // Per-variety groups: parallel arrays from the form
  const varieties = formData.getAll('variety') as string[]
  const terroirs = formData.getAll('terroir') as string[]
  const vintages = formData.getAll('vintage') as string[]
  const bottleCounts = formData.getAll('bottleCount') as string[]

  if (!name || !scheduledAt) return { error: 'Name and date are required' }

  // Build slots from each group
  const generatedSlots: {
    slotNumber: number
    category: string
    terroir: string | null
    vintage: string | null
    description: string | null
  }[] = []

  let slotNum = 1
  for (let i = 0; i < varieties.length; i++) {
    const variety = varieties[i]?.trim()
    const terroir = terroirs[i]?.trim() || null
    const vintage = vintages[i]?.trim() || null
    const count = parseInt(bottleCounts[i]) || 1
    if (!variety) continue
    for (let j = 0; j < count; j++) {
      generatedSlots.push({ slotNumber: slotNum++, category: variety, terroir, vintage, description: null })
    }
  }

  if (generatedSlots.length === 0) return { error: 'Add at least one bottle slot' }

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
        create: generatedSlots.map((s) => ({
          slotNumber: s.slotNumber,
          category: s.category,
          terroir: s.terroir,
          vintage: s.vintage,
          description: s.description,
        })),
      },
    },
  })

  revalidatePath('/events')
  redirect(`/events/${event.id}`)
}

export async function claimBottleSlotAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await getSession()
  if (!session) redirect('/login')

  const slotId = parseInt(formData.get('slotId') as string)
  const wineName = ((formData.get('wineName') as string) ?? '').trim()

  if (!slotId) return { error: 'Invalid slot' }

  const slot = await db.eventBottleSlot.findUnique({ where: { id: slotId } })
  if (!slot) return { error: 'Slot not found' }
  if (slot.signedUpBy !== null && slot.signedUpBy !== session.userId) {
    return { error: 'This slot is already claimed by someone else' }
  }

  await db.eventBottleSlot.update({
    where: { id: slotId },
    data: { signedUpBy: session.userId, wineName: wineName || null },
  })

  revalidatePath(`/events/${slot.eventId}`)
  return null
}

export async function unclaimBottleSlotAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await getSession()
  if (!session) redirect('/login')

  const slotId = parseInt(formData.get('slotId') as string)

  if (!slotId) return { error: 'Invalid slot' }

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
