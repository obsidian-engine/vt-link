# Makefile for VT-Link Backend

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
GORUN=$(GOCMD) run
BINARY_NAME=vt-link-backend
COVERAGE_FILE=coverage.out
LOG_FILE=/tmp/backend.log
PID_FILE=/tmp/backend.pid

# Default target
.DEFAULT_GOAL := run

# Test parameters
UNIT_TEST_PACKAGES=./tests/unit/...
INTEGRATION_TEST_PACKAGES=./tests/integration/...
E2E_TEST_PACKAGES=./tests/e2e/...
ALL_TEST_PACKAGES=./...

# Build flags
LDFLAGS=-ldflags "-s -w"

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: deps
deps: ## Download and install dependencies
	$(GOMOD) download
	$(GOMOD) tidy

.PHONY: vendor
vendor: deps ## Sync vendor directory
	$(GOMOD) vendor

.PHONY: deps-dev
deps-dev: deps ## Install development dependencies
	$(GOGET) github.com/vektra/mockery/v2@latest

.PHONY: generate
generate: ## Generate mocks and other generated code
	@echo "Generating mocks..."
	mockery

.PHONY: build
build: deps ## Build the application
	$(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) -v ./cmd/server

.PHONY: run
run: vendor ## Run the server (foreground)
	$(GORUN) cmd/server/main.go

.PHONY: run-bg
run-bg: vendor ## Run the server in background
	@echo "Starting server in background..."
	@nohup $(GORUN) cmd/server/main.go > $(LOG_FILE) 2>&1 & echo $$! > $(PID_FILE)
	@echo "Server started with PID $$(cat $(PID_FILE))"
	@echo "Logs: $(LOG_FILE)"

