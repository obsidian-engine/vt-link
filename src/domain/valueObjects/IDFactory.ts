import { z } from "zod";
import type {
  UserID,
  AccountID,
  LineChannelID,
  LineUserID,
  CampaignID,
  TemplateID,
  SegmentID,
  RichMenuID,
  LineRichMenuID,
  AutoReplyRuleID,
  BatchID,
  DeliveryLogID,
  EmailAddress,
  PhoneNumber,
  URL,
} from "./BaseTypes";

/**
 * Zodスキーマ定義
 */
const uuidSchema = z.string().uuid();
const lineUserIdSchema = z.string().min(1).max(33); // LINE User IDの仕様に合わせる
const lineChannelIdSchema = z.string().regex(/^\d+$/); // 数字のみ
const lineRichMenuIdSchema = z.string().min(1);
const emailSchema = z.string().email();
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/); // E.164準拠
const urlSchema = z.string().url();

/**
 * ID型のファクトリ関数群
 * ランタイム検証 + 型安全性を同時に提供
 */
export class IDFactory {
  static createUserID(value: unknown): UserID {
    return uuidSchema.parse(value) as UserID;
  }

  static createAccountID(value: unknown): AccountID {
    return uuidSchema.parse(value) as AccountID;
  }

  static createLineChannelID(value: unknown): LineChannelID {
    return lineChannelIdSchema.parse(value) as LineChannelID;
  }

  static createLineUserID(value: unknown): LineUserID {
    return lineUserIdSchema.parse(value) as LineUserID;
  }

  static createCampaignID(value: unknown): CampaignID {
    return uuidSchema.parse(value) as CampaignID;
  }

  static createTemplateID(value: unknown): TemplateID {
    return uuidSchema.parse(value) as TemplateID;
  }

  static createSegmentID(value: unknown): SegmentID {
    return uuidSchema.parse(value) as SegmentID;
  }

  static createRichMenuID(value: unknown): RichMenuID {
    return uuidSchema.parse(value) as RichMenuID;
  }

  static createLineRichMenuID(value: unknown): LineRichMenuID {
    return lineRichMenuIdSchema.parse(value) as LineRichMenuID;
  }

  static createAutoReplyRuleID(value: unknown): AutoReplyRuleID {
    return uuidSchema.parse(value) as AutoReplyRuleID;
  }

  static createBatchID(value: unknown): BatchID {
    return uuidSchema.parse(value) as BatchID;
  }

  static createDeliveryLogID(value: unknown): DeliveryLogID {
    return uuidSchema.parse(value) as DeliveryLogID;
  }

  static createEmailAddress(value: unknown): EmailAddress {
    return emailSchema.parse(value) as EmailAddress;
  }

  static createPhoneNumber(value: unknown): PhoneNumber {
    return phoneSchema.parse(value) as PhoneNumber;
  }

  static createURL(value: unknown): URL {
    return urlSchema.parse(value) as URL;
  }

  /**
   * 新しいUUID生成
   */
  static generateUserID(): UserID {
    return crypto.randomUUID() as UserID;
  }

  static generateAccountID(): AccountID {
    return crypto.randomUUID() as AccountID;
  }

  static generateCampaignID(): CampaignID {
    return crypto.randomUUID() as CampaignID;
  }

  static generateTemplateID(): TemplateID {
    return crypto.randomUUID() as TemplateID;
  }

  static generateSegmentID(): SegmentID {
    return crypto.randomUUID() as SegmentID;
  }

  static generateRichMenuID(): RichMenuID {
    return crypto.randomUUID() as RichMenuID;
  }

  static generateAutoReplyRuleID(): AutoReplyRuleID {
    return crypto.randomUUID() as AutoReplyRuleID;
  }

  static generateBatchID(): BatchID {
    return crypto.randomUUID() as BatchID;
  }

  static generateDeliveryLogID(): DeliveryLogID {
    return crypto.randomUUID() as DeliveryLogID;
  }
}

/**
 * 型安全な型チェック関数群
 */
export const TypeGuards = {
  isUserID: (value: unknown): value is UserID => {
    try {
      IDFactory.createUserID(value);
      return true;
    } catch {
      return false;
    }
  },

  isAccountID: (value: unknown): value is AccountID => {
    try {
      IDFactory.createAccountID(value);
      return true;
    } catch {
      return false;
    }
  },

  isLineUserID: (value: unknown): value is LineUserID => {
    try {
      IDFactory.createLineUserID(value);
      return true;
    } catch {
      return false;
    }
  },

  isLineChannelID: (value: unknown): value is LineChannelID => {
    try {
      IDFactory.createLineChannelID(value);
      return true;
    } catch {
      return false;
    }
  },

  isEmailAddress: (value: unknown): value is EmailAddress => {
    try {
      IDFactory.createEmailAddress(value);
      return true;
    } catch {
      return false;
    }
  },

  isURL: (value: unknown): value is URL => {
    try {
      IDFactory.createURL(value);
      return true;
    } catch {
      return false;
    }
  },
};
