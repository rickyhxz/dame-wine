import { db } from '@/lib/db'
import NewEventClient from './client'

export default async function NewEventPage() {
  const [users, wines] = await Promise.all([
    db.user.findMany({ orderBy: { name: 'asc' } }),
    db.wine.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
  ])

  return <NewEventClient users={users} wines={wines} />
}
