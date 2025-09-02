/**
 * API関連定数
 */

// HTTPステータスコード
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Supabaseエラーコード
export const SUPABASE_ERROR_CODE = {
  NOT_FOUND: 'PGRST116',
} as const;

// APIレスポンス制限
export const API_LIMITS = {
  DEFAULT_LIMIT: 100,
  MAX_LIMIT: 1000,
  HISTORY_LIMIT: 100,
  CAMPAIGN_LIMIT: 1000,
  USER_LIMIT: 1000,
} as const;

// タイムアウト・遅延設定
export const TIMEOUTS = {
  BATCH_DELAY_MS: 500,
  SLOW_DELIVERY_THRESHOLD_MS: 1000,
  RATE_LIMIT_WINDOW_MAX_SECONDS: 86400, // 1 day
} as const;