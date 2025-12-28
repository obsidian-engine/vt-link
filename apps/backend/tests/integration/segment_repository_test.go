package integration

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/db"
	"vt-link/backend/internal/infrastructure/db/pg"
)

type SegmentRepositoryIntegrationTestSuite struct {
	suite.Suite
	testDB *TestDB
	repo   repository.SegmentRepository
	ctx    context.Context
	userID uuid.UUID
}

func (s *SegmentRepositoryIntegrationTestSuite) SetupSuite() {
	s.testDB = SetupTestDB(s.T())
	dbWrapper := &db.DB{DB: s.testDB.DB}
	s.repo = pg.NewSegmentRepository(dbWrapper)
	s.ctx = context.Background()
	s.userID = uuid.New()
}

func (s *SegmentRepositoryIntegrationTestSuite) TearDownSuite() {
	s.testDB.TeardownTestDB()
}

func (s *SegmentRepositoryIntegrationTestSuite) SetupTest() {
	// テストごとにデータをクリア
	s.testDB.ClearAllTables(s.T())

	// テスト用ユーザーを作成
	s.createTestUser(s.userID)
}

func (s *SegmentRepositoryIntegrationTestSuite) createTestUser(userID uuid.UUID) {
	query := `
		INSERT INTO users (id, line_user_id, display_name, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		ON CONFLICT (id) DO NOTHING
	`
	_, err := s.testDB.DB.ExecContext(s.ctx, query, userID, "test-line-user", "テストユーザー")
	assert.NoError(s.T(), err)
}

func (s *SegmentRepositoryIntegrationTestSuite) TestList_NoData() {
	// Arrange: データなし

	// Act
	segments, err := s.repo.List(s.ctx, s.userID)

	// Assert: 定義済みセグメントのみ（カウント0）
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), segments)
	assert.GreaterOrEqual(s.T(), len(segments), 3, "定義済みセグメントが存在")

	// 定義済みセグメントの確認
	segmentMap := make(map[string]int)
	for _, seg := range segments {
		segmentMap[seg.ID] = seg.Count
	}
	assert.Equal(s.T(), 0, segmentMap["active"], "アクティブユーザー")
	assert.Equal(s.T(), 0, segmentMap["new"], "新規ユーザー")
	assert.Equal(s.T(), 0, segmentMap["blocked"], "ブロック済み")
}

func (s *SegmentRepositoryIntegrationTestSuite) TestList_WithActiveUsers() {
	// Arrange: アクティブユーザーを作成
	now := time.Now()

	// 30日以内にインタラクション（アクティブ）
	s.createTestFan(s.userID, "active1", false, now.Add(-10*24*time.Hour), &now)
	s.createTestFan(s.userID, "active2", false, now.Add(-20*24*time.Hour), nowPtr(now.Add(-5*24*time.Hour)))

	// 30日以上前（非アクティブ）
	s.createTestFan(s.userID, "inactive1", false, now.Add(-40*24*time.Hour), nowPtr(now.Add(-35*24*time.Hour)))

	// Act
	segments, err := s.repo.List(s.ctx, s.userID)

	// Assert
	assert.NoError(s.T(), err)
	segmentMap := make(map[string]int)
	for _, seg := range segments {
		segmentMap[seg.ID] = seg.Count
	}
	assert.Equal(s.T(), 2, segmentMap["active"], "アクティブユーザーは2人")
}

func (s *SegmentRepositoryIntegrationTestSuite) TestList_WithNewUsers() {
	// Arrange: 新規ユーザーを作成
	now := time.Now()

	// 7日以内にフォロー（新規）
	s.createTestFan(s.userID, "new1", false, now.Add(-2*24*time.Hour), nil)
	s.createTestFan(s.userID, "new2", false, now.Add(-5*24*time.Hour), nil)

	// 7日以上前にフォロー（既存）
	s.createTestFan(s.userID, "old1", false, now.Add(-10*24*time.Hour), nil)

	// Act
	segments, err := s.repo.List(s.ctx, s.userID)

	// Assert
	assert.NoError(s.T(), err)
	segmentMap := make(map[string]int)
	for _, seg := range segments {
		segmentMap[seg.ID] = seg.Count
	}
	assert.Equal(s.T(), 2, segmentMap["new"], "新規ユーザーは2人")
}

func (s *SegmentRepositoryIntegrationTestSuite) TestList_WithBlockedUsers() {
	// Arrange: ブロック済みユーザーを作成
	now := time.Now()

	s.createTestFan(s.userID, "fan1", false, now, nil)
	s.createTestFan(s.userID, "fan2", false, now, nil)
	s.createTestFan(s.userID, "blocked1", true, now, nil)
	s.createTestFan(s.userID, "blocked2", true, now, nil)

	// Act
	segments, err := s.repo.List(s.ctx, s.userID)

	// Assert
	assert.NoError(s.T(), err)
	segmentMap := make(map[string]int)
	for _, seg := range segments {
		segmentMap[seg.ID] = seg.Count
	}
	assert.Equal(s.T(), 2, segmentMap["blocked"], "ブロック済みユーザーは2人")
}

