interface JwtPayload {
  role?: string
  sub?: string
  email?: string
  exp?: number
  [key: string]: unknown
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}
