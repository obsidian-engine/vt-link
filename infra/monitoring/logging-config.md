# ログ・監視設定ガイド

vt-linkプロジェクトの無料構成での監視・ログ設定

## 📊 監視戦略概要

完全無料構成での効果的な監視を実現するためのアプローチ：

### 1. 監視レイヤー
- **Vercel Analytics** (無料枠): パフォーマンス・エラー監視
- **Cloudflare Analytics** (無料枠): Worker実行状況
- **Neon Monitoring** (無料枠): データベース使用量
- **カスタムヘルスチェック**: 自前での死活監視

### 2. ログ管理
- **Vercel Function Logs**: API実行ログ
- **Cloudflare Worker Logs**: スケジューラ実行ログ
- **構造化ログ**: JSON形式での統一ログ出力

## 🔧 Vercel監視設定

### 1. Analytics有効化

```bash
# Vercel Analytics を有効化
vercel analytics enable

# Real User Monitoring の確認
# Vercel Dashboard → Analytics → Web Vitals
```

### 2. Function監視

```bash
# リアルタイムログ表示
vercel logs --follow

# 特定のFunction実行ログ
vercel logs --function=/api/scheduler/run

# エラーログのみフィルタ
vercel logs --level=error
```

### 3. アラート設定（推奨）

Vercel Dashboardでの設定：
- **Function Errors**: エラー率 > 5%
- **Function Duration**: 実行時間 > 25秒
- **Build Failures**: ビルド失敗時

## 📈 Cloudflare Worker監視

### 1. Worker Analytics

```bash
# Worker実行状況確認
wrangler tail --env production

# メトリクス表示
wrangler metrics --env production
```

### 2. ログ構造化

```javascript
// infra/cloudflare/scheduler.js での改善例
function structuredLog(level, message, metadata = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level,
    service: 'vt-link-scheduler',
    message: message,
    ...metadata
  };
  console.log(JSON.stringify(logEntry));
}

// 使用例
structuredLog('info', 'Scheduler execution started', {
  scheduledTime: event.scheduledTime,
  environment: ENVIRONMENT
});

structuredLog('error', 'API call failed', {
  url: vercelApiUrl,
  status: response.status,
  error: error.message
});
```

## 🗄️ データベース監視

### 1. Neon Console監視

定期チェック項目：
- **Connection count**: 上限20接続の利用状況
- **Storage usage**: 512MB上限の使用量
- **Compute hours**: 月間制限時間の消費状況

### 2. アプリケーション側監視

```go
// apps/backend/internal/infrastructure/db/monitoring.go
package db

import (
    "context"
    "database/sql"
    "time"
)

type DatabaseMetrics struct {
    ActiveConnections int           `json:"active_connections"`
    IdleConnections   int           `json:"idle_connections"`
    WaitCount         int64         `json:"wait_count"`
    WaitDuration      time.Duration `json:"wait_duration_ms"`
    MaxOpenConns      int           `json:"max_open_conns"`
}

func (db *DB) GetMetrics() DatabaseMetrics {
    stats := db.Stats()

    return DatabaseMetrics{
        ActiveConnections: stats.InUse,
        IdleConnections:   stats.Idle,
        WaitCount:         stats.WaitCount,
        WaitDuration:      stats.WaitDuration,
        MaxOpenConns:      stats.MaxOpenConns,
    }
}
```

## 🚨 アラート設定

### 1. 無料のアラート手段

#### Webhook通知 (推奨)
```bash
# Discord Webhook例
curl -X POST "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "🚨 vt-link Alert: Database connection failed",
    "embeds": [{
      "title": "System Alert",
      "description": "PostgreSQL connection timeout",
      "color": 15158332,
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
    }]
  }'
```

#### GitHub Issues自動作成
```bash
# Critical alerts can create GitHub issues
gh issue create \
  --title "🚨 Production Alert: Database Connection Failed" \
  --body "Automated alert from monitoring system" \
  --label "alert,production"
```

### 2. ヘルスチェック拡張

```go
// apps/backend/api/status/alerts.go
package handler

import (
    "fmt"
    "net/http"
    "os"
)

func sendAlert(message string, severity string) error {
    webhookURL := os.Getenv("DISCORD_WEBHOOK_URL")
    if webhookURL == "" {
        return fmt.Errorf("webhook URL not configured")
    }

    // Discord webhook実装
    // （実装は省略 - 実際のプロダクションでは discord package 使用）

    return nil
}

// Critical alert sending
func checkCriticalIssues(status SystemStatus) {
    if status.Services.Database.Status == "error" {
        sendAlert("Database connection failed", "critical")
    }

    if status.Services.LineAPI.Status == "error" {
        sendAlert("LINE API configuration error", "warning")
    }
}
```

