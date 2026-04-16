import { useMemo, useState } from 'react'
import { MoviePoster } from '../components/MoviePoster'
import {
  formatSeatLabels,
  getMovieById,
  getShowtimeById,
  posterSources,
} from '../local/demoCatalog'
import {
  cancelLocalBooking,
  listBookingsForUser,
  type LocalBookingRecord,
} from '../local/localBookings'
import { useAuth } from '../context/AuthContext'

export function MyBookings() {
  const { user } = useAuth()
  const [bump, setBump] = useState(0)

  const list = useMemo(() => {
    if (!user) return []
    return listBookingsForUser(user.id).sort((a, b) => b.id - a.id)
  }, [user, bump])

  if (!user) return null

  function cancelBooking(b: LocalBookingRecord) {
    if (b.status === 'CANCELLED') return
    cancelLocalBooking(b.id)
    setBump((x) => x + 1)
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">My bookings</h1>
      {list.length === 0 ? (
        <p className="text-zinc-500">No bookings yet.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((b) => {
            const showtime = getShowtimeById(b.showtimeId)
            const movie = showtime
              ? getMovieById(showtime.movieId)
              : undefined
            const theater = showtime?.theaterName
            const start = showtime?.startTime
              ? new Date(showtime.startTime).toLocaleString()
              : ''
            const seats = formatSeatLabels(b.showtimeId, b.seatIds)
            const canCancel = b.status !== 'CANCELLED' && b.status !== 'PAID'
            return (
              <li
                key={b.id}
                className="flex gap-4 rounded-2xl border border-white/10 bg-[#12121a] p-5"
              >
                {movie && (
                  <div className="w-16 shrink-0 sm:w-20">
                    <MoviePoster
                      srcs={posterSources(movie)}
                      alt={movie.title}
                      className="aspect-[2/3] rounded-lg border border-white/10"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-white">{movie?.title}</h2>
                <p className="text-sm text-zinc-500">
                  {theater} · {start}
                </p>
                <p className="mt-2 text-sm text-zinc-400">Seats: {seats}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="text-amber-400/90">
                    ₹{Number(b.totalAmount ?? 0).toFixed(2)}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                    {b.status}
                  </span>
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => cancelBooking(b)}
                      className="rounded-lg border border-white/15 px-3 py-1 text-sm text-zinc-400 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
