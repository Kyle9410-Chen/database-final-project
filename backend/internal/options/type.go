package options

import "github.com/google/uuid"

type Response struct {
	OptionID   uuid.UUID `json:"option_id"`
	OptionText string    `json:"option_text"`
}
