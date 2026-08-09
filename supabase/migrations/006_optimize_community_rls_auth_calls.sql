-- Evaluate Auth helpers once per statement instead of once per row.

ALTER POLICY "Permanent users can create their Community profile"
  ON public.community_profiles
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1
      FROM public.personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
  );

ALTER POLICY "Permanent users can update their Community profile"
  ON public.community_profiles
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1
      FROM public.personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
  );

ALTER POLICY "Permanent users can delete their Community profile"
  ON public.community_profiles
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
  );

ALTER POLICY "Permanent users can insert their own questions"
  ON public.questions
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1 FROM public.personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
    AND EXISTS (
      SELECT 1 FROM public.community_profiles
      WHERE community_profiles.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "Permanent users can update their own questions"
  ON public.questions
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1 FROM public.personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
    AND EXISTS (
      SELECT 1 FROM public.community_profiles
      WHERE community_profiles.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "Permanent users can delete their own questions"
  ON public.questions
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
  );

ALTER POLICY "Permanent users can insert their own answers"
  ON public.answers
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1 FROM public.personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
    AND EXISTS (
      SELECT 1 FROM public.community_profiles
      WHERE community_profiles.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "Permanent users can update their own answers"
  ON public.answers
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
    AND EXISTS (
      SELECT 1 FROM public.personality_results
      WHERE personality_results.user_id = (SELECT auth.uid())
        AND personality_results.variant IN ('full', 'short')
    )
    AND EXISTS (
      SELECT 1 FROM public.community_profiles
      WHERE community_profiles.user_id = (SELECT auth.uid())
    )
  );

ALTER POLICY "Permanent users can delete their own answers"
  ON public.answers
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    AND (((SELECT auth.jwt()) ->> 'is_anonymous')::boolean) IS FALSE
  );
