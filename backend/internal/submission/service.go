package submission

import (
	"context"
	"database-final-project/internal/answer"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Querier interface {
	GetByFormID(ctx context.Context, id uuid.UUID) ([]Submission, error)
	Create(ctx context.Context, formID uuid.UUID) (Submission, error)
}

type answerStore interface {
	GetBySubmissionID(ctx context.Context, submissionID uuid.UUID) ([]answer.Response, error)
	Create(ctx context.Context, submissionID uuid.UUID, questionID uuid.UUID, answerText string, answerOptions []uuid.UUID) error
}

type Service struct {
	logger      *zap.Logger
	queries     Querier
	answerStore answerStore
}

func NewService(logger *zap.Logger, queries Querier, answerStore answerStore) *Service {
	return &Service{
		logger:      logger,
		queries:     queries,
		answerStore: answerStore,
	}
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) ([]AnswersSubmission, error) {
	submissions, err := s.queries.GetByFormID(ctx, id)
	if err != nil {
		return nil, err
	}

	answersSubmissions := make([]AnswersSubmission, len(submissions))
	for i, submission := range submissions {
		answers, err := s.answerStore.GetBySubmissionID(ctx, submission.ID)
		if err != nil {
			return nil, err
		}
		answersSubmissions[i] = AnswersSubmission{
			SubmissionID: submission.ID,
			Answers:      answers,
		}

	}

	return answersSubmissions, nil
}

func (s *Service) Create(ctx context.Context, formID uuid.UUID, answerReqs []answer.Request) error {
	submission, err := s.queries.Create(ctx, formID)
	if err != nil {
		return err
	}

	for _, answerReq := range answerReqs {
		err := s.answerStore.Create(ctx, submission.ID, answerReq.QuestionID, answerReq.AnswerText, answerReq.AnswerOptions)
		if err != nil {
			return err
		}
	}

	return nil
}