.PHONY: stop
stop: ## Stop the background server
	@if [ -f $(PID_FILE) ]; then \
		PID=$$(cat $(PID_FILE)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "Stopping server (PID: $$PID)..."; \
			kill $$PID; \
			rm -f $(PID_FILE); \
			echo "Server stopped"; \
		else \
			echo "Server not running (stale PID file removed)"; \
			rm -f $(PID_FILE); \
		fi \
	else \
		echo "No PID file found. Server may not be running."; \
	fi

.PHONY: restart
restart: stop run-bg ## Restart the server

.PHONY: logs
logs: ## View server logs
	@if [ -f $(LOG_FILE) ]; then \
		tail -f $(LOG_FILE); \
	else \
		echo "Log file not found: $(LOG_FILE)"; \
	fi

.PHONY: status
status: ## Check server status
	@if [ -f $(PID_FILE) ]; then \
		PID=$$(cat $(PID_FILE)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "Server is running (PID: $$PID)"; \
			curl -s http://localhost:8080/health || echo "Health check failed"; \
		else \
			echo "Server is not running (stale PID file)"; \
			rm -f $(PID_FILE); \
		fi \
	else \
		echo "Server is not running"; \
	fi

.PHONY: clean
clean: ## Clean build artifacts
	$(GOCLEAN)
	rm -f $(BINARY_NAME)
	rm -f $(COVERAGE_FILE)
	rm -f $(PID_FILE)

.PHONY: test
test: test-unit ## Run all tests (default: unit tests only)

.PHONY: test-unit
test-unit: ## Run unit tests
	@echo "Running unit tests..."
	$(GOTEST) -v -race -coverprofile=$(COVERAGE_FILE) $(UNIT_TEST_PACKAGES)

.PHONY: test-integration
test-integration: ## Run integration tests
	@echo "Running integration tests..."
	@if [ -z "$(TEST_DATABASE_URL)" ]; then \
		echo "ERROR: TEST_DATABASE_URL environment variable is required for integration tests"; \
		echo "Example: export TEST_DATABASE_URL='postgres://user:pass@localhost:5432/test_db?sslmode=disable'"; \
		exit 1; \
	fi
	@echo "Using database: $(shell echo $(TEST_DATABASE_URL) | sed 's/:[^:]*@/@***@/')"
	$(GOTEST) -v -race -timeout=10m $(INTEGRATION_TEST_PACKAGES)

.PHONY: test-e2e
test-e2e: ## Run E2E tests
	@echo "Running E2E tests..."
	@if [ -z "$(E2E_BASE_URL)" ]; then \
		echo "WARNING: E2E_BASE_URL not set, using default: http://localhost:3000"; \
	fi
	E2E_SKIP=false $(GOTEST) -v -timeout=5m $(E2E_TEST_PACKAGES)

.PHONY: test-all
test-all: test-unit test-integration test-e2e ## Run all types of tests

.PHONY: test-coverage
test-coverage: test-unit ## Generate and view test coverage report
	$(GOTEST) -coverprofile=$(COVERAGE_FILE) $(ALL_TEST_PACKAGES)
	$(GOCMD) tool cover -html=$(COVERAGE_FILE)

.PHONY: test-coverage-ci
test-coverage-ci: test-unit ## Generate test coverage report for CI
	$(GOTEST) -coverprofile=$(COVERAGE_FILE) $(ALL_TEST_PACKAGES)
	$(GOCMD) tool cover -func=$(COVERAGE_FILE)

.PHONY: lint
lint: ## Run linter (requires golangci-lint)
	@which golangci-lint > /dev/null || (echo "golangci-lint not found. Install it from https://golangci-lint.run/usage/install/" && exit 1)
	golangci-lint run ./...

.PHONY: fmt
fmt: ## Format Go code
	$(GOCMD) fmt ./...

.PHONY: vet
vet: ## Run go vet
	$(GOCMD) vet ./...

.PHONY: check
check: fmt vet lint ## Run all checks (format, vet, lint)

.PHONY: dev
dev: deps vendor generate ## Setup development environment
	@echo "Development environment setup complete"
	@echo "Run 'make run' to start the server"

.PHONY: dev-db
dev-db: ## Start development database (requires Docker)
	@echo "Starting PostgreSQL development database..."
	docker run --name vt-link-postgres-dev \
		-e POSTGRES_DB=vt_link_dev \
		-e POSTGRES_USER=postgres \
		-e POSTGRES_PASSWORD=password \
		-p 5432:5432 \
		-d postgres:15-alpine

.PHONY: dev-db-stop
dev-db-stop: ## Stop development database
	docker stop vt-link-postgres-dev || true
	docker rm vt-link-postgres-dev || true

.PHONY: migrate
migrate: ## Run database migrations
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "ERROR: DATABASE_URL environment variable is required"; \
		exit 1; \
	fi
	@which goose > /dev/null || (echo "goose not found. Install it with: go install github.com/pressly/goose/v3/cmd/goose@latest" && exit 1)
	goose -dir ./internal/migrations postgres "$(DATABASE_URL)" up

.PHONY: migrate-down
migrate-down: ## Rollback database migrations
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "ERROR: DATABASE_URL environment variable is required"; \
		exit 1; \
	fi
	@which goose > /dev/null || (echo "goose not found. Install it with: go install github.com/pressly/goose/v3/cmd/goose@latest" && exit 1)
	goose -dir ./internal/migrations postgres "$(DATABASE_URL)" down

.PHONY: migrate-status
migrate-status: ## Check migration status
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "ERROR: DATABASE_URL environment variable is required"; \
		exit 1; \
	fi
	@which goose > /dev/null || (echo "goose not found. Install it with: go install github.com/pressly/goose/v3/cmd/goose@latest" && exit 1)
	goose -dir ./internal/migrations postgres "$(DATABASE_URL)" status

.PHONY: ci-test
ci-test: deps generate test-coverage-ci ## Run tests for CI pipeline
	@echo "CI test suite completed"

.PHONY: ci-build
ci-build: deps generate build ## Build for CI pipeline
	@echo "CI build completed"

.PHONY: ci-check
ci-check: deps generate check ## Run all checks for CI pipeline
	@echo "CI checks completed"

.PHONY: ci
ci: ci-check ci-test ci-build ## Run full CI pipeline
	@echo "Full CI pipeline completed successfully"

.PHONY: docker-build
docker-build: ## Build Docker image
	docker build -t vt-link-backend:latest .

.PHONY: docker-run
docker-run: ## Run Docker container
	docker run --rm -p 8080:8080 \
		-e DATABASE_URL \
		-e JWT_SECRET \
		-e LINE_ACCESS_TOKEN \
		-e LINE_CHANNEL_ID \
		-e LINE_CHANNEL_SECRET \
		-e LINE_TARGET_USER_ID \
		vt-link-backend:latest

# Development shortcuts
.PHONY: up
up: dev-db migrate dev ## Start full development environment

.PHONY: down
down: dev-db-stop ## Stop development environment

.PHONY: reset
reset: down up ## Reset development environment

# Test shortcuts with environment setup
.PHONY: test-quick
test-quick: generate test-unit ## Quick test (unit tests only)

.PHONY: test-full
test-full: generate ## Full test suite with environment checks
	@echo "Running full test suite..."
	@if [ -n "$(TEST_DATABASE_URL)" ]; then \
		make test-integration; \
	else \
		echo "Skipping integration tests (TEST_DATABASE_URL not set)"; \
	fi
	@if [ "$(E2E_SKIP)" != "true" ]; then \
		make test-e2e; \
	else \
		echo "Skipping E2E tests (E2E_SKIP=true)"; \
	fi
	make test-unit

# Documentation
.PHONY: docs
docs: ## Generate documentation
	@echo "Generating documentation..."
	$(GOCMD) doc -all ./...

.PHONY: serve-docs
serve-docs: ## Serve documentation locally
	@echo "Serving documentation at http://localhost:6060"
	godoc -http=:6060

# Security
.PHONY: security-check
security-check: ## Run security checks (requires gosec)
	@which gosec > /dev/null || (echo "gosec not found. Install it with: go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest" && exit 1)
	gosec ./...

# Performance
.PHONY: benchmark
benchmark: ## Run benchmarks
	$(GOTEST) -bench=. -benchmem ./...

# Release preparation
.PHONY: pre-commit
pre-commit: check test-quick ## Run pre-commit checks
	@echo "Pre-commit checks passed!"

.PHONY: pre-push
pre-push: check test-full ## Run pre-push checks
	@echo "Pre-push checks passed!"

# Environment setup helpers
.PHONY: env-example
env-example: ## Create example environment file
	@echo "Creating .env.example file..."
	@echo "DATABASE_URL=postgres://user:pass@localhost:5432/vt_link" > .env.example
	@echo "TEST_DATABASE_URL=postgres://user:pass@localhost:5432/vt_link_test" >> .env.example
	@echo "JWT_SECRET=your_jwt_secret_32chars_minimum" >> .env.example
	@echo "LINE_ACCESS_TOKEN=your_line_access_token" >> .env.example
	@echo "LINE_CHANNEL_ID=your_line_channel_id" >> .env.example
	@echo "LINE_CHANNEL_SECRET=your_line_channel_secret" >> .env.example
	@echo "LINE_TARGET_USER_ID=your_test_user_id" >> .env.example
	@echo "SCHEDULER_SECRET=your_scheduler_secret" >> .env.example
	@echo "E2E_BASE_URL=http://localhost:3000" >> .env.example
	@echo "E2E_SKIP=false" >> .env.example
	@echo "Created .env.example file"