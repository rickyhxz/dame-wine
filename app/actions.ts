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
  redirect('/wines')
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
  redirect('/wines')
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
}
