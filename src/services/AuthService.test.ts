import { describe, it, expect, vi, beforeEach } from 'vitest'
import { tokenStore } from '@utils/tokenStore'
import { storage } from '@utils/storage'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

vi.mock('@utils/tokenStore', () => ({
  tokenStore: { get: vi.fn(), set: vi.fn(), clear: vi.fn() },
}))
vi.mock('@utils/storage', () => ({
  storage: { getRefreshToken: vi.fn(), setRefreshToken: vi.fn(), clearRefreshToken: vi.fn() },
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        accessToken: 'at-123',
        refreshToken: 'rt-456',
        mustChangePassword: false,
      }),
    })
  })

  it('stores tokens after successful login', async () => {
    const { AuthService } = await import('./AuthService')
    const result = await AuthService.login({ email: 'a@b.com', password: '123' })

    expect(tokenStore.set).toHaveBeenCalledWith('at-123')
    expect(storage.setRefreshToken).toHaveBeenCalledWith('rt-456')
    expect(result.mustChangePassword).toBe(false)
  })

  it('clears tokens on logout', async () => {
    const { AuthService } = await import('./AuthService')
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) })

    await AuthService.logout('rt-456')

    expect(tokenStore.clear).toHaveBeenCalled()
    expect(storage.clearRefreshToken).toHaveBeenCalled()
  })
})
