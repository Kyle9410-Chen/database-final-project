package answer

import (
	"context"
	"database-final-project/internal/options"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

type Querier interface {
	GetBySubmissionID(ctx context.Context, submissionID uuid.UUID) ([]GetBySubmissionIDRow, error)
	Create(ctx context.Context, params CreateParams) (Answer, error)
}

type optionStore interface {
	GetByQuestionID(ctx context.Context, id uuid.UUID) ([]options.Response, error)
}

type Service struct {
	logger      *zap.Logger
	queries     Querier
	optionStore optionStore
}

func NewService(logger *zap.Logger, queries Querier, optionStore optionStore) *Service {
	return &Service{
		logger:      logger,
		queries:     queries,
		optionStore: optionStore,
	}
}

func (s *Service) GetBySubmissionID(ctx context.Context, submissionID uuid.UUID) ([]Response, error) {
	answers, err := s.queries.GetBySubmissionID(ctx, submissionID)
	if err != nil {
		return nil, err
	}

	responses := make([]Response, len(answers))
	for i, answer := range answers {
		os, err := s.optionStore.GetByQuestionID(ctx, answer.QuestionID)
		if err != nil {
			return nil, err
		}
		responses[i] = Response{
			QuestionID:    answer.QuestionID,
			QuestionType:  string(answer.Type),
			IsRequired:    answer.IsRequired,
			QuestionText:  answer.Text,
			Options:       os,
			AnswerOptions: answer.AnswerOptions,
			AnswerText:    answer.AnswerText.String,
		}
	}

	return responses, nil
}

func (s *Service) Create(ctx context.Context, submissionID uuid.UUID, questionID uuid.UUID, answerText string, answerOptions []uuid.UUID) error {
	_, err := s.queries.Create(ctx, CreateParams{
		SubmissionID:  submissionID,
		QuestionID:    questionID,
		AnswerText:    pgtype.Text{String: answerText, Valid: answerText != ""},
		AnswerOptions: answerOptions,
	})
	if err != nil {
		return err
	}

	return nil
}
