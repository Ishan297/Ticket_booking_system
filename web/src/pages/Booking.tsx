import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MoviePoster } from '../components/MoviePoster'
import {
  getMovieById,
  getShowtimeById,
  posterSources,
  seatsForShowtime,
} from '../local/demoCatalog'
import { createLocalBooking, getOccupant } from '../local/localBookings'

type SeatRow = {
  id: number
  rowNo: string
  seatNo: string
  available: boolean
  bookedBy?: string
}

export function Booking() {
  const { showtimeId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const stId = showtimeId ? parseInt(showtimeId, 10) : NaN

  const showtime = Number.isFinite(stId) ? getShowtimeById(stId) : undefined
  const movie = showtime ? getMovieById(showtime.movieId) : undefined

  const [seats, setSeats] = useState<SeatRow[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(stId) || !user) return
    function refresh() {
      const base = seatsForShowtime(stId)
      const next: SeatRow[] = base.map((s) => {
        const occ = getOccupant(stId, s.id)
        return {
          id: s.id,
          rowNo: s.rowNo,
          seatNo: s.seatNo,
          available: !occ,
          bookedBy: occ
            ? `${occ.userName} (${occ.userEmail})`
            : undefined,
        }
      })
      setSeats(next)
    }
    refresh()
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'moviebooking_seat_bookings') refresh()
    }
    const onFocus = () => refresh()
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
    }
  }, [stId, user])

  const price = Number(showtime?.pricePerSeat ?? 0)
  const total = selected.length * price

  const rows = useMemo(() => {
    const map = new Map<string, SeatRow[]>()
    seats.forEach((s) => {
      const k = s.rowNo || '?'
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(s)
    })
    map.forEach((list) => list.sort((a, b) => a.seatNo.localeCompare(b.seatNo)))
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [seats])

  function renderSeatButton(s: SeatRow) {
    const isSel = selected.includes(s.id)
    const seatLabel = `${s.rowNo}${s.seatNo}`

    if (!s.available) {
      return (
        <div
          key={s.id}
          className="inline-flex cursor-not-allowed"
          title="Seat is booked"
        >
          <button
            type="button"
            disabled
            tabIndex={-1}
            aria-label={`${seatLabel}, seat is booked`}
            className="pointer-events-none flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800/50 text-xs font-medium text-zinc-600"
          >
            {s.seatNo}
          </button>
        </div>
      )
    }

    return (
      <button
        key={s.id}
        type="button"
        title={`${seatLabel} — available`}
        onClick={() => toggle(s.id, true)}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-medium transition ${
          isSel
            ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/30'
            : 'border border-white/10 bg-zinc-900 text-zinc-300 hover:border-amber-400/40'
        }`}
      >
        {s.seatNo}
      </button>
    )
  }

  function toggle(id: number, available: boolean) {
    if (!available) return
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function proceed() {
    if (!user || !Number.isFinite(stId) || selected.length === 0) return
    setSubmitting(true)
    setErr('')
    try {
      const result = createLocalBooking({
        userId: user.id,
        showtimeId: stId,
        seatIds: selected,
        totalAmount: total,
        occupant: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
        },
      })
      if ('error' in result) {
        setErr(result.error)
        return
      }
      const base = seatsForShowtime(stId)
      const next: SeatRow[] = base.map((s) => {
        const occ = getOccupant(stId, s.id)
        return {
          id: s.id,
          rowNo: s.rowNo,
          seatNo: s.seatNo,
          available: !occ,
          bookedBy: occ
            ? `${occ.userName} (${occ.userEmail})`
            : undefined,
        }
      })
      setSeats(next)
      setSelected([])
      navigate(`/confirm/${result.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  if (!showtimeId || !Number.isFinite(stId)) {
    return <p className="text-zinc-500">Invalid showtime.</p>
  }

  if (!showtime) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        Showtime not found.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-start sm:gap-6">
        {movie && (
          <div className="mx-auto w-28 shrink-0 sm:mx-0 sm:w-36">
            <MoviePoster
              srcs={posterSources(movie)}
              alt={movie.title}
              className="aspect-[2/3] rounded-xl border border-white/10 shadow-lg shadow-black/40"
            />
          </div>
        )}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="font-display text-2xl font-bold text-white">
            {movie?.title}
          </h1>
          <p className="mt-1 text-zinc-400">
            {showtime.theaterName} · {showtime.screenName}
          </p>
          <p className="text-sm text-zinc-500">
            {new Date(showtime.startTime).toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            Unavailable seats are already reserved. Seat availability updates in
            real time.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0c0c12] p-6 sm:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Screen — centered, wide; seats sit in front below */}
          <div className="relative mx-auto max-w-3xl">
            <div
              className="pointer-events-none absolute -inset-x-4 -top-8 h-24 bg-amber-500/5 blur-3xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-b-2xl border border-white/15 border-t-0 bg-gradient-to-b from-zinc-600/40 via-zinc-900/90 to-[#0a0a0f] px-6 py-5 text-center shadow-[0_12px_48px_rgba(0,0,0,0.45)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                Screen
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                All eyes this way
              </p>
              <div className="mx-auto mt-4 h-1 max-w-md rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-zinc-600">
            Front rows are closest to the screen · Center aisle
          </p>

          {/* Seat map: centered block, rows in front of screen */}
          <div
            className="mx-auto mt-6 flex w-full justify-center"
            style={{ perspective: '900px' }}
          >
            <div
              className="inline-flex origin-top flex-col items-center gap-3 [transform:rotateX(6deg)] sm:gap-3.5"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {rows.map(([row, list]) => {
                const half = Math.floor(list.length / 2) || list.length
                const left = list.slice(0, half)
                const right = list.slice(half)
                return (
                  <div
                    key={row}
                    className="flex items-center justify-center gap-2 sm:gap-3"
                  >
                    <span className="w-6 shrink-0 text-center text-sm font-medium tabular-nums text-zinc-500">
                      {row}
                    </span>
                    <div className="flex gap-1.5 sm:gap-2">
                      {left.map((s) => renderSeatButton(s))}
                    </div>
                    <div
                      className="flex h-10 w-5 shrink-0 flex-col items-center justify-center gap-0.5 text-zinc-700"
                      aria-hidden
                      title="Aisle"
                    >
                      <span className="h-full w-px bg-zinc-800" />
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      {right.map((s) => renderSeatButton(s))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-white/20 bg-zinc-900" />
              Available
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-amber-400" />
              Selected
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-zinc-800/80" />
              Taken
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#12121a] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Selected seats</p>
          <p className="text-lg font-semibold text-white">{selected.length}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Total</p>
          <p className="text-lg font-semibold text-amber-400">
            ₹{total.toFixed(2)}
          </p>
        </div>
        <button
          type="button"
          disabled={selected.length === 0 || submitting}
          onClick={proceed}
          className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 font-semibold text-black disabled:opacity-40"
        >
          {submitting ? 'Processing…' : 'Proceed to pay'}
        </button>
      </div>

      {err && (
        <p className="text-center text-sm text-red-400">{err}</p>
      )}
    </div>
  )
}
