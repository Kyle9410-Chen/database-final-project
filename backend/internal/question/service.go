package question

import (
	"context"
	"database-final-project/internal/question/options"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Querier interface {
	GetByFormID(ctx context.Context, formID uuid.UUID) ([]Question, error)
	Create(ctx context.Context, arg CreateParams) (Question, error)
}

type optionStore interface {
	Create(ctx context.Context, questionID uuid.UUID, text string) (options.Option, error)
	GetByQuestionID(ctx context.Context, questionID uuid.UUID) ([]options.Option, error)
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

func (s *Service) GetByFormID(ctx context.Context, formID uuid.UUID) ([]OptionsQuestion, error) {
	question, err := s.queries.GetByFormID(ctx, formID)
	if err != nil {
		return nil, err
	}

	os, err := s.optionStore.GetByQuestionID(ctx, formID)
	if err != nil {
		return nil, err
	}

	var optionsQuestions []OptionsQuestion
	for _, q := range question {
		optionsQuestions = append(optionsQuestions, OptionsQuestion{
			QuestionType: q.Type,
			QuestionText: q.Text,
			IsRequired:   q.IsRequired,
			Options:      os,
		})
	}

	return optionsQuestions, nil
}

func (s *Service) Create(ctx context.Context, formID uuid.UUID, questionText string, questionType string, isRequired bool, optionsReq []string) (OptionsQuestion, error) {
	question, err := s.queries.Create(ctx, CreateParams{
		FormID:     formID,
		Text:       questionText,
		Type:       QuestionType(questionType),
		IsRequired: isRequired,
	})
	if err != nil {
		return OptionsQuestion{}, err
	}

	os := make([]options.Option, len(optionsReq))
	for i, optionText := range optionsReq {
		option, err := s.optionStore.Create(ctx, question.ID, optionText)
		if err != nil {
			return OptionsQuestion{}, err
		}
		os[i] = option
	}

	return OptionsQuestion{
		QuestionType: question.Type,
		QuestionText: question.Text,
		IsRequired:   question.IsRequired,
		Options:      os,
	}, err
}
