import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginLocal } from '../local/localAuth'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const result = loginLocal({ email, password })
      if ('error' in result) {
        setErr(result.error)
        return
      }
      login(result.user)
      navigate(from, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-amber-400 hover:underline">
          Sign up
        </Link>
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        {err && (
          <p className="text-sm text-red-400">{err}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 font-semibold text-black shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
