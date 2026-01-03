package logger

import (
	"log/slog"
	"os"
)

var Log *slog.Logger

// Init ロガーを初期化
func Init() {
	env := os.Getenv("APP_ENV")

	var handler slog.Handler
	if env == "production" {
		// 本番環境: JSON形式
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
		})
	} else {
		// 開発環境: テキスト形式
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		})
	}

	Log = slog.New(handler)
}

// 初期化されていない場合のデフォルトロガー
func init() {
	Init()
}
