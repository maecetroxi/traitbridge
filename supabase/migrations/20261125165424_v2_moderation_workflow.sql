begin;

alter table tb_private.questions add column moderation_previous_status text
  check (moderation_previous_status in ('open','closed'));
alter table tb_private.answers add column moderation_hidden boolean not null default false;
alter table tb_private.experiences add column moderation_hidden boolean not null default false;
alter table tb_private.beta_members add column moderation_suspended boolean not null default false;
alter table tb_private.reports add column resolution text, add column resolved_at timestamptz;
alter table tb_private.experience_reports add column resolution text, add column resolved_at timestamptz;

create view tb_private.moderation_entries with (security_invoker = true) as
  select r.id, case when r.answer_id is null then 'question' else 'answer' end as kind,
    coalesce(r.answer_id,r.question_id) as content_id, coalesce(a.author_id,q.author_id) as author_id,
    null::text as title, coalesce(a.body,q.body) as body,
    r.reason, r.created_at, r.status = 'open' as is_open, r.resolution, r.resolved_at,
    coalesce(a.status,q.status) as content_status, p.pseudonym as author_pseudonym,
    coalesce(m.enabled and not m.moderator,false) as can_suspend
  from tb_private.reports r
  join tb_private.questions q on q.id = r.question_id
  left join tb_private.answers a on a.id = r.answer_id and a.question_id = q.id
  join tb_private.profiles p on p.id = coalesce(a.author_id,q.author_id)
  left join tb_private.beta_members m on m.user_id = p.id
  where r.answer_id is null or a.id is not null
  union all
  select r.id, 'experience', e.id, e.author_id, e.title, e.body, r.reason, r.created_at,
    not r.resolved, r.resolution, r.resolved_at, e.status, p.pseudonym,
    coalesce(m.enabled and not m.moderator,false)
  from tb_private.experience_reports r
  join tb_private.experiences e on e.id = r.experience_id
  join tb_private.profiles p on p.id = e.author_id
  left join tb_private.beta_members m on m.user_id = p.id;

revoke all on tb_private.moderation_entries from public, anon, authenticated;
grant select on tb_private.moderation_entries to service_role;

