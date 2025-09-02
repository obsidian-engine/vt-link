import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          line_user_id: string;
          display_name: string;
          avatar_url: string | null;
          role: 'admin' | 'member' | 'viewer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          line_user_id: string;
          display_name: string;
          avatar_url?: string | null;
          role?: 'admin' | 'member' | 'viewer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          line_user_id?: string;
          display_name?: string;
          avatar_url?: string | null;
          role?: 'admin' | 'member' | 'viewer';
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
          webhook_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      rich_menus: {
        Row: {
          id: string;
          account_id: string;
          line_rich_menu_id: string | null;
          name: string;
          size: 'full' | 'half';
          chat_bar_text: string | null;
          areas: unknown;
          image_url: string | null;
          is_default: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          line_rich_menu_id?: string | null;
          name: string;
          size?: 'full' | 'half';
          chat_bar_text?: string | null;
          areas?: unknown;
          image_url?: string | null;
          is_default?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          line_rich_menu_id?: string | null;
          name?: string;
          size?: 'full' | 'half';
          chat_bar_text?: string | null;
          areas?: unknown;
          image_url?: string | null;
          is_default?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
