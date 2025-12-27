package autoreply

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/external"
	"vt-link/backend/internal/shared/errx"
)

type Interactor struct {
	ruleRepo      repository.AutoReplyRuleRepository
	replier       *external.LineReplier
	channelSecret string
}

func NewInteractor(
	ruleRepo repository.AutoReplyRuleRepository,
	replier *external.LineReplier,
) Usecase {
	return &Interactor{
		ruleRepo:      ruleRepo,
		replier:       replier,
		channelSecret: os.Getenv("LINE_CHANNEL_SECRET"),
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
		log.Printf("Failed to create auto reply rule: %v", err)
		return nil, errx.ErrInternalServer
	}

	return rule, nil
}

func (i *Interactor) ListRules(ctx context.Context, userID uuid.UUID) ([]*model.AutoReplyRule, error) {
	rules, err := i.ruleRepo.FindByUserID(ctx, userID)
	if err != nil {
		log.Printf("Failed to list auto reply rules: %v", err)
		return nil, errx.ErrInternalServer
	}

	return rules, nil
}

func (i *Interactor) UpdateRule(ctx context.Context, input *UpdateRuleInput) (*model.AutoReplyRule, error) {
	rule, err := i.ruleRepo.FindByID(ctx, input.ID)
	if err != nil {
		log.Printf("Failed to find rule for update: %v", err)
		return nil, errx.ErrNotFound
	}

	rule.UpdateFields(input.Name, input.Keywords, input.MatchType, input.ReplyMessage, input.IsEnabled, input.Priority)

	err = i.ruleRepo.Update(ctx, rule)
	if err != nil {
		log.Printf("Failed to update auto reply rule: %v", err)
		return nil, errx.ErrInternalServer
	}

	return rule, nil
}

func (i *Interactor) DeleteRule(ctx context.Context, id uuid.UUID) error {
	err := i.ruleRepo.Delete(ctx, id)
	if err != nil {
		log.Printf("Failed to delete auto reply rule: %v", err)
		return errx.ErrNotFound
	}

	return nil
}

func (i *Interactor) ProcessWebhook(ctx context.Context, input *WebhookInput) error {
	// 署名検証
	if !i.verifySignature(input.Body, input.Signature) {
		log.Printf("Invalid webhook signature")
		return errx.NewAppError("INVALID_SIGNATURE", "Invalid webhook signature", 401)
	}

	// イベントパース
	var webhookBody WebhookBody
	if err := json.Unmarshal(input.Body, &webhookBody); err != nil {
		log.Printf("Failed to parse webhook body: %v", err)
		return errx.ErrInvalidInput
	}

	// イベント処理
	for _, event := range webhookBody.Events {
		if err := i.handleEvent(ctx, &event); err != nil {
			log.Printf("Failed to handle event: %v", err)
			// エラーでも処理継続（一部のイベント失敗で全体が止まらないように）
		}
	}

	return nil
}

func (i *Interactor) verifySignature(body []byte, signature string) bool {
	if i.channelSecret == "" {
		log.Println("LINE_CHANNEL_SECRET not configured, skipping signature verification")
		return true // 開発環境用
	}

	mac := hmac.New(sha256.New, []byte(i.channelSecret))
	mac.Write(body)
	expected := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(signature), []byte(expected))
}

func (i *Interactor) handleEvent(ctx context.Context, event *WebhookEvent) error {
	log.Printf("Handling event type: %s", event.Type)

	// TODO: userIDをLINE userIDから取得する処理が必要
	// 暫定的にダミーのuserIDを使用
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")

	rules, err := i.ruleRepo.FindByUserID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to find rules: %w", err)
	}

	switch event.Type {
	case "follow":
		return i.handleFollowEvent(ctx, event, rules)
	case "message":
		return i.handleMessageEvent(ctx, event, rules)
	default:
		log.Printf("Unsupported event type: %s", event.Type)
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
