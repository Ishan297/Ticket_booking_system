import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoviePoster } from '../components/MoviePoster'
import { DEMO_MOVIES, posterSources } from '../local/demoCatalog'

export function Home() {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return DEMO_MOVIES
    return DEMO_MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(s) ||
        m.genre.toLowerCase().includes(s),
    )
  }, [q])

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1520] via-[#12121a] to-[#0d1117] p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
          Tonight at the movies
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Book seats in seconds
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Browse what&apos;s playing, choose your seats, and complete checkout in
          one smooth flow—built for a clear, focused booking experience.
        </p>
        <div className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search by title or genre…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-white">
          Now showing
        </h2>
        <span className="text-sm text-zinc-500">
          {filtered.length} film{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-500">
          No movies match your search.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((m) => (
            <Link
              key={m.id}
              to={`/movie/${m.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-amber-400/30 hover:shadow-amber-500/5"
            >
              <div className="relative aspect-[2/3] bg-zinc-900">
                <MoviePoster
                  srcs={posterSources(m)}
                  alt={m.title}
                  className="h-full"
                  imgClassName="transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute right-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-sm font-semibold text-amber-300 backdrop-blur-sm">
                  ★ {m.rating.toFixed(1)}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-white group-hover:text-amber-200">
                  {m.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {[m.genre, m.language].filter(Boolean).join(' · ')}
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  {m.durationMin} min
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-amber-400/90">
                  View showtimes
                  <span className="ml-1 transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
