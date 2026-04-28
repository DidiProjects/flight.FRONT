import { tokenStore } from '@utils/tokenStore'
import { storage } from '@utils/storage'
import type { ApiError } from '@app-types/auth'

const API_URL = import.meta.env.VITE_API_URL as string

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (err: Error) => void
}> = []

async function attemptRefresh(): Promise<string> {
  const refreshToken = storage.getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Partial<ApiError>
    throw new Error(body.error ?? 'Sessão expirada')
  }

  const data = (await res.json()) as { accessToken: string; refreshToken: string }
  tokenStore.set(data.accessToken)
  storage.setRefreshToken(data.refreshToken)
  return data.accessToken
}

function queuedRefresh(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      refreshQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true
  return attemptRefresh()
    .then((token) => {
      refreshQueue.forEach((p) => p.resolve(token))
      refreshQueue = []
      return token
    })
    .catch((err: Error) => {
      refreshQueue.forEach((p) => p.reject(err))
      refreshQueue = []
      throw err
    })
    .finally(() => {
      isRefreshing = false
    })
}

function dispatchLogout() {
  tokenStore.clear()
  storage.clearRefreshToken()
  window.dispatchEvent(new CustomEvent('auth:logout'))
}

export async function proactiveRefresh(): Promise<string | null> {
  try {
    return await queuedRefresh()
  } catch {
    dispatchLogout()
    return null
  }
}

export class ApiService {
  protected baseUrl = API_URL

  protected async request<T>(
    path: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<T> {
    const token = tokenStore.get()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers })

    if (res.status === 401 && retry) {
      try {
        const newToken = await queuedRefresh()
        return this.request<T>(path, options, false)
          .then((data) => {
            void newToken
            return data
          })
          .catch((err: unknown) => { throw err })
      } catch {
        dispatchLogout()
        throw new Error('Sessão expirada. Faça login novamente.')
      }
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as Partial<ApiError>
      const message = body.error ?? `Erro ${res.status}`
      const err = Object.assign(new Error(message), { status: res.status, issues: body.issues })
      throw err
    }

    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
  }

  protected get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' })
  }

  protected post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  protected patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  protected delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }
}
