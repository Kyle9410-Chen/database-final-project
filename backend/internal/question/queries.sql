-- name: GetByFormID :many
SELECT *
FROM questions
WHERE form_id = $1
ORDER BY created_at ASC;

-- name: Create :one
INSERT INTO questions (form_id, text, type, is_required)
VALUES ($1, $2, $3, $4)
RETURNING *;