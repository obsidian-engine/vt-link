# VT-Link デプロイガイド

**Version**: 1.0
**最終更新**: 2025-12-27
**対象**: Phase 1-3 完了後の本番環境構築

---

## 概要

VT-Linkを本番環境にデプロイするための完全ガイド。無料構成（Vercel Hobby + Neon/Supabase + LINE Developers + Cloudflare Workers）を前提とします。

---

## 前提条件

- ✅ Phase 1-3 実装完了（develop ブランチ）
- ✅ GitHub リポジトリ準備完了
- ✅ 以下のアカウント作成済み:
  - Vercel アカウント
  - Neon または Supabase アカウント
  - LINE Developers アカウント
  - Cloudflare アカウント

---

## デプロイ手順

### Step 1: データベースセットアップ（Neon / Supabase）

#### Option A: Neon

1. **プロジェクト作成**
   - https://neon.tech にアクセス
   - "Create a project" をクリック
   - Project name: `vt-link`
   - Region: `Asia Pacific (Tokyo)` または `Asia Pacific (Singapore)`
   - PostgreSQL version: 15 以上

2. **接続文字列取得**
   ```
   postgres://[user]:[password]@[host]/[database]?sslmode=require
   ```
   - Dashboard → Connection Details → Connection string からコピー

3. **データベース作成確認**
   ```bash
   # psql でアクセス
   psql "postgres://[connection-string]"

   # データベース確認
   \l
   ```

#### Option B: Supabase

1. **プロジェクト作成**
   - https://supabase.com にアクセス
   - "New Project" をクリック
   - Name: `vt-link`
   - Database Password: 安全なパスワード設定
   - Region: `Northeast Asia (Tokyo)`

2. **接続文字列取得**
   - Settings → Database → Connection string (Postgres) からコピー
   ```
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

---

### Step 2: LINE Developers セットアップ

1. **LINE Messaging API チャネル作成**
   - https://developers.line.biz/console/ にアクセス
   - "Create a new provider" → Provider 作成
   - "Create a new channel" → Messaging API 選択
   - Channel name: `VT-Link`
   - Channel description: `VTuber向けLINE管理ツール`
   - Category: `News / Media`

2. **必要な情報取得**

   **Channel Access Token (Long-lived)**:
   - Messaging API タブ → Channel access token (long-lived) → "Issue"
   - トークンをコピー（後で環境変数に設定）

   **Channel Secret**:
   - Basic settings タブ → Channel secret をコピー

   **Channel ID**:
   - Basic settings タブ → Channel ID をコピー

3. **Webhook URL設定（Vercelデプロイ後）**
   - Messaging API タブ → Webhook settings
   - Webhook URL: `https://[your-project].vercel.app/webhook`
   - Use webhook: ON
   - Verify: 後で実施

4. **応答メッセージ設定**
   - Messaging API タブ → LINE Official Account features
   - Auto-reply messages: OFF（自動返信BOTを使用）
   - Greeting messages: OFF

---

### Step 3: Vercel デプロイ

#### 3-1. GitHub リポジトリ準備

```bash
# develop ブランチが最新であることを確認
git checkout develop
git pull origin develop

# main ブランチにマージ（本番環境用）
git checkout main
git merge develop
git push origin main
```

#### 3-2. Vercel プロジェクト作成

1. **Vercel にログイン**
   - https://vercel.com/dashboard にアクセス
   - GitHub でログイン

2. **プロジェクトインポート**
   - "Add New..." → "Project" をクリック
   - GitHub リポジトリ `obsidian-engine/vt-link` を選択
   - "Import" をクリック

3. **プロジェクト設定**
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

4. **環境変数設定（全て追加）**

   **必須環境変数**:
   ```env
   # Database
   DATABASE_URL=postgres://[your-neon-or-supabase-connection-string]

   # JWT
   JWT_SECRET=[ランダムな64文字の文字列]
   JWT_ACCESS_EXPIRY=3600
   JWT_REFRESH_EXPIRY=604800

   # LINE
   LINE_CHANNEL_ID=[LINEのChannel ID]
   LINE_CHANNEL_SECRET=[LINEのChannel Secret]
   LINE_ACCESS_TOKEN=[LINEのChannel Access Token]

   # Frontend
   NEXT_PUBLIC_API_BASE=https://[your-project].vercel.app

   # Vercel Blob (画像アップロード)
   BLOB_READ_WRITE_TOKEN=[後で自動生成]
   ```

   **JWT_SECRET生成方法**:
   ```bash
   # ローカルで実行
   openssl rand -hex 32
   ```

