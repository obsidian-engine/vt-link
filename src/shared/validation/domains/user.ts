/**
 * ユーザードメイン専用Zodスキーマ
 */
import { z } from 'zod';
import {
  IdSchemaBase,
  LineUserIdSchemaBase,
  NameSchemaBase,
  UrlSchemaBase,
  CreateEntitySchemaBase,
  UpdateEntitySchemaBase,
  createEnumSchema
} from '../base';

// ============================================================================
// ユーザー関連Enum
// ============================================================================
export const UserRoleSchema = createEnumSchema(['admin', 'member', 'viewer'] as const);

// ============================================================================
// ユーザーID関連
// ============================================================================
export const UserIdSchema = IdSchemaBase;
export const LineUserIdSchema = LineUserIdSchemaBase;

// ============================================================================
// ユーザー属性スキーマ
// ============================================================================
export const DisplayNameSchema = NameSchemaBase;
export const AvatarUrlSchema = UrlSchemaBase.optional();

// ============================================================================
// ユーザーエンティティスキーマ
// ============================================================================
const UserFieldsSchema = {
  id: UserIdSchema,
  line_user_id: LineUserIdSchema,
  display_name: DisplayNameSchema,
  avatar_url: AvatarUrlSchema,
  role: UserRoleSchema.default('member'),
} as const;

export const UserSchema = CreateEntitySchemaBase(UserFieldsSchema);
export const CreateUserSchema = z.object({
  line_user_id: LineUserIdSchema,
  display_name: DisplayNameSchema,
  avatar_url: AvatarUrlSchema,
  role: UserRoleSchema.default('member'),
});

export const UpdateUserSchema = UpdateEntitySchemaBase({
  display_name: DisplayNameSchema,
  avatar_url: AvatarUrlSchema,
  role: UserRoleSchema,
});

// ============================================================================
// 型推論
// ============================================================================
export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;