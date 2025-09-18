# セキュリティ強化ガイド

vt-linkプロジェクトのセキュリティベストプラクティスと実装ガイド

## 🔐 セキュリティ原則

### 1. Defense in Depth（多層防御）
- **アプリケーション層**: 入力検証、認証・認可
- **インフラ層**: HTTPS、環境変数、アクセス制御
- **運用層**: 監視、ログ、インシデント対応

### 2. Principle of Least Privilege
- 必要最小限の権限のみ付与
- 環境変数の適切な管理
- API アクセス制限

## 🛡️ 実装済みセキュリティ機能

### 1. HTTPS通信の強制
```json
// vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### 2. CORS設定
```go
// apps/backend/internal/infrastructure/http/response.go
func SetCORS(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Scheduler-Secret")
}
```

### 3. スケジューラー認証
```go
// apps/backend/api/scheduler/run.go
expectedSecret := os.Getenv("SCHEDULER_SECRET")
providedSecret := r.Header.Get("X-Scheduler-Secret")
if providedSecret != expectedSecret {
    http.Error(w, "Unauthorized", http.StatusUnauthorized)
    return
}
```

## 🔒 追加セキュリティ強化策

### 1. セキュリティヘッダーの追加

#### Vercel設定の強化
```json
// vercel.json への追加
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

### 2. API レート制限

#### Vercel Edge Functions での実装
```go
// apps/backend/internal/infrastructure/http/ratelimit.go
package http

import (
    "net/http"
    "sync"
    "time"
)

type RateLimiter struct {
    requests map[string][]time.Time
    mu       sync.RWMutex
    limit    int
    window   time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
    return &RateLimiter{
        requests: make(map[string][]time.Time),
        limit:    limit,
        window:   window,
    }
}

func (rl *RateLimiter) Allow(clientIP string) bool {
    rl.mu.Lock()
    defer rl.mu.Unlock()

    now := time.Now()
    requests := rl.requests[clientIP]

    // 古いリクエストを削除
    validRequests := make([]time.Time, 0)
    for _, req := range requests {
        if now.Sub(req) < rl.window {
            validRequests = append(validRequests, req)
        }
    }

    if len(validRequests) >= rl.limit {
        return false
    }

    validRequests = append(validRequests, now)
    rl.requests[clientIP] = validRequests

    return true
}

// ミドルウェア
func RateLimitMiddleware(rl *RateLimiter) func(http.HandlerFunc) http.HandlerFunc {
    return func(next http.HandlerFunc) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            clientIP := getClientIP(r)

            if !rl.Allow(clientIP) {
                http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
                return
            }

            next(w, r)
        }
    }
}

func getClientIP(r *http.Request) string {
    // Vercel/Cloudflare経由の場合
    if ip := r.Header.Get("CF-Connecting-IP"); ip != "" {
        return ip
    }
    if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
        return ip
    }
    if ip := r.Header.Get("X-Real-IP"); ip != "" {
        return ip
    }
    return r.RemoteAddr
}
```

### 3. 入力検証の強化

#### Zodスキーマでの検証
```typescript
// packages/schema-zod/src/schemas/security.ts
import { z } from 'zod';

export const SecureStringSchema = z
  .string()
  .min(1)
  .max(1000)
  .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, "Contains invalid characters");

export const EmailSchema = z
  .string()
  .email()
  .max(254);

export const SchedulerSecretSchema = z
  .string()
  .min(32)
  .max(64)
  .regex(/^[a-f0-9]+$/, "Must be hexadecimal");

// APIリクエスト用の共通検証
export const ApiRequestSchema = z.object({
  timestamp: z.string().datetime(),
  nonce: z.string().min(16),
});
```

### 4. 環境変数の検証

