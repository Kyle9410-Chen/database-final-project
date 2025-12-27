-- name: GetByQuestionID :many
SELECT *
FROM options
WHERE question_id = $1
ORDER BY created_at ASC;

-- name: Create :one
INSERT INTO options (question_id, text)
VALUES ($1, $2)
RETURNING *;