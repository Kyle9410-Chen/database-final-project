package options

import (
	"context"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Querier interface {
	Create(ctx context.Context, arg CreateParams) (Option, error)
	GetByQuestionID(ctx context.Context, questionID uuid.UUID) ([]Option, error)
}

type Service struct {
	logger  *zap.Logger
	queries Querier
}

func NewService(logger *zap.Logger, queries Querier) *Service {
	return &Service{
		logger:  logger,
		queries: queries,
	}
}

func (s *Service) GetByQuestionID(ctx context.Context, questionID uuid.UUID) ([]Option, error) {
	return s.queries.GetByQuestionID(ctx, questionID)
}

func (s *Service) Create(ctx context.Context, questionID uuid.UUID, text string) (Option, error) {
	return s.queries.Create(ctx, CreateParams{
		QuestionID: questionID,
		Text:       text,
	})
}