#### 起動時検証
```go
// apps/backend/internal/config/validation.go
package config

import (
    "fmt"
    "os"
    "regexp"
)

type SecurityConfig struct {
    DatabaseURL          string
    SchedulerSecret      string
    LineChannelToken     string
    Environment          string
}

func ValidateSecurityConfig() (*SecurityConfig, error) {
    config := &SecurityConfig{
        DatabaseURL:      os.Getenv("DATABASE_URL"),
        SchedulerSecret:  os.Getenv("SCHEDULER_SECRET"),
        LineChannelToken: os.Getenv("LINE_CHANNEL_ACCESS_TOKEN"),
        Environment:      os.Getenv("NODE_ENV"),
    }

    // DATABASE_URL検証
    if config.DatabaseURL == "" {
        return nil, fmt.Errorf("DATABASE_URL is required")
    }
    if !regexp.MustCompile(`^postgresql://`).MatchString(config.DatabaseURL) {
        return nil, fmt.Errorf("DATABASE_URL must be a valid PostgreSQL connection string")
    }

    // SCHEDULER_SECRET検証
    if config.SchedulerSecret == "" {
        return nil, fmt.Errorf("SCHEDULER_SECRET is required")
    }
    if len(config.SchedulerSecret) < 32 {
        return nil, fmt.Errorf("SCHEDULER_SECRET must be at least 32 characters")
    }

    // LINE Channel Token検証
    if config.LineChannelToken == "" {
        return nil, fmt.Errorf("LINE_CHANNEL_ACCESS_TOKEN is required")
    }

    // 本番環境での追加チェック
    if config.Environment == "production" {
        if len(config.SchedulerSecret) < 64 {
            return nil, fmt.Errorf("SCHEDULER_SECRET must be at least 64 characters in production")
        }
    }

    return config, nil
}
```

### 5. ログのセキュリティ

#### 機密情報のマスキング
```go
// apps/backend/internal/infrastructure/logging/secure.go
package logging

import (
    "encoding/json"
    "regexp"
    "strings"
)

var (
    // 機密情報のパターン
    tokenPattern = regexp.MustCompile(`[Bb]earer\s+[A-Za-z0-9\-._~+/]+=*`)
    secretPattern = regexp.MustCompile(`[Ss]ecret["\s]*[:=]["\s]*[A-Za-z0-9\-._~+/]+=*`)
    passwordPattern = regexp.MustCompile(`[Pp]assword["\s]*[:=]["\s]*[A-Za-z0-9\-._~+/!@#$%^&*]+=*`)
)

func MaskSensitiveData(data string) string {
    // トークンをマスク
    data = tokenPattern.ReplaceAllString(data, "Bearer ***")

    // シークレットをマスク
    data = secretPattern.ReplaceAllString(data, "secret: ***")

    // パスワードをマスク
    data = passwordPattern.ReplaceAllString(data, "password: ***")

    return data
}

