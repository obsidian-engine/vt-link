/**
 * Supabase Database Types
 * 手動生成版 - マイグレーションファイルから生成
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Common types
export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type RegionCode =
  | 'hokkaido'
  | 'tohoku'
  | 'kanto'
  | 'chubu'
  | 'kansai'
  | 'chugoku'
  | 'shikoku'
  | 'kyushu'
  | 'okinawa'
  | 'unknown';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          line_user_id: string;
          display_name: string;
          picture_url: string | null;
          status_message: string | null;
          language: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          line_user_id: string;
          display_name: string;
          picture_url?: string | null;
          status_message?: string | null;
          language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          line_user_id?: string;
          display_name?: string;
          picture_url?: string | null;
          status_message?: string | null;
          language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      line_accounts: {
        Row: {
          id: string;
          user_id: string;
          channel_id: string;
          channel_secret: string;
          channel_access_token: string;
          channel_name: string;
          channel_description: string | null;
          webhook_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          channel_id: string;
          channel_secret: string;
          channel_access_token: string;
          channel_name: string;
          channel_description?: string | null;
          webhook_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          channel_id?: string;
          channel_secret?: string;
          channel_access_token?: string;
          channel_name?: string;
          channel_description?: string | null;
          webhook_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          description: string | null;
          type: 'broadcast' | 'multicast' | 'narrowcast';
          status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
          scheduled_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          message_template: Json;
          target_segment_id: string | null;
          target_users: string[];
          delivery_settings: Json;
          metrics: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          name: string;
          description?: string | null;
          type?: 'broadcast' | 'multicast' | 'narrowcast';
          status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          message_template?: Json;
          target_segment_id?: string | null;
          target_users?: string[];
          delivery_settings?: Json;
          metrics?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          name?: string;
          description?: string | null;
          type?: 'broadcast' | 'multicast' | 'narrowcast';
          status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          message_template?: Json;
          target_segment_id?: string | null;
          target_users?: string[];
          delivery_settings?: Json;
          metrics?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      target_segments: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          description: string | null;
          conditions: Json;
          user_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          name: string;
          description?: string | null;
          conditions?: Json;
          user_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          name?: string;
          description?: string | null;
          conditions?: Json;
          user_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      delivery_batches: {
        Row: {
          id: string;
          campaign_id: string;
          batch_number: number;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          user_ids: string[];
          scheduled_at: string;
          started_at: string | null;
          completed_at: string | null;
          sent_count: number;
          failed_count: number;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          batch_number: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          user_ids?: string[];
          scheduled_at: string;
          started_at?: string | null;
          completed_at?: string | null;
          sent_count?: number;
          failed_count?: number;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          batch_number?: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          user_ids?: string[];
          scheduled_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          sent_count?: number;
          failed_count?: number;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      delivery_logs: {
        Row: {
          id: string;
          batch_id: string;
          campaign_id: string;
          line_user_id: string;
          status: 'sent' | 'failed';
          error_code: string | null;
          error_message: string | null;
          line_response: Json | null;
          delivered_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          campaign_id: string;
          line_user_id: string;
          status: 'sent' | 'failed';
          error_code?: string | null;
          error_message?: string | null;
          line_response?: Json | null;
          delivered_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          campaign_id?: string;
          line_user_id?: string;
          status?: 'sent' | 'failed';
          error_code?: string | null;
          error_message?: string | null;
          line_response?: Json | null;
          delivered_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      campaign_type: 'broadcast' | 'multicast' | 'narrowcast';
      campaign_status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
      batch_status: 'pending' | 'processing' | 'completed' | 'failed';
      delivery_status: 'sent' | 'failed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Convenience exports
export type User = Tables<'users'>;
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;

export type LineAccount = Tables<'line_accounts'>;
export type LineAccountInsert = TablesInsert<'line_accounts'>;
export type LineAccountUpdate = TablesUpdate<'line_accounts'>;

export type Campaign = Tables<'campaigns'>;
export type CampaignInsert = TablesInsert<'campaigns'>;
export type CampaignUpdate = TablesUpdate<'campaigns'>;

export type TargetSegment = Tables<'target_segments'>;
export type TargetSegmentInsert = TablesInsert<'target_segments'>;
export type TargetSegmentUpdate = TablesUpdate<'target_segments'>;

export type DeliveryBatch = Tables<'delivery_batches'>;
export type DeliveryBatchInsert = TablesInsert<'delivery_batches'>;
export type DeliveryBatchUpdate = TablesUpdate<'delivery_batches'>;

export type DeliveryLog = Tables<'delivery_logs'>;
export type DeliveryLogInsert = TablesInsert<'delivery_logs'>;
export type DeliveryLogUpdate = TablesUpdate<'delivery_logs'>;

// Enum types
export type CampaignType = Enums<'campaign_type'>;
export type CampaignStatus = Enums<'campaign_status'>;
export type BatchStatus = Enums<'batch_status'>;
export type DeliveryStatus = Enums<'delivery_status'>;
