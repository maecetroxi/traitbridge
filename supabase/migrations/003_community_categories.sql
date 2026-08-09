-- Adds a small, fixed category set to Community questions.
-- Safe to run more than once in the Supabase SQL editor.

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS category TEXT;

UPDATE questions
SET category = 'other'
WHERE category IS NULL;

ALTER TABLE questions
  ALTER COLUMN category SET DEFAULT 'other',
  ALTER COLUMN category SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_category_check'
      AND conrelid = 'questions'::regclass
  ) THEN
    ALTER TABLE questions
      ADD CONSTRAINT questions_category_check
      CHECK (
        category IN (
          'decisions',
          'work',
          'relationships',
          'communication',
          'stress',
          'habits',
          'self-understanding',
          'other'
        )
      );
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_questions_category
  ON questions(category);
