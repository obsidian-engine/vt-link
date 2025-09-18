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
		channelAccessToken: os.Getenv("LINE_ACCESS_TOKEN"),
		channelID:          os.Getenv("LINE_CHANNEL_ID"),
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
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
	jsonData, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

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
		log.Printf("LINE API error: status=%d, body=%s", resp.StatusCode, string(body))
		return fmt.Errorf("LINE API error: status %d", resp.StatusCode)
	}

	log.Printf("Successfully sent LINE message")
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