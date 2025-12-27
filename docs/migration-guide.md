# VT-Link マイグレーションガイド

**Version**: 1.0
**最終更新**: 2025-12-27

---

## 概要

VT-Linkのデータベースマイグレーション手順。gooseを使用してPostgreSQLスキーマを管理します。

---

## マイグレーションファイル一覧

| ファイル | 説明 | Phase |
|---------|------|-------|
| `0001_init.sql` | 初期テーブル作成（users, messages） | Phase 1 |
| `0002_add_sent_at.sql` | messagesテーブルにsent_atカラム追加 | Phase 1 |
| `0003_rename_campaigns_to_messages.sql` | campaignsテーブルをmessagesにリネーム | Phase 1 |
| `0004_auto_reply_rules.sql` | auto_reply_rulesテーブル作成 | Phase 2 |
| `0005_rich_menus.sql` | rich_menusテーブル作成 | Phase 3 |

---

## 前提条件

- PostgreSQL 15 以上
- goose CLI インストール済み
- DATABASE_URL 環境変数設定済み

---

## goose インストール

```bash
# Go がインストールされている場合
go install github.com/pressly/goose/v3/cmd/goose@latest

# パス確認
which goose
# 出力例: /Users/[user]/go/bin/goose

# バージョン確認
goose -version
# 出力例: goose version: v3.x.x
```

---

## マイグレーション実行手順

### 1. 環境変数設定

```bash
# Neon の場合
export DATABASE_URL="postgres://[user]:[password]@[host].neon.tech/[database]?sslmode=require"

# Supabase の場合
export DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# ローカル開発の場合
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/vt_link?sslmode=disable"
```

### 2. マイグレーション状態確認

```bash
cd apps/backend

# 現在の状態を確認
goose -dir ./internal/migrations postgres "$DATABASE_URL" status
```

**期待される出力（未実行の場合）**:
```
Applied At                  Migration
=======================================
Pending                     0001_init.sql
Pending                     0002_add_sent_at.sql
Pending                     0003_rename_campaigns_to_messages.sql
Pending                     0004_auto_reply_rules.sql
Pending                     0005_rich_menus.sql
```

### 3. マイグレーション実行

```bash
# 全マイグレーションを適用
goose -dir ./internal/migrations postgres "$DATABASE_URL" up

# 成功時の出力例:
# OK    0001_init.sql (XXms)
# OK    0002_add_sent_at.sql (XXms)
# OK    0003_rename_campaigns_to_messages.sql (XXms)
# OK    0004_auto_reply_rules.sql (XXms)
# OK    0005_rich_menus.sql (XXms)
```

### 4. マイグレーション確認

```bash
# 状態再確認
goose -dir ./internal/migrations postgres "$DATABASE_URL" status
```

**期待される出力（全て適用済み）**:
```
Applied At                  Migration
=======================================
2025-12-27 12:00:00 UTC     0001_init.sql
2025-12-27 12:00:01 UTC     0002_add_sent_at.sql
2025-12-27 12:00:02 UTC     0003_rename_campaigns_to_messages.sql
2025-12-27 12:00:03 UTC     0004_auto_reply_rules.sql
2025-12-27 12:00:04 UTC     0005_rich_menus.sql
```

### 5. テーブル確認

```bash
# psql で接続
psql "$DATABASE_URL"

# テーブル一覧表示
\dt

# 期待される出力:
#  Schema |       Name        | Type  |  Owner
# --------+-------------------+-------+---------
#  public | auto_reply_rules  | table | [user]
#  public | goose_db_version  | table | [user]
#  public | messages          | table | [user]
#  public | rich_menus        | table | [user]
#  public | users             | table | [user]

# テーブル構造確認（例: messages）
\d messages

# 終了
\q
```

---

## 段階的マイグレーション（オプション）

特定のバージョンまでのみ適用したい場合:

```bash
# バージョン3まで適用（Phase 1完了時点）
goose -dir ./internal/migrations postgres "$DATABASE_URL" up-to 3

# 1つ進める
goose -dir ./internal/migrations postgres "$DATABASE_URL" up-by-one

# 特定バージョンにロールバック
goose -dir ./internal/migrations postgres "$DATABASE_URL" down-to 2
```

---

## ロールバック手順

### 全てロールバック

```bash
# 全マイグレーションをロールバック（危険）
goose -dir ./internal/migrations postgres "$DATABASE_URL" reset

# 確認
goose -dir ./internal/migrations postgres "$DATABASE_URL" status
# 出力: 全て "Pending" になる
```

