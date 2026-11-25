begin;

create table tb_private.experiences (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references tb_private.profiles(id) on delete cascade,
  title text check (length(btrim(title)) between 1 and 100),
  body text not null check (length(btrim(body)) between 20 and 4000),
  topic text not null check (topic in ('relationships','work','decisions','social','stress','habits','self')),
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz not null default now()
);
create index on tb_private.experiences (created_at desc, id desc) where status = 'visible';
create index on tb_private.experiences (author_id, created_at desc, id desc);
create index on tb_private.questions (created_at desc, id desc) where discoverable and status <> 'hidden';

create table tb_private.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references tb_private.profiles(id) on delete cascade,
  question_id uuid references tb_private.questions(id) on delete cascade,
  experience_id uuid references tb_private.experiences(id) on delete cascade,
  check (num_nonnulls(question_id, experience_id) = 1),
  unique (question_id, user_id),
  unique (experience_id, user_id)
);
create index on tb_private.bookmarks (user_id);

create table tb_private.experience_helpful (
  experience_id uuid not null references tb_private.experiences(id) on delete cascade,
  user_id uuid not null references tb_private.profiles(id) on delete cascade,
  primary key (experience_id, user_id)
);
create index on tb_private.experience_helpful (user_id);

create table tb_private.experience_reports (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references tb_private.experiences(id) on delete cascade,
  reporter_id uuid references tb_private.profiles(id) on delete set null,
  reason text not null check (length(btrim(reason)) between 3 and 1000),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index on tb_private.experience_reports (experience_id);
create index on tb_private.experience_reports (reporter_id);
create unique index on tb_private.experience_reports (experience_id, reporter_id) where not resolved;

-- Keep recent fingerprints independent of deletion so reposting doesn't bypass limits.
create table tb_private.experience_writes (
  user_id uuid not null references tb_private.profiles(id) on delete cascade,
  experience_id uuid not null,
  fingerprint text not null,
  published boolean not null,
  created_at timestamptz not null default now()
);
create index on tb_private.experience_writes (user_id, created_at);

do $$
declare
  name text;
begin
  foreach name in array array['experiences','bookmarks','experience_helpful','experience_reports','experience_writes'] loop
    execute format('alter table tb_private.%I enable row level security', name);
    execute format('revoke all on table tb_private.%I from public, anon, authenticated', name);
    execute format('grant select, insert, update, delete on table tb_private.%I to service_role', name);
  end loop;
end $$;

-- Shared visibility for feed, bookmarks and mutations. The only caller
-- authenticates a beta member first. Never project answers or profile scores.
create function tb_private.discover_items(actor uuid, wanted_kind text, wanted_id uuid)
returns table (kind text, id uuid, author_id uuid, title text, body text, topic text,
               status text, created_at timestamptz, can_answer boolean)
language sql stable security invoker set search_path = '' as $$
  select 'question'::text, q.id, q.author_id, null::text, q.body, q.topic, q.status, q.created_at,
    q.author_id <> actor and q.status = 'open' and q.delivered_count < 3
    and exists (select 1 from tb_private.profiles p where p.id = actor and p.available)
    and not exists (select 1 from tb_private.answers a where a.question_id = q.id and a.author_id = actor)
    and not exists (select 1 from tb_private.assignments a where a.question_id = q.id and a.user_id = actor and a.skipped)
  from tb_private.questions q
  join tb_private.beta_members m on m.user_id = q.author_id and m.enabled
  where (wanted_kind is null or wanted_kind = 'question')
    and (wanted_id is null or wanted_id = q.id)
    and q.discoverable and q.status <> 'hidden'
    and not tb_private.blocked(actor, q.author_id)
  union all
  select 'experience'::text, e.id, e.author_id, e.title, e.body, e.topic, e.status, e.created_at, false
  from tb_private.experiences e
  join tb_private.beta_members m on m.user_id = e.author_id and m.enabled
  where (wanted_kind is null or wanted_kind = 'experience')
    and (wanted_id is null or wanted_id = e.id)
    and e.status = 'visible' and not tb_private.blocked(actor, e.author_id);
$$;
revoke all on function tb_private.discover_items(uuid, text, uuid) from public, anon, authenticated;
grant execute on function tb_private.discover_items(uuid, text, uuid) to service_role;

create function public.tb_v2_discover(p_actor uuid, p_action text, p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  item_id uuid := (p_data->>'id')::uuid;
  item_kind text := p_data->>'kind';
  target uuid;
  post tb_private.experiences;
  existing_report tb_private.experience_reports;
  normalized_body text;
  body_hash text;
  next_body text := p_data->>'body';
  result jsonb;
  time_limit timestamptz := now() - interval '24 hours';
  turn_on boolean := (p_data->>'enabled')::boolean;
begin
  if p_actor is null then raise exception 'AUTH_REQUIRED'; end if;
  -- Coordinate visibility and counters with matching, blocking and account deletion.
  perform pg_advisory_xact_lock(748923,2);
  if not exists (select 1 from tb_private.beta_members where user_id = p_actor and enabled)
    then raise exception 'BETA_REQUIRED'; end if;
  if not exists (select 1 from tb_private.profiles where id = p_actor)
    then raise exception 'ONBOARDING_REQUIRED'; end if;

  if p_action in ('discover_feed', 'discover_saved', 'discover_own') then
    with items as (
      select v.* from tb_private.discover_items(p_actor, item_kind, null) v
      where p_action = 'discover_feed'
        or (p_action = 'discover_saved' and exists (
          select 1 from tb_private.bookmarks b where b.user_id = p_actor
            and ((v.kind = 'question' and b.question_id = v.id) or (v.kind = 'experience' and b.experience_id = v.id))
        ))
      union all
      select 'experience'::text, e.id, e.author_id, e.title, e.body, e.topic, e.status, e.created_at, false
      from tb_private.experiences e where p_action = 'discover_own' and e.author_id = p_actor
    ), page as (
      select i.* from items i
      where (p_data->>'topic' is null or i.topic = p_data->>'topic')
        and (p_data->>'before_at' is null or (i.created_at, i.id, i.kind) <
          ((p_data->>'before_at')::timestamptz, (p_data->>'before_id')::uuid, p_data->>'before_kind'))
      order by i.created_at desc, i.id desc, i.kind desc
      limit 25
    )
    select coalesce(jsonb_agg(
      (to_jsonb(i) - 'author_id') || jsonb_build_object(
        'author', tb_private.person(i.author_id),
        'bookmarked', i.status <> 'hidden' and exists (
          select 1 from tb_private.bookmarks b where b.user_id = p_actor
            and ((i.kind = 'question' and b.question_id = i.id) or (i.kind = 'experience' and b.experience_id = i.id))
        ),
        'helpful', i.kind = 'experience' and i.status = 'visible' and exists (
          select 1 from tb_private.experience_helpful h where h.user_id = p_actor and h.experience_id = i.id
        )
      ) order by i.created_at desc, i.id desc, i.kind desc), '[]') into result from page i;
    return result;
  end if;

  if p_action in ('experience_moderation','experience_moderate') then
    if not exists (select 1 from tb_private.beta_members where user_id = p_actor and moderator and enabled)
      then raise exception 'FORBIDDEN'; end if;
    if p_action = 'experience_moderation' then
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', r.id, 'kind', 'experience', 'title', e.title, 'body', e.body,
        'reason', r.reason, 'created_at', r.created_at
      ) order by r.created_at, r.id), '[]') into result
      from (select * from tb_private.experience_reports
            where not resolved order by created_at, id limit 100) r
      join tb_private.experiences e on e.id = r.experience_id;
      return result;
    end if;
  end if;

  if p_action is null or not (p_action = any(array['experience_publish','experience_edit','experience_delete',
     'discover_bookmark','experience_helpful','experience_report','discover_block','discover_unshare','experience_moderate']))
    then raise exception 'UNKNOWN_ACTION'; end if;
  if (select count(*) from tb_private.events where user_id = p_actor and created_at > now() - interval '1 hour') >= 120
    then raise exception 'RATE_LIMIT'; end if;
  insert into tb_private.events(user_id, action) values (p_actor, p_action);
  delete from tb_private.events where user_id = p_actor and created_at < now() - interval '7 days';

  if p_action = 'discover_unshare' then
    update tb_private.questions set discoverable = false where id = item_id and author_id = p_actor;
    if not found then raise exception 'NOT_FOUND'; end if;
    return jsonb_build_object('ok', true);
  end if;

  if p_action in ('experience_edit','experience_delete') then
    select * into post from tb_private.experiences where id = item_id and author_id = p_actor for update;
    if not found then raise exception 'NOT_FOUND'; end if;
    if p_action = 'experience_delete' then
      delete from tb_private.experiences where id = item_id;
      return jsonb_build_object('ok', true);
    end if;
    if post.status <> 'visible' then raise exception 'NOT_AVAILABLE'; end if;
  end if;

  if p_action in ('experience_publish','experience_edit') then
    if length(regexp_replace(next_body, '[[:space:]]', '', 'g')) < 12
      then raise exception 'SPAM'; end if;
    normalized_body := lower(regexp_replace(btrim(next_body), '[[:space:]]+', ' ', 'g'));
    body_hash := md5(normalized_body);
    delete from tb_private.experience_writes where user_id = p_actor and created_at <= time_limit;
    if exists (select 1 from tb_private.experience_writes w where w.user_id = p_actor
      and w.fingerprint = body_hash and w.experience_id is distinct from item_id)
      then raise exception 'DUPLICATE_POST'; end if;
    if (select count(*) from tb_private.experience_writes where user_id = p_actor) >= 10
      or (p_action = 'experience_publish' and (select count(*) from tb_private.experience_writes
        where user_id = p_actor and published) >= 3)
      then raise exception 'RATE_LIMIT'; end if;
    if p_action = 'experience_publish' then
      insert into tb_private.experiences(author_id, title, body, topic)
        values (p_actor, p_data->>'title', next_body, p_data->>'topic') returning id into item_id;
    else
      update tb_private.experiences set title = p_data->>'title', body = next_body, topic = p_data->>'topic'
        where id = item_id;
    end if;
    insert into tb_private.experience_writes(user_id, experience_id, fingerprint, published)
      values (p_actor, item_id, body_hash, p_action = 'experience_publish');
    return jsonb_build_object('id', item_id);
  end if;

  if p_action = 'experience_moderate' then
    select * into existing_report from tb_private.experience_reports
      where id = item_id and not resolved for update;
    if not found then raise exception 'NOT_FOUND'; end if;
    if p_data->>'decision' = 'hide' then
      update tb_private.experiences set status = 'hidden' where id = existing_report.experience_id;
      update tb_private.experience_reports set resolved = true where experience_id = existing_report.experience_id;
    elsif p_data->>'decision' = 'ban' then
      select author_id into target from tb_private.experiences where id = existing_report.experience_id;
      update tb_private.beta_members set enabled = false where user_id = target;
      delete from tb_private.reservations where user_id = target;
    elsif p_data->>'decision' is distinct from 'dismiss' then
      raise exception 'INVALID_DECISION';
    end if;
    update tb_private.experience_reports set resolved = true where id = item_id;
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'discover_bookmark' and not turn_on then
    delete from tb_private.bookmarks where user_id = p_actor and
      ((item_kind = 'question' and question_id = item_id) or (item_kind = 'experience' and experience_id = item_id));
    return jsonb_build_object('enabled', false);
  elsif p_action = 'experience_helpful' and not turn_on then
    delete from tb_private.experience_helpful where user_id = p_actor and experience_id = item_id;
    return jsonb_build_object('enabled', false);
  end if;

  select i.author_id into target from tb_private.discover_items(p_actor, item_kind, item_id) i;
  if not found then raise exception 'NOT_FOUND'; end if;
  if p_action = 'discover_bookmark' then
    insert into tb_private.bookmarks(user_id, question_id, experience_id)
      values (p_actor, case when item_kind = 'question' then item_id end,
        case when item_kind = 'experience' then item_id end) on conflict do nothing;
  elsif target = p_actor then
    raise exception 'FORBIDDEN';
  elsif p_action = 'experience_helpful' then
    insert into tb_private.experience_helpful(experience_id, user_id) values (item_id, p_actor) on conflict do nothing;
  elsif p_action = 'experience_report' then
    insert into tb_private.experience_reports(experience_id, reporter_id, reason)
      values (item_id, p_actor, p_data->>'reason') on conflict do nothing;
  elsif p_action = 'discover_block' then
    insert into tb_private.blocks(user_id, blocked_id) values (p_actor, target) on conflict do nothing;
    delete from tb_private.reservations r using tb_private.questions q where r.question_id = q.id
      and ((q.author_id = p_actor and r.user_id = target) or (q.author_id = target and r.user_id = p_actor));
  end if;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.tb_v2_discover(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.tb_v2_discover(uuid, text, jsonb) to service_role;
commit;
