package e2e

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type MessageAPIE2ETestSuite struct {
	suite.Suite
	client  *TestClient
	config  *TestConfig
	cleanup func()
}

func (s *MessageAPIE2ETestSuite) SetupSuite() {
	s.client, s.config, s.cleanup = SetupE2ETest(s.T())
}

func (s *MessageAPIE2ETestSuite) TearDownSuite() {
	if s.cleanup != nil {
		s.cleanup()
	}
}

func (s *MessageAPIE2ETestSuite) TestHealthCheck() {
	// ヘルスチェックエンドポイントのテスト
	err := s.client.HealthCheck(s.T())
	assert.NoError(s.T(), err)
}

func (s *MessageAPIE2ETestSuite) TestCreateMessage_Success() {
	// メッセージ作成の正常系テスト
	req := &CreateMessageRequest{
		Title:   "E2Eテストメッセージ",
		Message: "E2Eテストメッセージ",
	}

	resp, err := s.client.CreateMessage(s.T(), req)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), resp)
	assert.NotEmpty(s.T(), resp.Message.ID)
	assert.Equal(s.T(), req.Title, resp.Message.Title)
	assert.Equal(s.T(), req.Body, resp.Message.Body)
	assert.Equal(s.T(), "draft", resp.Message.Status)
	assert.False(s.T(), resp.Message.CreatedAt.IsZero())
	assert.False(s.T(), resp.Message.UpdatedAt.IsZero())
}

func (s *MessageAPIE2ETestSuite) TestCreateMessage_InvalidInput() {
	// 無効な入力でのメッセージ作成テスト
	req := &CreateMessageRequest{
		Title:   "", // 空のタイトル
		Message: "テストメッセージ",
	}

	resp, err := s.client.CreateMessage(s.T(), req)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), resp)
	assert.Contains(s.T(), err.Error(), "INVALID_INPUT")
}

func (s *MessageAPIE2ETestSuite) TestListMessages_Empty() {
	// 空のメッセージ一覧取得テスト
	resp, err := s.client.ListMessages(s.T())

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), resp)
	// 初期状態では空である可能性が高い
	assert.IsType(s.T(), []Message{}, resp.Messages)
}

func (s *MessageAPIE2ETestSuite) TestCreateAndListMessages() {
	// メッセージ作成後の一覧取得テスト
	// 1. メッセージを作成
	createReq := &CreateMessageRequest{
		Title:   "一覧テストメッセージ",
		Message: "一覧テストメッセージ",
	}

	createResp, err := s.client.CreateMessage(s.T(), createReq)
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), createResp)

	// 2. メッセージ一覧を取得
	listResp, err := s.client.ListMessages(s.T())
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), listResp)

	// 3. 作成したメッセージが一覧に含まれていることを確認
	found := false
	for _, message := range listResp.Messages {
		if message.ID == createResp.Body.ID {
			found = true
			assert.Equal(s.T(), createReq.Title, message.Title)
			assert.Equal(s.T(), createReq.Body, message.Body)
			assert.Equal(s.T(), "draft", message.Status)
			break
		}
	}
	assert.True(s.T(), found, "Created message should be found in list")
}

func (s *MessageAPIE2ETestSuite) TestSendMessage_Success() {
	// メッセージ送信の正常系テスト
	// 1. メッセージを作成
	createReq := &CreateMessageRequest{
		Title:   "送信テストメッセージ",
		Message: "送信テストメッセージ",
	}

	createResp, err := s.client.CreateMessage(s.T(), createReq)
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), createResp)

	// 2. メッセージを送信
	err = s.client.SendMessage(s.T(), createResp.Body.ID)
	assert.NoError(s.T(), err)

	// 3. 送信後の状態を確認
	listResp, err := s.client.ListMessages(s.T())
	assert.NoError(s.T(), err)

	// 送信したメッセージのステータスが変更されていることを確認
	found := false
	for _, message := range listResp.Messages {
		if message.ID == createResp.Body.ID {
			found = true
			assert.Equal(s.T(), "sent", message.Status)
			assert.NotNil(s.T(), message.SentAt)
			break
		}
	}
	assert.True(s.T(), found, "Sent message should be found in list")
}

