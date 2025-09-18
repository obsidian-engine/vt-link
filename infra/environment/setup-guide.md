# 環境変数設定ガイド

vt-linkプロジェクトの各環境における環境変数の設定方法とベストプラクティス

## 🎯 概要

完全無料構成での運用に必要な環境変数の設定手順を説明します。

### 必要な環境変数一覧

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `DATABASE_URL` | PostgreSQL接続文字列 | ✅ | `postgresql://user:pass@host/db?sslmode=require` |
| `SCHEDULER_SECRET` | スケジューラ認証キー | ✅ | `your-256-bit-secret-key` |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API | ✅ | `your-line-channel-access-token` |
| `NODE_ENV` | 動作環境 | ❌ | `production` / `development` |
| `VT_LINK_VERSION` | アプリバージョン | ❌ | `v1.0.0` |
| `NEXT_PUBLIC_API_URL` | フロントエンド用API URL | ❌ | `https://vt-link.vercel.app` |

## 🔧 環境別設定手順

### 1. ローカル開発環境

#### 1.1 バックエンド (.env)

```bash
# apps/backend/.env
DATABASE_URL="postgresql://username:password@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/vt_link_db?sslmode=require"
SCHEDULER_SECRET="your-strong-secret-key-for-development-256-bits-long"
LINE_CHANNEL_ACCESS_TOKEN="your-line-channel-access-token-here"
NODE_ENV="development"
VT_LINK_VERSION="dev"

# オプション: ローカルデバッグ用
# LOG_LEVEL="debug"
# DISABLE_AUTH="true"  # 開発時のみ
```

#### 1.2 フロントエンド (.env.local)

```bash
# apps/frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"
```

### 2. Vercel本番環境

#### 2.1 Vercel CLI での設定

```bash
# 本番環境用
vercel env add DATABASE_URL production
# → Neonで取得したPostgreSQL接続文字列を入力

vercel env add SCHEDULER_SECRET production
# → ランダムな256bit文字列を入力（openssl rand -hex 32）

vercel env add LINE_CHANNEL_ACCESS_TOKEN production
# → LINE Developer Console から取得したトークンを入力

vercel env add NODE_ENV production
# → "production" を入力

vercel env add VT_LINK_VERSION production
# → 現在のバージョン（例: v1.0.0）を入力

vercel env add NEXT_PUBLIC_API_URL production
# → "https://vt-link.vercel.app" を入力
```

#### 2.2 Vercel Web Console での設定

1. [Vercel Dashboard](https://vercel.com/dashboard) → プロジェクト選択
2. **Settings** → **Environment Variables**
3. 上記の変数を **Production** 環境に追加

### 3. Cloudflare Workers

#### 3.1 Secrets設定

```bash
cd infra/cloudflare

# Scheduler用認証キー（Vercelと同じ値）
wrangler secret put SCHEDULER_SECRET
# → Vercelで設定したSCHEDULER_SECRETと同じ値を入力

# 本番環境用
wrangler secret put SCHEDULER_SECRET --env production
```

#### 3.2 Variables設定 (wrangler.toml)

```toml
# 本番環境のVercel URL
[env.production]
name = "vt-link-scheduler"
vars = { VERCEL_API_URL = "https://vt-link.vercel.app" }
```

## 🔐 セキュリティベストプラクティス

### 1. 強力なシークレット生成

```bash
# SCHEDULER_SECRET用（256bit）
openssl rand -hex 32

# または
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. 環境変数の管理

#### ✅ 推奨される方法
- Vercel/Cloudflareの環境変数管理機能を使用
- `.env.example` ファイルでテンプレート提供
- 本番用の値は別途安全に管理

#### ❌ 避けるべき方法
- `.env` ファイルをGitにコミット
- SlackやEmailでシークレットを共有
- ハードコードでの設定

### 3. アクセス制御

```bash
# ローカル環境のファイル権限
chmod 600 apps/backend/.env
chmod 600 apps/frontend/.env.local
```

## 🚀 デプロイメント時の確認事項

### 1. 必須環境変数チェック

```bash
# Vercel環境変数の確認
vercel env ls

# 期待される出力例:
# Production Environment Variables
# DATABASE_URL (Sensitive)
# SCHEDULER_SECRET (Sensitive)
# LINE_CHANNEL_ACCESS_TOKEN (Sensitive)
# NODE_ENV
# VT_LINK_VERSION
# NEXT_PUBLIC_API_URL
```

### 2. 動作確認

```bash
# ヘルスチェックで環境変数を確認
curl https://vt-link.vercel.app/api/status/detailed

# 期待される応答：全サービスが "healthy" 状態
```

## 🔍 トラブルシューティング

### よくある問題

#### 1. DATABASE_URLエラー
```
Error: connection refused
```

**対処法:**
- Neonコンソールで接続文字列を再確認
- `?sslmode=require` パラメータの追加確認
- Neonプロジェクトの停止状態確認

#### 2. SCHEDULER_SECRET不一致
```
Error: Unauthorized (401)
```

**対処法:**
- VercelとCloudflare Workersで同じ値を設定
- シークレットに特殊文字が含まれていないか確認

#### 3. LINE_CHANNEL_ACCESS_TOKEN無効
```
Error: 401 Unauthorized
```

**対処法:**
- LINE Developer Consoleでトークンを再生成
- Channel IDとChannel Secretの確認

## 📋 環境別チェックリスト

### 開発環境 ✅
- [ ] apps/backend/.env に必須変数設定
- [ ] apps/frontend/.env.local に設定
- [ ] .env ファイルを .gitignore に追加
- [ ] `pnpm dev` で正常起動確認

### 本番環境 ✅
- [ ] Vercel環境変数設定完了
- [ ] Cloudflare Workers Secrets設定完了
- [ ] ヘルスチェック API で全サービス healthy 確認
- [ ] スケジューラの動作確認

## 🎯 次のステップ

1. **データベース接続**: Neon PostgreSQLセットアップ
2. **LINE API設定**: Developer Console での設定
3. **デプロイテスト**: 実際の環境での動作確認
4. **監視設定**: ログ・アラートの設定