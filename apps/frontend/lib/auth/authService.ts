/**
 * Authentication Service
 * HttpOnly Cookie認証とLINE認証フローを提供
 */

const LINE_CLIENT_ID = process.env.NEXT_PUBLIC_LINE_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI!;

/**
 * CSRFトークンを取得（Cookieから）
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * OAuth state生成・保存
 */
export function generateAndStoreState(): string {
  const state = crypto.randomUUID();
  sessionStorage.setItem('oauth_state', state);
  return state;
}

/**
 * OAuth state検証
 */
export function validateState(state: string): boolean {
  const stored = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');
  return stored === state;
}

/**
 * LINE認証ページへリダイレクト
 */
export function redirectToLineLogin(): void {
  const state = generateAndStoreState();
  const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=profile%20openid%20email`;
  window.location.href = url;
}
