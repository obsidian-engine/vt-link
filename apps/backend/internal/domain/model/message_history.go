package model

import (
	"github.com/google/uuid"
	"time"
)

type MessageHistoryStatus string

const (
	MessageHistoryStatusPending MessageHistoryStatus = "pending"
	MessageHistoryStatusSent    MessageHistoryStatus = "sent"
	MessageHistoryStatusFailed  MessageHistoryStatus = "failed"
)

type MessageHistory struct {
	ID             uuid.UUID            `json:"id" db:"id"`
	UserID         uuid.UUID            `json:"user_id" db:"user_id"`
	MessageID      uuid.UUID            `json:"message_id" db:"message_id"`
	Status         MessageHistoryStatus `json:"status" db:"status"`
	SentAt         *time.Time           `json:"sent_at,omitempty" db:"sent_at"`
	RecipientCount int                  `json:"recipient_count" db:"recipient_count"`
	ErrorMessage   *string              `json:"error_message,omitempty" db:"error_message"`
	CreatedAt      time.Time            `json:"created_at" db:"created_at"`
}

// MarkAsSent 送信成功にマーク
func (mh *MessageHistory) MarkAsSent(recipientCount int) {
	now := time.Now()
	mh.Status = MessageHistoryStatusSent
	mh.SentAt = &now
	mh.RecipientCount = recipientCount
	mh.ErrorMessage = nil
}

// MarkAsFailed 送信失敗にマーク
func (mh *MessageHistory) MarkAsFailed(errorMsg string) {
	mh.Status = MessageHistoryStatusFailed
	mh.ErrorMessage = &errorMsg
}

// NewMessageHistory 新しい配信履歴を作成
func NewMessageHistory(userID, messageID uuid.UUID) *MessageHistory {
	now := time.Now()
	return &MessageHistory{
		ID:             uuid.New(),
		UserID:         userID,
		MessageID:      messageID,
		Status:         MessageHistoryStatusPending,
		RecipientCount: 0,
		CreatedAt:      now,
	}
}
