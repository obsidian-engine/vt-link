package integration

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"vt-link/backend/internal/infrastructure/db"
	"vt-link/backend/internal/infrastructure/db/pg"
	"vt-link/backend/internal/infrastructure/di"
)

// TestDB テスト用のデータベース接続を管理する構造体
type TestDB struct {
	DB       *sqlx.DB
	connPool *db.ConnectionPool
}

// SetupTestDB テスト用のデータベースをセットアップ
func SetupTestDB(t *testing.T) *TestDB {
	// テスト用データベースURLを取得
	testDBURL := os.Getenv("TEST_DATABASE_URL")
	if testDBURL == "" {
		// CI環境ではスキップ、ローカル環境では警告
		if os.Getenv("CI") != "" {
			t.Skip("TEST_DATABASE_URL not set in CI environment")
		}
		t.Fatal("TEST_DATABASE_URL environment variable is required for integration tests")
	}

	// データベース接続プールを作成
	connPool, err := db.NewConnectionPool(testDBURL)
	if err != nil {
		t.Fatalf("Failed to create connection pool: %v", err)
	}

	// データベース接続を取得
	testDB, err := connPool.GetDB()
	if err != nil {
		t.Fatalf("Failed to get database connection: %v", err)
	}

	// データベース接続をテスト
	if err := testDB.Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}

	return &TestDB{
		DB:       testDB,
		connPool: connPool,
	}
}

// TeardownTestDB テスト用データベースのクリーンアップ
func (tdb *TestDB) TeardownTestDB() {
	if tdb.connPool != nil {
		tdb.connPool.Close()
	}
}

// ClearAllTables すべてのテーブルをクリア（テスト間のデータ分離）
func (tdb *TestDB) ClearAllTables(t *testing.T) {
	ctx := context.Background()

	// PostgreSQL用のクリーンアップ（CASCADE付きTRUNCATE）
	tables := []string{
		"campaigns", // 依存関係の順序に注意
	}

	tx, err := tdb.DB.BeginTxx(ctx, nil)
	if err != nil {
		t.Fatalf("Failed to begin transaction: %v", err)
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	// PostgreSQLでのクリーンアップ
	for _, table := range tables {
		query := fmt.Sprintf("TRUNCATE TABLE %s RESTART IDENTITY CASCADE", table)
		if _, err := tx.ExecContext(ctx, query); err != nil {
			t.Logf("Warning: Failed to truncate table %s: %v", table, err)
			// 個別削除を試行
			deleteQuery := fmt.Sprintf("DELETE FROM %s", table)
			if _, err := tx.ExecContext(ctx, deleteQuery); err != nil {
				t.Fatalf("Failed to delete from table %s: %v", table, err)
			}
		}
	}

	if err = tx.Commit(); err != nil {
		t.Fatalf("Failed to commit transaction: %v", err)
	}

	t.Logf("Cleared %d tables for test isolation", len(tables))
}

// CreateTestCampaign テスト用のキャンペーンデータを作成
func (tdb *TestDB) CreateTestCampaign(t *testing.T, title, message string) string {
	ctx := context.Background()

	query := `
		INSERT INTO campaigns (id, title, message, status, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, 'draft', NOW(), NOW())
		RETURNING id
	`

	var campaignID string
	err := tdb.DB.GetContext(ctx, &campaignID, query, title, message)
	if err != nil {
		t.Fatalf("Failed to create test campaign: %v", err)
	}

	return campaignID
}

// TestContainer 結合テスト用のDIコンテナを作成
func SetupTestContainer(t *testing.T, testDB *TestDB) *di.Container {
	// テスト用のPusherモック（実際のLINE APIを呼ばない）
	mockPusher := &MockPusher{}

	// リポジトリを作成
	campaignRepo := pg.NewCampaignRepository(testDB.DB)

	// コンテナを作成
	container := &di.Container{
		CampaignRepository: campaignRepo,
		PushService:        mockPusher,
	}

	return container
}

// MockPusher テスト用のモックPusher
type MockPusher struct {
	PushTextCalls    []MockPushTextCall
	PushMessageCalls []MockPushMessageCall
	ShouldFail       bool
}

type MockPushTextCall struct {
	Text string
}

type MockPushMessageCall struct {
	Title string
	Body  string
}

func (m *MockPusher) PushText(ctx context.Context, text string) error {
	m.PushTextCalls = append(m.PushTextCalls, MockPushTextCall{Text: text})
	if m.ShouldFail {
		return fmt.Errorf("mock push text failed")
	}
	return nil
}

func (m *MockPusher) PushMessage(ctx context.Context, title, body string) error {
	m.PushMessageCalls = append(m.PushMessageCalls, MockPushMessageCall{Title: title, Body: body})
	if m.ShouldFail {
		return fmt.Errorf("mock push message failed")
	}
	return nil
}

// Reset モックの状態をリセット
func (m *MockPusher) Reset() {
	m.PushTextCalls = nil
	m.PushMessageCalls = nil
	m.ShouldFail = false
}

// AssertPushTextCalled PushTextが呼ばれたことを検証
func (m *MockPusher) AssertPushTextCalled(t *testing.T, expectedText string) {
	found := false
	for _, call := range m.PushTextCalls {
		if call.Text == expectedText {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("Expected PushText to be called with %q, but it wasn't", expectedText)
	}
}

// AssertPushMessageCalled PushMessageが呼ばれたことを検証
func (m *MockPusher) AssertPushMessageCalled(t *testing.T, expectedTitle, expectedBody string) {
	found := false
	for _, call := range m.PushMessageCalls {
		if call.Title == expectedTitle && call.Body == expectedBody {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("Expected PushMessage to be called with title=%q, body=%q, but it wasn't", expectedTitle, expectedBody)
	}
}