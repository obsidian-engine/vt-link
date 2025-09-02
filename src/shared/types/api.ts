import type {
  AccountID,
  AutoReplyRuleID,
  BatchID,
  CampaignID,
  DeliveryLogID,
  EmailAddress,
  LineChannelID,
  LineRichMenuID,
  LineUserID,
  PhoneNumber,
  RichMenuID,
  SegmentID,
  TemplateID,
  URL,
  UserID,
} from '@/domain/valueObjects/BaseTypes';
/**
 * API関連の型定義
 * フロントエンド・バックエンド間で共有される型
 */
import type { z } from 'zod';

// ============================================================================
// 基本的なAPI応答型
// ============================================================================
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: ReadonlyArray<{
    readonly field: string;
    readonly message: string;
  }>;
}

// ============================================================================
// ユーザー関連DTO
// ============================================================================
export interface UserDto {
  readonly id: UserID;
  readonly lineUserId: LineUserID;
  readonly displayName: string;
  readonly avatarUrl?: URL;
  readonly role: 'admin' | 'member' | 'viewer';
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateUserRequest {
  readonly lineUserId: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly role?: 'admin' | 'member' | 'viewer';
}

export interface UpdateUserRequest {
  readonly displayName?: string;
  readonly avatarUrl?: string;
  readonly role?: 'admin' | 'member' | 'viewer';
}

// ============================================================================
// LINEアカウント関連DTO
// ============================================================================
export interface LineAccountDto {
  readonly id: AccountID;
  readonly userId: UserID;
  readonly channelId: LineChannelID;
  readonly channelSecret: string; // フロントエンドでは部分的にマスク
  readonly channelAccessToken: string; // フロントエンドでは部分的にマスク
  readonly webhookUrl?: URL;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateLineAccountRequest {
  readonly channelId: string;
  readonly channelSecret: string;
  readonly channelAccessToken: string;
  readonly webhookUrl?: string;
}

export interface UpdateLineAccountRequest {
  readonly channelSecret?: string;
  readonly channelAccessToken?: string;
  readonly webhookUrl?: string;
  readonly isActive?: boolean;
}

// ============================================================================
// リッチメニュー関連DTO
// ============================================================================
export interface RichMenuAreaDto {
  readonly bounds: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly action: {
    readonly type: string;
    readonly text?: string;
    readonly uri?: string;
    readonly data?: string;
    readonly displayText?: string;
  };
}

export interface RichMenuDto {
  readonly id: RichMenuID;
  readonly accountId: AccountID;
  readonly lineRichMenuId?: LineRichMenuID;
  readonly name: string;
  readonly size: 'full' | 'half';
  readonly chatBarText?: string;
  readonly areas: readonly RichMenuAreaDto[];
  readonly imageUrl?: URL;
  readonly isDefault: boolean;
  readonly isPublished: boolean;
  readonly canBePublished: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateRichMenuRequest {
  readonly accountId: string;
  readonly name: string;
  readonly size?: 'full' | 'half';
  readonly chatBarText?: string;
  readonly areas: readonly RichMenuAreaDto[];
}

export interface UpdateRichMenuRequest {
  readonly name?: string;
  readonly size?: 'full' | 'half';
  readonly chatBarText?: string;
  readonly areas?: readonly RichMenuAreaDto[];
}

// ============================================================================
// メッセージ関連DTO
// ============================================================================
export interface MessageContentDto {
  readonly type: 'text' | 'image' | 'sticker';
  readonly payload: {
    readonly text?: string;
    readonly originalContentUrl?: string;
    readonly previewImageUrl?: string;
    readonly packageId?: string;
    readonly stickerId?: string;
  };
}

export interface MessageTemplateDto {
  readonly id: TemplateID;
  readonly accountId: AccountID;
  readonly name: string;
  readonly description?: string;
  readonly category: string;
  readonly content: readonly MessageContentDto[];
  readonly placeholders: readonly string[];
  readonly usageCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateMessageTemplateRequest {
  readonly accountId: string;
  readonly name: string;
  readonly description?: string;
  readonly category: string;
  readonly content: readonly MessageContentDto[];
  readonly placeholders?: readonly string[];
}

export interface UpdateMessageTemplateRequest {
  readonly name?: string;
  readonly description?: string;
  readonly category?: string;
  readonly content?: readonly MessageContentDto[];
  readonly placeholders?: readonly string[];
}

// ============================================================================
// セグメント関連DTO
// ============================================================================
export interface SegmentCriteriaDto {
  readonly genders?: ReadonlyArray<'male' | 'female' | 'other' | 'unknown'>;
  readonly ageRange?: {
    readonly min: number;
    readonly max: number;
  };
  readonly regions?: readonly string[];
}

export interface TargetSegmentDto {
  readonly id: SegmentID;
  readonly accountId: AccountID;
  readonly name: string;
  readonly description?: string;
  readonly criteria: SegmentCriteriaDto;
  readonly estimatedCount: number;
  readonly usageCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateTargetSegmentRequest {
  readonly accountId: string;
  readonly name: string;
  readonly description?: string;
  readonly criteria: SegmentCriteriaDto;
}

export interface UpdateTargetSegmentRequest {
  readonly name?: string;
  readonly description?: string;
  readonly criteria?: SegmentCriteriaDto;
}

// ============================================================================
// キャンペーン関連DTO
// ============================================================================
export interface CampaignDto {
  readonly id: CampaignID;
  readonly accountId: AccountID;
  readonly name: string;
  readonly type: 'broadcast' | 'narrowcast';
  readonly status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  readonly content: readonly MessageContentDto[];
  readonly templateId?: TemplateID;
  readonly segmentId?: SegmentID;
  readonly scheduledAt?: string;
  readonly sentAt?: string;
  readonly sentCount: number;
  readonly errorMessage?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCampaignRequest {
  readonly accountId: string;
  readonly name: string;
  readonly type: 'broadcast' | 'narrowcast';
  readonly content?: readonly MessageContentDto[];
  readonly templateId?: string;
  readonly segmentId?: string;
  readonly scheduledAt?: string;
  readonly placeholderData?: Record<string, string>;
}

export interface UpdateCampaignRequest {
  readonly name?: string;
  readonly content?: readonly MessageContentDto[];
  readonly templateId?: string;
  readonly segmentId?: string;
  readonly scheduledAt?: string;
}

export interface SendCampaignRequest {
  readonly campaignId: string;
  readonly scheduledAt?: string;
}

// ============================================================================
// 自動返信関連DTO
// ============================================================================
export interface AutoReplyConditionDto {
  readonly type: 'text' | 'sticker' | 'image';
  readonly match: 'exact' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
  readonly value: string;
  readonly caseSensitive: boolean;
}

export interface AutoReplyResponseDto {
  readonly type: 'text' | 'sticker' | 'image';
  readonly content: MessageContentDto;
  readonly delay?: number;
}

export interface AutoReplyRuleDto {
  readonly id: AutoReplyRuleID;
  readonly accountId: AccountID;
  readonly name: string;
  readonly conditions: readonly AutoReplyConditionDto[];
  readonly responses: readonly AutoReplyResponseDto[];
  readonly enabled: boolean;
  readonly priority: number;
  readonly rateLimit?: {
    readonly maxCount: number;
    readonly windowMinutes: number;
  };
  readonly timeWindow?: {
    readonly startHour: number;
    readonly endHour: number;
    readonly daysOfWeek: readonly number[];
  };
  readonly replyCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateAutoReplyRuleRequest {
  readonly accountId: string;
  readonly name: string;
  readonly conditions: readonly AutoReplyConditionDto[];
  readonly responses: readonly AutoReplyResponseDto[];
  readonly enabled?: boolean;
  readonly priority?: number;
  readonly rateLimit?: {
    readonly maxCount: number;
    readonly windowMinutes: number;
  };
  readonly timeWindow?: {
    readonly startHour: number;
    readonly endHour: number;
    readonly daysOfWeek: readonly number[];
  };
}

export interface UpdateAutoReplyRuleRequest {
  readonly name?: string;
  readonly conditions?: readonly AutoReplyConditionDto[];
  readonly responses?: readonly AutoReplyResponseDto[];
  readonly enabled?: boolean;
  readonly priority?: number;
  readonly rateLimit?: {
    readonly maxCount: number;
    readonly windowMinutes: number;
  };
  readonly timeWindow?: {
    readonly startHour: number;
    readonly endHour: number;
    readonly daysOfWeek: readonly number[];
  };
}

// ============================================================================
// 配信ログ関連DTO
// ============================================================================
export interface DeliveryLogDto {
  readonly id: DeliveryLogID;
  readonly batchId: BatchID;
  readonly campaignId: CampaignID;
  readonly userId: LineUserID;
  readonly status: 'pending' | 'sent' | 'failed';
  readonly errorMessage?: string;
  readonly sentAt?: string;
  readonly deliveredAt?: string;
  readonly createdAt: string;
}

export interface DeliveryBatchDto {
  readonly id: BatchID;
  readonly campaignId: CampaignID;
  readonly accountId: AccountID;
  readonly targetUserIds: readonly LineUserID[];
  readonly status: 'pending' | 'processing' | 'completed' | 'failed';
  readonly totalCount: number;
  readonly sentCount: number;
  readonly failedCount: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly errorMessage?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ============================================================================
// 分析・統計関連DTO
// ============================================================================
export interface CampaignStatsDto {
  readonly campaignId: CampaignID;
  readonly totalSent: number;
  readonly totalDelivered: number;
  readonly totalFailed: number;
  readonly deliveryRate: number;
  readonly avgDeliveryTime: number;
  readonly createdAt: string;
}

export interface AccountStatsDto {
  readonly accountId: AccountID;
  readonly totalCampaigns: number;
  readonly totalSent: number;
  readonly totalAutoReplies: number;
  readonly activeRichMenus: number;
  readonly followerCount?: number;
  readonly lastActivity?: string;
  readonly period: string; // 'day' | 'week' | 'month' | 'year'
  readonly createdAt: string;
}

// ============================================================================
// Webhook関連DTO
// ============================================================================
export interface WebhookEventDto {
  readonly type: string;
  readonly timestamp: number;
  readonly source: {
    readonly type: 'user' | 'group' | 'room';
    readonly userId?: LineUserID;
    readonly groupId?: string;
    readonly roomId?: string;
  };
  readonly message?: {
    readonly id: string;
    readonly type: string;
    readonly text?: string;
  };
  readonly replyToken?: string;
  readonly postback?: {
    readonly data: string;
    readonly params?: Record<string, string>;
  };
}

// ============================================================================
// Server Actions用型定義
// ============================================================================
export interface ServerActionResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly validationErrors?: ReadonlyArray<{
    readonly path: ReadonlyArray<string | number>;
    readonly message: string;
  }>;
}

// ============================================================================
// 型ガード関数
// ============================================================================
export const isApiResponse = <T>(value: unknown): value is ApiResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as any).success === 'boolean'
  );
};

export const isPaginatedResponse = <T>(value: unknown): value is PaginatedResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    Array.isArray((value as any).items) &&
    'total' in value &&
    typeof (value as any).total === 'number'
  );
};

export const isServerActionResult = <T>(value: unknown): value is ServerActionResult<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as any).success === 'boolean'
  );
};

// ============================================================================
// 型変換ヘルパー
// ============================================================================
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: string
): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

export const createPaginatedResponse = <T>(
  items: readonly T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> => ({
  items,
  total,
  page,
  pageSize,
  hasNext: page * pageSize < total,
  hasPrev: page > 1,
});

export const createServerActionResult = <T>(
  success: boolean,
  data?: T,
  error?: string,
  validationErrors?: ReadonlyArray<{
    path: ReadonlyArray<string | number>;
    message: string;
  }>
): ServerActionResult<T> => ({
  success,
  data,
  error,
  validationErrors,
});