5. **デプロイ実行**
   - "Deploy" をクリック
   - デプロイ完了まで待機（3-5分）
   - デプロイURL確認: `https://[your-project].vercel.app`

#### 3-3. Vercel Blob 設定

1. **Blob Storage 有効化**
   - Vercel Dashboard → Project → Storage
   - "Create Database" → "Blob" 選択
   - Database Name: `vt-link-images`
   - "Create" をクリック

2. **環境変数自動追加確認**
   - Settings → Environment Variables
   - `BLOB_READ_WRITE_TOKEN` が自動追加されていることを確認

---

### Step 4: データベースマイグレーション実行

```bash
# ローカル環境で実行
export DATABASE_URL="postgres://[your-connection-string]"

cd apps/backend

# goose インストール（未インストールの場合）
go install github.com/pressly/goose/v3/cmd/goose@latest

# マイグレーション実行
goose -dir ./internal/migrations postgres "$DATABASE_URL" up

# 確認
goose -dir ./internal/migrations postgres "$DATABASE_URL" status
```

**期待される出力**:
```
Applied At                  Migration
=======================================
2025-01-XX XX:XX:XX UTC     0001 create_users_table.sql
2025-01-XX XX:XX:XX UTC     0002 create_messages_table.sql
2025-01-XX XX:XX:XX UTC     0003 create_sessions_table.sql
2025-01-XX XX:XX:XX UTC     0004 auto_reply_rules.sql
2025-01-XX XX:XX:XX UTC     0005 rich_menus.sql
```

---

### Step 5: LINE Webhook URL 設定

1. **Webhook URL 設定**
   - LINE Developers Console → Messaging API タブ
   - Webhook URL: `https://[your-project].vercel.app/webhook`
   - "Update" をクリック

2. **Webhook 検証**
   - "Verify" をクリック
   - ✅ Success が表示されることを確認

---

### Step 6: Cloudflare Workers（スケジューラ）設定

#### 6-1. Cloudflare Workers プロジェクト作成

```bash
# Wrangler CLI インストール
npm install -g wrangler

# Cloudflare にログイン
wrangler login

# Worker プロジェクト作成
cd infra/cloudflare
wrangler init vt-link-scheduler
```

#### 6-2. Worker コード作成

**`infra/cloudflare/vt-link-scheduler/src/index.ts`**:
```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const response = await fetch(`${env.JOB_ENDPOINT}/api/scheduler/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.JOB_SECRET}`
      }
    })

    console.log('Scheduler run:', response.status)
  }
}
```

**`wrangler.toml`**:
```toml
name = "vt-link-scheduler"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[triggers]
crons = ["*/1 * * * *"]  # 毎分実行
```

#### 6-3. Secret 設定

```bash
# JOB_ENDPOINT 設定（Vercel URL）
wrangler secret put JOB_ENDPOINT
# 入力: https://[your-project].vercel.app

# JOB_SECRET 設定（JWT_SECRETと同じ値）
wrangler secret put JOB_SECRET
# 入力: [JWT_SECRETと同じ値]
```

#### 6-4. デプロイ

```bash
wrangler deploy
```

---

## 動作確認

### 1. ヘルスチェック

```bash
curl https://[your-project].vercel.app/api/healthz
# 期待: {"status":"ok"}
```

### 2. LINE ログイン

1. ブラウザで `https://[your-project].vercel.app` にアクセス
2. "LINEでログイン" をクリック
3. LINE認証画面でログイン
4. ダッシュボードにリダイレクトされることを確認

### 3. メッセージ配信テスト

1. ダッシュボード → メッセージ → 新規作成
2. タイトル・本文入力
3. "即時配信" をクリック
4. LINE公式アカウントにメッセージが届くことを確認

### 4. 自動返信テスト

