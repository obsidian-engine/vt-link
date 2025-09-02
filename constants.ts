// LINE API 制限値
export const LINE_API_LIMITS = {
  MAX_BATCH_SIZE: 500, // LINE APIは最大500件のユーザーIDまで一度に送信可能
} as const;

// RichMenu表示サイズ
export const RICH_MENU_DISPLAY_SIZES = {
  full: {
    width: 2500,
    height: 1686,
  },
  half: {
    width: 2500,
    height: 843,
  },
} as const;
