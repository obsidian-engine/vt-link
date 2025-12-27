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
			Timeout: 10 * time.Second,
		},
	}
}

// Reply LINE Reply APIでメッセージを返信
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
		log.Printf("LINE Reply API error: status=%d, body=%s", resp.StatusCode, string(body))
		return fmt.Errorf("LINE Reply API error: status %d", resp.StatusCode)
	}

	log.Printf("Successfully sent LINE reply")
	return nil
}