## 📋 監視ダッシュボード

### 1. 無料ダッシュボードツール

#### Grafana Cloud Free Tier
- 14日間のメトリクス保持
- 基本的なダッシュボード機能

#### Uptime Robot (無料枠)
- 50モニタまで無料
- ヘルスチェックAPI監視

```bash
# Uptime Robotで監視するエンドポイント
https://vt-link.vercel.app/api/healthz          # 基本ヘルスチェック
https://vt-link.vercel.app/api/status/detailed  # 詳細システム状態
```

### 2. カスタムダッシュボード

簡易的なステータスページを作成：

```html
<!-- infra/monitoring/status-page.html -->
<!DOCTYPE html>
<html>
<head>
    <title>vt-link Status</title>
    <meta charset="utf-8">
    <style>
        .healthy { color: green; }
        .error { color: red; }
        .degraded { color: orange; }
    </style>
</head>
<body>
    <h1>vt-link System Status</h1>
    <div id="status-container">
        Loading...
    </div>

    <script>
        async function loadStatus() {
            try {
                const response = await fetch('/api/status/detailed');
                const status = await response.json();

                const container = document.getElementById('status-container');
                container.innerHTML = `
                    <h2 class="${status.status}">Overall Status: ${status.status}</h2>
                    <ul>
                        <li class="${status.services.database.status}">
                            Database: ${status.services.database.status}
                            (${status.services.database.response_time_ms}ms)
                        </li>
                        <li class="${status.services.line_api.status}">
                            LINE API: ${status.services.line_api.status}
                        </li>
                        <li class="${status.services.scheduler.status}">
                            Scheduler: ${status.services.scheduler.status}
                        </li>
                    </ul>
                    <p>Last Updated: ${status.timestamp}</p>
                `;
            } catch (error) {
                document.getElementById('status-container').innerHTML =
                    '<div class="error">Failed to load status</div>';
            }
        }

        loadStatus();
        setInterval(loadStatus, 30000); // 30秒ごとに更新
    </script>
</body>
</html>
```

## 🔍 ログ分析

### 1. 構造化ログ検索

```bash
# Vercel CLI でのログ検索例
vercel logs --grep="ERROR"                    # エラーのみ
vercel logs --grep="scheduler.*failed"        # スケジューラエラー
vercel logs --grep="database.*timeout"        # DB timeout
```

### 2. パフォーマンス分析

```bash
# Function実行時間分析
vercel logs --function=/api/scheduler/run --grep="duration"

# メモリ使用量確認
vercel logs --function=/api/campaigns --grep="memory"
```

## 📈 メトリクス収集

### 1. 重要なKPI

**システム健全性:**
- API応答時間 < 2秒
- エラー率 < 1%
- データベース接続時間 < 500ms

**ビジネスメトリクス:**
- 1日あたりのスケジューラ実行回数
- 送信成功率
- ユーザーアクティビティ

### 2. 自動レポート

```bash
# 日次レポート生成スクリプト例
#!/bin/bash
# scripts/daily-report.sh

echo "📊 vt-link Daily Report $(date)"
echo "=================================="

# Vercel Analytics データ
echo "🚀 Function Executions:"
vercel logs --since=24h --grep="scheduler" | wc -l

# エラー率
echo "❌ Error Rate:"
ERROR_COUNT=$(vercel logs --since=24h --grep="ERROR" | wc -l)
TOTAL_COUNT=$(vercel logs --since=24h | wc -l)
echo "Errors: $ERROR_COUNT / Total: $TOTAL_COUNT"

# システム状態
echo "💚 Current System Status:"
curl -s https://vt-link.vercel.app/api/status/detailed | jq '.status'
```

## 🎯 運用フロー

### 日次チェック
1. Vercel Dashboard でエラー率確認
2. Neon Console でリソース使用量確認
3. Cloudflare Analytics でWorker実行状況確認

### 週次レビュー
1. パフォーマンストレンド分析
2. 無料枠使用量の確認
3. アラート設定の調整

### 月次評価
1. 全体的なシステム安定性評価
2. スケーリング戦略の見直し
3. 監視改善点の特定