# VT-Link

VTuber向けLINE公式アカウント統合管理プラットフォーム

## 🚀 Quick Start

### 前提条件

- Node.js 20+
- pnpm 9+

### セットアップ

```bash
# 依存関係のインストール
corepack enable
pnpm i -w

# 型生成（スキーマ→OpenAPI→TypeScript型）
pnpm gen
```

## 📁 プロジェクト構成

```
├── apps/
│   ├── frontend/          # Next.js 15 フロントエンド
│   └── backend/           # Go API サーバー
├── packages/
│   ├── schema-zod/        # Zodスキーマ定義（単一ソース）
│   └── api-client/        # 型安全APIクライアント
└── infra/                 # インフラ設定
```

## 🛠 開発コマンド

### 型生成・品質チェック

```bash
# 型生成（Zod → OpenAPI → TypeScript）
pnpm gen

# OpenAPIスキーマリント
pnpm spectral

# 型生成差分チェック（CI用）
pnpm check-types-diff
```

### モック開発

```bash
# Prismモックサーバー起動（推奨：バックエンド未完成時）
pnpm mock

# フロントエンド開発サーバー
pnpm -C apps/frontend dev
```

### 本格開発

```bash
# 全サービス並列起動
pnpm dev

# ビルド
pnpm build
```

## 🎯 フロントエンド先行開発

v2_0.md仕様に従った最短3ステップ：

### 1. 環境準備

```bash
pnpm gen                    # 型生成
pnpm mock                   # モック起動（別ターミナル）
```

### 2. モック接続

`apps/frontend/.env.development` でモック切り替え：

```env
# モック使用（推奨）
NEXT_PUBLIC_API_BASE=http://localhost:4010

# 実API使用
# NEXT_PUBLIC_API_BASE=http://localhost:8080
```

### 3. 開発・品質確認

```bash
pnpm -C apps/frontend dev   # 開発サーバー
pnpm spectral               # スキーマリント
pnpm check-types-diff       # 型差分確認
```

## 🔧 技術スタック

### フロントエンド

- **Next.js 15** (App Router)
- **SWR** (データフェッチング)
- **openapi-fetch** (型安全API通信)
- **react-hook-form + zod** (フォーム)
- **Zustand** (状態管理)
- **Tailwind CSS** (スタイリング)

### バックエンド

- **Go** + **Echo**
- **PostgreSQL** (Neon/Supabase)
- **Vercel Functions**

### 品質・ツール

- **Spectral** (OpenAPIリント)
- **TypeScript** (型安全)
- **Zod** (スキーマ駆動)

## 🚀 デプロイ

- **Frontend**: Vercel
- **Backend**: Vercel Functions
- **Database**: Neon/Supabase Free
- **Cron**: Cloudflare Workers

## 📋 品質ゲート

- ✅ Spectral OpenAPIリント
- ✅ 型生成差分チェック
- ✅ TypeScript型チェック
- ✅ ESLint/Prettier