create function public.tb_v2_moderation_workflow(p_actor uuid, p_action text, p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  item_id uuid := (p_data->>'id')::uuid;
  item_kind text := p_data->>'kind';
  decision text := p_data->>'decision';
  entry tb_private.moderation_entries;
  total integer;
  resolved_as text;
  account_result jsonb;
begin
  if p_actor is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(748923,2);
  if p_action = 'delete_account_prepare' then
    account_result := public.tb_v2(p_actor, p_action, '{}');
    -- Prevent restoration once deletion starts, even if Auth deletion fails.
    update tb_private.beta_members set moderation_suspended = false where user_id = p_actor;
    return account_result;
  end if;
  if not exists (select 1 from tb_private.beta_members where user_id = p_actor and enabled and moderator)
    then raise exception 'FORBIDDEN'; end if;
  if p_action in ('moderation_status','moderation_dashboard') then
    select ((select count(*) from tb_private.reports where status='open') +
      (select count(*) from tb_private.experience_reports where not resolved)) into total;
    if p_action = 'moderation_status' then return jsonb_build_object('open_count', total); end if;
    return jsonb_build_object(
      'open_count', total,
      'reports', (select coalesce(jsonb_agg(to_jsonb(r) - 'author_id' - 'content_id' order by r.created_at,r.id),'[]')
        from (select * from tb_private.moderation_entries where is_open order by created_at,id limit 100) r),
      'recent', (select coalesce(jsonb_agg(to_jsonb(r) - 'author_id' - 'content_id' order by r.resolved_at desc,r.id),'[]')
        from (select * from tb_private.moderation_entries where not is_open and resolved_at is not null order by resolved_at desc,id limit 25) r),
      'hidden', (select coalesce(jsonb_agg(to_jsonb(h) order by h.created_at desc,h.id),'[]') from (
        select q.id, 'question'::text as kind, null::text as title, q.body, q.created_at
        from tb_private.questions q where q.status='hidden' and q.moderation_previous_status is not null
        union all select a.id, 'answer', null, a.body, a.created_at from tb_private.answers a where a.status='hidden' and a.moderation_hidden
        union all select e.id, 'experience', e.title, e.body, e.created_at from tb_private.experiences e where e.status='hidden' and e.moderation_hidden
      ) h),
      'accounts', (select coalesce(jsonb_agg(jsonb_build_object('id',m.user_id,'pseudonym',p.pseudonym) order by p.pseudonym,m.user_id),'[]')
        from tb_private.beta_members m join tb_private.profiles p on p.id=m.user_id
        where not m.enabled and m.moderation_suspended and not m.moderator)
    );
  end if;
  if p_action = 'moderation_restore' then
    if item_kind = 'question' then
      update tb_private.questions set status=moderation_previous_status, moderation_previous_status=null
        where id=item_id and status='hidden' and moderation_previous_status is not null;
    elsif item_kind = 'answer' then
      update tb_private.answers set status='visible', moderation_hidden=false
        where id=item_id and status='hidden' and moderation_hidden;
    elsif item_kind = 'experience' then
      update tb_private.experiences set status='visible', moderation_hidden=false
        where id=item_id and status='hidden' and moderation_hidden;
    else raise exception 'INVALID_INPUT';
    end if;
    if not found then raise exception 'NOT_FOUND'; end if;
  elsif p_action = 'moderation_unsuspend' then
    update tb_private.beta_members set enabled=true, moderation_suspended=false
      where user_id=item_id and not enabled and moderation_suspended and not moderator;
    if not found then raise exception 'NOT_FOUND'; end if;
  elsif p_action = 'moderation_decide' then
    select * into entry from tb_private.moderation_entries
      where id=item_id and is_open and (kind=item_kind or (item_kind is null and kind<>'experience'));
    if not found then raise exception 'NOT_FOUND'; end if;
    if decision = 'hide' then
      if entry.kind = 'question' then
        update tb_private.questions set moderation_previous_status=status, status='hidden'
          where id=entry.content_id and status in ('open','closed');
        delete from tb_private.reservations where question_id=entry.content_id;
      elsif entry.kind = 'answer' then
        update tb_private.answers set moderation_hidden=true, status='hidden'
          where id=entry.content_id and status='visible';
      else
        update tb_private.experiences set moderation_hidden=true, status='hidden'
          where id=entry.content_id and status='visible';
      end if;
      if entry.content_status = 'deleted' then raise exception 'NOT_AVAILABLE'; end if;
      resolved_as := 'hidden';
    elsif decision = 'ban' then
      if entry.content_status = 'deleted' then raise exception 'NOT_AVAILABLE'; end if;
      if entry.author_id=p_actor or exists(select 1 from tb_private.beta_members where user_id=entry.author_id and moderator)
        then raise exception 'FORBIDDEN'; end if;
      update tb_private.beta_members set enabled=false, moderation_suspended=true
        where user_id=entry.author_id and enabled and not moderator;
      if not found then raise exception 'NOT_AVAILABLE'; end if;
      delete from tb_private.reservations r using tb_private.questions q
        where r.question_id=q.id and (r.user_id=entry.author_id or q.author_id=entry.author_id);
      resolved_as := 'suspended';
    elsif decision = 'dismiss' then resolved_as := 'dismissed';
    else raise exception 'INVALID_INPUT';
    end if;
    if entry.kind = 'experience' then
      update tb_private.experience_reports set resolved=true,resolution=resolved_as,resolved_at=now()
        where not resolved and (id=entry.id or (decision='hide' and experience_id=entry.content_id));
    else
      update tb_private.reports set status='resolved',resolution=resolved_as,resolved_at=now()
        where status='open' and (id=entry.id or (decision='hide' and
          ((entry.kind='question' and question_id=entry.content_id and answer_id is null) or
           (entry.kind='answer' and answer_id=entry.content_id))));
    end if;
  else raise exception 'UNKNOWN_ACTION';
  end if;
  return jsonb_build_object('ok',true);
end $$;

revoke all on function public.tb_v2_moderation_workflow(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.tb_v2_moderation_workflow(uuid,text,jsonb) to service_role;
commit;
