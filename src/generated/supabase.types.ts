// Supabase 自動生成型定義（スタブ）
// 実際の型定義は `npm run types:generate` で生成されます

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          line_user_id: string;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          line_user_id: string;
          display_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          line_user_id?: string;
          display_name?: string;
          updated_at?: string;
        };
      };
      line_users: {
        Row: {
          id: string;
          account_id: string;
          line_user_id: string;
          display_name: string;
          picture_url: string | null;
          status_message: string | null;
          language: string | null;
          gender: string | null;
          age: number | null;
          region: string | null;
          is_friend: boolean;
          blocked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          line_user_id: string;
          display_name: string;
          picture_url?: string | null;
          status_message?: string | null;
          language?: string | null;
          gender?: string | null;
          age?: number | null;
          region?: string | null;
          is_friend?: boolean;
          blocked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          line_user_id?: string;
          display_name?: string;
          picture_url?: string | null;
          status_message?: string | null;
          language?: string | null;
          gender?: string | null;
          age?: number | null;
          region?: string | null;
          is_friend?: boolean;
          blocked_at?: string | null;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          description: string | null;
          status: "draft" | "active" | "paused" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          name: string;
          description?: string | null;
          status?: "draft" | "active" | "paused" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          name?: string;
          description?: string | null;
          status?: "draft" | "active" | "paused" | "completed";
          updated_at?: string;
        };
      };
      rich_menus: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          size: "full" | "half";
          chat_bar_text: string | null;
          line_rich_menu_id: string | null;
          areas: any; // JSON
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          name: string;
          size: "full" | "half";
          chat_bar_text?: string | null;
          line_rich_menu_id?: string | null;
          areas?: any; // JSON
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          name?: string;
          size?: "full" | "half";
          chat_bar_text?: string | null;
          line_rich_menu_id?: string | null;
          areas?: any; // JSON
          is_published?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
