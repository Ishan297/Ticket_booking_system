/** Shared seat occupancy + booking records in localStorage (all users see same seats). */

const SEAT_KEY = 'moviebooking_seat_bookings'
const BOOKINGS_KEY = 'moviebooking_local_bookings'
const NEXT_BOOKING_ID_KEY = 'moviebooking_next_booking_id'

export type SeatOccupant = {
  userId: number
  userName: string
  userEmail: string
}

export type LocalBookingRecord = {
  id: number
  userId: number
  showtimeId: number
  seatIds: number[]
  totalAmount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  createdAt: string
}

function seatMapKey(showtimeId: number, seatId: number): string {
  return `${showtimeId}:${seatId}`
}

function readSeatMap(): Record<string, SeatOccupant> {
  try {
    const raw = localStorage.getItem(SEAT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, SeatOccupant>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeSeatMap(m: Record<string, SeatOccupant>) {
  localStorage.setItem(SEAT_KEY, JSON.stringify(m))
}

function readBookings(): LocalBookingRecord[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalBookingRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeBookings(list: LocalBookingRecord[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list))
}

function nextBookingId(): number {
  const raw = localStorage.getItem(NEXT_BOOKING_ID_KEY)
  let n = raw ? parseInt(raw, 10) : 1
  if (Number.isNaN(n) || n < 1) n = 1
  localStorage.setItem(NEXT_BOOKING_ID_KEY, String(n + 1))
  return n
}

export function getOccupant(
  showtimeId: number,
  seatId: number,
): SeatOccupant | undefined {
  return readSeatMap()[seatMapKey(showtimeId, seatId)]
}

export function isSeatTaken(showtimeId: number, seatId: number): boolean {
  return !!getOccupant(showtimeId, seatId)
}

/** Returns false if any seat already taken. */
export function tryReserveSeats(
  showtimeId: number,
  seatIds: number[],
  occupant: SeatOccupant,
): boolean {
  const map = readSeatMap()
  for (const sid of seatIds) {
    const k = seatMapKey(showtimeId, sid)
    if (map[k]) return false
  }
  for (const sid of seatIds) {
    map[seatMapKey(showtimeId, sid)] = occupant
  }
  writeSeatMap(map)
  return true
}

function releaseSeats(showtimeId: number, seatIds: number[]) {
  const map = readSeatMap()
  for (const sid of seatIds) {
    delete map[seatMapKey(showtimeId, sid)]
  }
  writeSeatMap(map)
}

export function createLocalBooking(input: {
  userId: number
  showtimeId: number
  seatIds: number[]
  totalAmount: number
  occupant: SeatOccupant
}): { id: number } | { error: string } {
  const ok = tryReserveSeats(input.showtimeId, input.seatIds, input.occupant)
  if (!ok) {
    return { error: 'One or more seats are no longer available.' }
  }
  const id = nextBookingId()
  const rec: LocalBookingRecord = {
    id,
    userId: input.userId,
    showtimeId: input.showtimeId,
    seatIds: [...input.seatIds],
    totalAmount: input.totalAmount,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }
  writeBookings([...readBookings(), rec])
  return { id }
}

export function getLocalBooking(id: number): LocalBookingRecord | undefined {
  return readBookings().find((b) => b.id === id)
}

export function updateLocalBookingStatus(
  id: number,
  status: LocalBookingRecord['status'],
) {
  const list = readBookings()
  const i = list.findIndex((b) => b.id === id)
  if (i < 0) return
  list[i] = { ...list[i], status }
  writeBookings(list)
}

export function cancelLocalBooking(id: number): boolean {
  const list = readBookings()
  const i = list.findIndex((b) => b.id === id)
  if (i < 0) return false
  const b = list[i]
  if (b.status === 'CANCELLED') return true
  releaseSeats(b.showtimeId, b.seatIds)
  list[i] = { ...b, status: 'CANCELLED' }
  writeBookings(list)
  return true
}

export function listBookingsForUser(userId: number): LocalBookingRecord[] {
  return readBookings().filter((b) => b.userId === userId)
}
