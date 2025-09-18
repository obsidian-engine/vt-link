package model

import (
	"time"
	"github.com/google/uuid"
)

type CampaignStatus string

const (
	CampaignStatusDraft     CampaignStatus = "draft"
	CampaignStatusScheduled CampaignStatus = "scheduled"
	CampaignStatusSent      CampaignStatus = "sent"
	CampaignStatusFailed    CampaignStatus = "failed"
)

type Campaign struct {
	ID          uuid.UUID      `json:"id" db:"id"`
	Title       string         `json:"title" db:"title"`
	Body        string         `json:"body" db:"body"`
	Status      CampaignStatus `json:"status" db:"status"`
	ScheduledAt *time.Time     `json:"scheduled_at,omitempty" db:"scheduled_at"`
	CreatedAt   time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at" db:"updated_at"`
}

// CanSend ビジネスルール：送信可能かどうか
func (c *Campaign) CanSend() bool {
	return c.Status == CampaignStatusDraft || c.Status == CampaignStatusScheduled
}

// MarkAsSent 送信済みにマーク
func (c *Campaign) MarkAsSent() {
	c.Status = CampaignStatusSent
	c.UpdatedAt = time.Now()
}

// MarkAsFailed 失敗にマーク
func (c *Campaign) MarkAsFailed() {
	c.Status = CampaignStatusFailed
	c.UpdatedAt = time.Now()
}

// Schedule スケジュール設定
func (c *Campaign) Schedule(scheduledAt time.Time) {
	c.Status = CampaignStatusScheduled
	c.ScheduledAt = &scheduledAt
	c.UpdatedAt = time.Now()
}

// NewCampaign 新しいキャンペーンを作成
func NewCampaign(title, body string) *Campaign {
	now := time.Now()
	return &Campaign{
		ID:        uuid.New(),
		Title:     title,
		Body:      body,
		Status:    CampaignStatusDraft,
		CreatedAt: now,
		UpdatedAt: now,
	}
}