# VT-Link Manager

VTuber向けLINE公式アカウント管理プラットフォーム

## 🏗️ プロジェクト構成

```
vt-link/
├── apps/
│   ├── web/          # Next.js Webアプリケーション
│   └── api/          # NestJS APIサーバー
├── packages/
│   ├── database/     # Prisma Database Schema
│   └── core/         # 共通型定義
├── docs/            # ドキュメント
└── docker/          # Docker設定
```

## 🚀 クイックスタート

### 前提条件

- Node.js 22.13.1
- pnpm 9.15.4
- Docker & Docker Compose

### セットアップ

1. 依存関係のインストール
```bash
pnpm install
```

2. 環境変数の設定
```bash
# APIサーバー
cp apps/api/.env.local.example apps/api/.env.local

# Webアプリ  
cp apps/web/.env.local.example apps/web/.env.local
```

3. データベースの起動
```bash
docker compose up -d
```

4. データベースのセットアップ
```bash
pnpm --filter @vt-link/database db:push
```

5. 開発サーバーの起動
```bash
pnpm dev
```

## 📱 アクセス

- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# コード品質チェック
pnpm check

# 型チェック
pnpm tsc

# テスト実行
pnpm test
```

## 📊 主要機能

- ✅ VTuberプロフィール管理
- ✅ LINE公式アカウント連携
- ✅ ファン管理システム
- ✅ メッセージ配信機能
- ✅ 配信スケジューリング

## 🔧 技術スタック

### フロントエンド
- **Next.js 15** - React フレームワーク
- **TypeScript** - 型安全
- **Tailwind CSS** - スタイリング
- **tRPC** - 型安全API通信

### バックエンド
- **NestJS** - Node.js フレームワーク
- **Prisma** - データベースORM
- **PostgreSQL** - メインデータベース
- **Redis** - キャッシュ・セッション

### 開発ツール
- **Turborepo** - モノレポ管理
- **Biome** - Linter/Formatter
- **Lefthook** - Git Hooks
- **Docker** - コンテナ化

## 📖 詳細ドキュメント

- [セットアップガイド](./docs/SETUP_GUIDE.md)
- [開発ガイド](./docs/DEVELOPMENT.md)
- [API仕様](http://localhost:3001/api)