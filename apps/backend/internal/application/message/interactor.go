package message

import (
	"context"
	"fmt"
	"log"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/domain/service"
	"vt-link/backend/internal/shared/clock"
	"vt-link/backend/internal/shared/errx"
)

type Interactor struct {
	messageRepo repository.MessageRepository
	txManager   repository.TxManager
	pusher      service.Pusher
	clock       clock.Clock
}

func NewInteractor(
	messageRepo repository.MessageRepository,
	txManager repository.TxManager,
	pusher service.Pusher,
	clock clock.Clock,
) Usecase {
	return &Interactor{
		messageRepo: messageRepo,
		txManager:   txManager,
		pusher:      pusher,
		clock:       clock,
	}
}

func (i *Interactor) CreateMessage(ctx context.Context, input *CreateMessageInput) (*model.Message, error) {
	if input.Title == "" || input.Body == "" {
		return nil, errx.ErrInvalidInput
	}

	message := model.NewMessage(input.Title, input.Body)

	err := i.messageRepo.Create(ctx, message)
	if err != nil {
		log.Printf("Failed to create message: %v", err)
		return nil, errx.ErrInternalServer
	}

	return message, nil
}

func (i *Interactor) ListMessages(ctx context.Context, input *ListMessagesInput) ([]*model.Message, error) {
	limit := input.Limit
	if limit <= 0 || limit > 100 {
		limit = 100 // デフォルト100件、最大100件
	}

	offset := input.Offset
	if offset < 0 {
		offset = 0
	}

	messages, err := i.messageRepo.List(ctx, limit, offset)
	if err != nil {
		log.Printf("Failed to list messages: %v", err)
		return nil, errx.ErrInternalServer
	}

	return messages, nil
}

func (i *Interactor) GetMessage(ctx context.Context, id uuid.UUID) (*model.Message, error) {
	message, err := i.messageRepo.FindByID(ctx, id)
	if err != nil {
		log.Printf("Failed to find message: %v", err)
		return nil, errx.ErrNotFound
	}

	return message, nil
}

func (i *Interactor) SendMessage(ctx context.Context, input *SendMessageInput) error {
	return i.txManager.WithinTx(ctx, func(ctx context.Context) error {
		message, err := i.messageRepo.FindByID(ctx, input.ID)
		if err != nil {
			log.Printf("Failed to find message for send: %v", err)
			return errx.ErrNotFound
		}

		if !message.CanSend() {
			return errx.NewAppError("CANNOT_SEND", "Message cannot be sent", 400)
		}

		// LINE Push送信
		text := fmt.Sprintf("%s\n\n%s", message.Title, message.Body)
		err = i.pusher.PushText(ctx, text)
		if err != nil {
			log.Printf("Failed to push message: %v", err)
			message.MarkAsFailed()
			i.messageRepo.Update(ctx, message)
			return errx.NewAppError("PUSH_FAILED", "Failed to send message", 500)
		}

		// 送信成功
		message.MarkAsSent()
		err = i.messageRepo.Update(ctx, message)
		if err != nil {
			log.Printf("Failed to update message status: %v", err)
			return errx.ErrInternalServer
		}

		return nil
	})
}

func (i *Interactor) RunScheduler(ctx context.Context, input *SchedulerInput) (int, error) {
	limit := input.Limit
	if limit <= 0 || limit > 50 {
		limit = 50 // デフォルト50件、最大50件（Vercel Functions のタイムアウト対策）
	}

	messages, err := i.messageRepo.FindScheduledMessages(ctx, input.Now, limit)
	if err != nil {
		log.Printf("Failed to find scheduled messages: %v", err)
		return 0, errx.ErrInternalServer
	}

	sentCount := 0
	for _, message := range messages {
		sendInput := &SendMessageInput{ID: message.ID}
		err := i.SendMessage(ctx, sendInput)
		if err != nil {
			log.Printf("Failed to send scheduled message %s: %v", message.ID, err)
			continue
		}
		sentCount++
	}

	log.Printf("Scheduler processed %d messages, sent %d successfully", len(messages), sentCount)
	return sentCount, nil
}
