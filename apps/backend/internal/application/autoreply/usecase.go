package autoreply

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type CreateRuleInput struct {
	UserID       uuid.UUID              `json:"userId"`
	Type         model.AutoReplyRuleType `json:"type"`
	Name         string                 `json:"name"`
	Keywords     []string               `json:"keywords"`
	MatchType    *model.MatchType       `json:"matchType"`
	ReplyMessage string                 `json:"replyMessage"`
	Priority     int                    `json:"priority"`
}

type UpdateRuleInput struct {
	ID           uuid.UUID        `json:"id"`
	Name         *string          `json:"name"`
	Keywords     []string         `json:"keywords"`
	MatchType    *model.MatchType `json:"matchType"`
	ReplyMessage *string          `json:"replyMessage"`
	IsEnabled    *bool            `json:"isEnabled"`
	Priority     *int             `json:"priority"`
}

// BulkUpdateRuleInput 一括更新用の入力
type BulkUpdateRuleInput struct {
	ID        uuid.UUID `json:"id"`
	IsEnabled bool      `json:"isEnabled"`
}

// BulkUpdateInput 一括更新リクエスト
type BulkUpdateInput struct {
	Updates []BulkUpdateRuleInput `json:"updates"`
}

type WebhookInput struct {
	Signature string `json:"-"`
	Body      []byte `json:"-"`
}

type Usecase interface {
	// CreateRule 自動返信ルールを作成
	CreateRule(ctx context.Context, input *CreateRuleInput) (*model.AutoReplyRule, error)

	// ListRules ユーザーのルール一覧を取得
	ListRules(ctx context.Context, userID uuid.UUID) ([]*model.AutoReplyRule, error)

	// UpdateRule ルールを更新
	UpdateRule(ctx context.Context, input *UpdateRuleInput) (*model.AutoReplyRule, error)

	// BulkUpdateRules 複数ルールの有効/無効を一括更新
	BulkUpdateRules(ctx context.Context, input *BulkUpdateInput) error

	// DeleteRule ルールを削除
	DeleteRule(ctx context.Context, id uuid.UUID) error

	// ProcessWebhook LINE Webhookイベントを処理
	ProcessWebhook(ctx context.Context, input *WebhookInput) error
}
