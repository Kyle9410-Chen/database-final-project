package form

import (
	"context"
	"database-final-project/internal"
	"database-final-project/internal/answer"
	"database-final-project/internal/submission"
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

type AnswersRequest struct {
	Answers []AnswerRequest `json:"answers" validate:"required,min=1"`
}

type AnswerRequest struct {
	QuestionID     uuid.UUID   `json:"question_id" validate:"required"`
	AnswerText     string      `json:"answer_text,omitempty"`
	AnswersOptions []uuid.UUID `json:"answer_options,omitempty"`
}

type Store interface {
	GetAll(ctx context.Context) ([]QuestionsForm, error)
	GetByID(ctx context.Context, id uuid.UUID) (QuestionsForm, error)
	Create(ctx context.Context, title string, questionRequest []QuestionRequest) (QuestionsForm, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type submissionStore interface {
	GetByID(ctx context.Context, id uuid.UUID) ([]submission.AnswersSubmission, error)
	Create(ctx context.Context, formID uuid.UUID, answers []answer.Request) error
}

type Handler struct {
	logger          *zap.Logger
	store           Store
	submissionStore submissionStore
}

func NewHandler(logger *zap.Logger, store Store, submissionStore submissionStore) *Handler {
	return &Handler{
		logger:          logger,
		store:           store,
		submissionStore: submissionStore,
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

func (h *Handler) GetAllAnswer(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		h.logger.Error("Invalid form ID", zap.String("id", idStr), zap.Error(err))
		internal.WriteResponseToBody(w, h.logger, http.StatusBadRequest, internal.NewBadRequestError("Invalid form ID"))
		return
	}

	answers, err := h.submissionStore.GetByID(r.Context(), id)
	if err != nil {
		h.logger.Error("Failed to get answers by form ID", zap.Error(err))
		internal.WriteResponseToBody(w, h.logger, http.StatusInternalServerError, internal.NewInternalServerError("Failed to get answers"))
		return
	}

	internal.WriteResponseToBody(w, h.logger, http.StatusOK, answers)
}

func (h *Handler) CreateAnswer(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := uuid.Parse(idStr)
	if err != nil {
		h.logger.Error("Invalid form ID", zap.String("id", idStr), zap.Error(err))
		internal.WriteResponseToBody(w, h.logger, http.StatusBadRequest, internal.NewBadRequestError("Invalid form ID"))
		return
	}

	var req AnswersRequest
	err = internal.ParseRequestFromBody(r, h.logger, &req)
	if err != nil {
		internal.WriteResponseToBody(w, h.logger, http.StatusBadRequest, internal.NewBadRequestError(err.Error()))
		return
	}

	err = h.submissionStore.Create(r.Context(), id, convertToAnswerRequests(req.Answers))
	if err != nil {
		h.logger.Error("Failed to create answers", zap.Error(err))
		internal.WriteResponseToBody(w, h.logger, http.StatusInternalServerError, internal.NewInternalServerError("Failed to create answers"))
		return
	}

	internal.WriteResponseToBody(w, h.logger, http.StatusNoContent, nil)
}

func convertToAnswerRequests(answerRequests []AnswerRequest) []answer.Request {
	var answers []answer.Request
	for _, ar := range answerRequests {
		answers = append(answers, answer.Request{
			QuestionID:    ar.QuestionID,
			AnswerText:    ar.AnswerText,
			AnswerOptions: ar.AnswersOptions,
		})
	}
	return answers
}
