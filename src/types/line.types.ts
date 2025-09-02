/**
 * LINE Messaging API の型定義
 */

// LINE メッセージの基本型
export interface LineMessage {
  readonly type: LineMessageType;
}

// LINE メッセージタイプ
export type LineMessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'location'
  | 'sticker'
  | 'imagemap'
  | 'template'
  | 'flex';

// テキストメッセージ
export interface LineTextMessage extends LineMessage {
  readonly type: 'text';
  readonly text: string;
  readonly emojis?: LineEmoji[];
}

// 画像メッセージ
export interface LineImageMessage extends LineMessage {
  readonly type: 'image';
  readonly originalContentUrl: string;
  readonly previewImageUrl: string;
}

// ビデオメッセージ
export interface LineVideoMessage extends LineMessage {
  readonly type: 'video';
  readonly originalContentUrl: string;
  readonly previewImageUrl: string;
}

// 音声メッセージ
export interface LineAudioMessage extends LineMessage {
  readonly type: 'audio';
  readonly originalContentUrl: string;
  readonly duration: number;
}

// スタンプメッセージ
export interface LineStickerMessage extends LineMessage {
  readonly type: 'sticker';
  readonly packageId: string;
  readonly stickerId: string;
}

// 位置情報メッセージ
export interface LineLocationMessage extends LineMessage {
  readonly type: 'location';
  readonly title: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
}

// LINE メッセージのユニオン型
export type LineMessageUnion =
  | LineTextMessage
  | LineImageMessage
  | LineVideoMessage
  | LineAudioMessage
  | LineStickerMessage
  | LineLocationMessage;

// LINE 絵文字
export interface LineEmoji {
  readonly index: number;
  readonly productId: string;
  readonly emojiId: string;
}

// LINE Webhook イベント
export interface LineWebhookEvent {
  readonly type: LineEventType;
  readonly timestamp: number;
  readonly source: LineEventSource;
  readonly webhookEventId: string;
  readonly deliveryContext: {
    readonly isRedelivery: boolean;
  };
}

// LINE イベントタイプ
export type LineEventType =
  | 'message'
  | 'follow'
  | 'unfollow'
  | 'join'
  | 'leave'
  | 'memberJoined'
  | 'memberLeft'
  | 'postback'
  | 'videoPlayComplete';

// LINE イベントソース
export interface LineEventSource {
  readonly type: 'user' | 'group' | 'room';
  readonly userId?: string;
  readonly groupId?: string;
  readonly roomId?: string;
}

// LINE メッセージイベント
export interface LineMessageEvent extends LineWebhookEvent {
  readonly type: 'message';
  readonly replyToken: string;
  readonly message: LineReceivedMessage;
}

// 受信メッセージ
export interface LineReceivedMessage {
  readonly id: string;
  readonly type: LineMessageType;
  readonly text?: string;
  readonly timestamp: number;
}

// LINE フォローイベント
export interface LineFollowEvent extends LineWebhookEvent {
  readonly type: 'follow';
  readonly replyToken: string;
}

// LINE ポストバックイベント
export interface LinePostbackEvent extends LineWebhookEvent {
  readonly type: 'postback';
  readonly replyToken: string;
  readonly postback: {
    readonly data: string;
    readonly params?: {
      readonly datetime?: string;
      readonly date?: string;
      readonly time?: string;
    };
  };
}

// LINE Webhook リクエストボディ
export interface LineWebhookRequestBody {
  readonly destination: string;
  readonly events: LineWebhookEvent[];
}

// LINE API レスポンス
export interface LineApiResponse {
  readonly sentMessages?: Array<{
    readonly id: string;
    readonly quoteToken: string;
  }>;
}

// LINE エラーレスポンス
export interface LineErrorResponse {
  readonly message: string;
  readonly details?: Array<{
    readonly message: string;
    readonly property: string;
  }>;
}

// LINE アクションタイプ
export enum LineActionType {
  Postback = 'postback',
  Message = 'message',
  Uri = 'uri',
  DatetimePicker = 'datetimepicker',
  Camera = 'camera',
  CameraRoll = 'cameraRoll',
  Location = 'location',
}

// LINE アクション
export interface LineAction {
  readonly type: LineActionType;
  readonly label?: string;
  readonly data?: string;
  readonly text?: string;
  readonly uri?: string;
  readonly initial?: string;
  readonly max?: string;
  readonly min?: string;
  readonly mode?: 'date' | 'time' | 'datetime';
}

// Rich Menu エリア
export interface RichMenuArea {
  readonly bounds: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly action: LineAction;
}

// Rich Menu サイズ
export interface RichMenuSize {
  readonly width: number;
  readonly height: number;
}

// Rich Menu アクション
export interface RichMenuAction {
  readonly type: LineActionType;
  readonly data?: string;
  readonly text?: string;
  readonly uri?: string;
}
