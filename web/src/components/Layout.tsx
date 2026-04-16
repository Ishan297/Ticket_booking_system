import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-white/10 text-amber-300'
      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
  }`

export function Layout() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-lg font-bold text-black shadow-lg shadow-amber-500/20">
              C
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              CineBook
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/my-bookings" className={navClass}>
              My Bookings
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden text-zinc-400 sm:inline">
                  Hi, <span className="text-zinc-200">{user.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    window.location.href = '/'
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 transition hover:bg-white/10"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-1.5 text-zinc-300 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 font-medium text-black shadow-md shadow-amber-500/25 hover:brightness-105"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} CineBook. All rights reserved.
      </footer>
    </div>
  )
}
