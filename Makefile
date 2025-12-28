# VT-Link Makefile

.PHONY: help
help: ## ヘルプ表示
	@echo 'Usage: make [target]'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

.PHONY: dev
dev: ## 開発サーバー起動（backend + frontend）
	@trap 'kill 0' INT; \
	cd apps/backend && make run & \
	pnpm --filter frontend dev & \
	wait

.PHONY: build
build: ## ビルド（全体）
	@pnpm build

.PHONY: test
test: ## テスト実行
	@cd apps/backend && make test
	@pnpm --filter frontend test

.PHONY: clean
clean: ## ビルド成果物削除
	@cd apps/backend && make clean
	@rm -rf apps/frontend/.next apps/frontend/out
	@echo "Clean complete"
