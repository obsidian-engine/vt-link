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

	"vt-link/backend/internal/domain/model"
)

type LineRichMenuService struct {
	channelAccessToken string
	httpClient         *http.Client
}

// LINE API用のRichMenuリクエスト構造体
type LineRichMenuRequest struct {
	Size        LineRichMenuSize   `json:"size"`
	Selected    bool               `json:"selected"`
	Name        string             `json:"name"`
	ChatBarText string             `json:"chatBarText"`
	Areas       []LineRichMenuArea `json:"areas"`
}

type LineRichMenuSize struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type LineRichMenuArea struct {
	Bounds LineRichMenuBounds `json:"bounds"`
	Action LineRichMenuAction `json:"action"`
}

type LineRichMenuBounds struct {
	X      int `json:"x"`
	Y      int `json:"y"`
	Width  int `json:"width"`
	Height int `json:"height"`
}

type LineRichMenuAction struct {
	Type  string `json:"type"`
	Label string `json:"label,omitempty"`
	URI   string `json:"uri,omitempty"`
	Text  string `json:"text,omitempty"`
	Data  string `json:"data,omitempty"`
}

type LineRichMenuResponse struct {
	RichMenuID string `json:"richMenuId"`
}

func NewLineRichMenuService(accessToken string) *LineRichMenuService {
	return &LineRichMenuService{
		channelAccessToken: accessToken,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// CreateRichMenu LINE APIでリッチメニューを作成
func (s *LineRichMenuService) CreateRichMenu(ctx context.Context, menu *model.RichMenu) (string, error) {
	if s.channelAccessToken == "" {
		return "", fmt.Errorf("LINE_ACCESS_TOKEN not configured")
	}

	// ドメインモデルからLINE APIリクエストに変換
	lineAreas := make([]LineRichMenuArea, len(menu.Areas))
	for i, area := range menu.Areas {
		lineAreas[i] = LineRichMenuArea{
			Bounds: LineRichMenuBounds{
				X:      area.Bounds.X,
				Y:      area.Bounds.Y,
				Width:  area.Bounds.Width,
				Height: area.Bounds.Height,
			},
			Action: LineRichMenuAction{
				Type:  area.Action.Type,
				Label: area.Action.Label,
				URI:   area.Action.URI,
				Text:  area.Action.Text,
				Data:  area.Action.Data,
			},
		}
	}

	request := LineRichMenuRequest{
		Size: LineRichMenuSize{
			Width:  menu.Size.Width,
			Height: menu.Size.Height,
		},
		Selected:    true,
		Name:        menu.Name,
		ChatBarText: menu.ChatBarText,
		Areas:       lineAreas,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", fmt.Errorf("failed to marshal rich menu request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.line.me/v2/bot/richmenu", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.channelAccessToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		log.Printf("LINE Rich Menu API error: status=%d, body=%s", resp.StatusCode, string(body))
		return "", fmt.Errorf("LINE Rich Menu API error: status %d", resp.StatusCode)
	}

	var response LineRichMenuResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return "", fmt.Errorf("failed to unmarshal response: %w", err)
	}

	log.Printf("Successfully created LINE rich menu: %s", response.RichMenuID)
	return response.RichMenuID, nil
}

// UploadImage リッチメニューの画像をアップロード
func (s *LineRichMenuService) UploadImage(ctx context.Context, richMenuID string, imageData []byte) error {
	if s.channelAccessToken == "" {
		return fmt.Errorf("LINE_ACCESS_TOKEN not configured")
	}

	url := fmt.Sprintf("https://api.line.me/v2/bot/richmenu/%s/content", richMenuID)

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(imageData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// 画像の種類を判定（簡易版：最初のバイトで判定）
	contentType := "image/png"
	if len(imageData) > 2 && imageData[0] == 0xFF && imageData[1] == 0xD8 {
		contentType = "image/jpeg"
	}

	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Authorization", "Bearer "+s.channelAccessToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("LINE Upload Image API error: status=%d, body=%s", resp.StatusCode, string(body))
		return fmt.Errorf("LINE Upload Image API error: status %d", resp.StatusCode)
	}

	log.Printf("Successfully uploaded rich menu image: %s", richMenuID)
	return nil
}

// SetDefault リッチメニューをデフォルトとして設定
func (s *LineRichMenuService) SetDefault(ctx context.Context, richMenuID string) error {
	if s.channelAccessToken == "" {
		return fmt.Errorf("LINE_ACCESS_TOKEN not configured")
	}

	url := fmt.Sprintf("https://api.line.me/v2/bot/user/all/richmenu/%s", richMenuID)

	req, err := http.NewRequestWithContext(ctx, "POST", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.channelAccessToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("LINE Set Default API error: status=%d, body=%s", resp.StatusCode, string(body))
		return fmt.Errorf("LINE Set Default API error: status %d", resp.StatusCode)
	}

	log.Printf("Successfully set default rich menu: %s", richMenuID)
	return nil
}

// DeleteRichMenu LINE APIからリッチメニューを削除
func (s *LineRichMenuService) DeleteRichMenu(ctx context.Context, richMenuID string) error {
	if s.channelAccessToken == "" {
		return fmt.Errorf("LINE_ACCESS_TOKEN not configured")
	}

	url := fmt.Sprintf("https://api.line.me/v2/bot/richmenu/%s", richMenuID)

	req, err := http.NewRequestWithContext(ctx, "DELETE", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.channelAccessToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("LINE Delete Rich Menu API error: status=%d, body=%s", resp.StatusCode, string(body))
		return fmt.Errorf("LINE Delete Rich Menu API error: status %d", resp.StatusCode)
	}

	log.Printf("Successfully deleted rich menu: %s", richMenuID)
	return nil
}
