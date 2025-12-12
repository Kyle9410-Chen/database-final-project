package form

import (
	"context"
	"database-final-project/internal"
	"net/http"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type CreateRequest struct {
	Title string `json:"title" validate:"required,min=1,max=255"`
}

type Response struct {
	ID          uuid.UUID `json:"form_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
}

type Store interface {
	GetAll(ctx context.Context) ([]Form, error)
	GetByID(ctx context.Context, id uuid.UUID) (Form, error)
	Create(ctx context.Context, title string) (Form, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type Handler struct {
	logger *zap.Logger
	store  Store
}

func NewHandler(logger *zap.Logger, store Store) *Handler {
	return &Handler{
		logger: logger,
		store:  store,
	}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	err := internal.ParseRequestFromBody(r, h.logger, &req)
	if err != nil {
		internal.WriteResponseToBody(w, h.logger, http.StatusBadRequest, internal.NewBadRequestError(err.Error()))
		return
	}

	form, err := h.store.Create(r.Context(), req.Title)
	if err != nil {
		h.logger.Error("Failed to create form", zap.Error(err))
		internal.WriteResponseToBody(w, h.logger, http.StatusInternalServerError, internal.NewInternalServerError("Failed to create form"))
		return
	}

	internal.WriteResponseToBody(w, h.logger, http.StatusCreated, Response{
		ID:    form.ID,
		Title: form.Title,
	})
}
