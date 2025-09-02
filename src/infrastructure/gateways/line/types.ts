/**
 * LINE Bot API型定義
 * 公式APIドキュメントに基づく厳密な型定義
 */
import type {
  LineChannelID,
  LineUserID,
  LineRichMenuID,
  URL,
} from "@/domain/valueObjects/BaseTypes";

// ============================================================================
// 基本型定義
// ============================================================================
export type LineEventType =
  | "message"
  | "follow"
  | "unfollow"
  | "join"
  | "leave"
  | "memberJoined"
  | "memberLeft"
  | "postback"
  | "videoPlayComplete"
  | "beacon"
  | "accountLink"
  | "things";

export type LineMessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "sticker"
  | "imagemap"
  | "template"
  | "flex";

export type LineSourceType = "user" | "group" | "room";

// ============================================================================
// メッセージ関連型定義
// ============================================================================
export interface LineTextMessage {
  readonly type: "text";
  readonly text: string;
  readonly emojis?: ReadonlyArray<LineEmoji>;
  readonly mention?: LineMention;
  readonly quotedMessageId?: string;
  readonly quoteToken?: string;
}

export interface LineImageMessage {
  readonly type: "image";
  readonly originalContentUrl: URL;
  readonly previewImageUrl: URL;
}

export interface LineVideoMessage {
  readonly type: "video";
  readonly originalContentUrl: URL;
  readonly previewImageUrl: URL;
  readonly trackingId?: string;
}

export interface LineAudioMessage {
  readonly type: "audio";
  readonly originalContentUrl: URL;
  readonly duration: number;
}

export interface LineFileMessage {
  readonly type: "file";
  readonly fileName: string;
}

