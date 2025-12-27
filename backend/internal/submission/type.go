package submission

import (
	"database-final-project/internal/answer"

	"github.com/google/uuid"
)

type AnswersSubmission struct {
	SubmissionID uuid.UUID         `json:"submission_id"`
	Answers      []answer.Response `json:"answers"`
}
