// Supabase生成型のカスタマイズ
export interface GeneratedDatabase {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
    Enums: Record<string, any>;
    CompositeTypes: Record<string, any>;
  };
}
import type { MergeDeep } from 'type-fest';
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
  DeliveryLogID
} from '@/domain/valueObjects/BaseTypes';

// Generated型の上書き設定
type DatabaseOverrides = {
  public: {
    Tables: {
      users: {
        Row: {
          id: UserID;
          line_user_id: LineUserID;
        };
        Insert: {
          id?: UserID;
          line_user_id: LineUserID;
        };
        Update: {
          id?: UserID;
          line_user_id?: LineUserID;
        };
      };
      line_accounts: {
        Row: {
          id: AccountID;
          user_id: UserID;
          channel_id: LineChannelID;
        };
        Insert: {
          id?: AccountID;
          user_id: UserID;
          channel_id: LineChannelID;
        };
        Update: {
          id?: AccountID;
          user_id?: UserID;
          channel_id?: LineChannelID;
        };
      };
      rich_menus: {
        Row: {
          id: RichMenuID;
          account_id: AccountID;
          line_rich_menu_id: LineRichMenuID | null;
        };
        Insert: {
          id?: RichMenuID;
          account_id: AccountID;
          line_rich_menu_id?: LineRichMenuID | null;
        };
        Update: {
          id?: RichMenuID;
          account_id?: AccountID;
          line_rich_menu_id?: LineRichMenuID | null;
        };
      };
      campaigns: {
        Row: {
          id: CampaignID;
          account_id: AccountID;
        };
        Insert: {
          id?: CampaignID;
          account_id: AccountID;
        };
        Update: {
          id?: CampaignID;
          account_id?: AccountID;
        };
      };
      message_templates: {
        Row: {
          id: TemplateID;
          account_id: AccountID;
        };
        Insert: {
          id?: TemplateID;
          account_id: AccountID;
        };
        Update: {
          id?: TemplateID;
          account_id?: AccountID;
        };
      };
      target_segments: {
        Row: {
          id: SegmentID;
          account_id: AccountID;
        };
        Insert: {
          id?: SegmentID;
          account_id: AccountID;
        };
        Update: {
          id?: SegmentID;
          account_id?: AccountID;
        };
      };
    };
  };
};

// 型安全なDatabase型をエクスポート
export type Database = MergeDeep<GeneratedDatabase, DatabaseOverrides>;

// よく使う型のエイリアス
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type LineAccountRow = Database['public']['Tables']['line_accounts']['Row'];
export type LineAccountInsert = Database['public']['Tables']['line_accounts']['Insert'];
export type LineAccountUpdate = Database['public']['Tables']['line_accounts']['Update'];

export type RichMenuRow = Database['public']['Tables']['rich_menus']['Row'];
export type RichMenuInsert = Database['public']['Tables']['rich_menus']['Insert'];
export type RichMenuUpdate = Database['public']['Tables']['rich_menus']['Update'];

export type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update'];
