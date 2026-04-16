import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MoviePoster } from '../components/MoviePoster'
import {
  getMovieById,
  getShowtimesForMovie,
  posterSources,
  seatsForShowtime,
} from '../local/demoCatalog'

export function MovieDetail() {
  const { movieId } = useParams()
  const id = movieId ? parseInt(movieId, 10) : NaN

  const movie = Number.isFinite(id) ? getMovieById(id) : undefined
  const showtimes = Number.isFinite(id) ? getShowtimesForMovie(id) : []

  const seatHint = useMemo(() => {
    if (showtimes.length === 0) return ''
    const st = showtimes[0]
    const n = seatsForShowtime(st.id).length
    return `${n} seats per show`
  }, [showtimes])

  if (!movieId || !Number.isFinite(id)) {
    return <p className="text-zinc-500">No movie selected.</p>
  }

  if (!movie) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        Movie not found.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:flex sm:gap-8">
        <div className="w-full shrink-0 sm:w-56 md:w-64">
          <MoviePoster
            srcs={posterSources(movie)}
            alt={movie.title}
            className="aspect-[2/3] w-full max-w-xs rounded-xl sm:max-w-none"
          />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              {movie.title}
            </h1>
            <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-sm font-semibold text-amber-300">
              ★ {movie.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {[movie.genre, movie.language, `${movie.durationMin} min`]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mt-4 max-w-3xl text-zinc-400">{movie.description}</p>
          {seatHint && (
            <p className="mt-3 text-xs text-zinc-600">{seatHint}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold text-white">
          Showtimes
        </h2>
        <ul className="mt-4 space-y-3">
          {showtimes.length === 0 ? (
            <li className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-zinc-500">
              No showtimes yet.
            </li>
          ) : (
            showtimes.map((s) => {
              const start = new Date(s.startTime).toLocaleString()
              const price = s.pricePerSeat
              return (
                <li
                  key={s.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#12121a] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">
                      {s.theaterName} — {s.screenName}
                    </p>
                    <p className="text-sm text-zinc-500">{start}</p>
                    <p className="text-sm text-amber-400/90">
                      ₹{Number(price).toFixed(0)} / seat
                    </p>
                  </div>
                  <Link
                    to={`/booking/${s.id}`}
                    className="inline-flex justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-black"
                  >
                    Select seats
                  </Link>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>
  )
}
