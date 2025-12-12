-- name: GetAll :many
SELECT * FROM forms;

-- name: GetByID :one
SELECT * FROM forms WHERE id = $1;

-- name: Create :one
INSERT INTO forms (title) VALUES ($1) RETURNING *;

-- name: Update :one
UPDATE forms SET title = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;

-- name: Delete :exec
DELETE FROM forms WHERE id = $1;