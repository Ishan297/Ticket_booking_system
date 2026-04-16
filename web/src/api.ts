/** In dev, Vite proxies /api → backend. In prod, UI is served from Spring Boot on same origin. */
export const API_BASE = '/api'

export async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return {} as T
  try {
    return JSON.parse(text) as T
  } catch {
    return {} as T
  }
}

export async function apiErrorMessage(res: Response): Promise<string> {
  const data = await parseJson<{ message?: string }>(res)
  return data.message || res.statusText || 'Request failed'
}
