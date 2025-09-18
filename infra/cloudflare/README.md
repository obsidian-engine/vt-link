# Cloudflare Worker Scheduler 設定

vt-linkの予約送信機能を実現するCloudflare Workerの設定とデプロイ方法

## 概要

毎分実行されるCron TriggerでVercelの`/api/scheduler/run`エンドポイントを呼び出し、スケジュールされたキャンペーンを送信する。

## 必要なツール

```bash
npm install -g wrangler
# または
pnpm add -g wrangler
```

## デプロイ手順

### 1. Cloudflareアカウント認証

```bash
wrangler login
```

### 2. プロジェクト作成・設定

```bash
cd infra/cloudflare

# Secretを設定 (VercelのSCHEDULER_SECRETと同じ値)
wrangler secret put SCHEDULER_SECRET
# プロンプトで秘密鍵を入力

# 本番環境用
wrangler secret put SCHEDULER_SECRET --env production

# ステージング環境用
wrangler secret put SCHEDULER_SECRET --env staging
```

### 3. デプロイ

```bash
# 開発環境
wrangler deploy --env development

# ステージング環境
wrangler deploy --env staging

# 本番環境
wrangler deploy --env production
```

## 設定項目

### Environment Variables
- `VERCEL_API_URL`: VercelアプリのURL (wrangler.tomlで設定)

### Secrets
- `SCHEDULER_SECRET`: Vercel APIへのアクセス用秘密鍵

### Cron Schedule
- `* * * * *`: 毎分実行 (必要に応じて調整可能)

## ローカル開発

```bash
# ローカルでWorkerをテスト
wrangler dev

# Cron Triggerを手動実行してテスト
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

## 監視・ログ

```bash
# リアルタイムログ表示
wrangler tail

# 特定環境のログ
wrangler tail --env production
```

## トラブルシューティング

### よくある問題

1. **SCHEDULER_SECRET未設定**
   ```
   Error: SCHEDULER_SECRET is not set
   ```
   → `wrangler secret put SCHEDULER_SECRET`で設定

2. **Vercel APIタイムアウト**
   ```
   HTTP 504: Gateway Timeout
   ```
   → VercelのFunction実行時間を確認、必要に応じてlimit値を調整

3. **CORS エラー**
   → Vercel側の`/api/scheduler/run`でCORS設定を確認

### Free枠での制限事項

- **実行回数**: 100,000リクエスト/日
- **CPU時間**: 10ms/リクエスト
- **メモリ**: 128MB

毎分実行の場合: 1,440回/日 → Free枠内で十分運用可能

## 料金見積もり (Free枠内)

- 毎分実行 = 1,440回/日 = 43,200回/月
- Cloudflare Workers Free: 100,000回/月まで無料
- **→ 完全無料で運用可能**