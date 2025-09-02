#!/usr/bin/env node

/**
 * Supabaseデータベース型生成スクリプト
 * Supabase CLIを使用してTypeScript型定義を自動生成
 */

import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const CONFIG = {
  outputPath: 'src/generated/supabase.types.ts',
  projectRef: process.env.SUPABASE_PROJECT_REF,
  dbUrl: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
};

async function generateTypes() {
  console.log('🏗️  Supabaseデータベース型を生成中...');

  try {
    // ディレクトリが存在しない場合は作成
    const outputDir = path.dirname(CONFIG.outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    let command;
    if (process.env.NODE_ENV === 'production' && CONFIG.projectRef) {
      // 本番環境: Supabaseプロジェクトから型生成
      command = `npx supabase gen types typescript --project-id ${CONFIG.projectRef}`;
    } else if (CONFIG.dbUrl) {
      // 開発環境: ローカルDBから型生成
      command = `npx supabase gen types typescript --db-url "${CONFIG.dbUrl}"`;
    } else {
      // ローカル開発環境
      command = 'npx supabase gen types typescript --local';
    }

    console.log(`実行コマンド: ${command}`);

    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('warning')) {
      console.warn('⚠️  警告:', stderr);
    }

    // 生成された型定義をファイルに書き込み
    await fs.writeFile(CONFIG.outputPath, stdout, 'utf8');

    console.log('✅ Supabaseデータベース型の生成が完了しました');
    console.log(`📁 出力ファイル: ${CONFIG.outputPath}`);

    // 型定義のカスタマイズファイルも生成
    await generateCustomTypes();
  } catch (error) {
    console.error('❌ 型生成に失敗しました:', error.message);

    if (error.message.includes('supabase')) {
      console.log('💡 ヒント: Supabase CLIがインストールされていない可能性があります');
      console.log('   インストール: npm install -g supabase');
    }

    process.exit(1);
  }
}

async function generateCustomTypes() {
  const customTypesContent = `// Supabase生成型のカスタマイズ
import type { Database as GeneratedDatabase } from './supabase.types';
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
`;

  const customTypesPath = 'src/generated/database.types.ts';
  await fs.writeFile(customTypesPath, customTypesContent, 'utf8');

  console.log(`📁 カスタム型定義: ${customTypesPath}`);
}

// スクリプト直接実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTypes().catch(console.error);
}

export { generateTypes };
