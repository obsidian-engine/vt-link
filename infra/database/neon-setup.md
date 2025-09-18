# Neon PostgreSQL セットアップ

vt-linkプロジェクト用のNeon PostgreSQLデータベースのセットアップ手順

## 1. Neonアカウント作成とプロジェクト作成

1. [Neon Console](https://console.neon.tech/)にアクセス
2. GitHubアカウントでサインアップ
3. 新しいプロジェクトを作成:
   - Project name: `vt-link`
   - Database name: `vt_link_db`
   - Region: `Asia Pacific (Tokyo)` (レイテンシー最適化)
   - PostgreSQL version: `16` (最新安定版)

## 2. 接続文字列取得

Neon Console → Settings → Connection Details から以下の形式で取得:

```
postgresql://[username]:[password]@[endpoint]/[database]?sslmode=require
```

例:
```
postgresql://username:password@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/vt_link_db?sslmode=require
```

## 3. 環境変数設定

### Vercel環境変数
```bash
# Vercel CLIでの設定例
vercel env add DATABASE_URL
# 上記の接続文字列を入力

# 本番環境
vercel env add DATABASE_URL production
# ステージング環境
vercel env add DATABASE_URL preview
```

### ローカル開発環境
```bash
# apps/backend/.env
DATABASE_URL="postgresql://username:password@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/vt_link_db?sslmode=require"

# その他の環境変数
SCHEDULER_SECRET="your-strong-secret-key-here"
LINE_CHANNEL_ACCESS_TOKEN="your-line-channel-access-token"
```

## 4. マイグレーション実行

### 開発用マイグレーション実行スクリプト
```bash
# apps/backend/scripts/migrate.sh
#!/bin/bash
set -e

# 環境変数チェック
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set"
    exit 1
fi

echo "Running database migrations..."

# goose を使用したマイグレーション
cd "$(dirname "$0")/../internal/migrations"

# goose がインストールされていない場合
if ! command -v goose &> /dev/null; then
    echo "Installing goose..."
    go install github.com/pressly/goose/v3/cmd/goose@latest
fi

# マイグレーション実行
goose postgres "$DATABASE_URL" up

echo "Migration completed successfully!"
```

### Package.jsonスクリプト追加
```json
{
  "scripts": {
    "migrate": "cd apps/backend && bash scripts/migrate.sh",
    "migrate:status": "cd apps/backend && goose -dir internal/migrations postgres \"$DATABASE_URL\" status",
    "migrate:down": "cd apps/backend && goose -dir internal/migrations postgres \"$DATABASE_URL\" down"
  }
}
```

## 5. 接続プール設定

### Neon設定最適化

**Connection Limits (Free Tier):**
- 最大同時接続数: 20
- 接続プールサイズ: 5-10 (推奨)

**Vercel Functions用接続設定:**
```go
// apps/backend/internal/infrastructure/db/conn.go の最適化例
func NewConnection() (*sqlx.DB, error) {
    databaseURL := os.Getenv("DATABASE_URL")
    if databaseURL == "" {
        return nil, errors.New("DATABASE_URL is not set")
    }

    db, err := sqlx.Connect("postgres", databaseURL)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to database: %w", err)
    }

    // Neon Free Tier に最適化された設定
    db.SetMaxOpenConns(5)       // 最大5接続
    db.SetMaxIdleConns(2)       // アイドル接続2つ
    db.SetConnMaxLifetime(5 * time.Minute)  // 5分でリセット
    db.SetConnMaxIdleTime(1 * time.Minute)  // 1分でアイドル接続クローズ

    return db, nil
}
```

## 6. バックアップ・復旧

### Neon自動バックアップ
- Free Tier: 7日間保持
- Point-in-time recovery: 利用可能

### 手動バックアップ
```bash
# 定期バックアップスクリプト例
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 7. モニタリング

### Neon Console監視項目
- Connection count
- Query performance
- Storage usage
- Compute usage

### アラート設定
- 接続数上限警告 (18/20接続時)
- ストレージ使用量警告 (400MB/500MB時)

## 8. 料金見積もり (Free Tier)

**無料枠制限:**
- Storage: 512 MB
- Compute: 191.9 hours/month
- Connections: 20 concurrent

**予想使用量:**
- vt-linkアプリ: ~50MB storage
- 月間実行時間: ~10 hours (軽量API使用)
- **→ 完全無料で運用可能**

## トラブルシューティング

### よくある問題

1. **接続エラー**
   ```
   Error: connection refused
   ```
   → Neonプロジェクトが停止中。コンソールで確認・再開

2. **SSL接続エラー**
   ```
   Error: SSL required
   ```
   → 接続文字列に `?sslmode=require` を追加

3. **接続プール枯渇**
   ```
   Error: sorry, too many clients
   ```
   → 接続プール設定を見直し、MaxOpenConnsを削減