/**
 * unique symbolを使用したBrand型パターン
 * モジュールを跨いでも型安全性を保証
 */
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// 基本的なID型定義
export type UserID = Brand<string, 'UserID'>;
export type AccountID = Brand<string, 'AccountID'>;
export type LineChannelID = Brand<string, 'LineChannelID'>;
export type LineUserID = Brand<string, 'LineUserID'>;
export type CampaignID = Brand<string, 'CampaignID'>;
export type TemplateID = Brand<string, 'TemplateID'>;
export type SegmentID = Brand<string, 'SegmentID'>;
export type RichMenuID = Brand<string, 'RichMenuID'>;
export type LineRichMenuID = Brand<string, 'LineRichMenuID'>;
export type AutoReplyRuleID = Brand<string, 'AutoReplyRuleID'>;
export type BatchID = Brand<string, 'BatchID'>;
export type DeliveryLogID = Brand<string, 'DeliveryLogID'>;

// より具体的な値型
export type EmailAddress = Brand<string, 'EmailAddress'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;
export type URL = Brand<string, 'URL'>;

/**
 * Brand型のユーティリティ関数
 */
export const createBrand = <T extends string>(value: string): Brand<string, T> => {
  return value as Brand<string, T>;
};

/**
 * Brand型の値を取得
 */
export const unwrapBrand = <T, B extends string>(branded: Brand<T, B>): T => {
  return branded as T;
};

/**
 * Brand型の型ガード
 */
export const isBrandedType = <T, B extends string>(
  value: unknown,
  validator: (v: unknown) => v is T
): value is Brand<T, B> => {
  return validator(value);
};
