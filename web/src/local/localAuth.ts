import type { User } from '../context/AuthContext'

const USERS_KEY = 'moviebooking_users'
const NEXT_USER_ID_KEY = 'moviebooking_next_user_id'

/** Sample accounts created on first load when missing (for QA / staging-style flows). */
export const SAMPLE_ACCOUNTS = [
  {
    email: 'alice.west@cinebook.com',
    password: 'alice123',
    name: 'Alice West',
  },
  {
    email: 'bob.ellis@cinebook.com',
    password: 'bob123',
    name: 'Bob Ellis',
  },
] as const

type StoredUser = {
  id: number
  email: string
  password: string
  name: string
  phone: string | null
  role: string
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredUser[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function nextUserId(): number {
  const raw = localStorage.getItem(NEXT_USER_ID_KEY)
  let n = raw ? parseInt(raw, 10) : 1
  if (Number.isNaN(n) || n < 1) n = 1
  localStorage.setItem(NEXT_USER_ID_KEY, String(n + 1))
  return n
}

/** Ensures sample accounts exist in storage (idempotent). Call once on app load. */
export function seedDemoUsers(): void {
  if (typeof localStorage === 'undefined') return
  const users = readUsers()
  let changed = false
  const next = [...users]
  for (const d of SAMPLE_ACCOUNTS) {
    const email = d.email.toLowerCase()
    if (next.some((u) => u.email.toLowerCase() === email)) continue
    next.push({
      id: nextUserId(),
      email,
      password: d.password,
      name: d.name,
      phone: null,
      role: 'USER',
    })
    changed = true
  }
  if (changed) writeUsers(next)
}

function toPublic(u: StoredUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
  }
}

export function registerLocal(input: {
  name: string
  email: string
  password: string
  phone: string | null
}): { user: User } | { error: string } {
  const email = input.email.trim().toLowerCase()
  const users = readUsers()
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { error: 'An account with this email already exists.' }
  }
  const u: StoredUser = {
    id: nextUserId(),
    email,
    password: input.password,
    name: input.name.trim(),
    phone: input.phone,
    role: 'USER',
  }
  users.push(u)
  writeUsers(users)
  return { user: toPublic(u) }
}

export function loginLocal(input: {
  email: string
  password: string
}): { user: User } | { error: string } {
  const email = input.email.trim().toLowerCase()
  const users = readUsers()
  const u = users.find(
    (x) => x.email.toLowerCase() === email && x.password === input.password,
  )
  if (!u) return { error: 'Invalid email or password.' }
  return { user: toPublic(u) }
}
