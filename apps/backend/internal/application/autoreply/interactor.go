package autoreply

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/shared/errx"
	"vt-link/backend/internal/shared/logger"
)

type Interactor struct {
	ruleRepo      repository.AutoReplyRuleRepository
	userRepo      repository.UserRepository
	replier       repository.LineReplier
	channelSecret string
}

func NewInteractor(
	ruleRepo repository.AutoReplyRuleRepository,
	userRepo repository.UserRepository,
	replier repository.LineReplier,
	channelSecret string,
) Usecase {
	return &Interactor{
		ruleRepo:      ruleRepo,
		userRepo:      userRepo,
		replier:       replier,
		channelSecret: channelSecret,
	}
}

func (i *Interactor) CreateRule(ctx context.Context, input *CreateRuleInput) (*model.AutoReplyRule, error) {
	if input.Name == "" || input.ReplyMessage == "" {
		return nil, errx.ErrInvalidInput
	}

	if input.Type == model.RuleTypeKeyword && len(input.Keywords) == 0 {
		return nil, errx.NewAppError("INVALID_INPUT", "Keywords required for keyword type rule", 400)
	}

	rule := model.NewAutoReplyRule(
		input.UserID,
		input.Type,
		input.Name,
		input.Keywords,
		input.MatchType,
		input.ReplyMessage,
		input.Priority,
	)

	err := i.ruleRepo.Create(ctx, rule)
	if err != nil {
		logger.Log.Error("Failed to create auto reply rule",
			"error", err,
			"userID", input.UserID,
			"ruleType", input.Type,
		)
		return nil, errx.ErrInternalServer
	}

	return rule, nil
}

func (i *Interactor) ListRules(ctx context.Context, userID uuid.UUID) ([]*model.AutoReplyRule, error) {
	rules, err := i.ruleRepo.FindByUserID(ctx, userID)
	if err != nil {
		logger.Log.Error("Failed to list auto reply rules",
			"error", err,
			"userID", userID,
		)
		return nil, errx.ErrInternalServer
	}

	return rules, nil
}

func (i *Interactor) UpdateRule(ctx context.Context, input *UpdateRuleInput) (*model.AutoReplyRule, error) {
	rule, err := i.ruleRepo.FindByID(ctx, input.ID)
	if err != nil {
		logger.Log.Error("Failed to find rule for update",
			"error", err,
			"ruleID", input.ID,
		)
		return nil, errx.ErrNotFound
	}

	rule.UpdateFields(input.Name, input.Keywords, input.MatchType, input.ReplyMessage, input.IsEnabled, input.Priority)

	err = i.ruleRepo.Update(ctx, rule)
	if err != nil {
		logger.Log.Error("Failed to update auto reply rule",
			"error", err,
			"ruleID", input.ID,
		)
		return nil, errx.ErrInternalServer
	}

	return rule, nil
}

func (i *Interactor) DeleteRule(ctx context.Context, id uuid.UUID) error {
	err := i.ruleRepo.Delete(ctx, id)
	if err != nil {
		logger.Log.Error("Failed to delete auto reply rule",
			"error", err,
			"ruleID", id,
		)
		return errx.ErrNotFound
	}

	return nil
}

func (i *Interactor) BulkUpdateRules(ctx context.Context, input *BulkUpdateInput) error {
	if len(input.Updates) == 0 {
		return nil
	}

	items := make([]repository.BulkUpdateItem, len(input.Updates))
	for idx, u := range input.Updates {
		items[idx] = repository.BulkUpdateItem{
			ID:        u.ID,
			IsEnabled: u.IsEnabled,
		}
	}

	err := i.ruleRepo.BulkUpdateEnabled(ctx, items)
	if err != nil {
		logger.Log.Error("Failed to bulk update auto reply rules",
			"error", err,
			"count", len(items),
		)
		return errx.ErrInternalServer
	}

	return nil
}

