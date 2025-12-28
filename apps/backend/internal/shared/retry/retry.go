package retry

import (
	"context"
	"fmt"
	"log"
	"time"
)

// Config リトライ設定
type Config struct {
	MaxRetries     int           // 最大リトライ回数（デフォルト: 3）
	InitialBackoff time.Duration // 初期バックオフ時間（デフォルト: 1秒）
}

// DefaultConfig デフォルト設定
var DefaultConfig = Config{
	MaxRetries:     3,
	InitialBackoff: time.Second,
}

// WithRetry 指数バックオフでリトライを実行
func WithRetry(ctx context.Context, cfg Config, fn func() error) error {
	if cfg.MaxRetries <= 0 {
		cfg.MaxRetries = DefaultConfig.MaxRetries
	}
	if cfg.InitialBackoff <= 0 {
		cfg.InitialBackoff = DefaultConfig.InitialBackoff
	}

	var lastErr error
	for attempt := 0; attempt < cfg.MaxRetries; attempt++ {
		err := fn()
		if err == nil {
			return nil
		}

		lastErr = err
		log.Printf("[RETRY] Attempt %d/%d failed: %v", attempt+1, cfg.MaxRetries, err)

		// 最後のリトライでなければ待機
		if attempt < cfg.MaxRetries-1 {
			// 指数バックオフ: initialBackoff * 2^attempt
			backoffDuration := cfg.InitialBackoff * time.Duration(1<<uint(attempt))
			select {
			case <-ctx.Done():
				return fmt.Errorf("context cancelled during retry: %w", ctx.Err())
			case <-time.After(backoffDuration):
				// 次のリトライへ
			}
		}
	}

	log.Printf("[RETRY] All %d attempts failed", cfg.MaxRetries)
	return fmt.Errorf("all %d retry attempts failed: %w", cfg.MaxRetries, lastErr)
}
