import { db } from '@/lib/db'
import NewEventClient from './client'

export default async function NewEventPage() {
  const users = await db.user.findMany({ orderBy: { name: 'asc' } })
  return <NewEventClient users={users} />
}
