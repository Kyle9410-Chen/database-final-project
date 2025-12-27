CREATE TABLE IF NOT EXISTS answers
(
    id            UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    submission_id UUID        NOT NULL REFERENCES submissions (id) ON DELETE CASCADE,
    question_id   UUID        NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    answer_text   TEXT,
    answer_options UUID[],
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);