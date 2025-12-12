package internal

type ErrorResponse struct {
	Title   string `json:"title"`
	Status  int    `json:"status"`
	Message string `json:"message"`
	Type    string `json:"type"`
}

func NewBadRequestError(message string) *ErrorResponse {
	return &ErrorResponse{
		Title:   "Bad Request",
		Status:  400,
		Message: message,
		Type:    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/400",
	}
}

func NewNotFoundError(message string) *ErrorResponse {
	return &ErrorResponse{
		Title:   "Not Found",
		Status:  404,
		Message: message,
		Type:    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404",
	}
}

func NewForbiddenError(message string) *ErrorResponse {
	return &ErrorResponse{
		Title:   "Forbidden",
		Status:  403,
		Message: message,
		Type:    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403",
	}
}

func NewInternalServerError(message string) *ErrorResponse {
	return &ErrorResponse{
		Title:   "Internal Server Error",
		Status:  500,
		Message: message,
		Type:    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/500",
	}
}
