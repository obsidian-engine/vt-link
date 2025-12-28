# VT-Link Backend Makefile

GOCMD=go
BINARY_NAME=vt-link-backend
LDFLAGS=-ldflags "-s -w"

.PHONY: help
help: ## ヘルプ表示
	@echo 'Usage: make [target]'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

.PHONY: run
run: vendor ## サーバー起動
	$(GOCMD) run cmd/server/main.go

.PHONY: build
build: deps ## ビルド
	$(GOCMD) build $(LDFLAGS) -o $(BINARY_NAME) -v ./cmd/server

.PHONY: lint
lint: ## golangci-lintでコードチェック
	@which golangci-lint > /dev/null || (echo "golangci-lint not found. Install it with: brew install golangci-lint" && exit 1)
	golangci-lint run ./...

.PHONY: lint-fix
lint-fix: ## golangci-lintで自動修正
	@which golangci-lint > /dev/null || (echo "golangci-lint not found. Install it with: brew install golangci-lint" && exit 1)
	golangci-lint run --fix ./...

.PHONY: test-unit
test-unit: ## ユニットテストのみ実行
	$(GOCMD) test -v -race ./tests/unit/...

.PHONY: test-integration
test-integration: ## 統合テストのみ実行
	@if [ -z "$(TEST_DATABASE_URL)" ]; then \
		echo "ERROR: TEST_DATABASE_URL environment variable is required"; \
		exit 1; \
	fi
	$(GOCMD) test -v -race ./tests/integration/...

.PHONY: test
test: test-unit test-integration ## 全テスト実行（ユニット+統合）

.PHONY: clean
clean: ## クリーンアップ
	$(GOCMD) clean
	rm -f $(BINARY_NAME) coverage.out

.PHONY: deps
deps: ## 依存関係インストール
	$(GOCMD) mod download
	$(GOCMD) mod tidy

.PHONY: vendor
vendor: deps ## vendor同期
	$(GOCMD) mod vendor

.PHONY: migrate
migrate: ## マイグレーション実行
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "ERROR: DATABASE_URL environment variable is required"; \
		exit 1; \
	fi
	@which goose > /dev/null || (echo "goose not found. Install it with: go install github.com/pressly/goose/v3/cmd/goose@latest" && exit 1)
	goose -dir ./internal/migrations postgres "$(DATABASE_URL)" up

.PHONY: migrate-status
migrate-status: ## マイグレーション状態確認
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "ERROR: DATABASE_URL environment variable is required"; \
		exit 1; \
	fi
	@which goose > /dev/null || (echo "goose not found. Install it with: go install github.com/pressly/goose/v3/cmd/goose@latest" && exit 1)
	goose -dir ./internal/migrations postgres "$(DATABASE_URL)" status
