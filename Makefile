# VT-Link Root Makefile
# プロジェクトルートからバックエンド・フロントエンドを操作するための便利コマンド

.PHONY: help
help: ## Show this help message
	@echo 'VT-Link Development Commands'
	@echo ''
	@echo 'Backend:'
	@echo '  make backend         - Start backend server (foreground)'
	@echo '  make backend-bg      - Start backend server (background)'
	@echo '  make backend-stop    - Stop background backend server'
	@echo '  make backend-restart - Restart backend server'
	@echo '  make backend-status  - Check backend server status'
	@echo '  make backend-logs    - View backend logs'
	@echo '  make backend-test    - Run backend tests'
	@echo ''
	@echo 'Frontend:'
	@echo '  make frontend        - Start frontend dev server'
	@echo '  make frontend-build  - Build frontend for production'
	@echo '  make frontend-test   - Run frontend tests'
	@echo ''
	@echo 'Development:'
	@echo '  make dev             - Start both frontend and backend'
	@echo '  make setup           - Setup development environment'
	@echo '  make clean           - Clean all build artifacts'
	@echo ''

# ==================== Backend Commands ====================

.PHONY: backend
backend: ## Start backend server (foreground)
	@echo "Starting backend server..."
	@cd apps/backend && make run

.PHONY: backend-bg
backend-bg: ## Start backend server (background)
	@echo "Starting backend server in background..."
	@cd apps/backend && make run-bg

.PHONY: backend-stop
backend-stop: ## Stop background backend server
	@cd apps/backend && make stop

.PHONY: backend-restart
backend-restart: ## Restart backend server
	@cd apps/backend && make restart

.PHONY: backend-status
backend-status: ## Check backend server status
	@cd apps/backend && make status

.PHONY: backend-logs
backend-logs: ## View backend logs
	@cd apps/backend && make logs

.PHONY: backend-test
backend-test: ## Run backend tests
	@cd apps/backend && make test

.PHONY: backend-build
backend-build: ## Build backend binary
	@cd apps/backend && make build

.PHONY: backend-lint
backend-lint: ## Run backend linter
	@cd apps/backend && make lint

# ==================== Frontend Commands ====================

.PHONY: frontend
frontend: ## Start frontend dev server
	@echo "Starting frontend dev server..."
	@pnpm --filter frontend dev

.PHONY: frontend-build
frontend-build: ## Build frontend for production
	@echo "Building frontend..."
	@pnpm --filter frontend build

.PHONY: frontend-test
frontend-test: ## Run frontend tests
	@pnpm --filter frontend test

.PHONY: frontend-lint
frontend-lint: ## Run frontend linter
	@pnpm --filter frontend lint

# ==================== Development Commands ====================

.PHONY: dev
dev: ## Start both frontend and backend
	@echo "Starting development environment..."
	@echo "Backend: http://localhost:8080"
	@echo "Frontend: http://localhost:3000"
	@echo ""
	@trap 'kill 0' INT; \
	cd apps/backend && make run & \
	pnpm --filter frontend dev & \
	wait

.PHONY: setup
setup: ## Setup development environment
	@echo "Setting up development environment..."
	@echo "1. Installing pnpm dependencies..."
	@pnpm install
	@echo "2. Setting up backend..."
	@cd apps/backend && make deps
	@echo "3. Checking for .env files..."
	@if [ ! -f apps/backend/.env ]; then \
		echo "WARNING: apps/backend/.env not found. Copy from .env.example:"; \
		echo "  cp apps/backend/.env.example apps/backend/.env"; \
	fi
	@if [ ! -f apps/frontend/.env.local ]; then \
		echo "INFO: apps/frontend/.env.local not found (optional)"; \
	fi
	@echo ""
	@echo "Setup complete! Run 'make dev' to start development."

.PHONY: clean
clean: ## Clean all build artifacts
	@echo "Cleaning build artifacts..."
	@cd apps/backend && make clean
	@rm -rf apps/frontend/.next
	@rm -rf apps/frontend/out
	@echo "Clean complete!"

# ==================== Test Commands ====================

.PHONY: test
test: backend-test frontend-test ## Run all tests

.PHONY: test-backend
test-backend: backend-test ## Run backend tests (alias)

.PHONY: test-frontend
test-frontend: frontend-test ## Run frontend tests (alias)

# ==================== Lint Commands ====================

.PHONY: lint
lint: backend-lint frontend-lint ## Run all linters

# ==================== Database Commands ====================

.PHONY: db-up
db-up: ## Start development database
	@cd apps/backend && make dev-db

.PHONY: db-down
db-down: ## Stop development database
	@cd apps/backend && make dev-db-stop

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@cd apps/backend && make migrate

# ==================== CI Commands ====================

.PHONY: ci
ci: lint test ## Run CI pipeline (lint + test)
	@echo "CI pipeline completed!"
