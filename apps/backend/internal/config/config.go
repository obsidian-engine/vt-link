package config

import (
	"fmt"
	"os"
)

// Config アプリケーション設定
type Config struct {
	// LINE Messaging API
	LineAccessToken   string
	LineChannelSecret string

	// LINE Login
	LineLoginChannelID     string
	LineLoginChannelSecret string
	LineLoginCallbackURL   string

	// JWT
	JWTSecret string

	// Database
	DatabaseURL string
}

// LoadConfig 環境変数から設定を読み込む
func LoadConfig() (*Config, error) {
	cfg := &Config{
		LineAccessToken:        getEnv("LINE_ACCESS_TOKEN", ""),
		LineChannelSecret:      getEnv("LINE_CHANNEL_SECRET", ""),
		LineLoginChannelID:     getEnv("LINE_LOGIN_CHANNEL_ID", ""),
		LineLoginChannelSecret: getEnv("LINE_LOGIN_CHANNEL_SECRET", ""),
		LineLoginCallbackURL:   getEnv("LINE_LOGIN_CALLBACK_URL", ""),
		JWTSecret:              getEnv("JWT_SECRET", ""),
		DatabaseURL:            getEnv("DATABASE_URL", ""),
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}

	return cfg, nil
}

// Validate 設定のバリデーション
func (c *Config) Validate() error {
	// 必須項目のチェック
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}

	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}

	// LINE Messaging API（自動返信機能で必須）
	if c.LineAccessToken == "" {
		return fmt.Errorf("LINE_ACCESS_TOKEN is required")
	}

	if c.LineChannelSecret == "" {
		return fmt.Errorf("LINE_CHANNEL_SECRET is required")
	}

	// LINE Login（認証で必須）
	if c.LineLoginChannelID == "" {
		return fmt.Errorf("LINE_LOGIN_CHANNEL_ID is required")
	}

	if c.LineLoginChannelSecret == "" {
		return fmt.Errorf("LINE_LOGIN_CHANNEL_SECRET is required")
	}

	if c.LineLoginCallbackURL == "" {
		return fmt.Errorf("LINE_LOGIN_CALLBACK_URL is required")
	}

	return nil
}

// getEnv 環境変数取得（デフォルト値付き）
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
