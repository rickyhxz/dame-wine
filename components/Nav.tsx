import Link from 'next/link'
import { logoutAction } from '@/app/actions'

export function Nav({ userName }: { userName: string }) {
  return (
    <nav className="bg-wine-dark text-white px-4 py-3 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/home" className="text-xl font-bold text-gold tracking-wide">
          Dame Wine
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/home" className="text-white/80 hover:text-white transition-colors font-medium">
            Home
          </Link>
          <Link href="/wines" className="text-white/80 hover:text-white transition-colors font-medium">
            Wines
          </Link>
          <Link href="/my-list" className="text-white/80 hover:text-white transition-colors font-medium">
            My List
          </Link>
          <Link href="/events" className="text-white/80 hover:text-white transition-colors font-medium">
            Events
          </Link>
          <Link href="/wines/add" className="text-white/80 hover:text-white transition-colors font-medium">
            + Add
          </Link>

          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/20">
            <span className="text-white/60">{userName}</span>
            <form action={logoutAction}>
              <button type="submit" className="text-white/60 hover:text-white transition-colors text-xs">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
