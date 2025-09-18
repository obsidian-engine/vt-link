# VT-Link Backend (Vercel Go Functions)

Vercel Go Functions + Neon/Supabase + LINE Bot APIを使用したバックエンドAPI

## 🏗️ アーキテクチャ

**レイヤードアーキテクチャ (Clean Architecture)**
- **Domain**: エンティティ・ビジネスルール
- **Application**: ユースケース・インタラクタ
- **Infrastructure**: DB・外部API・HTTP
- **API**: Vercel Functions (Presentation層)

```
apps/backend/
├── api/                          # Vercel Functions エンドポイント
│   ├── campaigns/
│   │   ├── index.go             # GET/POST /api/campaigns
│   │   └── send.go              # POST /api/campaigns/send?id=xxx
│   ├── scheduler/run.go         # POST /api/scheduler/run
│   ├── healthz.go               # GET /api/healthz
│   └── openapi.yaml.go          # GET /api/openapi.yaml
├── internal/
│   ├── domain/                  # ドメイン層
│   ├── application/             # アプリケーション層
│   ├── infrastructure/          # インフラ層
│   └── shared/                  # 共通ユーティリティ
└── go.mod
```

## 📋 API エンドポイント

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | キャンペーン一覧取得 |
| POST | `/api/campaigns` | キャンペーン作成 |
| POST | `/api/campaigns/send?id={id}` | 即時送信 |
| POST | `/api/scheduler/run` | スケジューラ実行 |
| GET | `/api/healthz` | ヘルスチェック |
| GET | `/api/openapi.yaml` | OpenAPI仕様 |

## 🚀 ローカル開発

### 1. 依存関係インストール
```bash
cd apps/backend
go mod tidy
```

### 2. 環境変数設定
```bash
# apps/backend/.env.local
DATABASE_URL=postgres://user:pass@localhost:5432/dbname
JWT_SECRET=your_jwt_secret_32chars_minimum
LINE_ACCESS_TOKEN=your_line_access_token
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_TARGET_USER_ID=your_test_user_id
SCHEDULER_SECRET=your_scheduler_secret
```

### 3. データベースマイグレーション
```bash
# Neon/Supabaseの場合
export DATABASE_URL="postgres://..."
go install github.com/pressly/goose/v3/cmd/goose@latest
goose -dir ./internal/migrations postgres "$DATABASE_URL" up
```

### 4. Vercel CLI開発サーバー
```bash
# ルートディレクトリで
npm install -g vercel
vercel dev
```

## 🌐 本番デプロイ (Vercel)

### 1. Vercelプロジェクト作成
```bash
vercel --prod
```

### 2. 環境変数設定 (Vercel Dashboard)
- `DATABASE_URL`: Neon/Supabaseの接続文字列
- `JWT_SECRET`: JWTシークレット
- `LINE_ACCESS_TOKEN`: LINE Bot Access Token
- `LINE_CHANNEL_ID`: LINE Channel ID
- `LINE_CHANNEL_SECRET`: LINE Channel Secret
- `LINE_TARGET_USER_ID`: 送信先ユーザーID（テスト用）
- `SCHEDULER_SECRET`: スケジューラ認証用シークレット

### 3. マイグレーション実行
```bash
# CI/CDまたはローカルから本番DBに対して実行
export DATABASE_URL="postgres://neon-or-supabase-url"
goose -dir ./apps/backend/internal/migrations postgres "$DATABASE_URL" up
```

## ⏰ Cloudflare Workers (Cron)

スケジューラを毎分実行するWorker設定:

```javascript
// worker.js
export default {
  async scheduled(event, env, ctx) {
    const response = await fetch('https://your-app.vercel.app/api/scheduler/run', {
      method: 'POST',
      headers: {
        'X-Scheduler-Secret': env.SCHEDULER_SECRET,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log('Scheduler result:', result);
  }
};
```

```toml
# wrangler.toml
name = "vt-link-scheduler"
main = "worker.js"

[triggers]
crons = ["*/1 * * * *"]  # 毎分実行
```

## 🧪 テスト

```bash
cd apps/backend
go test ./...
```

## 📊 監視・ログ

- **Vercel Functions**: Vercel Dashboard でログ確認
- **Cloudflare Workers**: Cloudflare Dashboard でCron実行ログ確認
- **ヘルスチェック**: `GET /api/healthz` でDB接続状況確認

## 🔧 トラブルシューティング

### よくある問題

1. **DATABASE_URLエラー**
   - Neon/Supabaseの接続文字列を確認
   - Vercel環境変数が正しく設定されているか確認

2. **LINE Push失敗**
   - LINE Developer Console でトークン権限確認
   - レート制限を確認（最大500req/min）

3. **Vercel Functions タイムアウト**
   - 処理時間を30秒以内に収める
   - スケジューラのLimit設定を調整（デフォルト30件）

4. **CORS エラー**
   - 各エンドポイントでCORSヘッダーが設定されているか確認
   - OPTIONSメソッドに対応しているか確認

## 📚 参考

- [Vercel Go Functions](https://vercel.com/docs/functions/serverless-functions/runtimes/go)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Supabase PostgreSQL](https://supabase.com/docs)
- [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)