export interface LineLocationMessage {
  readonly type: "location";
  readonly title: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface LineStickerMessage {
  readonly type: "sticker";
  readonly packageId: string;
  readonly stickerId: string;
  readonly stickerResourceType?:
    | "STATIC"
    | "ANIMATION"
    | "SOUND"
    | "ANIMATION_SOUND"
    | "POPUP"
    | "POPUP_SOUND"
    | "CUSTOM"
    | "MESSAGE";
  readonly keywords?: ReadonlyArray<string>;
  readonly text?: string;
}

export interface LineImagemapMessage {
  readonly type: "imagemap";
  readonly baseUrl: URL;
  readonly altText: string;
  readonly baseSize: LineSize;
  readonly video?: LineImagemapVideo;
  readonly actions: ReadonlyArray<LineImagemapAction>;
}

export interface LineTemplateMessage {
  readonly type: "template";
  readonly altText: string;
  readonly template: LineTemplate;
}

export interface LineFlexMessage {
  readonly type: "flex";
  readonly altText: string;
  readonly contents: LineFlexContainer;
  readonly quickReply?: LineQuickReply;
  readonly sender?: LineSender;
}

// Union type for all message types
export type LineMessage =
  | LineTextMessage
  | LineImageMessage
  | LineVideoMessage
  | LineAudioMessage
  | LineFileMessage
  | LineLocationMessage
  | LineStickerMessage
  | LineImagemapMessage
  | LineTemplateMessage
  | LineFlexMessage;

// ============================================================================
// ソース関連型定義
// ============================================================================
export interface LineUserSource {
  readonly type: "user";
  readonly userId: LineUserID;
}

export interface LineGroupSource {
  readonly type: "group";
  readonly groupId: string;
  readonly userId?: LineUserID;
}

export interface LineRoomSource {
  readonly type: "room";
  readonly roomId: string;
  readonly userId?: LineUserID;
}

export type LineSource = LineUserSource | LineGroupSource | LineRoomSource;

// ============================================================================
// イベント関連型定義
// ============================================================================
export interface LineBaseEvent {
  readonly type: LineEventType;
  readonly mode: "active" | "standby";
  readonly timestamp: number;
  readonly source: LineSource;
  readonly webhookEventId: string;
  readonly deliveryContext: {
    readonly isRedelivery: boolean;
  };
}

export interface LineMessageEvent extends LineBaseEvent {
  readonly type: "message";
  readonly replyToken: string;
  readonly message: LineMessage & {
    readonly id: string;
    readonly quoteToken?: string;
  };
}

export interface LineFollowEvent extends LineBaseEvent {
  readonly type: "follow";
  readonly replyToken: string;
  readonly link?: {
    readonly result: "ok" | "failed";
    readonly nonce?: string;
  };
}

export interface LineUnfollowEvent extends LineBaseEvent {
  readonly type: "unfollow";
}

export interface LinePostbackEvent extends LineBaseEvent {
  readonly type: "postback";
  readonly replyToken: string;
  readonly postback: {
    readonly data: string;
    readonly params?: Record<string, string>;
  };
}

export type LineEvent =
  | LineMessageEvent
  | LineFollowEvent
  | LineUnfollowEvent
  | LinePostbackEvent;

// ============================================================================
// ヘルパー型定義
// ============================================================================
export interface LineSize {
  readonly width: number;
  readonly height: number;
}

export interface LineEmoji {
  readonly index: number;
  readonly productId: string;
  readonly emojiId: string;
}

export interface LineMention {
  readonly mentionees: ReadonlyArray<{
    readonly index: number;
    readonly length: number;
    readonly userId: LineUserID;
  }>;
}

export interface LineSender {
  readonly name?: string;
  readonly iconUrl?: URL;
}

export interface LineQuickReply {
  readonly items: ReadonlyArray<LineQuickReplyItem>;
}

export interface LineQuickReplyItem {
  readonly type: "action";
  readonly imageUrl?: URL;
  readonly action: LineAction;
}

// ============================================================================
// アクション関連型定義
// ============================================================================
export type LineAction =
  | LinePostbackAction
  | LineMessageAction
  | LineURIAction
  | LineDatetimePickerAction
  | LineCameraAction
  | LineCameraRollAction
  | LineLocationAction;

export interface LinePostbackAction {
  readonly type: "postback";
  readonly label?: string;
  readonly data: string;
  readonly displayText?: string;
  readonly text?: string;
}

export interface LineMessageAction {
  readonly type: "message";
  readonly label?: string;
  readonly text: string;
}

export interface LineURIAction {
  readonly type: "uri";
  readonly label?: string;
  readonly uri: URL;
  readonly altUri?: {
    readonly desktop?: URL;
  };
}

export interface LineDatetimePickerAction {
  readonly type: "datetimepicker";
  readonly label?: string;
  readonly data: string;
  readonly mode: "date" | "time" | "datetime";
  readonly initial?: string;
  readonly max?: string;
  readonly min?: string;
}

export interface LineCameraAction {
  readonly type: "camera";
  readonly label?: string;
}

export interface LineCameraRollAction {
  readonly type: "cameraRoll";
  readonly label?: string;
}

export interface LineLocationAction {
  readonly type: "location";
  readonly label?: string;
}

// ============================================================================
// テンプレート関連型定義
// ============================================================================
export type LineTemplate =
  | LineButtonsTemplate
  | LineConfirmTemplate
  | LineCarouselTemplate
  | LineImageCarouselTemplate;

export interface LineButtonsTemplate {
  readonly type: "buttons";
  readonly thumbnailImageUrl?: URL;
  readonly imageAspectRatio?: "1:1.51" | "1:1";
  readonly imageSize?: "cover" | "contain";
  readonly imageBackgroundColor?: string;
  readonly title?: string;
  readonly text: string;
  readonly defaultAction?: LineAction;
  readonly actions: ReadonlyArray<LineAction>;
}

export interface LineConfirmTemplate {
  readonly type: "confirm";
  readonly text: string;
  readonly actions: readonly [LineAction, LineAction];
}

export interface LineCarouselTemplate {
  readonly type: "carousel";
  readonly columns: ReadonlyArray<LineCarouselColumn>;
  readonly imageAspectRatio?: "1:1.51" | "1:1";
  readonly imageSize?: "cover" | "contain";
}

export interface LineCarouselColumn {
  readonly thumbnailImageUrl?: URL;
  readonly imageBackgroundColor?: string;
  readonly title?: string;
  readonly text: string;
  readonly defaultAction?: LineAction;
  readonly actions: ReadonlyArray<LineAction>;
}

export interface LineImageCarouselTemplate {
  readonly type: "image_carousel";
  readonly columns: ReadonlyArray<LineImageCarouselColumn>;
}

export interface LineImageCarouselColumn {
  readonly imageUrl: URL;
  readonly action: LineAction;
}

// ============================================================================
// Imagemap関連型定義
// ============================================================================
export interface LineImagemapVideo {
  readonly originalContentUrl: URL;
  readonly previewImageUrl: URL;
  readonly area: LineImagemapArea;
  readonly externalLink?: {
    readonly linkUri: URL;
    readonly label: string;
  };
}

export type LineImagemapAction =
  | LineImagemapURIAction
  | LineImagemapMessageAction;

export interface LineImagemapURIAction {
  readonly type: "uri";
  readonly linkUri: URL;
  readonly area: LineImagemapArea;
}

export interface LineImagemapMessageAction {
  readonly type: "message";
  readonly text: string;
  readonly area: LineImagemapArea;
}

export interface LineImagemapArea {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// ============================================================================
// Flex関連型定義（簡略版）
// ============================================================================
export type LineFlexContainer = LineFlexBubble | LineFlexCarousel;

export interface LineFlexBubble {
  readonly type: "bubble";
  readonly size?: "nano" | "micro" | "kilo" | "mega" | "giga";
  readonly header?: LineFlexBox;
  readonly hero?: LineFlexComponent;
  readonly body?: LineFlexBox;
  readonly footer?: LineFlexBox;
  readonly styles?: LineFlexBubbleStyles;
  readonly action?: LineAction;
}

export interface LineFlexCarousel {
  readonly type: "carousel";
  readonly contents: ReadonlyArray<LineFlexBubble>;
}

export interface LineFlexBox {
  readonly type: "box";
  readonly layout: "horizontal" | "vertical" | "baseline";
  readonly contents: ReadonlyArray<LineFlexComponent>;
  readonly backgroundColor?: string;
  readonly borderColor?: string;
  readonly borderWidth?: string;
  readonly cornerRadius?: string;
  readonly margin?: string;
  readonly paddingAll?: string;
  readonly paddingTop?: string;
  readonly paddingBottom?: string;
  readonly paddingStart?: string;
  readonly paddingEnd?: string;
  readonly spacing?: string;
  readonly flex?: number;
  readonly justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  readonly alignItems?: "flex-start" | "center" | "flex-end";
  readonly background?: LineFlexBoxBackground;
  readonly action?: LineAction;
}

export type LineFlexComponent =
  | LineFlexBox
  | LineFlexButton
  | LineFlexImage
  | LineFlexText
  | LineFlexSeparator
  | LineFlexSpacer;

export interface LineFlexButton {
  readonly type: "button";
  readonly action: LineAction;
  readonly flex?: number;
  readonly margin?: string;
  readonly height?: "sm" | "md";
  readonly style?: "link" | "primary" | "secondary";
  readonly color?: string;
  readonly gravity?: "top" | "bottom" | "center";
}

export interface LineFlexImage {
  readonly type: "image";
  readonly url: URL;
  readonly flex?: number;
  readonly margin?: string;
  readonly align?: "start" | "end" | "center";
  readonly gravity?: "top" | "bottom" | "center";
  readonly size?: string;
  readonly aspectRatio?: string;
  readonly aspectMode?: "cover" | "fit";
  readonly backgroundColor?: string;
  readonly action?: LineAction;
}

export interface LineFlexText {
  readonly type: "text";
  readonly text: string;
  readonly flex?: number;
  readonly margin?: string;
  readonly size?: string;
  readonly align?: "start" | "end" | "center";
  readonly gravity?: "top" | "bottom" | "center";
  readonly wrap?: boolean;
  readonly lineSpacing?: string;
  readonly weight?: "regular" | "bold";
  readonly color?: string;
  readonly action?: LineAction;
  readonly style?: "normal" | "italic";
  readonly decoration?: "none" | "underline" | "line-through";
}

export interface LineFlexSeparator {
  readonly type: "separator";
  readonly margin?: string;
  readonly color?: string;
}

export interface LineFlexSpacer {
  readonly type: "spacer";
  readonly size?: string;
}

export interface LineFlexBoxBackground {
  readonly type: "linearGradient";
  readonly angle: string;
  readonly startColor: string;
  readonly endColor: string;
}

export interface LineFlexBubbleStyles {
  readonly header?: LineFlexBlockStyle;
  readonly hero?: LineFlexBlockStyle;
  readonly body?: LineFlexBlockStyle;
  readonly footer?: LineFlexBlockStyle;
}

export interface LineFlexBlockStyle {
  readonly backgroundColor?: string;
  readonly separator?: boolean;
  readonly separatorColor?: string;
}

// ============================================================================
// Rich Menu関連型定義
// ============================================================================
export interface LineRichMenuSize {
  readonly width: number;
  readonly height: number;
}

export interface LineRichMenuArea {
  readonly bounds: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly action: LineAction;
}

export interface LineRichMenuRequest {
  readonly size: LineRichMenuSize;
  readonly selected: boolean;
  readonly name: string;
  readonly chatBarText: string;
  readonly areas: ReadonlyArray<LineRichMenuArea>;
}

export interface LineRichMenuResponse extends LineRichMenuRequest {
  readonly richMenuId: LineRichMenuID;
}

// ============================================================================
// API応答型定義
// ============================================================================
export interface LineApiResponse {
  readonly sentMessages?: ReadonlyArray<{
    readonly id: string;
    readonly quoteToken: string;
  }>;
}

export interface LineErrorResponse {
  readonly message: string;
  readonly details?: ReadonlyArray<{
    readonly message: string;
    readonly property: string;
  }>;
}

// ============================================================================
// リクエスト型定義
// ============================================================================
export interface LineBroadcastRequest {
  readonly messages: ReadonlyArray<LineMessage>;
  readonly notificationDisabled?: boolean;
}

export interface LineNarrowcastRequest {
  readonly messages: ReadonlyArray<LineMessage>;
  readonly recipient: {
    readonly type: "user" | "audience";
    readonly userIds?: ReadonlyArray<LineUserID>;
    readonly audienceGroupId?: number;
  };
  readonly filter?: {
    readonly demographic?: {
      readonly ageFilter?: {
        readonly gte?: number;
        readonly lt?: number;
      };
      readonly genderFilter?: {
        readonly oneOf: ReadonlyArray<"male" | "female">;
      };
      readonly areaFilter?: {
        readonly oneOf: ReadonlyArray<string>;
      };
    };
  };
  readonly limit?: {
    readonly max?: number;
    readonly upToRemainingQuota?: boolean;
  };
  readonly notificationDisabled?: boolean;
}

export interface LineReplyRequest {
  readonly replyToken: string;
  readonly messages: ReadonlyArray<LineMessage>;
  readonly notificationDisabled?: boolean;
}

export interface LinePushRequest {
  readonly to: LineUserID | string; // group or room ID
  readonly messages: ReadonlyArray<LineMessage>;
  readonly notificationDisabled?: boolean;
}

// ============================================================================
// Webhook検証関連
// ============================================================================
export interface LineWebhookRequest {
  readonly destination: LineChannelID;
  readonly events: ReadonlyArray<LineEvent>;
}

// ============================================================================
// 型ガード関数
// ============================================================================
export const isLineTextMessage = (
  message: LineMessage,
): message is LineTextMessage => message.type === "text";

export const isLineImageMessage = (
  message: LineMessage,
): message is LineImageMessage => message.type === "image";

export const isLineStickerMessage = (
  message: LineMessage,
): message is LineStickerMessage => message.type === "sticker";

export const isLineMessageEvent = (
  event: LineEvent,
): event is LineMessageEvent => event.type === "message";

export const isLineFollowEvent = (event: LineEvent): event is LineFollowEvent =>
  event.type === "follow";

export const isLineUnfollowEvent = (
  event: LineEvent,
): event is LineUnfollowEvent => event.type === "unfollow";

export const isLinePostbackEvent = (
  event: LineEvent,
): event is LinePostbackEvent => event.type === "postback";

export const isUserSource = (source: LineSource): source is LineUserSource =>
  source.type === "user";

export const isGroupSource = (source: LineSource): source is LineGroupSource =>
  source.type === "group";

export const isRoomSource = (source: LineSource): source is LineRoomSource =>
  source.type === "room";
