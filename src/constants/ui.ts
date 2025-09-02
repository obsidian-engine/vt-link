/**
 * UI関連定数
 */

// リッチメニュー表示サイズ設定
export const RICH_MENU_DISPLAY_SIZES = {
  full: { width: 2500, height: 1686 },
  half: { width: 2500, height: 843 },
} as const;

// アニメーション・タイミング設定
export const ANIMATION_TIMINGS = {
  SIDEBAR_TRANSITION_MS: 300,
  LOADING_DELAY_MS: 500,
  TOAST_DURATION_MS: 3000,
} as const;

// レイアウト設定
export const LAYOUT_SETTINGS = {
  SIDEBAR_WIDTH: 256,
  MOBILE_BREAKPOINT: 768,
  DESKTOP_BREAKPOINT: 1024,
} as const;

// カラーテーマ設定
export const THEME_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
} as const;
