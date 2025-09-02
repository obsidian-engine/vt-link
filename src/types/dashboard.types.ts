/**
 * ダッシュボード共通型定義
 * @description 各ページで使用される共通のデータ型を定義
 */

// 基本的なエンティティID型
export type EntityId = string;

// ページネーション型
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// API レスポンス型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

// 統計情報カード型
export interface StatsCard {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

// 日時関連の型
export type DateString = string;
export type TimestampString = string;

// セグメント関連
export interface TargetSegment {
  id: EntityId;
  name: string;
  description?: string;
  type: 'demographic' | 'behavior' | 'custom';
  criteria: SegmentCriteria;
  estimatedCount?: number;
  usageCount?: number;
  createdAt: DateString;
  updatedAt: DateString;
}

export interface SegmentCriteria {
  ageRange?: {
    min: number;
    max: number;
  };
  genders?: Array<'male' | 'female' | 'unknown'>;
  regions?: string[];
  tags?: string[];
  customConditions?: Record<string, unknown>;
}

// テンプレート関連
export interface MessageTemplate {
  id: EntityId;
  name: string;
  contentType: 'text' | 'image' | 'carousel' | 'button' | 'flex';
  category: string;
  content: TemplateContent;
  placeholders?: string[];
  usageCount?: number;
  description?: string;
  createdAt: DateString;
  updatedAt: DateString;
}

export type TemplateContent = 
  | TextContent
  | ImageContent
  | CarouselContent
  | ButtonContent
  | FlexContent;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  originalContentUrl: string;
  previewImageUrl?: string;
}

export interface CarouselContent {
  type: 'carousel';
  columns: CarouselColumn[];
}

export interface CarouselColumn {
  title?: string;
  text?: string;
  imageUrl?: string;
  actions?: TemplateAction[];
}

export interface ButtonContent {
  type: 'button';
  text: string;
  actions: TemplateAction[];
}

export interface FlexContent {
  type: 'flex';
  altText: string;
  contents: Record<string, unknown>; // LINE Flex Message format
}

export interface TemplateAction {
  type: 'message' | 'uri' | 'postback';
  label: string;
  data?: string;
  uri?: string;
  text?: string;
}

// 履歴・配信関連
export interface DeliveryHistory {
  id: EntityId;
  type: 'broadcast' | 'narrowcast' | 'reply';
  name?: string;
  status: 'sending' | 'sent' | 'failed' | 'cancelled';
  sentCount?: number;
  failedCount?: number;
  totalCount?: number;
  sentAt?: DateString;
  createdAt: DateString;
  template?: {
    id: EntityId;
    name: string;
  };
  segment?: {
    id: EntityId;
    name: string;
  };
}

// フォームの汎用型
export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormFieldBase {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
}

export interface SelectField extends FormFieldBase {
  type: 'select';
  options: FormSelectOption[];
  multiple?: boolean;
}

export interface TextFieldBase extends FormFieldBase {
  type: 'text' | 'textarea' | 'email' | 'url' | 'tel';
  maxLength?: number;
  minLength?: number;
}

export interface NumberField extends FormFieldBase {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface CheckboxField extends FormFieldBase {
  type: 'checkbox';
  defaultChecked?: boolean;
}

export type FormField = SelectField | TextFieldBase | NumberField | CheckboxField;

// エラー・成功メッセージ型
export interface NotificationMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}