#!/bin/bash
set -e

# データベースマイグレーション実行スクリプト
# 使用方法: bash scripts/migrate.sh

echo "🚀 Starting database migration..."

# 環境変数チェック
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set"
    echo "Please set DATABASE_URL environment variable"
    echo "Example: export DATABASE_URL='postgresql://user:pass@host/db?sslmode=require'"
    exit 1
fi

echo "📍 Database URL: ${DATABASE_URL%@*}@***" # パスワード部分をマスク

# goose がインストールされていない場合の確認とインストール
if ! command -v goose &> /dev/null; then
    echo "📦 goose not found. Installing..."
    go install github.com/pressly/goose/v3/cmd/goose@latest

    # Go binディレクトリがPATHに含まれているか確認
    if ! command -v goose &> /dev/null; then
        echo "⚠️ goose installation may have failed or Go bin directory is not in PATH"
        echo "Please ensure ~/go/bin is in your PATH or install goose manually"
        exit 1
    fi

    echo "✅ goose installed successfully"
fi

# マイグレーションディレクトリに移動
MIGRATION_DIR="$(dirname "$0")/../internal/migrations"
cd "$MIGRATION_DIR"

echo "📂 Migration directory: $(pwd)"
echo "📄 Available migrations:"
ls -la *.sql 2>/dev/null || echo "  No .sql files found"

# 現在のマイグレーション状態を確認
echo ""
echo "📊 Current migration status:"
goose postgres "$DATABASE_URL" status || {
    echo "⚠️ Failed to get migration status. This might be normal for first run."
}

echo ""
echo "🔄 Running migrations..."

# マイグレーション実行
goose postgres "$DATABASE_URL" up

echo ""
echo "📊 Migration status after execution:"
goose postgres "$DATABASE_URL" status

echo ""
echo "✅ Database migration completed successfully!"
echo "🎉 Your database is now up to date"