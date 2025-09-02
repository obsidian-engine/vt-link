/**
 * 共通Zodスキーマ定義
 * データベース型とAPI型の一元管理
 */
import { z } from 'zod';

// ============================================================================
// 基本ID型のスキーマ
// ============================================================================
export const UserIDSchema = z.string().uuid();
export const AccountIDSchema = z.string().uuid();
export const LineChannelIDSchema = z.string().regex(/^\d+$/);
export const LineUserIDSchema = z.string().min(1).max(33);
export const CampaignIDSchema = z.string().uuid();
export const TemplateIDSchema = z.string().uuid();
export const SegmentIDSchema = z.string().uuid();
export const RichMenuIDSchema = z.string().uuid();
export const LineRichMenuIDSchema = z.string().min(1);
export const AutoReplyRuleIDSchema = z.string().uuid();
export const BatchIDSchema = z.string().uuid();
export const DeliveryLogIDSchema = z.string().uuid();

// ============================================================================
// 値型のスキーマ
// ============================================================================
export const EmailAddressSchema = z.string().email();
export const PhoneNumberSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
export const URLSchema = z.string().url();

// ============================================================================
// Enum型のスキーマ
// ============================================================================
export const UserRoleSchema = z.enum(['admin', 'member', 'viewer']);
export const RichMenuSizeSchema = z.enum(['full', 'half']);
export const MessageStatusSchema = z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed']);
export const ReplyRuleStatusSchema = z.enum(['active', 'inactive']);
export const MessageTypeSchema = z.enum(['text', 'image', 'sticker']);
export const GenderSchema = z.enum(['male', 'female', 'other', 'unknown']);
export const RegionCodeSchema = z.enum(['tokyo', 'osaka', 'nagoya', 'fukuoka', 'sapporo', 'other']);
export const CampaignStatusSchema = z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled']);
export const CampaignTypeSchema = z.enum(['broadcast', 'narrowcast']);

// ============================================================================
// 複合型のスキーマ
// ============================================================================

// MessageContent用のスキーマ
export const TextContentSchema = z.object({
  text: z.string().min(1).max(5000),
});

export const ImageContentSchema = z.object({
  originalContentUrl: URLSchema,
  previewImageUrl: URLSchema,
});

export const StickerContentSchema = z.object({
  packageId: z.string().min(1),
  stickerId: z.string().min(1),
});

export const MessageContentSchema = z.object({
  type: MessageTypeSchema,
  payload: z.union([TextContentSchema, ImageContentSchema, StickerContentSchema]),
});

// AgeRange用のスキーマ
export const AgeRangeSchema = z.object({
  min: z.number().int().min(0).max(120),
  max: z.number().int().min(0).max(120),
}).refine(
  (data) => data.min <= data.max,
  { message: "最小年齢は最大年齢以下である必要があります" }
);

// SegmentCriteria用のスキーマ
export const SegmentCriteriaSchema = z.object({
  genders: z.array(GenderSchema).optional(),
  ageRange: AgeRangeSchema.optional(),
  regions: z.array(RegionCodeSchema).optional(),
}).refine(
  (data) => data.genders || data.ageRange || data.regions,
  { message: "少なくとも1つの条件を指定する必要があります" }
);

// PlaceholderData用のスキーマ
export const PlaceholderDataSchema = z.record(z.string(), z.string());

// ============================================================================
// エンティティのスキーマ
// ============================================================================

// User関連
export const UserCreateSchema = z.object({
  line_user_id: LineUserIDSchema,
  display_name: z.string().min(1).max(100),
  avatar_url: URLSchema.optional(),
  role: UserRoleSchema.default('member'),
});

export const UserUpdateSchema = UserCreateSchema.partial();

// LineAccount関連
export const LineAccountCreateSchema = z.object({
  user_id: UserIDSchema,
  channel_id: LineChannelIDSchema,
  channel_secret: z.string().min(1).max(100),
  channel_access_token: z.string().min(1),
  webhook_url: URLSchema.optional(),
  is_active: z.boolean().default(true),
});