func (s *MessageAPIE2ETestSuite) TestSendMessage_InvalidID() {
	// 存在しないIDでのメッセージ送信テスト
	err := s.client.SendMessage(s.T(), "invalid-uuid")

	// アサーション
	assert.Error(s.T(), err)
	assert.Contains(s.T(), err.Error(), "INVALID_ID")
}

func (s *MessageAPIE2ETestSuite) TestSendMessage_NotFound() {
	// 存在しないメッセージの送信テスト
	err := s.client.SendMessage(s.T(), "123e4567-e89b-12d3-a456-426614174000")

	// アサーション
	assert.Error(s.T(), err)
	assert.Contains(s.T(), err.Error(), "NOT_FOUND")
}

func (s *MessageAPIE2ETestSuite) TestSendMessage_AlreadySent() {
	// 既に送信済みのメッセージの再送信テスト
	// 1. メッセージを作成
	createReq := &CreateMessageRequest{
		Title:   "再送信テストメッセージ",
		Message: "再送信テストメッセージ",
	}

	createResp, err := s.client.CreateMessage(s.T(), createReq)
	assert.NoError(s.T(), err)

	// 2. 初回送信
	err = s.client.SendMessage(s.T(), createResp.Body.ID)
	assert.NoError(s.T(), err)

	// 3. 再送信を試行
	err = s.client.SendMessage(s.T(), createResp.Body.ID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Contains(s.T(), err.Error(), "ALREADY_SENT")
}

func (s *MessageAPIE2ETestSuite) TestCompleteWorkflow() {
	// 完全なワークフローのテスト（作成→一覧→送信→確認）
	messages := []CreateMessageRequest{
		{Title: "ワークフローテスト1", Body: "メッセージ1"},
		{Title: "ワークフローテスト2", Body: "メッセージ2"},
		{Title: "ワークフローテスト3", Body: "メッセージ3"},
	}

	var createdIDs []string

	// 1. 複数のメッセージを作成
	for _, req := range messages {
		resp, err := s.client.CreateMessage(s.T(), &req)
		assert.NoError(s.T(), err)
		assert.NotNil(s.T(), resp)
		createdIDs = append(createdIDs, resp.Message.ID)
	}

	// 2. 一覧で作成されたメッセージを確認
	listResp, err := s.client.ListMessages(s.T())
	assert.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(listResp.Messages), len(messages))

	// 3. 一部のメッセージを送信
	for i, id := range createdIDs {
		if i%2 == 0 { // 偶数番目のメッセージのみ送信
			err := s.client.SendMessage(s.T(), id)
			assert.NoError(s.T(), err)
		}
	}

	// 4. 送信後の状態を確認
	finalListResp, err := s.client.ListMessages(s.T())
	assert.NoError(s.T(), err)

	sentCount := 0
	draftCount := 0
	for _, message := range finalListResp.Messages {
		for i, id := range createdIDs {
			if message.ID == id {
				if i%2 == 0 {
					assert.Equal(s.T(), "sent", message.Status)
					assert.NotNil(s.T(), message.SentAt)
					sentCount++
				} else {
					assert.Equal(s.T(), "draft", message.Status)
					assert.Nil(s.T(), message.SentAt)
					draftCount++
				}
			}
		}
	}

	// 送信されたメッセージとドラフトメッセージの数を確認
	expectedSent := (len(messages) + 1) / 2 // 偶数番目の数
	expectedDraft := len(messages) - expectedSent
	assert.Equal(s.T(), expectedSent, sentCount)
	assert.Equal(s.T(), expectedDraft, draftCount)
}

// テストスイートを実行するためのエントリーポイント
func TestMessageAPIE2ETestSuite(t *testing.T) {
	// E2E_SKIP環境変数が設定されている場合はテストをスキップ
	if skipE2E := os.Getenv("E2E_SKIP"); skipE2E == "true" {
		t.Skip("E2E tests are disabled by E2E_SKIP environment variable")
	}

	suite.Run(t, new(MessageAPIE2ETestSuite))
}
