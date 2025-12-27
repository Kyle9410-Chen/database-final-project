package form

import (
	"context"
	"database-final-project/internal/question"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Querier interface {
	GetAll(ctx context.Context) ([]Form, error)
	GetByID(ctx context.Context, id uuid.UUID) (Form, error)
	Create(ctx context.Context, title string) (Form, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type questionStore interface {
	GetByFormID(ctx context.Context, formID uuid.UUID) ([]question.OptionsQuestion, error)
	Create(ctx context.Context, formID uuid.UUID, questionText string, questionType string, isRequired bool, optionsReq []string) (question.OptionsQuestion, error)
}

type Service struct {
	logger        *zap.Logger
	querier       Querier
	questionStore questionStore
}

func NewService(logger *zap.Logger, querier Querier, questionStore questionStore) *Service {
	return &Service{
		logger:        logger,
		querier:       querier,
		questionStore: questionStore,
	}
}

func (s *Service) GetAll(ctx context.Context) ([]QuestionsForm, error) {
	forms, err := s.querier.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	var questionsForms []QuestionsForm
	for _, form := range forms {
		q, err := s.questionStore.GetByFormID(ctx, form.ID)
		if err != nil {
			return nil, err
		}
		questionsForms = append(questionsForms, QuestionsForm{
			FormID:    form.ID,
			Title:     form.Title,
			Questions: q,
		})
	}

	return questionsForms, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (QuestionsForm, error) {
	forms, err := s.querier.GetByID(ctx, id)
	if err != nil {
		return QuestionsForm{}, err
	}

	questions, err := s.questionStore.GetByFormID(ctx, forms.ID)
	if err != nil {
		return QuestionsForm{}, err
	}

	return QuestionsForm{
		FormID:    forms.ID,
		Title:     forms.Title,
		Questions: questions,
	}, nil
}

func (s *Service) Create(ctx context.Context, title string, questionRequest []QuestionRequest) (QuestionsForm, error) {
	form, err := s.querier.Create(ctx, title)
	if err != nil {
		return QuestionsForm{}, err
	}

	questions := make([]question.OptionsQuestion, len(questionRequest))
	for i, questionRequest := range questionRequest {
		q, err := s.questionStore.Create(ctx, form.ID, questionRequest.QuestionText, string(questionRequest.QuestionType), questionRequest.IsRequired, questionRequest.Options)
		questions[i] = q
		if err != nil {
			return QuestionsForm{}, err
		}
	}

	return QuestionsForm{
		FormID:    form.ID,
		Title:     form.Title,
		Questions: questions,
	}, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	return s.querier.Delete(ctx, id)
}
