package internal

import (
	"encoding/json"
	"io"
	"net/http"

	"go.uber.org/zap"
)

func ParseRequestFromBody(r *http.Request, logger *zap.Logger, s interface{}) error {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	defer func() {
		err := r.Body.Close()
		if err != nil {
			logger.Error("Failed to close request body", zap.Error(err))
		}
	}()

	err = json.Unmarshal(body, s)
	if err != nil {
		logger.Error("Failed to unmarshal request body", zap.Error(err), zap.ByteString("body", body))
		return err
	}

	return nil
}

func WriteResponseToBody(w http.ResponseWriter, logger *zap.Logger, statusCode int, s interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	responseBytes, err := json.Marshal(s)
	if err != nil {
		logger.Error("Failed to marshal response", zap.Error(err), zap.Any("response", s))
		return err
	}

	_, err = w.Write(responseBytes)
	if err != nil {
		logger.Error("Failed to write response", zap.Error(err))
		return err
	}
	return nil
}
