package e2e

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"testing"
	"time"
)

// TestConfig E2Eテスト用の設定
type TestConfig struct {
	BaseURL     string
	TestDBURL   string
	APITimeout  time.Duration
	CleanupData bool
}

// LoadTestConfig テスト設定を環境変数から読み込み
func LoadTestConfig() *TestConfig {
	baseURL := os.Getenv("E2E_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000" // デフォルトのローカル開発URL
	}

	testDBURL := os.Getenv("TEST_DATABASE_URL")

	timeout := 30 * time.Second
	if timeoutStr := os.Getenv("E2E_TIMEOUT"); timeoutStr != "" {
		if parsedTimeout, err := time.ParseDuration(timeoutStr); err == nil {
			timeout = parsedTimeout
		}
	}

	cleanupData := os.Getenv("E2E_CLEANUP_DATA") != "false" // デフォルトはtrue

	return &TestConfig{
		BaseURL:     baseURL,
		TestDBURL:   testDBURL,
		APITimeout:  timeout,
		CleanupData: cleanupData,
	}
}

// TestClient E2Eテスト用のHTTPクライアント
type TestClient struct {
	httpClient *http.Client
	baseURL    string
	config     *TestConfig
}

// NewTestClient E2Eテスト用クライアントを作成
func NewTestClient(config *TestConfig) *TestClient {
	return &TestClient{
		httpClient: &http.Client{
			Timeout: config.APITimeout,
		},
		baseURL: config.BaseURL,
		config:  config,
	}
}

// CreateCampaignRequest キャンペーン作成リクエスト
type CreateCampaignRequest struct {
	Title   string `json:"title"`
	Message string `json:"message"`
}

// CreateCampaignResponse キャンペーン作成レスポンス
type CreateCampaignResponse struct {
	Campaign Campaign `json:"campaign"`
}

// Campaign キャンペーンの構造体
type Campaign struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Message     string     `json:"message"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	ScheduledAt *time.Time `json:"scheduled_at,omitempty"`
	SentAt      *time.Time `json:"sent_at,omitempty"`
}

// ListCampaignsResponse キャンペーン一覧レスポンス
type ListCampaignsResponse struct {
	Campaigns []Campaign `json:"campaigns"`
}

// ErrorResponse エラーレスポンス
type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
}

// CreateCampaign キャンペーンを作成
func (c *TestClient) CreateCampaign(t *testing.T, req *CreateCampaignRequest) (*CreateCampaignResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := c.httpClient.Post(
		c.baseURL+"/api/campaigns",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		var errorResp ErrorResponse
		if err := json.Unmarshal(body, &errorResp); err == nil {
			return nil, fmt.Errorf("API error (%d): %s - %s", resp.StatusCode, errorResp.Code, errorResp.Message)
		}
		return nil, fmt.Errorf("API error (%d): %s", resp.StatusCode, string(body))
	}

	var result CreateCampaignResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &result, nil
}

// ListCampaigns キャンペーン一覧を取得
func (c *TestClient) ListCampaigns(t *testing.T) (*ListCampaignsResponse, error) {
	resp, err := c.httpClient.Get(c.baseURL + "/api/campaigns")
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		var errorResp ErrorResponse
		if err := json.Unmarshal(body, &errorResp); err == nil {
			return nil, fmt.Errorf("API error (%d): %s - %s", resp.StatusCode, errorResp.Code, errorResp.Message)
		}
		return nil, fmt.Errorf("API error (%d): %s", resp.StatusCode, string(body))
	}

	var result ListCampaignsResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &result, nil
}

// SendCampaign キャンペーンを送信
func (c *TestClient) SendCampaign(t *testing.T, campaignID string) error {
	resp, err := c.httpClient.Post(
		fmt.Sprintf("%s/api/campaigns/send?id=%s", c.baseURL, campaignID),
		"application/json",
		nil,
	)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		var errorResp ErrorResponse
		if err := json.Unmarshal(body, &errorResp); err == nil {
			return fmt.Errorf("API error (%d): %s - %s", resp.StatusCode, errorResp.Code, errorResp.Message)
		}
		return fmt.Errorf("API error (%d): %s", resp.StatusCode, string(body))
	}

	return nil
}

// HealthCheck ヘルスチェックエンドポイントを確認
func (c *TestClient) HealthCheck(t *testing.T) error {
	resp, err := c.httpClient.Get(c.baseURL + "/api/healthz")
	if err != nil {
		return fmt.Errorf("failed to send health check request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("health check failed (%d): %s", resp.StatusCode, string(body))
	}

	return nil
}

// WaitForServer サーバーが起動するまで待機
func (c *TestClient) WaitForServer(t *testing.T, maxRetries int, retryInterval time.Duration) error {
	for i := 0; i < maxRetries; i++ {
		if err := c.HealthCheck(t); err == nil {
			t.Logf("Server is ready after %d attempts", i+1)
			return nil
		}

		if i < maxRetries-1 {
			t.Logf("Server not ready, waiting %v before retry %d/%d", retryInterval, i+1, maxRetries)
			time.Sleep(retryInterval)
		}
	}

	return fmt.Errorf("server failed to become ready after %d attempts", maxRetries)
}

// DatabaseCleaner データベースクリーンアップ用のヘルパー
type DatabaseCleaner struct {
	testDBURL string
}

// NewDatabaseCleaner データベースクリーナーを作成
func NewDatabaseCleaner(testDBURL string) *DatabaseCleaner {
	return &DatabaseCleaner{
		testDBURL: testDBURL,
	}
}

// CleanupTestData テストデータをクリーンアップ
func (dc *DatabaseCleaner) CleanupTestData(t *testing.T) {
	if dc.testDBURL == "" {
		t.Log("TEST_DATABASE_URL not set, skipping database cleanup")
		return
	}

	// 実際のデータベースクリーンアップロジックをここに実装
	// 例: 特定のプレフィックスを持つテストデータのみを削除
	t.Log("Cleaning up test data from database")
}

// SetupE2ETest E2Eテストのセットアップを行う共通関数
func SetupE2ETest(t *testing.T) (*TestClient, *TestConfig, func()) {
	config := LoadTestConfig()
	client := NewTestClient(config)

	// サーバーの起動を待機
	if err := client.WaitForServer(t, 10, 2*time.Second); err != nil {
		t.Fatalf("Failed to wait for server: %v", err)
	}

	// クリーンアップ関数を返す
	cleanup := func() {
		if config.CleanupData {
			cleaner := NewDatabaseCleaner(config.TestDBURL)
			cleaner.CleanupTestData(t)
		}
	}

	return client, config, cleanup
}