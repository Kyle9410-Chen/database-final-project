.PHONY: all gen build run

gen:
	@go mod download
	@./scripts/create_full_schema.sh
	@sqlc generate


build:
	@go build -o bin/backend cmd/backend/main.go

run:
	@go run cmd/backend/main.go