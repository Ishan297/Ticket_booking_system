import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { seedDemoUsers } from '../local/localAuth'

const STORAGE_KEY = 'moviebooking_user'

export type User = {
  id: number
  name: string
  email: string
  role?: string
  phone?: string | null
}

type AuthContextValue = {
  user: User | null
  setUser: (u: User | null) => void
  login: (u: User) => void
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStored(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const seeded = useRef(false)
  if (!seeded.current) {
    seeded.current = true
    seedDemoUsers()
  }

  const [user, setUserState] = useState<User | null>(() => loadStored())

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const login = useCallback(
    (u: User) => {
      setUser(u)
    },
    [setUser],
  )

  const logout = useCallback(() => {
    setUser(null)
  }, [setUser])

  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN'

  const value = useMemo(
    () => ({ user, setUser, login, logout, isAdmin }),
    [user, setUser, login, logout, isAdmin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
