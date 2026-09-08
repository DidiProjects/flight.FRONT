import { describe, it, expect, vi, beforeEach } from 'vitest'
import { proactiveRefresh } from './ApiService'
import { storage } from '@utils/storage'
import { tokenStore } from '@utils/tokenStore'

/**
 * StrictMode double-invokes effects in development, and `AuthContext`'s
 * session bootstrap runs on every mount. Without a single-flight guard, two
 * near-simultaneous refreshes each hit `/auth/refresh` — and since the refresh
 * token is one-shot (rotates on use), the second call always arrives with an
 * already-spent token and 401s, logging out a session that had just been
 * restored. `queuedRefresh` (used by `proactiveRefresh`) exists to prevent
 * exactly that: this pins the contract that makes it safe to call from more
 * than one place without hand-rolled dedup at each call site.
 */
describe('proactiveRefresh — chamadas concorrentes', () => {
  beforeEach(() => {
    storage.setRefreshToken('rt-inicial')
    tokenStore.clear()
  })

  it('duas chamadas concorrentes disparam UMA única requisição de refresh', async () => {
    let calls = 0
    vi.stubGlobal('fetch', vi.fn(async () => {
      calls++
      return {
        ok: true,
        json: async () => ({ accessToken: 'novo-access', refreshToken: 'novo-refresh' }),
      } as Response
    }))

    const [a, b] = await Promise.all([proactiveRefresh(), proactiveRefresh()])

    expect(calls).toBe(1)
    expect(a).toBe('novo-access')
    expect(b).toBe('novo-access')

    vi.unstubAllGlobals()
  })

  it('chamadas em sequência (uma após a outra terminar) disparam uma requisição cada', async () => {
    let calls = 0
    vi.stubGlobal('fetch', vi.fn(async () => {
      calls++
      return {
        ok: true,
        json: async () => ({ accessToken: `access-${calls}`, refreshToken: `refresh-${calls}` }),
      } as Response
    }))

    await proactiveRefresh()
    await proactiveRefresh()

    expect(calls).toBe(2)

    vi.unstubAllGlobals()
  })
})
