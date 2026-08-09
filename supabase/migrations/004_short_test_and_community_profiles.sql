-- Adds the short assessment, Community post types, and public three-band profiles.
-- Existing questions remain readable and default to the `question` post type.

UPDATE personality_results
SET variant = 'full'
WHERE variant IS NULL;

ALTER TABLE personality_results
  DROP CONSTRAINT IF EXISTS personality_results_variant_check;

ALTER TABLE personality_results
  ADD CONSTRAINT personality_results_variant_check
  CHECK (variant IN ('full', 'short'));

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS post_type TEXT;

UPDATE questions
SET post_type = 'question'
WHERE post_type IS NULL;

ALTER TABLE questions
  ALTER COLUMN post_type SET DEFAULT 'question',
  ALTER COLUMN post_type SET NOT NULL;

ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_post_type_check;

ALTER TABLE questions
  ADD CONSTRAINT questions_post_type_check
  CHECK (post_type IN ('question', 'experience'));

CREATE INDEX IF NOT EXISTS idx_questions_post_type
  ON questions(post_type);

CREATE TABLE IF NOT EXISTS community_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bands JSONB NOT NULL,
  test_variant TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT community_profiles_display_name_check
    CHECK (char_length(btrim(display_name)) BETWEEN 2 AND 40),
  CONSTRAINT community_profiles_test_variant_check
    CHECK (test_variant IN ('full', 'short')),
  CONSTRAINT community_profiles_bands_check
    CHECK (
      bands ?& ARRAY['O', 'C', 'E', 'A', 'N']
      AND bands ->> 'O' IN ('low', 'middle', 'high')
      AND bands ->> 'C' IN ('low', 'middle', 'high')
      AND bands ->> 'E' IN ('low', 'middle', 'high')
      AND bands ->> 'A' IN ('low', 'middle', 'high')
      AND bands ->> 'N' IN ('low', 'middle', 'high')
    )
);

ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view Community profiles" ON community_profiles;
DROP POLICY IF EXISTS "Permanent users can create their Community profile" ON community_profiles;
DROP POLICY IF EXISTS "Permanent users can update their Community profile" ON community_profiles;
DROP POLICY IF EXISTS "Permanent users can delete their Community profile" ON community_profiles;

CREATE POLICY "Anyone can view Community profiles"
  ON community_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permanent users can create their Community profile"
  ON community_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1
      FROM personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
  );

CREATE POLICY "Permanent users can update their Community profile"
  ON community_profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1
      FROM personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
  );

CREATE POLICY "Permanent users can delete their Community profile"
  ON community_profiles FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
  );

DROP TRIGGER IF EXISTS update_community_profiles_updated_at ON community_profiles;
CREATE TRIGGER update_community_profiles_updated_at
  BEFORE UPDATE ON community_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP POLICY IF EXISTS "Permanent users can insert their own questions" ON questions;
DROP POLICY IF EXISTS "Permanent users can update their own questions" ON questions;

CREATE POLICY "Permanent users can insert their own questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1 FROM personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
    AND EXISTS (
      SELECT 1 FROM community_profiles
      WHERE community_profiles.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Permanent users can update their own questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1 FROM personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
    AND EXISTS (
      SELECT 1 FROM community_profiles
      WHERE community_profiles.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Permanent users can insert their own answers" ON answers;
DROP POLICY IF EXISTS "Permanent users can update their own answers" ON answers;

CREATE POLICY "Permanent users can insert their own answers"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1 FROM personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
    AND EXISTS (
      SELECT 1 FROM community_profiles
      WHERE community_profiles.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Permanent users can update their own answers"
  ON answers FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1 FROM personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
    AND EXISTS (
      SELECT 1 FROM community_profiles
      WHERE community_profiles.user_id = (SELECT auth.uid())
    )
  );
