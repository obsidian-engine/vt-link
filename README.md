# VT-Link Manager

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)

**VTuber向けLINE公式アカウント統合管理プラットフォーム**

ファン管理、メッセージ配信、イベント運営を効率化するオールインワンツールです。

## 📋 Table of Contents

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [Quick Start](#quick-start)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [データベース管理コマンド](#データベース管理コマンド)
- [利用可能なスクリプト](#利用可能なスクリプト)
- [デプロイ](#デプロイ)
- [必要なGitHub Secrets](#必要なgithub-secrets)
- [ディレクトリ構造](#ディレクトリ構造)
- [貢献](#貢献)
- [ライセンス](#ライセンス)

## 概要

Next.js + Supabase + TypeScript で構築されたVTuber向けのLINE公式アカウント管理ツールです。

## 概要

Next.js 15 + Supabase + TypeScript で構築されたVTuber向けのLINE公式アカウント管理ツールです。

## 主な機能

- 📱 LINE公式アカウント統合管理
- 👥 ファンコミュニティ管理
- 📧 一括メッセージ配信
- 📊 エンゲージメント分析
- 🎫 イベント・配信管理

## 技術スタック

- **Frontend**: Next.js 15.5.2, React 19.0, TypeScript 5.7.2
- **Backend**: Supabase
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: DnD Kit
- **Deployment**: Vercel

## Quick Start

```bash
# 1. リポジトリをクローン
git clone https://github.com/your-username/vt-link.git
cd vt-link

# 2. Node.js 18以上が必要
node --version  # >= 18.0.0

# 3. 依存関係をインストール
npm install

# 4. 環境変数を設定
cp .env.local.example .env.local

# 5. 開発サーバーを起動
npm run dev
```

開発サーバーが [http://localhost:3000](http://localhost:3000) で起動します。

## 開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/vt-link.git
cd vt-link
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、必要な環境変数を設定してください：

```bash
cp .env.local.example .env.local
```

### 4. Supabase の設定

```bash
# Supabaseプロジェクトの初期化
npx supabase init

# ローカルのSupabaseを起動
npx supabase start

# 型定義を生成
npm run types:generate
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

開発サーバーが [http://localhost:3000](http://localhost:3000) で起動します。

## データベース管理コマンド

### Supabaseローカル環境

```bash
# Supabaseローカル環境を開始
npx supabase start

# Supabaseローカル環境を停止
npx supabase stop

# データベース状態を確認
npx supabase status

# ダッシュボードを開く (通常は http://localhost:54323)
npx supabase dashboard
```

### マイグレーション管理

```bash
# 新しいマイグレーションを作成
npx supabase migration new <migration_name>

# ローカルデータベースにマイグレーションを適用
npx supabase db push

# リモートデータベースからスキーマを取得
npx supabase db pull

# マイグレーション履歴を確認
npx supabase migration list
```

### 型定義生成

```bash
# TypeScript型定義を生成
npm run types:generate

# 型定義生成のエイリアス
npm run db:types

# 型定義生成を監視 (ファイル変更時に自動実行)
npm run types:watch

# 手動で型定義を生成 (直接実行)
node scripts/generate-types.js
```

### データベーススキーマ管理

```bash
# スキーマをリセット (注意: 全データ削除)
npx supabase db reset

# 現在のスキーマを表示
npx supabase db diff

# Seed データを投入
npx supabase seed
```

### トラブルシューティング

```bash
# Supabaseコンテナのログを確認
npx supabase logs

# 特定のサービスのログを確認
npx supabase logs -f database
npx supabase logs -f api

# Supabase環境をクリーンアップ
npx supabase stop --no-backup
npx supabase start
```

### 便利なコマンド

```bash
# SQL ファイルを実行
npx supabase db query --file path/to/query.sql

# 本番データベースと同期
npx supabase link --project-ref <your-project-ref>
npx supabase db pull

# 型生成と開発サーバーを同時起動
npm run types:watch & npm run dev
```

## 利用可能なスクリプト

| Script                   | Description                  | Used in CI |
| ------------------------ | ---------------------------- | ---------- |
| `npm run dev`            | 開発サーバーを起動           |            |
| `npm run build`          | プロダクションビルド         | ✅         |
| `npm run start`          | プロダクションサーバーを起動 |            |
| `npm run lint`           | ESLint実行                   | ✅         |
| `npm run type-check`     | TypeScript型チェック         | ✅         |
| `npm run format`         | Prettierでコードフォーマット |            |
| `npm run types:generate` | Supabase型定義生成           | ✅         |

## デプロイ

### Vercelへのデプロイ

1. **Vercelプロジェクトの作成**
   - [Vercel Dashboard](https://vercel.com/dashboard)でプロジェクトを作成
   - GitHub リポジトリを連携

2. **環境変数の設定**
   Vercelダッシュボードで以下の環境変数を設定：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - その他プロジェクト固有の環境変数

3. **自動デプロイ**
   - `main` ブランチへのプッシュで本番環境に自動デプロイ
   - `develop` ブランチへのプッシュでプレビュー環境に自動デプロイ

### GitHub Actions

このプロジェクトでは GitHub Actions を使用して自動デプロイを行います：

- **品質チェック**: ESLint、TypeScript型チェック
- **ビルド**: Next.js アプリケーションのビルド
- **デプロイ**: Vercel への自動デプロイ

## 必要なGitHub Secrets

GitHub リポジトリの Settings > Secrets and variables > Actions で以下のシークレットを設定してください：

### Vercel関連

- `VERCEL_TOKEN`: Vercel CLI用のトークン
- `VERCEL_ORG_ID`: Vercel組織ID（任意）
- `VERCEL_PROJECT_ID`: VercelプロジェクトID（任意）

### Supabase関連

- `SUPABASE_ACCESS_TOKEN`: Supabase管理用トークン
- `SUPABASE_PROJECT_REF`: SupabaseプロジェクトのリファレンスID

## ディレクトリ構造

```
├── app/                    # Next.js App Router
├── src/                    # ソースコード
├── supabase/              # Supabaseスキーマ・設定
├── scripts/               # ビルドスクリプト
├── public/                # 静的ファイル
├── .github/workflows/     # GitHub Actions
├── package.json           # 依存関係
├── next.config.js         # Next.js設定
├── tailwind.config.ts     # Tailwind設定
├── tsconfig.json          # TypeScript設定
└── vercel.json            # Vercel設定
```

## 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
