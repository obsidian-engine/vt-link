# VT-Link Development Guide

## Quick Start

### 初回セットアップ

```bash
# 1. 依存関係インストール
make setup

# 2. .env ファイル設定
cp apps/backend/.env.example apps/backend/.env
# エディタで apps/backend/.env を編集

# 3. 開発サーバー起動
make dev
```

---

## Makefile コマンド一覧

### 基本コマンド

| コマンド | 説明 |
|---------|------|
| `make help` | コマンド一覧を表示 |
| `make dev` | フロントエンド + バックエンド同時起動 |
| `make setup` | 開発環境セットアップ |
| `make clean` | ビルド成果物削除 |

---

## バックエンド

### 起動・停止

```bash
# フォアグラウンドで起動（推奨：開発時）
make backend

# バックグラウンドで起動
make backend-bg

# 停止
make backend-stop

# 再起動
make backend-restart

# ステータス確認
make backend-status

# ログ表示（リアルタイム）
make backend-logs
```

### テスト

```bash
# ユニットテスト
make backend-test

# 統合テスト（データベース必要）
cd apps/backend && make test-integration

# 全テスト
cd apps/backend && make test-all

# カバレッジ
cd apps/backend && make test-coverage
```

### コード品質

```bash
# Lint実行
make backend-lint

# コードフォーマット
cd apps/backend && make fmt

# go vet実行
cd apps/backend && make vet

# 全チェック（fmt + vet + lint）
cd apps/backend && make check
```

### ビルド

```bash
# バイナリビルド
make backend-build

# Docker イメージビルド
cd apps/backend && make docker-build
```

---

## フロントエンド

### 起動

```bash
# 開発サーバー起動
make frontend

# ビルド
make frontend-build
```

### テスト

```bash
# テスト実行
make frontend-test

# Lint実行
make frontend-lint
```

---

## データベース

### 開発用データベース（Docker）

```bash
# 起動
make db-up

# 停止
make db-down

# マイグレーション実行
make db-migrate
```

### マイグレーション管理

```bash
cd apps/backend

# マイグレーション実行
make migrate

# ロールバック
make migrate-down

# ステータス確認
make migrate-status
```

**環境変数**: `DATABASE_URL` が必要

---

## CI/CD

### ローカルでCI実行

```bash
# 全チェック + 全テスト
make ci

# またはバックエンドのみ
cd apps/backend && make ci
```

---

## トラブルシューティング

### バックエンドが起動しない

**1. .env ファイルの確認**
```bash
ls -la apps/backend/.env
# なければ .env.example からコピー
cp apps/backend/.env.example apps/backend/.env
```

**2. ポート8080が使用中**
```bash
# プロセス確認
lsof -i :8080

# 強制停止
make backend-stop
```

**3. 依存関係の再インストール**
```bash
cd apps/backend
make deps
make vendor
```

### フロントエンドが起動しない

**1. node_modules 再インストール**
```bash
pnpm install
```

**2. .next キャッシュ削除**
```bash
make clean
```

### データベース接続エラー

**1. Docker コンテナ確認**
```bash
docker ps | grep postgres
```

**2. DATABASE_URL 確認**
```bash
cd apps/backend
grep DATABASE_URL .env
```

---

## 開発フロー例

### 新機能開発

```bash
# 1. ブランチ作成
git checkout -b feature/new-feature

# 2. バックグラウンドで起動
make backend-bg
make frontend

# 3. 開発...

# 4. テスト実行
make test

# 5. コード品質チェック
make lint

# 6. コミット
git add .
git commit -m "feat: implement new feature"

# 7. バックエンド停止
make backend-stop
```

### バグ修正

```bash
# 1. ログ確認
make backend-logs

# 2. テスト作成
cd apps/backend
# tests/ にテスト追加

# 3. テスト実行（TDD）
make test-unit

# 4. 修正実装

# 5. 全テスト実行
make test

# 6. CI確認
make ci
```

---

## 環境変数

### バックエンド (.env)

必須:
- `DATABASE_URL` - PostgreSQL接続文字列
- `JWT_SECRET` - JWT署名キー（32文字以上推奨）
- `LINE_LOGIN_CHANNEL_ID` - LINE認証チャンネルID
- `LINE_LOGIN_CHANNEL_SECRET` - LINE認証シークレット
- `LINE_LOGIN_CALLBACK_URL` - 認証コールバックURL

オプション:
- `PORT` - サーバーポート（デフォルト: 8080）
- `SCHEDULER_SECRET` - スケジューラーAPIシークレット

### フロントエンド (.env.local)

- `NEXT_PUBLIC_API_BASE` - バックエンドAPIベースURL
- `NEXT_PUBLIC_LINE_CLIENT_ID` - LINE認証クライアントID
- `NEXT_PUBLIC_LINE_REDIRECT_URI` - 認証リダイレクトURI

---

## 推奨開発ツール

### バックエンド（Go）

```bash
# golangci-lint（Linter）
brew install golangci-lint

# goose（マイグレーションツール）
go install github.com/pressly/goose/v3/cmd/goose@latest

# mockery（モック生成）
go install github.com/vektra/mockery/v2@latest

# gosec（セキュリティチェック）
go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
```

### フロントエンド（Next.js）

- pnpm（パッケージマネージャー）
- ESLint（設定済み）
- Vitest（テストフレームワーク）

---

## パフォーマンス

### ベンチマーク実行

```bash
cd apps/backend
make benchmark
```

### プロファイリング

```bash
# CPUプロファイル
go test -cpuprofile=cpu.prof -bench=.

# メモリプロファイル
go test -memprofile=mem.prof -bench=.

# プロファイル確認
go tool pprof cpu.prof
```

---

## セキュリティ

### 脆弱性スキャン

```bash
cd apps/backend

# gosec実行
make security-check

# 依存関係チェック
go list -json -m all | nancy sleuth
```

---

## ドキュメント生成

```bash
cd apps/backend

# ドキュメント生成
make docs

# ドキュメントサーバー起動
make serve-docs
# http://localhost:6060 でアクセス
```
