package integration

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"

	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/infrastructure/db"
	"vt-link/backend/internal/infrastructure/di"
)

// TestDB テスト用のデータベース接続を管理する構造体
type TestDB struct {
	DB *sqlx.DB
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

	// データベース接続を作成
	testDB, err := sqlx.Open("postgres", testDBURL)
	if err != nil {
		t.Fatalf("Failed to open database connection: %v", err)
	}

	// データベース接続をテスト
	if err := testDB.Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}

	return &TestDB{
		DB: testDB,
	}
}

// TeardownTestDB テスト用データベースのクリーンアップ
func (tdb *TestDB) TeardownTestDB() {
	if tdb.DB != nil {
		_ = tdb.DB.Close()
	}
}

// ClearAllTables すべてのテーブルをクリア（テスト間のデータ分離）
func (tdb *TestDB) ClearAllTables(t *testing.T) {
	ctx := context.Background()

	// PostgreSQL用のクリーンアップ（CASCADE付きTRUNCATE）
	tables := []string{
		"auto_reply_rules", // 依存関係の順序に注意
		"rich_menus",
		"messages",
	}

	tx, err := tdb.DB.BeginTxx(ctx, nil)
	if err != nil {
		t.Fatalf("Failed to begin transaction: %v", err)
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
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

// CreateTestMessage テスト用のメッセージデータを作成
func (tdb *TestDB) CreateTestMessage(t *testing.T, title, message string) string {
	ctx := context.Background()

	query := `
		INSERT INTO messages (id, title, message, status, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, 'draft', NOW(), NOW())
		RETURNING id
	`

	var messageID string
	err := tdb.DB.GetContext(ctx, &messageID, query, title, message)
	if err != nil {
		t.Fatalf("Failed to create test message: %v", err)
	}

	return messageID
}

// TestContainer 結合テスト用のDIコンテナを作成
func SetupTestContainer(t *testing.T, testDB *TestDB) *di.Container {
	// DB構造体でラップ
	dbWrapper := &db.DB{DB: testDB.DB}

	// コンテナを作成
	container := &di.Container{
		DB: dbWrapper,
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

// CreateTestAutoReplyRule テスト用の自動返信ルールを作成
func (tdb *TestDB) CreateTestAutoReplyRule(t *testing.T, userID uuid.UUID, name string, ruleType model.AutoReplyRuleType, keywords []string, matchType *model.MatchType, replyMessage string, priority int) string {
	ctx := context.Background()

	query := `
		INSERT INTO auto_reply_rules (id, user_id, type, name, keywords, match_type, reply_message, is_enabled, priority, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, $7, NOW(), NOW())
		RETURNING id
	`

	var ruleID string
	err := tdb.DB.GetContext(ctx, &ruleID, query, userID, ruleType, name, pq.Array(keywords), matchType, replyMessage, priority)
	if err != nil {
		t.Fatalf("Failed to create test auto reply rule: %v", err)
	}

	return ruleID
}

// ClearAutoReplyRules auto_reply_rulesテーブルをクリア
func (tdb *TestDB) ClearAutoReplyRules(t *testing.T) {
	ctx := context.Background()

	tx, err := tdb.DB.BeginTxx(ctx, nil)
	if err != nil {
		t.Fatalf("Failed to begin transaction: %v", err)
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		}
	}()

	query := "TRUNCATE TABLE auto_reply_rules RESTART IDENTITY CASCADE"
	if _, err := tx.ExecContext(ctx, query); err != nil {
		// TRUNCATEが失敗した場合はDELETEを試行
		deleteQuery := "DELETE FROM auto_reply_rules"
		if _, err := tx.ExecContext(ctx, deleteQuery); err != nil {
			t.Fatalf("Failed to clear auto_reply_rules table: %v", err)
		}
	}

	if err = tx.Commit(); err != nil {
		t.Fatalf("Failed to commit transaction: %v", err)
	}

	t.Log("Cleared auto_reply_rules table for test isolation")
}

// CreateTestRichMenu テスト用のリッチメニューを作成
func (tdb *TestDB) CreateTestRichMenu(t *testing.T, userID uuid.UUID) string {
	ctx := context.Background()

	// JSONB用のサイズとエリアを準備
	sizeJSON := `{"width": 2500, "height": 1686}`
	areasJSON := `[{
		"bounds": {"x": 0, "y": 0, "width": 1250, "height": 843},
		"action": {"type": "uri", "label": "ホーム", "uri": "https://example.com"}
	}, {
		"bounds": {"x": 1250, "y": 0, "width": 1250, "height": 843},
		"action": {"type": "message", "label": "お問い合わせ", "text": "お問い合わせ"}
	}]`

	query := `
		INSERT INTO rich_menus (id, user_id, name, chat_bar_text, image_url, size, areas, is_active, is_published_line, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::jsonb, $6::jsonb, false, false, NOW(), NOW())
		RETURNING id
	`

	var menuID string
	err := tdb.DB.GetContext(ctx, &menuID, query, userID, "テストメニュー", "タップしてください", "https://example.com/test.png", sizeJSON, areasJSON)
	if err != nil {
		t.Fatalf("Failed to create test rich menu: %v", err)
	}

	return menuID
}

// ClearRichMenus rich_menusテーブルをクリア
func (tdb *TestDB) ClearRichMenus(t *testing.T) {
	ctx := context.Background()

	tx, err := tdb.DB.BeginTxx(ctx, nil)
	if err != nil {
		t.Fatalf("Failed to begin transaction: %v", err)
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		}
	}()

	query := "TRUNCATE TABLE rich_menus RESTART IDENTITY CASCADE"
	if _, err := tx.ExecContext(ctx, query); err != nil {
		// TRUNCATEが失敗した場合はDELETEを試行
		deleteQuery := "DELETE FROM rich_menus"
		if _, err := tx.ExecContext(ctx, deleteQuery); err != nil {
			t.Fatalf("Failed to clear rich_menus table: %v", err)
		}
	}

	if err = tx.Commit(); err != nil {
		t.Fatalf("Failed to commit transaction: %v", err)
	}

	t.Log("Cleared rich_menus table for test isolation")
}
