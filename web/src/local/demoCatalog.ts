/** Demo data for local-only mode: 2 movies, showtimes, seat grids. */

export type DemoMovie = {
  id: number
  title: string
  description: string
  genre: string
  durationMin: number
  language: string
  /** Primary + optional fallbacks if the first URL fails to load. */
  posterUrl: string
  posterFallbackUrls?: string[]
  rating: number
}

/** Ordered list of poster image URLs for `<img>` / `MoviePoster`. */
export function posterSources(m: DemoMovie): string[] {
  return [m.posterUrl, ...(m.posterFallbackUrls ?? [])]
}

export type DemoShowtime = {
  id: number
  movieId: number
  pricePerSeat: number
  startTime: string
  theaterName: string
  screenName: string
}

export const DEMO_MOVIES: DemoMovie[] = [
  {
    id: 1,
    title: 'Dune: Part Two',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.',
    genre: 'Sci‑Fi',
    durationMin: 166,
    language: 'English',
    posterUrl:
      'https://upload.wikimedia.org/wikipedia/en/6/63/Dune_Part_Two_poster.jpg',
    posterFallbackUrls: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=480&h=720&fit=crop&q=85',
    ],
    rating: 8.8,
  },
  {
    id: 2,
    title: 'Oppenheimer',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    genre: 'Biography / Drama',
    durationMin: 180,
    language: 'English',
    // Local file in public/posters (filename is case-sensitive on some servers).
    posterUrl: '/posters/Oppenheimer.jpeg',
    posterFallbackUrls: [
      'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg',
      'https://images.unsplash.com/photo-1489592760522-09f2380b9798?w=480&h=720&fit=crop&q=85',
    ],
    rating: 8.4,
  },
]

const base = new Date()
base.setHours(19, 0, 0, 0)
const t1 = new Date(base)
const t2 = new Date(base)
t2.setHours(21, 30, 0, 0)

export const DEMO_SHOWTIMES: DemoShowtime[] = [
  {
    id: 101,
    movieId: 1,
    pricePerSeat: 350,
    startTime: t1.toISOString(),
    theaterName: 'CineBook Multiplex',
    screenName: 'Screen 1',
  },
  {
    id: 102,
    movieId: 2,
    pricePerSeat: 380,
    startTime: t2.toISOString(),
    theaterName: 'CineBook Multiplex',
    screenName: 'Screen 2',
  },
]

export type DemoSeat = {
  id: number
  rowNo: string
  seatNo: string
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const COLS = 8

/** Same layout for every showtime; seat `id` is unique per showtime (1..n). */
export function seatsForShowtime(showtimeId: number): DemoSeat[] {
  void showtimeId
  const list: DemoSeat[] = []
  let id = 1
  for (const row of ROWS) {
    for (let c = 1; c <= COLS; c++) {
      list.push({ id, rowNo: row, seatNo: String(c) })
      id++
    }
  }
  return list
}

export function getMovieById(id: number): DemoMovie | undefined {
  return DEMO_MOVIES.find((m) => m.id === id)
}

export function getShowtimesForMovie(movieId: number): DemoShowtime[] {
  return DEMO_SHOWTIMES.filter((s) => s.movieId === movieId)
}

export function getShowtimeById(id: number): DemoShowtime | undefined {
  return DEMO_SHOWTIMES.find((s) => s.id === id)
}

export function formatSeatLabels(showtimeId: number, seatIds: number[]): string {
  const seats = seatsForShowtime(showtimeId)
  const byId = new Map(seats.map((s) => [s.id, s]))
  return seatIds
    .map((id) => {
      const s = byId.get(id)
      return s ? `${s.rowNo}${s.seatNo}` : String(id)
    })
    .join(', ')
}
