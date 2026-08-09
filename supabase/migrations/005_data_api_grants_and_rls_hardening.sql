-- Makes Data API access explicit and hardens the existing RLS setup.
-- Community content stays public to read; exact test results stay private.

ALTER TABLE public.personality_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own personality results"
  ON public.personality_results;
DROP POLICY IF EXISTS "Users can insert their own personality results"
  ON public.personality_results;
DROP POLICY IF EXISTS "Users can update their own personality results"
  ON public.personality_results;

CREATE POLICY "Users can view their own personality results"
  ON public.personality_results FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own personality results"
  ON public.personality_results FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own personality results"
  ON public.personality_results FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.personality_results FROM anon, authenticated;
REVOKE ALL ON TABLE public.questions FROM anon, authenticated;
REVOKE ALL ON TABLE public.answers FROM anon, authenticated;
REVOKE ALL ON TABLE public.community_profiles FROM anon, authenticated;

GRANT SELECT ON TABLE
  public.questions,
  public.answers,
  public.community_profiles
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.questions,
  public.answers,
  public.community_profiles
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.personality_results
TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO postgres, service_role;

-- Keep future public-schema tables private until a migration grants the exact
-- Data API privileges they require.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
