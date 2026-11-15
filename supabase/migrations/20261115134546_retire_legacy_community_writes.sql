-- Apply only when V2 replaces the published application. No content is deleted.
begin;
-- Prevent bypassing the read-only V1 UI through its old write API. This changes
-- access rights only: existing public visibility and own DELETE policies remain.
do $$ declare t text; begin
 foreach t in array array['questions','answers','community_profiles'] loop
  if to_regclass('public.'||t) is not null then
   execute format('revoke insert,update on public.%I from authenticated',t);
  end if;
 end loop;
end $$;
commit;
