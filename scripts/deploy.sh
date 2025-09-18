#!/bin/bash
set -e

# vt-link デプロイメントスクリプト
# 使用方法: ./scripts/deploy.sh [environment]
# 例: ./scripts/deploy.sh production

ENVIRONMENT="${1:-staging}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Starting vt-link deployment to: $ENVIRONMENT"
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

    # Node.js & pnpm
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi

    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is required but not installed"
        exit 1
    fi

    # Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi

    # Cloudflare CLI (if deploying to production)
    if [[ "$ENVIRONMENT" == "production" ]] && ! command -v wrangler &> /dev/null; then
        log_warning "Wrangler CLI not found. Installing..."
        npm install -g wrangler
    fi

    log_success "Prerequisites check completed"
}

# Git状態チェック
check_git_status() {
    log_info "Checking Git repository status..."

    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Working directory has uncommitted changes"
        git status --short

        read -p "Continue with uncommitted changes? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment cancelled"
            exit 1
        fi
    fi

    # ブランチチェック
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Current branch: $CURRENT_BRANCH"

    if [[ "$ENVIRONMENT" == "production" && "$CURRENT_BRANCH" != "main" ]]; then
        log_warning "Production deployment should be from 'main' branch"
        read -p "Continue from '$CURRENT_BRANCH' branch? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment cancelled"
            exit 1
        fi
    fi

    log_success "Git status check completed"
}

# 依存関係インストール
install_dependencies() {
    log_info "Installing dependencies..."

    cd "$PROJECT_ROOT"
    pnpm install --frozen-lockfile

    log_success "Dependencies installed"
}

# 型生成
generate_types() {
    log_info "Generating types from schemas..."

    cd "$PROJECT_ROOT"
    pnpm gen

    log_success "Type generation completed"
}

# ビルドテスト
build_test() {
    log_info "Running build test..."

    cd "$PROJECT_ROOT"
    pnpm build

    log_success "Build test completed"
}

# 型チェック・Lint
quality_checks() {
    log_info "Running quality checks..."

    cd "$PROJECT_ROOT"

    # 型チェック
    log_info "Running type check..."
    pnpm type-check

    # Lint
    log_info "Running lint..."
    pnpm lint

    log_success "Quality checks completed"
}

# Vercelデプロイ
deploy_vercel() {
    log_info "Deploying to Vercel ($ENVIRONMENT)..."

    cd "$PROJECT_ROOT"

    if [[ "$ENVIRONMENT" == "production" ]]; then
        vercel --prod --yes
    else
        vercel --yes
    fi

    log_success "Vercel deployment completed"
}

# Cloudflare Workerデプロイ
deploy_cloudflare() {
    log_info "Deploying Cloudflare Worker ($ENVIRONMENT)..."

    cd "$PROJECT_ROOT/infra/cloudflare"

    if [[ "$ENVIRONMENT" == "production" ]]; then
        wrangler deploy --env production
    elif [[ "$ENVIRONMENT" == "staging" ]]; then
        wrangler deploy --env staging
    else
        wrangler deploy --env development
    fi

    log_success "Cloudflare Worker deployment completed"
}

# デプロイメント検証
verify_deployment() {
    log_info "Verifying deployment..."

    # Vercel URLを取得
    if [[ "$ENVIRONMENT" == "production" ]]; then
        VERCEL_URL="https://vt-link.vercel.app"
    else
        # 最新のデプロイメントURLを取得
        VERCEL_URL=$(vercel ls --scope team 2>/dev/null | grep vt-link | head -1 | awk '{print $2}')
        if [[ -z "$VERCEL_URL" ]]; then
            VERCEL_URL="https://vt-link-preview.vercel.app"  # fallback
        fi
    fi

    log_info "Testing deployment at: $VERCEL_URL"

    # ヘルスチェック
    if curl -f -s "$VERCEL_URL/api/healthz" > /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi

    # 詳細ステータスチェック
    STATUS_RESPONSE=$(curl -s "$VERCEL_URL/api/status/detailed")
    if echo "$STATUS_RESPONSE" | grep -q '"status":"healthy"'; then
        log_success "Detailed status check passed"
    else
        log_warning "System status is not fully healthy"
        echo "$STATUS_RESPONSE" | jq '.services' 2>/dev/null || echo "$STATUS_RESPONSE"
    fi

    log_success "Deployment verification completed"
}

# デプロイメント通知
send_notification() {
    log_info "Sending deployment notification..."

    COMMIT_HASH=$(git rev-parse --short HEAD)
    COMMIT_MESSAGE=$(git log -1 --pretty=%B)
    DEPLOY_TIME=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

    # Discord通知 (DISCORD_WEBHOOK_URLが設定されている場合)
    if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then
        curl -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"🚀 vt-link Deployment\",
                    \"description\": \"Successfully deployed to **$ENVIRONMENT**\",
                    \"color\": 3066993,
                    \"fields\": [
                        {\"name\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"inline\": true},
                        {\"name\": \"Commit\", \"value\": \"\`$COMMIT_HASH\`\", \"inline\": true},
                        {\"name\": \"Deploy Time\", \"value\": \"$DEPLOY_TIME\", \"inline\": true},
                        {\"name\": \"Message\", \"value\": \"$COMMIT_MESSAGE\", \"inline\": false}
                    ]
                }]
            }" &> /dev/null

        log_success "Discord notification sent"
    fi

    # GitHub deployment status (GitHub CLIが利用可能な場合)
    if command -v gh &> /dev/null; then
        gh api repos/:owner/:repo/deployments \
            --method POST \
            --field ref="$COMMIT_HASH" \
            --field environment="$ENVIRONMENT" \
            --field description="Deployed via script" \
            &> /dev/null || true

        log_success "GitHub deployment status updated"
    fi

    log_success "Notifications sent"
}

# メイン実行フロー
main() {
    echo "🎯 vt-link Deployment Script"
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date)"
    echo "==============================================="

    check_prerequisites
    check_git_status
    install_dependencies
    generate_types
    quality_checks
    build_test
    deploy_vercel

    # Cloudflare Workerデプロイ（production/stagingのみ）
    if [[ "$ENVIRONMENT" == "production" || "$ENVIRONMENT" == "staging" ]]; then
        deploy_cloudflare
    fi

    verify_deployment
    send_notification

    echo "==============================================="
    log_success "🎉 Deployment completed successfully!"
    log_info "Environment: $ENVIRONMENT"
    log_info "Commit: $(git rev-parse --short HEAD)"
    log_info "Time: $(date)"

    # 音声通知（macOSの場合）
    if [[ "$OSTYPE" == "darwin"* ]] && command -v afplay &> /dev/null; then
        afplay ~/papa1.mp3 2>/dev/null || true
    fi
}

# スクリプト実行
main "$@"