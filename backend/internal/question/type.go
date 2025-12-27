package question

import "database-final-project/internal/question/options"

type OptionsQuestion struct {
	QuestionType QuestionType     `json:"type"`
	QuestionText string           `json:"question_text"`
	IsRequired   bool             `json:"is_required"`
	Options      []options.Option `json:"options,omitempty"`
}
