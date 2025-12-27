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

func (s *Service) GetByQuestionID(ctx context.Context, questionID uuid.UUID) ([]Response, error) {
	options, err := s.queries.GetByQuestionID(ctx, questionID)
	if err != nil {
		return nil, err
	}

	var responses []Response
	for _, option := range options {
		responses = append(responses, Response{
			OptionID:   option.ID,
			OptionText: option.Text,
		})
	}

	return responses, nil
}

func (s *Service) Create(ctx context.Context, questionID uuid.UUID, text string) (Response, error) {
	option, err := s.queries.Create(ctx, CreateParams{
		QuestionID: questionID,
		Text:       text,
	})
	if err != nil {
		return Response{}, err
	}

	return Response{
		OptionID:   option.ID,
		OptionText: option.Text,
	}, nil
}
