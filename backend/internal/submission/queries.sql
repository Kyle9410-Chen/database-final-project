-- name: GetByFormID :many
SELECT *
FROM submissions
WHERE form_id = $1;

-- name: Create :one
INSERT INTO submissions (form_id)
VALUES ($1)
RETURNING *;