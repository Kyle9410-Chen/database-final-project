package form

import (
	"context"
	"database-final-project/internal"
	"net/http"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type CreateRequest struct {
	Title     string            `json:"title" validate:"required,min=1,max=255"`
	Questions []QuestionRequest `json:"questions,omitempty"`
}

type QuestionRequest struct {
	QuestionType QuestionType `json:"type" validate:"required,oneof=short_answer select multiselect"`
	IsRequired   bool         `json:"is_required"`
	QuestionText string       `json:"question_text" validate:"required,min=1,max=1000"`
	Options      []string     `json:"options,omitempty"`
}

type Store interface {
	GetAll(ctx context.Context) ([]QuestionsForm, error)
	GetByID(ctx context.Context, id uuid.UUID) (QuestionsForm, error)
	Create(ctx context.Context, title string, questionRequest []QuestionRequest) (QuestionsForm, error)
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

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	forms, err := h.store.GetAll(r.Context())
	if err != nil {
		h.logger.Error("Failed to get forms", zap.Error(err))
		internal.WriteResponseToBody(w, h.logger, http.StatusInternalServerError, internal.NewInternalServerError("Failed to get forms"))
		return
	}

	if forms == nil {
		forms = []QuestionsForm{}
	}

	internal.WriteResponseToBody(w, h.logger, http.StatusOK, forms)
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		h.logger.Error("Invalid form ID", zap.String("id", idStr), zap.Error(err))
		internal.WriteResponseToBody(w, h.logger, http.StatusBadRequest, internal.NewBadRequestError("Invalid form ID"))
		return
	}

	form, err := h.store.GetByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Failed to get form by ID", zap.Error(err))
		internal.WriteResponseToBody(w, h.logger, http.StatusInternalServerError, internal.NewInternalServerError("Failed to get form"))
		return
	}

	internal.WriteResponseToBody(w, h.logger, http.StatusOK, form)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	err := internal.ParseRequestFromBody(r, h.logger, &req)
	if err != nil {
		internal.WriteResponseToBody(w, h.logger, http.StatusBadRequest, internal.NewBadRequestError(err.Error()))
		return
	}

	form, err := h.store.Create(r.Context(), req.Title, req.Questions)
	if err != nil {
		h.logger.Error("Failed to create form", zap.Error(err))
		internal.WriteResponseToBody(w, h.logger, http.StatusInternalServerError, internal.NewInternalServerError("Failed to create form"))
		return
	}

	internal.WriteResponseToBody(w, h.logger, http.StatusCreated, form)
}
