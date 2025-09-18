#!/bin/bash
set -e

# vt-link 開発環境起動スクリプト
# 使用方法: ./scripts/dev.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🛠️  Starting vt-link development environment"
echo "📂 Project root: $PROJECT_ROOT"

# 色付きログ関数
log_info() {
    echo -e "\033[36m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

log_warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

# 前提条件チェック
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Node.js バージョンチェック
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi

    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_NODE_VERSION="20.0.0"

    if ! node -e "process.exit(process.version.slice(1).split('.').map(Number).reduce((a,b,i) => a + b * Math.pow(1000, 2-i), 0) >= 20000000 ? 0 : 1)"; then
        log_error "Node.js version $NODE_VERSION is not supported. Required: >= $REQUIRED_NODE_VERSION"
        exit 1
    fi

    # pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is required but not installed"
        log_info "Install with: npm install -g pnpm"
        exit 1
    fi

    log_success "Prerequisites check completed"
}

# 環境変数チェック
check_environment_variables() {
    log_info "Checking environment variables..."

    cd "$PROJECT_ROOT"

    # Backend .env チェック
    if [[ ! -f "apps/backend/.env" ]]; then
        log_warning "Backend .env file not found"
        log_info "Creating from template..."

        if [[ -f "apps/backend/.env.example" ]]; then
            cp "apps/backend/.env.example" "apps/backend/.env"
            log_warning "Please edit apps/backend/.env with your actual values:"
            log_warning "  - DATABASE_URL"
            log_warning "  - SCHEDULER_SECRET"
            log_warning "  - LINE_CHANNEL_ACCESS_TOKEN"
        else
            log_error "Template file apps/backend/.env.example not found"
            exit 1
        fi
    fi

    # Frontend .env.local チェック
    if [[ ! -f "apps/frontend/.env.local" ]]; then
        log_warning "Frontend .env.local file not found"
        log_info "Creating from template..."

        if [[ -f "apps/frontend/.env.example" ]]; then
            cp "apps/frontend/.env.example" "apps/frontend/.env.local"
            log_info "Frontend environment variables set from template"
        fi
    fi

    log_success "Environment variables check completed"
}

# 依存関係インストール
install_dependencies() {
    log_info "Installing dependencies..."

    cd "$PROJECT_ROOT"

    # pnpm install実行
    if ! pnpm install; then
        log_error "Failed to install dependencies"
        exit 1
    fi

    log_success "Dependencies installed"
}

# 型生成
generate_types() {
    log_info "Generating types from schemas..."

    cd "$PROJECT_ROOT"

    if ! pnpm gen; then
        log_error "Type generation failed"
        exit 1
    fi

    log_success "Type generation completed"
}

# データベース接続テスト
test_database_connection() {
    log_info "Testing database connection..."

    # DATABASE_URLが設定されているかチェック
    if [[ -f "apps/backend/.env" ]]; then
        if grep -q "DATABASE_URL=" "apps/backend/.env" && ! grep -q "DATABASE_URL=\".*your.*\"" "apps/backend/.env"; then
            log_info "Database URL configured, testing connection..."

            # 簡易的な接続テスト（実際のGoアプリを使わずpsqlコマンドで確認）
            # 注: psqlが利用可能な場合のみ
            if command -v psql &> /dev/null; then
                DATABASE_URL=$(grep "DATABASE_URL=" "apps/backend/.env" | cut -d'=' -f2- | tr -d '"')
                if echo "SELECT 1;" | psql "$DATABASE_URL" &> /dev/null; then
                    log_success "Database connection successful"
                else
                    log_warning "Database connection failed. Please check your DATABASE_URL"
                fi
            else
                log_info "psql not available, skipping connection test"
            fi
        else
            log_warning "DATABASE_URL not configured or using template value"
            log_info "Please set a valid DATABASE_URL in apps/backend/.env"
        fi
    fi
}

# 開発サーバー起動
start_development_servers() {
    log_info "Starting development servers..."

    cd "$PROJECT_ROOT"

    log_info "🚀 Starting all development servers..."
    log_info "  - Frontend: http://localhost:3000"
    log_info "  - Backend API: http://localhost:3000/api/*"
    log_info ""
    log_info "Press Ctrl+C to stop all servers"
    log_info ""

    # pnpm dev を実行（フロントエンド + バックエンド並列起動）
    pnpm dev
}

# プロセス終了時のクリーンアップ
cleanup() {
    log_info "Shutting down development servers..."

    # バックグラウンドプロセスがあれば終了
    jobs -p | xargs -r kill 2>/dev/null || true

    log_success "Development environment stopped"
}

# シグナルハンドリング
trap cleanup EXIT INT TERM

# 開発Tips表示
show_development_tips() {
    echo ""
    echo "🎯 Development Tips:"
    echo "  - API Endpoints: http://localhost:3000/api/*"
    echo "  - Health Check: http://localhost:3000/api/healthz"
    echo "  - System Status: http://localhost:3000/api/status/detailed"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  - pnpm gen          # Regenerate types"
    echo "  - pnpm lint         # Run linting"
    echo "  - pnpm type-check   # Run type checking"
    echo "  - pnpm build        # Build for production"
    echo ""
    echo "📁 Key Directories:"
    echo "  - apps/frontend/    # Next.js application"
    echo "  - apps/backend/     # Go API functions"
    echo "  - packages/         # Shared packages"
    echo ""
}

# メイン実行フロー
main() {
    echo "🎯 vt-link Development Environment Setup"
    echo "Timestamp: $(date)"
    echo "==============================================="

    check_prerequisites
    check_environment_variables
    install_dependencies
    generate_types
    test_database_connection

    show_development_tips

    echo "==============================================="
    log_success "✨ Setup completed! Starting development servers..."
    echo ""

    start_development_servers
}

# スクリプト実行
main "$@"