begin;

-- Existing profiles keep their scores and variant. Provenance is unknown for
-- historical rows; only new writes through this service RPC record it.
alter table tb_private.profiles
  add column assessment jsonb check (assessment is null or jsonb_typeof(assessment) = 'object');

create function public.tb_v2_save_assessment(p_actor uuid, p_action text, p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  saved jsonb;
  provenance jsonb := p_data->'assessment';
begin
  if p_action is null or p_action not in ('onboard', 'sync_full')
    or coalesce(jsonb_typeof(provenance), '') <> 'object'
    or coalesce(provenance->>'variant', '') not in ('short', 'full')
    or coalesce(provenance->>'source', '') not in ('onboarding', 'device_test', 'account_result')
    or (p_action = 'sync_full' and provenance->>'variant' <> 'full') then
    raise exception 'INVALID_PROFILE';
  end if;

  -- Reuse the existing beta, consent, profile and write-limit checks. Updating
  -- the provenance and variant is atomic with the original gateway action.
  saved := public.tb_v2(p_actor, p_action, p_data);
  update tb_private.profiles
    set variant = provenance->>'variant', assessment = provenance
    where id = p_actor;
  return saved;
end
$$;

revoke all on function public.tb_v2_save_assessment(uuid, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.tb_v2_save_assessment(uuid, text, jsonb)
  to service_role;

commit;
