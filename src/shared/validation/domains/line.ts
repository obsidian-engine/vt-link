/**
 * LINEドメイン専用Zodスキーマ
 */
import { z } from "zod";
import {
  IdSchemaBase,
  LineChannelIdSchemaBase,
  LineUserIdSchemaBase,
  UrlSchemaBase,
  ShortTextSchemaBase,
  MediumTextSchemaBase,
  LongTextSchemaBase,
  NonNegativeIntSchemaBase,
  LimitedArraySchemaBase,
  CreateEntitySchemaBase,
  UpdateEntitySchemaBase,
  createEnumSchema,
} from "../base";
import { UserIdSchema } from "./user";

// ============================================================================
// LINE関連Enum
// ============================================================================
export const RichMenuSizeSchema = createEnumSchema(["full", "half"] as const);
export const MessageTypeSchema = createEnumSchema([
  "text",
  "image",
  "sticker",
] as const);
export const CampaignStatusSchema = createEnumSchema([
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
  "cancelled",
] as const);
export const CampaignTypeSchema = createEnumSchema([
  "broadcast",
  "narrowcast",
] as const);

// ============================================================================
// LINE ID関連
// ============================================================================
export const AccountIdSchema = IdSchemaBase;
export const LineChannelIdSchema = LineChannelIdSchemaBase;
export const LineUserIdSchema = LineUserIdSchemaBase;
export const LineRichMenuIdSchema = ShortTextSchemaBase;

// ============================================================================
// LINEアカウントスキーマ
// ============================================================================
const LineAccountFieldsSchema = {
  id: AccountIdSchema,
  user_id: UserIdSchema,
  channel_id: LineChannelIdSchema,
  channel_secret: MediumTextSchemaBase,
  channel_access_token: LongTextSchemaBase,
  webhook_url: UrlSchemaBase.optional(),
  is_active: z.boolean().default(true),
} as const;

export const LineAccountSchema = CreateEntitySchemaBase(
  LineAccountFieldsSchema,
);

export const CreateLineAccountSchema = z.object({
  user_id: UserIdSchema,
  channel_id: LineChannelIdSchema,
  channel_secret: MediumTextSchemaBase,
  channel_access_token: LongTextSchemaBase,
  webhook_url: UrlSchemaBase.optional(),
  is_active: z.boolean().default(true),
});

export const UpdateLineAccountSchema = UpdateEntitySchemaBase({
  channel_secret: MediumTextSchemaBase,
  channel_access_token: LongTextSchemaBase,
  webhook_url: UrlSchemaBase.optional(),
  is_active: z.boolean(),
});

// ============================================================================
// リッチメニューエリアスキーマ
// ============================================================================
export const RichMenuBoundsSchema = z.object({
  x: NonNegativeIntSchemaBase,
  y: NonNegativeIntSchemaBase,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const RichMenuActionSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
  uri: UrlSchemaBase.optional(),
  data: z.string().optional(),
  displayText: z.string().optional(),
});

export const RichMenuAreaSchema = z.object({
  bounds: RichMenuBoundsSchema,
  action: RichMenuActionSchema,
});

// ============================================================================
// リッチメニュースキーマ
// ============================================================================
const RichMenuFieldsSchema = {
  id: IdSchemaBase,
  account_id: AccountIdSchema,
  line_rich_menu_id: LineRichMenuIdSchema.optional(),
  name: ShortTextSchemaBase,
  size: RichMenuSizeSchema.default("full"),
  chat_bar_text: z.string().max(14).optional(),
  areas: LimitedArraySchemaBase(RichMenuAreaSchema, 20).default([]),
  image_url: UrlSchemaBase.optional(),
  is_default: z.boolean().default(false),
  is_published: z.boolean().default(false),
} as const;

export const RichMenuSchema = CreateEntitySchemaBase(RichMenuFieldsSchema);

export const CreateRichMenuSchema = z.object({
  account_id: AccountIdSchema,
  name: ShortTextSchemaBase,
  size: RichMenuSizeSchema.default("full"),
  chat_bar_text: z.string().max(14).optional(),
  areas: LimitedArraySchemaBase(RichMenuAreaSchema, 20).default([]),
  image_url: UrlSchemaBase.optional(),
  is_default: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export const UpdateRichMenuSchema = UpdateEntitySchemaBase({
  name: ShortTextSchemaBase,
  size: RichMenuSizeSchema,
  chat_bar_text: z.string().max(14).optional(),
  areas: LimitedArraySchemaBase(RichMenuAreaSchema, 20),
  image_url: UrlSchemaBase.optional(),
  is_default: z.boolean(),
  is_published: z.boolean(),
});

// ============================================================================
// メッセージコンテンツスキーマ
// ============================================================================
export const TextContentSchema = z.object({
  text: LongTextSchemaBase,
});

export const ImageContentSchema = z.object({
  originalContentUrl: UrlSchemaBase,
  previewImageUrl: UrlSchemaBase,
});

export const StickerContentSchema = z.object({
  packageId: ShortTextSchemaBase,
  stickerId: ShortTextSchemaBase,
});

export const MessageContentSchema = z.object({
  type: MessageTypeSchema,
  payload: z.union([
    TextContentSchema,
    ImageContentSchema,
    StickerContentSchema,
  ]),
});

// ============================================================================
// 型推論
// ============================================================================
export type RichMenuSize = z.infer<typeof RichMenuSizeSchema>;
export type MessageType = z.infer<typeof MessageTypeSchema>;
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;
export type CampaignType = z.infer<typeof CampaignTypeSchema>;

export type LineAccount = z.infer<typeof LineAccountSchema>;
export type CreateLineAccountInput = z.infer<typeof CreateLineAccountSchema>;
export type UpdateLineAccountInput = z.infer<typeof UpdateLineAccountSchema>;

export type RichMenu = z.infer<typeof RichMenuSchema>;
export type CreateRichMenuInput = z.infer<typeof CreateRichMenuSchema>;
export type UpdateRichMenuInput = z.infer<typeof UpdateRichMenuSchema>;

export type RichMenuArea = z.infer<typeof RichMenuAreaSchema>;
export type RichMenuBounds = z.infer<typeof RichMenuBoundsSchema>;
export type RichMenuAction = z.infer<typeof RichMenuActionSchema>;

export type MessageContent = z.infer<typeof MessageContentSchema>;
export type TextContent = z.infer<typeof TextContentSchema>;
export type ImageContent = z.infer<typeof ImageContentSchema>;
export type StickerContent = z.infer<typeof StickerContentSchema>;
