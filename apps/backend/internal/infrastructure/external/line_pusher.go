package external

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"vt-link/backend/internal/domain/service"
	"vt-link/backend/internal/shared/retry"
)

type LinePusher struct {
	channelAccessToken string
	channelID          string
	httpClient         *http.Client
}

type LineMessage struct {
	To       string     `json:"to"`
	Messages []LineText `json:"messages"`
}

type LineText struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

func NewLinePusher() service.Pusher {
	return &LinePusher{
		channelAccessToken: os.Getenv("LINE_MESSAGING_ACCESS_TOKEN"),
		channelID:          os.Getenv("LINE_MESSAGING_CHANNEL_ID"),
		httpClient: &http.Client{
			Timeout: 3 * time.Second, // LINE API推奨タイムアウト
		},
	}
}

func (p *LinePusher) PushText(ctx context.Context, text string) error {
	if p.channelAccessToken == "" || p.channelID == "" {
		log.Println("LINE credentials not configured, skipping push")
		return nil // 本番では環境変数未設定時はスキップ
	}

	// NOTE: 実際の実装では送信先ユーザーIDを管理する必要があります
	// ここではサンプル実装として固定の宛先（開発用）を使用
	targetUserID := os.Getenv("LINE_TARGET_USER_ID")
	if targetUserID == "" {
		log.Println("LINE_TARGET_USER_ID not configured, skipping push")
		return nil
	}

	message := LineMessage{
		To: targetUserID,
		Messages: []LineText{
			{
				Type: "text",
				Text: text,
			},
		},
	}

	return p.sendMessage(ctx, message)
}

func (p *LinePusher) PushMessage(ctx context.Context, title, body string) error {
	text := fmt.Sprintf("%s\n\n%s", title, body)
	return p.PushText(ctx, text)
}

func (p *LinePusher) sendMessage(ctx context.Context, message LineMessage) error {
	return p.sendMessageWithRetry(ctx, message, retry.DefaultConfig)
}

func (p *LinePusher) sendMessageWithRetry(ctx context.Context, message LineMessage, cfg retry.Config) error {
	jsonData, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	return retry.WithRetry(ctx, cfg, func() error {
		req, err := http.NewRequestWithContext(ctx, "POST", "https://api.line.me/v2/bot/message/push", bytes.NewBuffer(jsonData))
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+p.channelAccessToken)

		resp, err := p.httpClient.Do(req)
		if err != nil {
			return fmt.Errorf("failed to send request: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			log.Printf("[LINE API] Push error: status=%d, body=%s", resp.StatusCode, string(body))
			return fmt.Errorf("LINE API error: status %d", resp.StatusCode)
		}

		log.Printf("[LINE API] Successfully sent push message")
		return nil
	})
}

// PushWithRetry 指数バックオフでリトライしながらメッセージを送信
func (p *LinePusher) PushWithRetry(ctx context.Context, message string, maxRetries int) error {
	if maxRetries <= 0 {
		maxRetries = 3 // デフォルト3回
	}

	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		err := p.PushText(ctx, message)
		if err == nil {
			return nil
		}

		lastErr = err
		log.Printf("Retry attempt %d/%d failed: %v", attempt+1, maxRetries, err)

		// 最後のリトライでなければ待機
		if attempt < maxRetries-1 {
			// 指数バックオフ: 1s, 2s, 4s, ...
			backoffDuration := time.Duration(1<<uint(attempt)) * time.Second
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(backoffDuration):
				// 次のリトライへ
			}
		}
	}

	return fmt.Errorf("all %d retry attempts failed: %w", maxRetries, lastErr)
}

// Broadcast 全ユーザーにブロードキャスト
func (p *LinePusher) Broadcast(ctx context.Context, message string) error {
	if p.channelAccessToken == "" {
		log.Println("LINE credentials not configured, skipping broadcast")
		return nil
	}

	payload := map[string]interface{}{
		"messages": []LineText{
			{
				Type: "text",
				Text: message,
			},
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.line.me/v2/bot/message/broadcast", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create broadcast request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.channelAccessToken)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send broadcast request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("LINE Broadcast API error: status=%d, body=%s", resp.StatusCode, string(body))
		return fmt.Errorf("LINE Broadcast API error: status %d", resp.StatusCode)
	}

	log.Printf("Successfully sent LINE broadcast message")
	return nil
}

// MulticastByAudience オーディエンスIDのリストでマルチキャスト
func (p *LinePusher) MulticastByAudience(ctx context.Context, audienceIDs []string, message string) error {
	if p.channelAccessToken == "" {
		log.Println("LINE credentials not configured, skipping multicast")
		return nil
	}

	if len(audienceIDs) == 0 {
		return fmt.Errorf("audienceIDs must not be empty")
	}

	payload := map[string]interface{}{
		"to": audienceIDs,
		"messages": []LineText{
			{
				Type: "text",
				Text: message,
			},
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal multicast message: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.line.me/v2/bot/message/multicast", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create multicast request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.channelAccessToken)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send multicast request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("LINE Multicast API error: status=%d, body=%s", resp.StatusCode, string(body))
		return fmt.Errorf("LINE Multicast API error: status %d", resp.StatusCode)
	}

	log.Printf("Successfully sent LINE multicast message to %d audiences", len(audienceIDs))
	return nil
}

// DummyPusher テスト・開発用のダミー実装
type DummyPusher struct{}

func NewDummyPusher() service.Pusher {
	return &DummyPusher{}
}

func (p *DummyPusher) PushText(ctx context.Context, text string) error {
	log.Printf("[DUMMY] Push text: %s", text)
	return nil
}

func (p *DummyPusher) PushMessage(ctx context.Context, title, body string) error {
	log.Printf("[DUMMY] Push message - Title: %s, Body: %s", title, body)
	return nil
}

func (p *DummyPusher) PushWithRetry(ctx context.Context, message string, maxRetries int) error {
	log.Printf("[DUMMY] Push with retry (max: %d): %s", maxRetries, message)
	return nil
}

func (p *DummyPusher) Broadcast(ctx context.Context, message string) error {
	log.Printf("[DUMMY] Broadcast: %s", message)
	return nil
}

func (p *DummyPusher) MulticastByAudience(ctx context.Context, audienceIDs []string, message string) error {
	log.Printf("[DUMMY] Multicast to %d audiences: %s", len(audienceIDs), message)
	return nil
}
