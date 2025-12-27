package form

import (
	"database-final-project/internal/question"

	"github.com/google/uuid"
)

type QuestionsForm struct {
	FormID    uuid.UUID                  `json:"form_id"`
	Title     string                     `json:"title"`
	Questions []question.OptionsQuestion `json:"questions"`
}
