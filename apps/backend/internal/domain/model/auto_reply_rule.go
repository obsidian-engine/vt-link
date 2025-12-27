package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type AutoReplyRuleType string
type MatchType string

const (
	RuleTypeFollow  AutoReplyRuleType = "follow"
	RuleTypeKeyword AutoReplyRuleType = "keyword"

	MatchTypeExact   MatchType = "exact"
	MatchTypePartial MatchType = "partial"
)

type AutoReplyRule struct {
	ID           uuid.UUID         `json:"id" db:"id"`
	UserID       uuid.UUID         `json:"userId" db:"user_id"`
	Type         AutoReplyRuleType `json:"type" db:"type"`
	Name         string            `json:"name" db:"name"`
	Keywords     pq.StringArray    `json:"keywords" db:"keywords"`
	MatchType    *MatchType        `json:"matchType,omitempty" db:"match_type"`
	ReplyMessage string            `json:"replyMessage" db:"reply_message"`
	IsEnabled    bool              `json:"isEnabled" db:"is_enabled"`
	Priority     int               `json:"priority" db:"priority"`
	CreatedAt    time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time         `json:"updatedAt" db:"updated_at"`
}

// NewAutoReplyRule 新しいAutoReplyRuleを作成
func NewAutoReplyRule(userID uuid.UUID, ruleType AutoReplyRuleType, name string, keywords []string, matchType *MatchType, replyMessage string, priority int) *AutoReplyRule {
	now := time.Now()
	return &AutoReplyRule{
		ID:           uuid.New(),
		UserID:       userID,
		Type:         ruleType,
		Name:         name,
		Keywords:     keywords,
		MatchType:    matchType,
		ReplyMessage: replyMessage,
		IsEnabled:    true,
		Priority:     priority,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}

// UpdateFields ルールのフィールドを更新
func (r *AutoReplyRule) UpdateFields(name *string, keywords []string, matchType *MatchType, replyMessage *string, isEnabled *bool, priority *int) {
	if name != nil {
		r.Name = *name
	}
	if keywords != nil {
		r.Keywords = keywords
	}
	if matchType != nil {
		r.MatchType = matchType
	}
	if replyMessage != nil {
		r.ReplyMessage = *replyMessage
	}
	if isEnabled != nil {
		r.IsEnabled = *isEnabled
	}
	if priority != nil {
		r.Priority = *priority
	}
	r.UpdatedAt = time.Now()
}
