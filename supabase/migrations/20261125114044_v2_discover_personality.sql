begin;

alter table tb_private.profiles
  add column discover_personality_shared boolean not null default false;

-- Coarse stages are the only author inputs to publicly observable filters.
-- Validate all five values before projecting anything, including highlights.
create function tb_private.discover_personality(scores jsonb, variant text)
returns jsonb language sql immutable security invoker set search_path = '' as $$
  with marks as (
    select trait, ord, case when jsonb_typeof(scores->trait) = 'number'
      then (scores->>trait)::numeric end as score
    from unnest(array['O','C','E','A','N']) with ordinality as dims(trait, ord)
  ), valid as (
    select 1 from marks
    having count(score) = 5 and bool_and(score between 1 and 5)
  )
  select jsonb_build_object(
    'bands', (select jsonb_object_agg(trait, case
      when score < 2.5 then 'low' when score > 3.5 then 'high' else 'middle' end) from marks),
    'highlights', (select coalesce(jsonb_agg(chosen.trait order by chosen.ord), '[]') from (
      select trait, ord from marks where abs(score - 3) >= 1
      order by abs(score - 3) desc, ord limit 2
    ) chosen),
    'short_test', variant = 'short'
  ) from valid where variant in ('short', 'full');
$$;

-- Same topic dimensions as topicTraits in lib/v2/matching.ts.
create function tb_private.discover_topic_traits(topic text)
returns text[] language sql immutable security invoker set search_path = '' as $$
  select case topic
    when 'relationships' then array['A','E']
    when 'work' then array['C','E']
    when 'decisions' then array['O','N']
    when 'social' then array['E']
    when 'stress' then array['N']
    when 'habits' then array['C']
    when 'self' then array['O','N']
  end;
$$;

create function tb_private.discover_perspective(reader jsonb, author jsonb, topic text)
returns text language sql immutable strict security invoker set search_path = '' as $$
  select case
    when avg(distance) <= 0.5 then 'similar'
    when avg(distance) >= 1 then 'different'
  end
  from (
    select abs(
      array_position(array['low','middle','high'], reader->>trait) -
      array_position(array['low','middle','high'], author->>trait)
    ) as distance
    from unnest(tb_private.discover_topic_traits(topic)) as relevant(trait)
  ) d;
$$;

-- Feed reads and sharing settings are separate from the existing write and
-- moderation gateway. Keep the original visibility predicate for all lists.
create function public.tb_v2_discover_profile(p_actor uuid, p_action text, p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  reader tb_private.profiles;
  reader_bands jsonb;
  perspective text;
  share boolean;
  result jsonb;
begin
  if p_actor is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(748923,2);
  if not exists (select 1 from tb_private.beta_members where user_id = p_actor and enabled)
    then raise exception 'BETA_REQUIRED'; end if;
  select * into reader from tb_private.profiles where id = p_actor;
  if not found then raise exception 'ONBOARDING_REQUIRED'; end if;

  if p_action = 'discover_personality' then
    if jsonb_typeof(p_data->'enabled') is distinct from 'boolean'
      then raise exception 'INVALID_INPUT'; end if;
    share := (p_data->>'enabled')::boolean;
    if share and tb_private.discover_personality(reader.scores, reader.variant) is null
      then raise exception 'DISCOVER_TEST_REQUIRED'; end if;
    update tb_private.profiles set discover_personality_shared = share where id = p_actor;
    return jsonb_build_object('enabled', share);
  end if;

  if p_action is null or p_action not in ('discover_feed','discover_saved','discover_own')
    then raise exception 'UNKNOWN_ACTION'; end if;
  if p_action = 'discover_feed' then
    perspective := p_data->>'perspective';
    if perspective is not null then
      if perspective not in ('similar','different') then raise exception 'INVALID_INPUT'; end if;
      reader_bands := tb_private.discover_personality(reader.scores, reader.variant)->'bands';
      if reader_bands is null then return '[]'; end if;
    end if;
  end if;

  with items as (
    select v.* from tb_private.discover_items(p_actor, p_data->>'kind', null) v
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
    join tb_private.profiles author on author.id = i.author_id
    where (p_data->>'topic' is null or i.topic = p_data->>'topic')
      and (p_data->>'before_at' is null or (i.created_at, i.id, i.kind) <
        ((p_data->>'before_at')::timestamptz, (p_data->>'before_id')::uuid, p_data->>'before_kind'))
      and (perspective is null or (
        i.author_id <> p_actor and author.discover_personality_shared
        and tb_private.discover_perspective(reader_bands,
          tb_private.discover_personality(author.scores, author.variant)->'bands', i.topic) = perspective
      ))
    order by i.created_at desc, i.id desc, i.kind desc
    limit 25
  )
  select coalesce(jsonb_agg(
    (to_jsonb(i) - 'author_id') || jsonb_build_object(
      'author', tb_private.person(i.author_id),
      'personality', case when i.status <> 'hidden' and author.discover_personality_shared
        then tb_private.discover_personality(author.scores, author.variant) end,
      'bookmarked', i.status <> 'hidden' and exists (
        select 1 from tb_private.bookmarks b where b.user_id = p_actor
          and ((i.kind = 'question' and b.question_id = i.id) or (i.kind = 'experience' and b.experience_id = i.id))
      ),
      'helpful', i.kind = 'experience' and i.status = 'visible' and exists (
        select 1 from tb_private.experience_helpful h where h.user_id = p_actor and h.experience_id = i.id
      )
    ) order by i.created_at desc, i.id desc, i.kind desc), '[]') into result
  from page i join tb_private.profiles author on author.id = i.author_id;
  return result;
end $$;

revoke all on function tb_private.discover_personality(jsonb, text),
  tb_private.discover_topic_traits(text), tb_private.discover_perspective(jsonb, jsonb, text),
  public.tb_v2_discover_profile(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function tb_private.discover_personality(jsonb, text),
  tb_private.discover_topic_traits(text), tb_private.discover_perspective(jsonb, jsonb, text),
  public.tb_v2_discover_profile(uuid, text, jsonb) to service_role;

commit;
