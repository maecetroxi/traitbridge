-- Community content is public to read, but only permanent users may write.
-- Anonymous Auth users use the authenticated role, so the JWT claim must be checked.

DROP POLICY IF EXISTS "Authenticated users can view all questions" ON questions;
DROP POLICY IF EXISTS "Users can insert their own questions" ON questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON questions;
DROP POLICY IF EXISTS "Anyone can view all questions" ON questions;
DROP POLICY IF EXISTS "Permanent users can insert their own questions" ON questions;
DROP POLICY IF EXISTS "Permanent users can update their own questions" ON questions;
DROP POLICY IF EXISTS "Permanent users can delete their own questions" ON questions;

CREATE POLICY "Anyone can view all questions"
  ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permanent users can insert their own questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
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
  );

CREATE POLICY "Permanent users can delete their own questions"
  ON questions FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
  );

DROP POLICY IF EXISTS "Authenticated users can view all answers" ON answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON answers;
DROP POLICY IF EXISTS "Users can update their own answers" ON answers;
DROP POLICY IF EXISTS "Users can delete their own answers" ON answers;
DROP POLICY IF EXISTS "Anyone can view all answers" ON answers;
DROP POLICY IF EXISTS "Permanent users can insert their own answers" ON answers;
DROP POLICY IF EXISTS "Permanent users can update their own answers" ON answers;
DROP POLICY IF EXISTS "Permanent users can delete their own answers" ON answers;

CREATE POLICY "Anyone can view all answers"
  ON answers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permanent users can insert their own answers"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
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
  );

CREATE POLICY "Permanent users can delete their own answers"
  ON answers FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (SELECT (auth.jwt() ->> 'is_anonymous')::boolean) IS FALSE
  );
