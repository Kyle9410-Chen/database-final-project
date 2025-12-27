-- name: GetBySubmissionID :many
SELECT
    a.*,
    q.*
FROM answers a
JOIN questions q ON q.id = a.question_id
WHERE a.submission_id = $1
ORDER BY a.created_at ASC;

-- name: Create :one
INSERT INTO answers (submission_id, question_id, answer_text, answer_options)
VALUES ($1, $2, $3, $4)
RETURNING *;