export const LineAccountUpdateSchema = LineAccountCreateSchema.partial().omit({ user_id: true });

// RichMenu関連
export const RichMenuAreaSchema = z.object({
  bounds: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    width: z.number().int().min(1),
    height: z.number().int().min(1),
  }),
  action: z.object({
    type: z.string(),
    text: z.string().optional(),
    uri: URLSchema.optional(),
    data: z.string().optional(),
    displayText: z.string().optional(),
  }),
});

export const RichMenuCreateSchema = z.object({
  account_id: AccountIDSchema,
  name: z.string().min(1).max(100),
  size: RichMenuSizeSchema.default('full'),
  chat_bar_text: z.string().max(14).optional(),
  areas: z.array(RichMenuAreaSchema).default([]),
  image_url: URLSchema.optional(),
  is_default: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export const RichMenuUpdateSchema = RichMenuCreateSchema.partial().omit({ account_id: true });

// Campaign関連
export const CampaignCreateSchema = z.object({
  account_id: AccountIDSchema,
  name: z.string().min(1).max(100),
  type: CampaignTypeSchema,
  content: z.array(MessageContentSchema).min(1),
  template_id: TemplateIDSchema.optional(),
  segment_id: SegmentIDSchema.optional(),
  placeholder_data: PlaceholderDataSchema.optional(),
  scheduled_at: z.string().datetime().optional(),
});

export const CampaignUpdateSchema = CampaignCreateSchema.partial().omit({ account_id: true });

// MessageTemplate関連  
export const MessageTemplateCreateSchema = z.object({
  account_id: AccountIDSchema,
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1).max(100).default('other'),
  content: z.array(MessageContentSchema).min(1),
  placeholders: z.array(z.string()).default([]),
});

export const MessageTemplateUpdateSchema = MessageTemplateCreateSchema.partial().omit({ account_id: true });

// TargetSegment関連
export const TargetSegmentCreateSchema = z.object({
  account_id: AccountIDSchema,
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  criteria: SegmentCriteriaSchema,
});

export const TargetSegmentUpdateSchema = TargetSegmentCreateSchema.partial().omit({ account_id: true });

// ============================================================================
// API Request/Response スキーマ
// ============================================================================

// Server Actions用のスキーマ
export const CreateRichMenuActionSchema = z.object({
  accountId: AccountIDSchema,
  name: z.string().min(1),
  size: RichMenuSizeSchema.optional(),
  chatBarText: z.string().max(14).optional(),
  areas: z.string().optional(), // JSON string
});

export const CreateCampaignActionSchema = z.object({
  accountId: AccountIDSchema,
  name: z.string().min(1),
  type: CampaignTypeSchema,
  templateId: TemplateIDSchema.optional(),
  segmentId: SegmentIDSchema.optional(),
  scheduledAt: z.string().datetime().optional(),
  content: z.string().optional(), // JSON string
});

// API Response用の共通スキーマ
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

// ============================================================================
// 型推論ヘルパー
// ============================================================================
export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type LineAccountCreateInput = z.infer<typeof LineAccountCreateSchema>;
export type LineAccountUpdateInput = z.infer<typeof LineAccountUpdateSchema>;
export type RichMenuCreateInput = z.infer<typeof RichMenuCreateSchema>;
export type RichMenuUpdateInput = z.infer<typeof RichMenuUpdateSchema>;
export type CampaignCreateInput = z.infer<typeof CampaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof CampaignUpdateSchema>;
export type MessageTemplateCreateInput = z.infer<typeof MessageTemplateCreateSchema>;
export type MessageTemplateUpdateInput = z.infer<typeof MessageTemplateUpdateSchema>;
export type TargetSegmentCreateInput = z.infer<typeof TargetSegmentCreateSchema>;
export type TargetSegmentUpdateInput = z.infer<typeof TargetSegmentUpdateSchema>;

export type CreateRichMenuActionInput = z.infer<typeof CreateRichMenuActionSchema>;
export type CreateCampaignActionInput = z.infer<typeof CreateCampaignActionSchema>;

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};