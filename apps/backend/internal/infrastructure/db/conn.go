package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type DB struct {
	*sqlx.DB
}

// NewDB Neon/Supabase用のDB接続を作成（リトライ機能付き）
func NewDB() (*DB, error) {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is required")
	}

	// Neon/Supabaseのスリープ対策でリトライ機能を追加
	var db *sqlx.DB
	var err error

	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		db, err = sqlx.Open("postgres", databaseURL)
		if err != nil {
			log.Printf("Failed to open database connection (attempt %d/%d): %v", i+1, maxRetries, err)
			time.Sleep(time.Duration(i+1) * time.Second)
			continue
		}

		// 接続テスト
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		err = db.PingContext(ctx)
		cancel()

		if err != nil {
			log.Printf("Failed to ping database (attempt %d/%d): %v", i+1, maxRetries, err)
			db.Close()
			time.Sleep(time.Duration(i+1) * time.Second)
			continue
		}

		// 成功
		break
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database after %d attempts: %w", maxRetries, err)
	}

	// Vercel Functions用の接続設定（短時間で解放）
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(2)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(30 * time.Second)

	log.Println("Database connection established successfully")
	return &DB{DB: db}, nil
}

// Health ヘルスチェック用
func (db *DB) Health(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return db.PingContext(ctx)
}

// TxManager トランザクション管理
type TxManager struct {
	db *DB
}

func NewTxManager(db *DB) *TxManager {
	return &TxManager{db: db}
}

func (tm *TxManager) WithinTx(ctx context.Context, fn func(ctx context.Context) error) error {
	tx, err := tm.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// トランザクション内でコンテキストに*sqlx.Txを設定
	txCtx := context.WithValue(ctx, "tx", tx)

	err = fn(txCtx)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetExecutor コンテキストからExecutorを取得（トランザクション対応）
func GetExecutor(ctx context.Context, db *DB) sqlx.ExtContext {
	if tx, ok := ctx.Value("tx").(*sqlx.Tx); ok {
		return tx
	}
	return db.DB
}
