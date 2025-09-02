/**
 * バリデーション関連定数
 */

// 文字列長制限
export const STRING_LIMITS = {
  MIN_LENGTH: 1,
  SHORT_TEXT_MAX: 100,
  MEDIUM_TEXT_MAX: 255,
  LONG_TEXT_MAX: 5000,
  DESCRIPTION_MAX: 1000,
} as const;

// 数値制限
export const NUMBER_LIMITS = {
  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,
  AGE_MIN: 0,
  AGE_MAX: 120,
  TIME_MIN: 0,
  TIME_MAX: 120,
} as const;

// 電話番号正規表現（E.164準拠）
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// 共通バリデーション設定
export const VALIDATION_RULES = {
  REQUIRED_STRING: { min: 1 },
  NAME_FIELD: { min: 1, max: 100 },
  DESCRIPTION_FIELD: { max: 1000 },
  TEXT_CONTENT: { min: 1, max: 5000 },
  CHANNEL_SECRET: { min: 1, max: 100 },
  DISPLAY_NAME: { min: 1, max: 100 },
  CATEGORY: { min: 1, max: 100 },
  TITLE: { min: 1, max: 255 },
} as const;
