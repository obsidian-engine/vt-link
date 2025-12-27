const LINE_CLIENT_ID = process.env.NEXT_PUBLIC_LINE_CLIENT_ID!
const REDIRECT_URI = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI!

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)

  // Dispatch custom event to notify auth state change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tokenUpdate'))
  }
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')

  // Dispatch custom event to notify auth state change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tokenUpdate'))
  }
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

export function redirectToLineLogin(): void {
  const state = Math.random().toString(36).substring(7)
  const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=profile%20openid%20email`
  window.location.href = url
}
