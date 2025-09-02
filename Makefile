.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Variables
GO := go
GOMOD := $(GO) mod
GQLGEN := gqlgen
ENT := ent
GOLANGCI := golangci-lint
MIGRATE := migrate
AIR := air

# Docker commands
.PHONY: up
up: ## Start all services with docker-compose
	docker compose up -d --build

.PHONY: down
down: ## Stop all services
	docker compose down --remove-orphans

.PHONY: logs
logs: ## Show logs from all services
	docker compose logs -f --tail=100

.PHONY: logs-api
logs-api: ## Show API logs only
	docker compose logs -f --tail=100 api

.PHONY: restart
restart: down up ## Restart all services

.PHONY: clean
clean: ## Clean up containers and volumes
	docker compose down -v --remove-orphans

# Development commands
.PHONY: dev
dev: ## Run development server with hot reload
	$(AIR) -c .air.toml

.PHONY: dev-docker
dev-docker: ## Run development server in Docker
	docker compose up api

# Dependency management
.PHONY: tidy
tidy: ## Run go mod tidy
	$(GOMOD) tidy

.PHONY: vendor
vendor: tidy ## Create vendor directory
	$(GOMOD) vendor

.PHONY: deps
deps: ## Download dependencies
	$(GOMOD) download

# Code generation
.PHONY: generate
generate: generate-ent generate-gql ## Generate all code

.PHONY: generate-ent
generate-ent: ## Generate Ent code
	$(ENT) generate ./internal/ent/schema

.PHONY: generate-gql
generate-gql: ## Generate GraphQL code
	$(GQLGEN) generate

.PHONY: init-ent
init-ent: ## Initialize new Ent schema
	$(ENT) new $(name)

# Database migration
.PHONY: migrate-create
migrate-create: ## Create a new migration (usage: make migrate-create name=create_users_table)
	$(MIGRATE) create -ext sql -dir migrations -seq $(name)

.PHONY: migrate-up
migrate-up: ## Run all pending migrations
	$(MIGRATE) -path migrations -database "$${DB_DSN}" up

.PHONY: migrate-down
migrate-down: ## Rollback last migration
	$(MIGRATE) -path migrations -database "$${DB_DSN}" down 1

.PHONY: migrate-force
migrate-force: ## Force migration version (usage: make migrate-force version=1)
	$(MIGRATE) -path migrations -database "$${DB_DSN}" force $(version)

.PHONY: migrate-status
migrate-status: ## Show migration status
	$(MIGRATE) -path migrations -database "$${DB_DSN}" version

# Testing
.PHONY: test
test: ## Run all tests
	$(GO) test -v -race -coverprofile=coverage.out ./...

.PHONY: test-cover
test-cover: test ## Run tests with coverage report
	$(GO) tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

.PHONY: test-short
test-short: ## Run short tests only
	$(GO) test -v -short ./...

.PHONY: test-integration
test-integration: ## Run integration tests
	$(GO) test -v -tags=integration ./...

# Linting and formatting
.PHONY: lint
lint: ## Run golangci-lint
	$(GOLANGCI) run ./...

.PHONY: lint-fix
lint-fix: ## Run golangci-lint with auto-fix
	$(GOLANGCI) run --fix ./...

.PHONY: fmt
fmt: ## Format code with gofmt
	$(GO) fmt ./...

.PHONY: vet
vet: ## Run go vet
	$(GO) vet ./...

# Build
.PHONY: build
build: ## Build the application
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GO) build -ldflags="-w -s" -o bin/server ./cmd/server

.PHONY: build-local
build-local: ## Build for local development
	$(GO) build -o bin/server ./cmd/server

.PHONY: run
run: build-local ## Build and run locally
	./bin/server

# Docker image management
.PHONY: docker-build
docker-build: ## Build production Docker image
	docker build -t vt-lineads:latest .

.PHONY: docker-build-dev
docker-build-dev: ## Build development Docker image
	docker build -f Dockerfile.dev -t vt-lineads:dev .

# Utilities
.PHONY: psql
psql: ## Connect to PostgreSQL database
	docker compose exec postgres psql -U $${DB_USER:-dev} -d $${DB_NAME:-vt_lineads}

.PHONY: redis-cli
redis-cli: ## Connect to Redis CLI
	docker compose exec redis redis-cli

.PHONY: minio-setup
minio-setup: ## Setup MinIO buckets
	@echo "Setting up MinIO buckets..."
	docker compose exec minio mc alias set local http://localhost:9000 minioadmin minioadmin
	docker compose exec minio mc mb local/media --ignore-existing
	docker compose exec minio mc mb local/backups --ignore-existing

# Installation
.PHONY: install-tools
install-tools: ## Install required Go tools
	go install github.com/99designs/gqlgen@latest
	go install entgo.io/ent/cmd/ent@latest
	go install github.com/air-verse/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Info
.PHONY: info
info: ## Show environment info
	@echo "Go version: $$(go version)"
	@echo "Docker version: $$(docker --version)"
	@echo "Docker Compose version: $$(docker compose version)"

.DEFAULT_GOAL := help