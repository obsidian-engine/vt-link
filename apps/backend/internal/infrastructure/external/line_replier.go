package external

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"vt-link/backend/internal/shared/retry"
)

type LineReplier struct {
	channelAccessToken string
	httpClient         *http.Client
}

type LineReplyMessage struct {
	ReplyToken string     `json:"replyToken"`
	Messages   []LineText `json:"messages"`
}

func NewLineReplier(accessToken string) *LineReplier {
	return &LineReplier{
		channelAccessToken: accessToken,
		httpClient: &http.Client{
			Timeout: 3 * time.Second, // LINE API推奨タイムアウト
		},
	}
}

// Reply LINE Reply APIでメッセージを返信（リトライ付き）
func (r *LineReplier) Reply(ctx context.Context, replyToken, text string) error {
	if r.channelAccessToken == "" {
		log.Println("LINE_ACCESS_TOKEN not configured, skipping reply")
		return nil
	}

	message := LineReplyMessage{
		ReplyToken: replyToken,
		Messages: []LineText{
			{
				Type: "text",
				Text: text,
			},
		},
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal reply message: %w", err)
	}

	return retry.WithRetry(ctx, retry.DefaultConfig, func() error {
		req, err := http.NewRequestWithContext(ctx, "POST", "https://api.line.me/v2/bot/message/reply", bytes.NewBuffer(jsonData))
		if err != nil {
			return fmt.Errorf("failed to create reply request: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+r.channelAccessToken)

		resp, err := r.httpClient.Do(req)
		if err != nil {
			return fmt.Errorf("failed to send reply request: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			log.Printf("[LINE API] Reply error: status=%d, body=%s", resp.StatusCode, string(body))
			return fmt.Errorf("LINE Reply API error: status %d", resp.StatusCode)
		}

		log.Printf("[LINE API] Successfully sent reply message")
		return nil
	})
}