func (i *Interactor) ProcessWebhook(ctx context.Context, input *WebhookInput) error {
	// 署名検証
	if !i.verifySignature(input.Body, input.Signature) {
		logger.Log.Warn("Invalid webhook signature")
		return errx.NewAppError("INVALID_SIGNATURE", "Invalid webhook signature", 401)
	}

	// イベントパース
	var webhookBody WebhookBody
	if err := json.Unmarshal(input.Body, &webhookBody); err != nil {
		logger.Log.Error("Failed to parse webhook body",
			"error", err,
		)
		return errx.ErrInvalidInput
	}

	// イベント処理
	for _, event := range webhookBody.Events {
		if err := i.handleEvent(ctx, webhookBody.Destination, &event); err != nil {
			logger.Log.Error("Failed to handle event",
				"error", err,
				"eventType", event.Type,
			)
			// エラーでも処理継続（一部のイベント失敗で全体が止まらないように）
		}
	}

	return nil
}

func (i *Interactor) verifySignature(body []byte, signature string) bool {
	if i.channelSecret == "" {
		logger.Log.Warn("LINE_CHANNEL_SECRET not configured, skipping signature verification")
		return true // 開発環境用
	}

	mac := hmac.New(sha256.New, []byte(i.channelSecret))
	mac.Write(body)
	expected := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(signature), []byte(expected))
}

func (i *Interactor) handleEvent(ctx context.Context, destination string, event *WebhookEvent) error {
	logger.Log.Info("Handling event",
		"eventType", event.Type,
		"destination", destination,
	)

	// destination（Bot User ID）からオーナーユーザーを特定
	user, err := i.userRepo.FindByLineBotUserID(ctx, destination)
	if err != nil {
		logger.Log.Error("Failed to find user for bot user ID",
			"error", err,
			"botUserID", destination,
		)
		return fmt.Errorf("failed to find user for bot: %w", err)
	}

	rules, err := i.ruleRepo.FindByUserID(ctx, user.ID)
	if err != nil {
		return fmt.Errorf("failed to find rules: %w", err)
	}

	switch event.Type {
	case "follow":
		return i.handleFollowEvent(ctx, event, rules)
	case "message":
		return i.handleMessageEvent(ctx, event, rules)
	default:
		logger.Log.Info("Unsupported event type",
			"eventType", event.Type,
		)
		return nil
	}
}

func (i *Interactor) handleFollowEvent(ctx context.Context, event *WebhookEvent, rules []*model.AutoReplyRule) error {
	for _, rule := range rules {
		if !rule.IsEnabled || rule.Type != model.RuleTypeFollow {
			continue
		}

		// follow typeのルールで返信
		return i.sendReply(ctx, event.ReplyToken, rule.ReplyMessage)
	}

	return nil
}

func (i *Interactor) handleMessageEvent(ctx context.Context, event *WebhookEvent, rules []*model.AutoReplyRule) error {
	if event.Message == nil || event.Message.Type != "text" {
		return nil
	}

	messageText := event.Message.Text

	for _, rule := range rules {
		if !rule.IsEnabled || rule.Type != model.RuleTypeKeyword {
			continue
		}

		if i.matchKeywords(messageText, rule.Keywords, rule.MatchType) {
			return i.sendReply(ctx, event.ReplyToken, rule.ReplyMessage)
		}
	}

	return nil
}

func (i *Interactor) matchKeywords(text string, keywords []string, matchType *model.MatchType) bool {
	if matchType == nil {
		return false
	}

	for _, keyword := range keywords {
		switch *matchType {
		case model.MatchTypeExact:
			if text == keyword {
				return true
			}
		case model.MatchTypePartial:
			if strings.Contains(text, keyword) {
				return true
			}
		}
	}

	return false
}

func (i *Interactor) sendReply(ctx context.Context, replyToken, message string) error {
	return i.replier.Reply(ctx, replyToken, message)
}

// Webhook構造体
type WebhookBody struct {
	Destination string         `json:"destination"`
	Events      []WebhookEvent `json:"events"`
}

type WebhookEvent struct {
	Type       string          `json:"type"`
	ReplyToken string          `json:"replyToken"`
	Source     WebhookSource   `json:"source"`
	Message    *WebhookMessage `json:"message,omitempty"`
}

type WebhookSource struct {
	Type   string `json:"type"`
	UserID string `json:"userId"`
}

type WebhookMessage struct {
	Type string `json:"type"`
	Text string `json:"text"`
}
