CREATE TYPE question_type AS ENUM ('short_answer', 'select', 'multiselect');

CREATE TABLE IF NOT EXISTS questions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
     text TEXT NOT NULL,
     type question_type NOT NULL,
     is_required BOOLEAN NOT NULL DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);