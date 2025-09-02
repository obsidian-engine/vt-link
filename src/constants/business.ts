/**
 * ビジネスロジック関連定数
 */

// エンティティの最大長制限
export const ENTITY_MAX_LENGTHS = {
  NAME: 100,
  DESCRIPTION: 500,
  SHORT_DESCRIPTION: 255,
  TITLE: 100,
  LONG_TEXT: 5000,
} as const;

// メッセージキャンペーン制限
export const CAMPAIGN_LIMITS = {
  MAX_TARGET_USERS: 500,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// 年齢制限
export const AGE_LIMITS = {
  MIN: 0,
  MAX: 120,
} as const;

// レート制限設定
export const RATE_LIMIT_SETTINGS = {
  GLOBAL_COOLDOWN_SECONDS: 300, // 5分
  USER_COOLDOWN_SECONDS: 1800, // 30分
  USER_SHORT_COOLDOWN_SECONDS: 120, // 2分
  USER_MEDIUM_COOLDOWN_SECONDS: 180, // 3分
  USER_LONG_COOLDOWN_SECONDS: 600, // 10分
  MAX_REQUESTS_PER_WINDOW: 5,
  WINDOW_SECONDS: 600, // 10分
} as const;
