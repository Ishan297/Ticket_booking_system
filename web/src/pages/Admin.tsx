import { useState, type FormEvent } from 'react'
import { API_BASE, parseJson } from '../api'

export function Admin() {
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  function showSuccess(text: string) {
    setErr('')
    setMsg(text)
  }
  function showError(text: string) {
    setMsg('')
    setErr(text)
  }

  async function postMovie(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    try {
      const res = await fetch(`${API_BASE}/admin/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: (f.elements.namedItem('title') as HTMLInputElement).value,
          description:
            (f.elements.namedItem('description') as HTMLInputElement).value ||
            null,
          durationMin: parseInt(
            (f.elements.namedItem('durationMin') as HTMLInputElement).value,
            10,
          ),
          genre:
            (f.elements.namedItem('genre') as HTMLInputElement).value || null,
          language:
            (f.elements.namedItem('language') as HTMLInputElement).value ||
            null,
        }),
      })
      const data = await parseJson<{ id?: number; message?: string }>(res)
      if (!res.ok) throw new Error(data.message || 'Failed')
      showSuccess(`Movie added. ID: ${data.id}`)
      f.reset()
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed')
    }
  }

  async function postTheater(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    try {
      const res = await fetch(`${API_BASE}/admin/theaters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (f.elements.namedItem('name') as HTMLInputElement).value,
          city: (f.elements.namedItem('city') as HTMLInputElement).value,
          address:
            (f.elements.namedItem('address') as HTMLInputElement).value ||
            null,
        }),
      })
      const data = await parseJson<{ id?: number; message?: string }>(res)
      if (!res.ok) throw new Error(data.message || 'Failed')
      showSuccess(`Theater added. ID: ${data.id}`)
      f.reset()
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed')
    }
  }

  async function postScreen(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    try {
      const res = await fetch(`${API_BASE}/admin/screens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theaterId: parseInt(
            (f.elements.namedItem('theaterId') as HTMLInputElement).value,
            10,
          ),
          name: (f.elements.namedItem('name') as HTMLInputElement).value,
          capacity: parseInt(
            (f.elements.namedItem('capacity') as HTMLInputElement).value,
            10,
          ),
        }),
      })
      const data = await parseJson<{ id?: number; message?: string }>(res)
      if (!res.ok) throw new Error(data.message || 'Failed')
      showSuccess(`Screen added. ID: ${data.id}`)
      f.reset()
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed')
    }
  }

  async function postShowtime(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    try {
      const start = (f.elements.namedItem('startTime') as HTMLInputElement)
        .value
      const end = (f.elements.namedItem('endTime') as HTMLInputElement).value
      const res = await fetch(`${API_BASE}/admin/showtimes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: parseInt(
            (f.elements.namedItem('movieId') as HTMLInputElement).value,
            10,
          ),
          screenId: parseInt(
            (f.elements.namedItem('screenId') as HTMLInputElement).value,
            10,
          ),
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
          pricePerSeat: parseFloat(
            (f.elements.namedItem('pricePerSeat') as HTMLInputElement).value,
          ),
        }),
      })
      const data = await parseJson<{ id?: number; message?: string }>(res)
      if (!res.ok) throw new Error(data.message || 'Failed')
      showSuccess(`Showtime added. ID: ${data.id}`)
      f.reset()
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed')
    }
  }

  const input =
    'mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20'
  const label = 'block text-xs font-medium uppercase tracking-wide text-zinc-500'

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Admin</h1>
        <p className="mt-2 text-zinc-500">
          Add movies, venues, screens, and showtimes.
        </p>
      </div>

      {msg && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {msg}
        </p>
      )}
      {err && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {err}
        </p>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl font-semibold text-white">
          Add movie
        </h2>
        <form onSubmit={postMovie} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Title</label>
            <input name="title" required className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Description</label>
            <input name="description" className={input} />
          </div>
          <div>
            <label className={label}>Duration (min)</label>
            <input name="durationMin" type="number" min={1} required className={input} />
          </div>
          <div>
            <label className={label}>Genre</label>
            <input name="genre" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Language</label>
            <input name="language" className={input} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 font-semibold text-black"
            >
              Add movie
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl font-semibold text-white">
          Add theater
        </h2>
        <form onSubmit={postTheater} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Name</label>
            <input name="name" required className={input} />
          </div>
          <div>
            <label className={label}>City</label>
            <input name="city" required className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Address</label>
            <input name="address" className={input} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 font-semibold text-black"
            >
              Add theater
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl font-semibold text-white">
          Add screen
        </h2>
        <form onSubmit={postScreen} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Theater ID</label>
            <input name="theaterId" type="number" required className={input} />
          </div>
          <div>
            <label className={label}>Screen name</label>
            <input name="name" required className={input} />
          </div>
          <div>
            <label className={label}>Capacity</label>
            <input
              name="capacity"
              type="number"
              min={1}
              defaultValue={50}
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 font-semibold text-black"
            >
              Add screen
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl font-semibold text-white">
          Add showtime
        </h2>
        <form onSubmit={postShowtime} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Movie ID</label>
            <input name="movieId" type="number" required className={input} />
          </div>
          <div>
            <label className={label}>Screen ID</label>
            <input name="screenId" type="number" required className={input} />
          </div>
          <div>
            <label className={label}>Start</label>
            <input name="startTime" type="datetime-local" required className={input} />
          </div>
          <div>
            <label className={label}>End</label>
            <input name="endTime" type="datetime-local" required className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Price per seat (₹)</label>
            <input
              name="pricePerSeat"
              type="number"
              step="0.01"
              required
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 font-semibold text-black"
            >
              Add showtime
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