### 1つずつロールバック

```bash
# 最新のマイグレーションのみロールバック
goose -dir ./internal/migrations postgres "$DATABASE_URL" down

# 確認
goose -dir ./internal/migrations postgres "$DATABASE_URL" status
```

---

## トラブルシューティング

### 問題: `goose: no such file or directory`

**原因**: goose がインストールされていない

**解決策**:
```bash
go install github.com/pressly/goose/v3/cmd/goose@latest

# PATH に追加（~/.zshrc または ~/.bashrc に追記）
export PATH="$PATH:$(go env GOPATH)/bin"

# 再読み込み
source ~/.zshrc
```

### 問題: `connection refused`

**原因**: DATABASE_URL が間違っているか、DBが起動していない

**解決策**:
```bash
# 接続文字列確認
echo $DATABASE_URL

# psql で直接接続テスト
psql "$DATABASE_URL" -c "SELECT version();"
```

### 問題: `goose_db_version already exists`

**原因**: 以前のマイグレーションが中途半端に適用されている

**解決策**:
```bash
# 現在の状態確認
goose -dir ./internal/migrations postgres "$DATABASE_URL" status

# 手動でリセット（全データ削除注意！）
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS goose_db_version CASCADE;"

# 再実行
goose -dir ./internal/migrations postgres "$DATABASE_URL" up
```

### 問題: マイグレーションが途中で失敗

**原因**: SQL構文エラーまたは制約違反

**解決策**:
```bash
# エラー詳細確認
goose -dir ./internal/migrations postgres "$DATABASE_URL" up -v

# 該当マイグレーションファイルを確認・修正
# 例: apps/backend/internal/migrations/0004_auto_reply_rules.sql

# 修正後、状態確認
goose -dir ./internal/migrations postgres "$DATABASE_URL" status

# 失敗したマイグレーションから再実行
goose -dir ./internal/migrations postgres "$DATABASE_URL" up
```

---

## CI/CDでのマイグレーション

### GitHub Actions 例

```yaml
name: Database Migration

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install goose
        run: go install github.com/pressly/goose/v3/cmd/goose@latest

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd apps/backend
          goose -dir ./internal/migrations postgres "$DATABASE_URL" up
```

---

## データバックアップ（推奨）

マイグレーション前に必ずバックアップを取得:

```bash
# 全データベースバックアップ
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql

# 特定テーブルのみバックアップ
pg_dump "$DATABASE_URL" -t messages -t users > backup_tables.sql

# リストア（必要な場合）
psql "$DATABASE_URL" < backup_YYYYMMDD_HHMMSS.sql
```

---

## マイグレーションファイル作成（開発者向け）

新しいマイグレーションファイルを作成する場合:

```bash
cd apps/backend/internal/migrations

# 新規マイグレーション作成
goose create add_new_feature sql

# 生成されたファイルを編集
# 例: 0006_add_new_feature.sql
```

**テンプレート**:
```sql
-- +goose Up
-- +goose StatementBegin
CREATE TABLE new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS new_table;
-- +goose StatementEnd
```

---

## ベストプラクティス

1. **本番環境では必ずバックアップ取得**
2. **ステージング環境で事前テスト**
3. **マイグレーション実行は1人ずつ**（並列実行禁止）
4. **ロールバック手順を事前確認**
5. **大量データがある場合は時間帯を考慮**（深夜推奨）
6. **マイグレーション後は必ず動作確認**

---

## チェックリスト

マイグレーション実行前:
- [ ] DATABASE_URL が正しい環境を指している
- [ ] データベースバックアップ取得済み
- [ ] goose インストール確認
- [ ] ステージング環境でテスト済み
- [ ] ロールバック手順確認済み

マイグレーション実行後:
- [ ] `goose status` で全て Applied 確認
- [ ] テーブル存在確認（`\dt`）
- [ ] サンプルデータ挿入テスト
- [ ] アプリケーション動作確認
- [ ] エラーログ確認

---

## 参考リンク

- [goose 公式ドキュメント](https://github.com/pressly/goose)
- [PostgreSQL マイグレーションベストプラクティス](https://wiki.postgresql.org/wiki/Don't_Do_This)
- [Neon Documentation](https://neon.tech/docs)
- [Supabase Documentation](https://supabase.com/docs)