// 構造化ログ
type SecureLogEntry struct {
    Timestamp string                 `json:"timestamp"`
    Level     string                 `json:"level"`
    Message   string                 `json:"message"`
    Service   string                 `json:"service"`
    RequestID string                 `json:"request_id,omitempty"`
    UserID    string                 `json:"user_id,omitempty"`
    Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

func (s *SecureLogEntry) String() string {
    // JSONシリアライズ前に機密情報をマスク
    jsonBytes, _ := json.Marshal(s)
    return MaskSensitiveData(string(jsonBytes))
}
```

## 🚨 セキュリティ監視

### 1. 異常検知

#### 不審なアクセスパターンの検知
```go
// apps/backend/internal/security/monitoring.go
package security

import (
    "log"
    "time"
)

type SecurityMonitor struct {
    failedAttempts map[string]int
    lastAttempt    map[string]time.Time
}

func NewSecurityMonitor() *SecurityMonitor {
    return &SecurityMonitor{
        failedAttempts: make(map[string]int),
        lastAttempt:    make(map[string]time.Time),
    }
}

func (sm *SecurityMonitor) RecordFailedAuth(clientIP string) {
    now := time.Now()

    // 24時間でリセット
    if last, exists := sm.lastAttempt[clientIP]; exists && now.Sub(last) > 24*time.Hour {
        sm.failedAttempts[clientIP] = 0
    }

    sm.failedAttempts[clientIP]++
    sm.lastAttempt[clientIP] = now

    // アラート判定
    if sm.failedAttempts[clientIP] >= 5 {
        sm.sendSecurityAlert("Suspicious authentication attempts", clientIP)
    }
}

func (sm *SecurityMonitor) sendSecurityAlert(message, clientIP string) {
    log.Printf("SECURITY ALERT: %s from IP: %s", message, clientIP)

    // Discord/Slack通知などの実装
    // sendNotification(fmt.Sprintf("🚨 Security Alert: %s from %s", message, clientIP))
}
```

### 2. セキュリティヘルスチェック

```go
// apps/backend/api/security/health.go
package handler

import (
    "net/http"
    "os"
    "time"

    httphelper "vt-link/backend/internal/infrastructure/http"
)

type SecurityHealth struct {
    OverallStatus     string            `json:"overall_status"`
    Timestamp         string            `json:"timestamp"`
    SecurityChecks    map[string]string `json:"security_checks"`
    Recommendations   []string          `json:"recommendations"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
    httphelper.SetCORS(w)

    if r.Method != "GET" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    health := SecurityHealth{
        OverallStatus:  "secure",
        Timestamp:      time.Now().UTC().Format(time.RFC3339),
        SecurityChecks: make(map[string]string),
        Recommendations: make([]string, 0),
    }

    // 環境変数チェック
    if os.Getenv("SCHEDULER_SECRET") == "" {
        health.SecurityChecks["scheduler_secret"] = "missing"
        health.OverallStatus = "warning"
        health.Recommendations = append(health.Recommendations, "Set SCHEDULER_SECRET environment variable")
    } else {
        health.SecurityChecks["scheduler_secret"] = "configured"
    }

    // HTTPS チェック
    if r.Header.Get("X-Forwarded-Proto") == "https" || r.TLS != nil {
        health.SecurityChecks["https"] = "enabled"
    } else {
        health.SecurityChecks["https"] = "disabled"
        health.OverallStatus = "warning"
        health.Recommendations = append(health.Recommendations, "Enable HTTPS")
    }

    // セキュリティヘッダーチェック
    health.SecurityChecks["security_headers"] = "configured"

    httphelper.WriteJSON(w, http.StatusOK, health)
}
```

## 📋 セキュリティチェックリスト

### 開発時
- [ ] 環境変数に機密情報を直接書かない
- [ ] `.env` ファイルを `.gitignore` に追加
- [ ] 強力なパスワード・シークレット生成
- [ ] 入力検証の実装
- [ ] エラーメッセージで内部情報を漏洩しない

### デプロイ前
- [ ] セキュリティヘッダーの設定確認
- [ ] HTTPS の強制確認
- [ ] 環境変数の適切な設定
- [ ] レート制限の動作確認
- [ ] ログからの機密情報除去確認

### 運用時
- [ ] 定期的なセキュリティヘルスチェック
- [ ] 異常アクセスの監視
- [ ] セキュリティアップデートの適用
- [ ] インシデント対応計画の準備

## 🎯 次のステップ

1. **WAF設定**: Cloudflare WAF (Pro plan以上)
2. **依存関係スキャン**: GitHub Dependabot
3. **コードスキャン**: GitHub CodeQL
4. **ペネトレーションテスト**: 定期的なセキュリティテスト

## 📞 インシデント対応

### 緊急時連絡先
- **開発チーム**: [連絡先情報]
- **インフラ担当**: [連絡先情報]

### インシデント対応フロー
1. **検知**: 監視アラート・ユーザー報告
2. **初期対応**: 影響範囲の特定・一時的な対処
3. **調査**: ログ分析・原因特定
4. **復旧**: 根本的な修正・サービス復旧
5. **事後対応**: レポート作成・再発防止策