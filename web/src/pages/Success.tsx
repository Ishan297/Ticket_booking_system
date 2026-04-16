import { Link, useParams } from 'react-router-dom'
import { MoviePoster } from '../components/MoviePoster'
import {
  formatSeatLabels,
  getMovieById,
  getShowtimeById,
  posterSources,
} from '../local/demoCatalog'
import { getLocalBooking } from '../local/localBookings'

export function Success() {
  const { bookingId } = useParams()

  const id = bookingId ? parseInt(bookingId, 10) : NaN

  const booking = Number.isFinite(id) ? getLocalBooking(id) : undefined
  const showtime = booking
    ? getShowtimeById(booking.showtimeId)
    : undefined
  const movie = showtime ? getMovieById(showtime.movieId) : undefined

  const seats = booking
    ? formatSeatLabels(booking.showtimeId, booking.seatIds)
    : ''

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
        ✓
      </div>
      <h1 className="font-display text-3xl font-bold text-white">
        Booking confirmed
      </h1>
      <p className="mt-2 text-zinc-400">
        Your reservation is confirmed. Enjoy the show.
      </p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left">
        {booking && movie && showtime ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="mx-auto w-24 shrink-0 sm:mx-0 sm:w-28">
              <MoviePoster
                srcs={posterSources(movie)}
                alt={movie.title}
                className="aspect-[2/3] rounded-xl border border-white/10"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{movie.title}</p>
              <p className="text-sm text-zinc-500">
                {showtime.theaterName} ·{' '}
                {new Date(showtime.startTime).toLocaleString()}
              </p>
              <p className="mt-3 text-sm text-zinc-400">Seats: {seats}</p>
              <p className="mt-2 text-amber-400">
                ₹{Number(booking.totalAmount ?? 0).toFixed(2)}
              </p>
              <p className="mt-2 text-xs text-zinc-600">Booking #{booking.id}</p>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500">Booking #{bookingId}</p>
        )}
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/my-bookings"
          className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-semibold text-black"
        >
          My bookings
        </Link>
        <Link
          to="/"
          className="rounded-xl border border-white/15 px-6 py-3 font-medium text-zinc-300 hover:bg-white/5"
        >
          Back home
        </Link>
      </div>
    </div>
  )
}
