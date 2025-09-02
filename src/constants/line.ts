/**
 * LINE API関連定数
 */

// リッチメニューサイズ
export const RICH_MENU_SIZES = {
  FULL: {
    WIDTH: 2500,
    HEIGHT: 1686,
  },
  HALF: {
    WIDTH: 2500,
    HEIGHT: 843,
  },
} as const;

// LINE APIバッチサイズ制限
export const LINE_API_LIMITS = {
  MAX_BATCH_SIZE: 500, // 最大500件のユーザーIDまで一度に送信可能
  MAX_TEXT_LENGTH: 5000,
  MAX_NAME_LENGTH: 300,
} as const;

// LINEスタンプのデフォルト値
export const DEFAULT_STICKERS = {
  PACKAGE_ID: '446', // LINE公式スタンプパッケージ
  STICKER_IDS: {
    DEFAULT: '1988',
    ALTERNATIVE_1: '1990',
    ALTERNATIVE_2: '1999',
    ALTERNATIVE_3: '2000',
    ALTERNATIVE_4: '2001',
    ALTERNATIVE_5: '2010',
  },
} as const;

// テストユーザーID（開発・テスト用）
export const TEST_IDS = {
  USER_ID: 'test-user-123',
  ACCOUNT_ID: 'account-001',
  VTUBER_ACCOUNT_ID: 'vtuber-hoshimachi-001',
  GAMER_ACCOUNT_ID: 'vtuber-gamer-001',
  FAN_USER_ID: 'fan-user-12345',
  MESSAGE_ID: 'msg-001',
  REPLY_TOKEN: 'reply-token-001',
} as const;