func (s *SegmentRepositoryIntegrationTestSuite) TestList_WithTagSegments() {
	// Arrange: タグ付きファンを作成
	now := time.Now()

	s.createTestFanWithTags(s.userID, "fan1", false, now, nil, []string{"VIP", "購入者"})
	s.createTestFanWithTags(s.userID, "fan2", false, now, nil, []string{"VIP"})
	s.createTestFanWithTags(s.userID, "fan3", false, now, nil, []string{"購入者"})
	s.createTestFanWithTags(s.userID, "fan4", false, now, nil, []string{"イベント参加"})

	// Act
	segments, err := s.repo.List(s.ctx, s.userID)

	// Assert
	assert.NoError(s.T(), err)

	// タグセグメントの確認
	tagSegments := make(map[string]int)
	for _, seg := range segments {
		switch seg.ID {
		case "tag_VIP":
			tagSegments["VIP"] = seg.Count
		case "tag_購入者":
			tagSegments["購入者"] = seg.Count
		case "tag_イベント参加":
			tagSegments["イベント参加"] = seg.Count
		}
	}

	assert.Equal(s.T(), 2, tagSegments["VIP"], "VIPタグは2人")
	assert.Equal(s.T(), 2, tagSegments["購入者"], "購入者タグは2人")
	assert.Equal(s.T(), 1, tagSegments["イベント参加"], "イベント参加タグは1人")
}

func (s *SegmentRepositoryIntegrationTestSuite) TestList_DifferentUser() {
	// Arrange: 別ユーザーのデータを作成
	otherUserID := uuid.New()
	s.createTestUser(otherUserID)
	now := time.Now()
	s.createTestFanWithTags(otherUserID, "other-fan", false, now, nil, []string{"他ユーザータグ"})

	// Act
	segments, err := s.repo.List(s.ctx, s.userID)

	// Assert: 他ユーザーのデータは含まれない
	assert.NoError(s.T(), err)
	for _, seg := range segments {
		if seg.ID == "tag_他ユーザータグ" {
			assert.Fail(s.T(), "他ユーザーのタグが含まれている")
		}
	}
}

func (s *SegmentRepositoryIntegrationTestSuite) TestList_AllSegments() {
	// Arrange: 全タイプのデータを作成
	now := time.Now()

	// アクティブ
	s.createTestFan(s.userID, "active1", false, now.Add(-10*24*time.Hour), &now)

	// 新規
	s.createTestFan(s.userID, "new1", false, now.Add(-2*24*time.Hour), nil)

	// ブロック済み
	s.createTestFan(s.userID, "blocked1", true, now, nil)

	// タグ付き
	s.createTestFanWithTags(s.userID, "tagged1", false, now, nil, []string{"タグA"})

	// Act
	segments, err := s.repo.List(s.ctx, s.userID)

	// Assert: すべてのセグメントタイプが存在
	assert.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(segments), 4, "定義済み3つ + タグ1つ")

	segmentIDs := make([]string, len(segments))
	for i, seg := range segments {
		segmentIDs[i] = seg.ID
	}

	assert.Contains(s.T(), segmentIDs, "active")
	assert.Contains(s.T(), segmentIDs, "new")
	assert.Contains(s.T(), segmentIDs, "blocked")
	assert.Contains(s.T(), segmentIDs, "tag_タグA")
}

// ヘルパーメソッド

func (s *SegmentRepositoryIntegrationTestSuite) createTestFan(userID uuid.UUID, lineUserID string, isBlocked bool, followedAt time.Time, lastInteractionAt *time.Time) {
	query := `
		INSERT INTO fans (id, user_id, line_user_id, display_name, is_blocked, followed_at, last_interaction_at, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
	`
	_, err := s.testDB.DB.ExecContext(s.ctx, query, userID, lineUserID, "ファン"+lineUserID, isBlocked, followedAt, lastInteractionAt)
	assert.NoError(s.T(), err)
}

func (s *SegmentRepositoryIntegrationTestSuite) createTestFanWithTags(userID uuid.UUID, lineUserID string, isBlocked bool, followedAt time.Time, lastInteractionAt *time.Time, tags []string) {
	query := `
		INSERT INTO fans (id, user_id, line_user_id, display_name, is_blocked, followed_at, last_interaction_at, tags, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
	`
	_, err := s.testDB.DB.ExecContext(s.ctx, query, userID, lineUserID, "ファン"+lineUserID, isBlocked, followedAt, lastInteractionAt, pq.Array(tags))
	assert.NoError(s.T(), err)
}

func nowPtr(t time.Time) *time.Time {
	return &t
}

// テストスイート実行
func TestSegmentRepositoryIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(SegmentRepositoryIntegrationTestSuite))
}
