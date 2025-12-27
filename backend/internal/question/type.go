package question

import (
	"database-final-project/internal/options"

	"github.com/google/uuid"
)

type OptionsQuestion struct {
	QuestionID   uuid.UUID          `json:"question_id"`
	QuestionType QuestionType       `json:"type"`
	QuestionText string             `json:"question_text"`
	IsRequired   bool               `json:"is_required"`
	Options      []options.Response `json:"options,omitempty"`
}
