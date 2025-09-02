/**
 * 基本的なZodスキーマパーツ
 * 他のスキーマから組み合わせて使用
 */
import { z } from 'zod';

// ============================================================================
// プリミティブ型のスキーマ
// ============================================================================
export const IdSchemaBase = z.string().uuid();
export const LineUserIdSchemaBase = z.string().min(1).max(33);
export const LineChannelIdSchemaBase = z.string().regex(/^\d+$/);
export const EmailSchemaBase = z.string().email();
export const UrlSchemaBase = z.string().url();
export const PhoneSchemaBase = z.string().regex(/^\+?[1-9]\d{1,14}$/);

// ============================================================================
// 共通バリデーションルール
// ============================================================================
export const NameSchemaBase = z.string().min(1).max(100);
export const DescriptionSchemaBase = z.string().max(1000).optional();
export const TimestampSchemaBase = z.string().datetime();

// ============================================================================
// 範囲バリデーション
// ============================================================================
export const PositiveIntSchemaBase = z.number().int().positive();
export const NonNegativeIntSchemaBase = z.number().int().nonnegative();
export const PercentageSchemaBase = z.number().min(0).max(100);

// ============================================================================
// テキスト制約
// ============================================================================
export const ShortTextSchemaBase = z.string().min(1).max(100);
export const MediumTextSchemaBase = z.string().min(1).max(255);
export const LongTextSchemaBase = z.string().min(1).max(5000);

// ============================================================================
// 配列制約
// ============================================================================
export const NonEmptyArraySchemaBase = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.array(itemSchema).nonempty();

export const LimitedArraySchemaBase = <T extends z.ZodTypeAny>(
  itemSchema: T,
  maxLength: number
) => z.array(itemSchema).max(maxLength);

// ============================================================================
// 日時関連
// ============================================================================
export const FutureDateSchemaBase = z.string().datetime().refine(
  (date) => new Date(date) > new Date(),
  { message: "Date must be in the future" }
);

export const PastDateSchemaBase = z.string().datetime().refine(
  (date) => new Date(date) < new Date(),
  { message: "Date must be in the past" }
);

// ============================================================================
// ファイル関連
// ============================================================================
export const ImageUrlSchemaBase = UrlSchemaBase.refine(
  (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  },
  { message: "URL must point to an image file" }
);

// ============================================================================
// 条件付きバリデーション
// ============================================================================
export const RequiredWhenSchemaBase = <T extends z.ZodTypeAny>(
  schema: T,
  condition: (data: any) => boolean,
  message?: string
) => z.union([
  schema,
  z.undefined()
]).refine(
  (value) => !condition || value !== undefined,
  { message: message || "Field is required" }
);

// ============================================================================
// 複合バリデーション
// ============================================================================
export const CreateEntitySchemaBase = <T extends z.ZodRawShape>(fields: T) =>
  z.object({
    ...fields,
    created_at: TimestampSchemaBase.optional(),
    updated_at: TimestampSchemaBase.optional(),
  });

export const UpdateEntitySchemaBase = <T extends z.ZodRawShape>(fields: T) =>
  z.object({
    ...fields,
    updated_at: TimestampSchemaBase.optional(),
  }).partial();

// ============================================================================
// API応答スキーマベース
// ============================================================================
export const ApiResponseSchemaBase = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    timestamp: TimestampSchemaBase,
  });

export const PaginatedResponseSchemaBase = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: NonNegativeIntSchemaBase,
    page: PositiveIntSchemaBase,
    pageSize: PositiveIntSchemaBase,
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  });

// ============================================================================
// カスタムバリデーション関数
// ============================================================================
export const createEnumSchema = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values);

export const createConditionalSchema = <T extends z.ZodTypeAny, U extends z.ZodTypeAny>(
  condition: z.ZodTypeAny,
  trueSchema: T,
  falseSchema: U
) => z.union([
  z.object({ condition: z.literal(true), value: trueSchema }),
  z.object({ condition: z.literal(false), value: falseSchema })
]);

// ============================================================================
// バリデーションヘルパー
// ============================================================================
export const safeParseWithDefault = <T extends z.ZodTypeAny>(
  schema: T,
  defaultValue: z.infer<T>
) => (input: unknown): z.infer<T> => {
  const result = schema.safeParse(input);
  return result.success ? result.data : defaultValue;
};

export const createValidator = <T extends z.ZodTypeAny>(schema: T) => ({
  parse: (input: unknown): z.infer<T> => schema.parse(input),
  safeParse: (input: unknown) => schema.safeParse(input),
  is: (input: unknown): input is z.infer<T> => schema.safeParse(input).success,
  assert: (input: unknown, message?: string): asserts input is z.infer<T> => {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new Error(message || `Validation failed: ${result.error.message}`);
    }
  }
});