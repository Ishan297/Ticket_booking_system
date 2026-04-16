import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MoviePoster } from '../components/MoviePoster'
import {
  formatSeatLabels,
  getMovieById,
  getShowtimeById,
  posterSources,
} from '../local/demoCatalog'
import {
  getLocalBooking,
  updateLocalBookingStatus,
} from '../local/localBookings'

export function Confirm() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [err, setErr] = useState('')
  const [paying, setPaying] = useState(false)

  const id = bookingId ? parseInt(bookingId, 10) : NaN
  const booking = Number.isFinite(id) ? getLocalBooking(id) : undefined

  const showtime = booking
    ? getShowtimeById(booking.showtimeId)
    : undefined
  const movie = showtime ? getMovieById(showtime.movieId) : undefined

  function pay() {
    if (!Number.isFinite(id)) return
    setPaying(true)
    setErr('')
    try {
      const b = getLocalBooking(id)
      if (!b) {
        setErr('Booking not found.')
        return
      }
      if (b.status === 'CANCELLED') {
        setErr('This booking was cancelled.')
        return
      }
      updateLocalBookingStatus(id, 'PAID')
      navigate(`/success/${id}`)
    } finally {
      setPaying(false)
    }
  }

  if (!bookingId || !Number.isFinite(id)) {
    return <p className="text-zinc-500">No booking.</p>
  }

  if (!booking) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        We couldn&apos;t find this booking. Please start a new seat selection.
      </p>
    )
  }

  const movieTitle = movie?.title
  const theater = showtime?.theaterName
  const start = showtime?.startTime
    ? new Date(showtime.startTime).toLocaleString()
    : ''
  const seatStr = booking
    ? formatSeatLabels(booking.showtimeId, booking.seatIds)
    : ''

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-bold text-white">
        Confirm & pay
      </h1>
      {err && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {err}
        </p>
      )}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row">
        {movie && (
          <div className="mx-auto w-24 shrink-0 sm:mx-0 sm:w-28">
            <MoviePoster
              srcs={posterSources(movie)}
              alt={movie.title}
              className="aspect-[2/3] rounded-xl border border-white/10"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-white">{movieTitle}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {theater} · {start}
          </p>
          <p className="mt-4 text-sm text-zinc-400">Seats: {seatStr}</p>
          <p className="mt-4 text-xl font-bold text-amber-400">
            ₹{Number(booking?.totalAmount ?? 0).toFixed(2)}
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-500">
        Review your order, then complete payment to confirm your tickets.
      </p>
      <button
        type="button"
        onClick={pay}
        disabled={paying || !booking}
        className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 font-semibold text-black disabled:opacity-50"
      >
        {paying ? 'Processing…' : 'Complete payment'}
      </button>
    </div>
  )
}