1. 自動返信設定 → フォロー時メッセージ設定
2. メッセージ入力 → 保存
3. LINEで公式アカウントをフォロー
4. 自動返信が届くことを確認

### 5. リッチメニューテスト

1. リッチメニュー → 新規作成
2. 画像アップロード → テンプレート選択 → アクション設定
3. "LINE反映" をクリック
4. LINE でリッチメニューが表示されることを確認

---

## トラブルシューティング

### 問題: データベース接続エラー

**症状**: `failed to connect to database`

**解決策**:
1. DATABASE_URL が正しいか確認
2. Neon/Supabase でIPアドレス制限がないか確認
3. `?sslmode=require` パラメータが付いているか確認

### 問題: LINE Webhook 検証失敗

**症状**: Webhook Verify で "Failed"

**解決策**:
1. Webhook URL が正しいか確認（`https://[your-project].vercel.app/webhook`）
2. Vercel デプロイが完了しているか確認
3. LINE_CHANNEL_SECRET が正しいか確認

### 問題: 画像アップロード失敗

**症状**: `BLOB_READ_WRITE_TOKEN is not set`

**解決策**:
1. Vercel Blob Storage が有効化されているか確認
2. 環境変数に `BLOB_READ_WRITE_TOKEN` が設定されているか確認
3. Vercel プロジェクトを再デプロイ

### 問題: スケジューラが動作しない

**症状**: 予約メッセージが配信されない

**解決策**:
1. Cloudflare Workers のログを確認
2. JOB_ENDPOINT, JOB_SECRET が正しいか確認
3. `/api/scheduler/run` エンドポイントが実装されているか確認

---

## セキュリティチェックリスト

- [ ] JWT_SECRET は安全なランダム文字列（64文字以上）
- [ ] LINE_CHANNEL_SECRET は公開していない
- [ ] DATABASE_URL は環境変数で管理（ハードコード禁止）
- [ ] Vercel Environment Variables は Production のみに設定
- [ ] LINE Webhook の署名検証が有効
- [ ] HTTPS のみでアクセス可能（HTTP リダイレクト）
- [ ] CORS 設定が適切（フロントエンドドメインのみ許可）

---

## パフォーマンス最適化（オプション）

### 1. Vercel Edge Functions 使用

- `/api/*` エンドポイントを Edge Functions に移行
- レスポンス時間 50-100ms 短縮

### 2. Neon Autoscaling 有効化

- Neon Dashboard → Settings → Autoscaling
- Compute units: 0.25 - 1.0 CU

### 3. Vercel Analytics 有効化

- Vercel Dashboard → Analytics → Enable
- パフォーマンス指標を監視

---

## モニタリング

### Vercel Logs

```bash
# リアルタイムログ確認
vercel logs --follow

# 過去24時間のエラーログ
vercel logs --since 24h
```

### Cloudflare Workers Logs

- Cloudflare Dashboard → Workers & Pages → vt-link-scheduler → Logs

### データベース監視

**Neon**:
- Dashboard → Monitoring → Query Performance

**Supabase**:
- Dashboard → Database → Logs

---

## コスト見積もり（月額）

| サービス | プラン | コスト |
|---------|--------|--------|
| Vercel | Hobby | $0 |
| Neon / Supabase | Free Tier | $0 |
| Cloudflare Workers | Free (100,000 req/day) | $0 |
| LINE Developers | Free | $0 |
| **合計** | | **$0** |

**無料枠制限**:
- Vercel: 100GB bandwidth/月
- Neon: 3GB storage, 100h compute/月
- Supabase: 500MB database, 2GB bandwidth/月
- Cloudflare Workers: 100,000 requests/日

---

## 次のステップ

1. **カスタムドメイン設定** (オプション)
   - Vercel Dashboard → Settings → Domains
   - 独自ドメイン追加

2. **監視・アラート設定**
   - Vercel Analytics 有効化
   - Sentry 統合（エラートラッキング）

3. **バックアップ設定**
   - Neon/Supabase の自動バックアップ確認
   - 定期的な手動バックアップ実施

4. **ドキュメント更新**
   - ユーザーマニュアル作成
   - API仕様書公開（OpenAPI）

---

**注意**: 本番環境では必ずセキュリティチェックリストを完了させてください。
