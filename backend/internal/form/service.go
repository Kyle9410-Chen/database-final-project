package form

import (
	"context"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Querier interface {
	GetAll(ctx context.Context) ([]Form, error)
	GetByID(ctx context.Context, id uuid.UUID) (Form, error)
	Create(ctx context.Context, title string) (Form, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type Service struct {
	logger  *zap.Logger
	querier Querier
}

func NewService(logger *zap.Logger, querier Querier) *Service {
	return &Service{
		logger:  logger,
		querier: querier,
	}
}

func (s *Service) GetAll(ctx context.Context) ([]Form, error) {
	return s.querier.GetAll(ctx)
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (Form, error) {
	return s.querier.GetByID(ctx, id)
}
func (s *Service) Create(ctx context.Context, title string) (Form, error) {
	return s.querier.Create(ctx, title)
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	return s.querier.Delete(ctx, id)
}
