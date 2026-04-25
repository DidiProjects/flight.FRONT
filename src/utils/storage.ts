const REFRESH_TOKEN_KEY = 'flight_rt'

export const storage = {
  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch {
      return null
    }
  },

  setRefreshToken: (token: string): void => {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } catch {
      /* storage unavailable */
    }
  },

  clearRefreshToken: (): void => {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch {
      /* storage unavailable */
    }
  },
}
