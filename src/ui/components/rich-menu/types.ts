export interface RichMenuArea {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly action: RichMenuAction;
}

export enum LineActionType {
  Postback = 'postback',
  Message = 'message',
  Uri = 'uri',
}

export interface RichMenuAction {
  readonly type: LineActionType;
  readonly text?: string;
  readonly data?: string;
  readonly uri?: string;
  readonly displayText?: string;
}

export interface RichMenuSize {
  readonly width: number;
  readonly height: number;
}

export const RICH_MENU_SIZES: Record<'full' | 'half', RichMenuSize> = {
  full: { width: 2500, height: 1686 },
  half: { width: 2500, height: 843 },
} as const;

export const EDITOR_SCALE = 0.3; // エディター表示用のスケール

export const GRID_SIZE = 10; // スナップグリッドサイズ（px）