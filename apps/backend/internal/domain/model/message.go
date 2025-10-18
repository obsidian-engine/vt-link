package model

import (
	"github.com/google/uuid"
	"time"
)

type MessageStatus string

const (
	MessageStatusDraft     MessageStatus = "draft"
	MessageStatusScheduled MessageStatus = "scheduled"
	MessageStatusSent      MessageStatus = "sent"
	MessageStatusFailed    MessageStatus = "failed"
)

type Message struct {
	ID          uuid.UUID     `json:"id" db:"id"`
	Title       string        `json:"title" db:"title"`
	Body        string        `json:"body" db:"message"`
	Status      MessageStatus `json:"status" db:"status"`
	ScheduledAt *time.Time    `json:"scheduled_at,omitempty" db:"scheduled_at"`
	SentAt      *time.Time    `json:"sent_at,omitempty" db:"sent_at"`
	CreatedAt   time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at" db:"updated_at"`
}

// CanSend ビジネスルール：送信可能かどうか
func (m *Message) CanSend() bool {
	return m.Status == MessageStatusDraft || m.Status == MessageStatusScheduled || m.Status == MessageStatusFailed
}

// MarkAsSent 送信済みにマーク
func (m *Message) MarkAsSent() {
	// 冪等性: 既に送信済みなら更新しない
	if m.Status != MessageStatusSent || m.SentAt == nil {
		now := time.Now()
		m.SentAt = &now
	}
	m.Status = MessageStatusSent
	m.UpdatedAt = time.Now()
}

// MarkAsFailed 失敗にマーク
func (m *Message) MarkAsFailed() {
	m.Status = MessageStatusFailed
	m.UpdatedAt = time.Now()
}

// Schedule スケジュール設定
func (m *Message) Schedule(scheduledAt time.Time) {
	m.Status = MessageStatusScheduled
	m.ScheduledAt = &scheduledAt
	m.UpdatedAt = time.Now()
}

// NewMessage 新しいメッセージを作成
func NewMessage(title, body string) *Message {
	now := time.Now()
	return &Message{
		ID:        uuid.New(),
		Title:     title,
		Body:      body,
		Status:    MessageStatusDraft,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
