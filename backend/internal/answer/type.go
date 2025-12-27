package answer

import (
	"database-final-project/internal/options"

	"github.com/google/uuid"
)

type Request struct {
	QuestionID    uuid.UUID   `json:"question_id"`
	AnswerText    string      `json:"answer_text"`
	AnswerOptions []uuid.UUID `json:"answer_options,omitempty"`
}

type Response struct {
	QuestionID    uuid.UUID          `json:"question_id"`
	QuestionType  string             `json:"question_type"`
	QuestionText  string             `json:"question_text"`
	IsRequired    bool               `json:"is_required"`
	Options       []options.Response `json:"options,omitempty"`
	AnswerText    string             `json:"answer_text"`
	AnswerOptions []uuid.UUID        `json:"answer_options,omitempty"`
}
