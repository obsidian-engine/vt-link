/**
 * Authentication Service
 * トークン管理とLINE認証フローを提供
 */

const LINE_CLIENT_ID = process.env.NEXT_PUBLIC_LINE_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI!;

/**
 * アクセストークンを取得
 * @returns アクセストークン、存在しない場合はnull
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/**
 * リフレッシュトークンを取得
 * @returns リフレッシュトークン、存在しない場合はnull
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

/**
 * トークンを保存
 * @param accessToken - アクセストークン
 * @param refreshToken - リフレッシュトークン
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

/**
 * トークンを削除
 */
export function clearTokens(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/**
 * 認証状態を確認
 * @returns 認証済みの場合true
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/**
 * LINE認証ページへリダイレクト
 */
export function redirectToLineLogin(): void {
  const state = Math.random().toString(36).substring(7);
  const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=profile%20openid%20email`;
  window.location.href = url;
}
