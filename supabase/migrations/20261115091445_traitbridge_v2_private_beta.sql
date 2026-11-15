-- Additive, isolated V2 schema. No V1 rows or policies are changed.
-- Apply first to a disposable staging database. Only the Next.js server can
-- invoke the public gateway; anon/authenticated have no table or RPC access.
begin;
create schema if not exists tb_private;
revoke all on schema tb_private from public, anon, authenticated;
grant usage on schema tb_private to service_role;

create table tb_private.beta_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default true,
 moderator boolean not null default false
);
create table tb_private.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 pseudonym text not null check (length(btrim(pseudonym)) between 2 and 30),
 avatar jsonb not null,
 scores jsonb not null check (scores ?& array['O','C','E','A','N']),
 variant text not null check (variant in ('short','full')),
 language text not null check (language in ('de','en')),
 interests text[] not null default '{}', experiences text[] not null default '{}',
 available boolean not null default true, notifications boolean not null default true,
 consent_version text not null default '2026-11-v2',
 consent_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create table tb_private.questions (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references tb_private.profiles(id) on delete cascade,
 body text not null check (length(btrim(body)) between 20 and 2000),
 topic text not null check (topic in ('relationships','work','decisions','social','stress','habits','self')),
 language text not null check (language in ('de','en')),
 discoverable boolean not null default false,
 status text not null default 'open' check (status in ('open','closed','hidden')),
 delivered_count integer not null default 0 check(delivered_count between 0 and 3),
 created_at timestamptz not null default now()
);
create table tb_private.assignments (
 question_id uuid not null references tb_private.questions(id) on delete cascade,
 user_id uuid not null references tb_private.profiles(id) on delete cascade,
 reason text not null check (reason in ('similar','broader','topic')),
 skipped boolean not null default false,
 created_at timestamptz not null default now(),
 primary key(question_id,user_id)
);
create table tb_private.reservations (
 id uuid primary key default gen_random_uuid(),
 question_id uuid not null references tb_private.questions(id) on delete cascade,
 user_id uuid not null references tb_private.profiles(id) on delete cascade,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '20 minutes'),
 unique(question_id,user_id)
);
create table tb_private.answers (
 id uuid primary key default gen_random_uuid(),
 question_id uuid not null references tb_private.questions(id) on delete cascade,
 author_id uuid not null references tb_private.profiles(id) on delete cascade,
 body text not null check (length(btrim(body)) between 20 and 4000),
 status text not null default 'visible' check (status in ('visible','hidden','deleted')),
 thanks text check(length(thanks)<=500), created_at timestamptz not null default now(),
 unique(question_id,author_id)
);
create table tb_private.blocks (
 user_id uuid not null references tb_private.profiles(id) on delete cascade,
 blocked_id uuid not null references tb_private.profiles(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,blocked_id), check(user_id<>blocked_id)
);
create table tb_private.notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references tb_private.profiles(id) on delete cascade,
 question_id uuid references tb_private.questions(id) on delete cascade,
 kind text not null check(kind in ('answer','thanks','question')),
 created_at timestamptz not null default now(), read_at timestamptz
);
create table tb_private.reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid references tb_private.profiles(id) on delete set null,
 question_id uuid references tb_private.questions(id) on delete cascade,
 answer_id uuid references tb_private.answers(id) on delete cascade,
 reason text not null check(length(btrim(reason)) between 3 and 1000),
 status text not null default 'open' check(status in ('open','resolved')),
 created_at timestamptz not null default now()
);
create table tb_private.events (
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null, created_at timestamptz not null default now()
);
create index on tb_private.questions(author_id,created_at desc);
create index on tb_private.questions(language,status,created_at);
create index on tb_private.assignments(user_id,created_at);
create index on tb_private.reservations(question_id,expires_at);
create index on tb_private.answers(author_id,created_at);
create index on tb_private.blocks(blocked_id,user_id);
create index on tb_private.notifications(user_id,created_at desc);
create index on tb_private.events(user_id,created_at desc);

do $$ declare t text; begin
 foreach t in array array['beta_members','profiles','questions','assignments','reservations','answers','blocks','notifications','reports','events'] loop
  execute format('alter table tb_private.%I enable row level security',t);
  execute format('revoke all on tb_private.%I from public, anon, authenticated',t);
  execute format('grant select,insert,update,delete on tb_private.%I to service_role',t);
 end loop;
end $$;

create function tb_private.blocked(a uuid,b uuid) returns boolean
language sql stable security invoker set search_path='' as $$
 select exists(select 1 from tb_private.blocks where (user_id=a and blocked_id=b) or (user_id=b and blocked_id=a))
$$;
create function tb_private.person(p uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('id',id,'pseudonym',pseudonym,'avatar',avatar) from tb_private.profiles where id=p
$$;
create function tb_private.question_json(q tb_private.questions) returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('id',q.id,'author',tb_private.person(q.author_id),'body',q.body,'topic',q.topic,'language',q.language,'discoverable',q.discoverable,'status',q.status,'created_at',q.created_at)
$$;
create function tb_private.can_read(a uuid,qid uuid) returns boolean
language sql stable security invoker set search_path='' as $$
 select exists(select 1 from tb_private.questions q
 join tb_private.beta_members m on m.user_id=q.author_id and m.enabled
 where q.id=qid and q.status<>'hidden' and not tb_private.blocked(a,q.author_id)
 and (q.author_id=a or q.discoverable or exists(select 1 from tb_private.assignments x where x.question_id=q.id and x.user_id=a and not x.skipped)
 or exists(select 1 from tb_private.answers r where r.question_id=q.id and r.author_id=a)))
$$;
revoke all on all functions in schema tb_private from public,anon,authenticated;
grant execute on all functions in schema tb_private to service_role;

-- SECURITY INVOKER: the service role is required. Never grant this to browser roles.
create function public.tb_v2(p_actor uuid,p_action text,p_data jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path='' as $$
declare
 p tb_private.profiles; q tb_private.questions; a tb_private.answers;
 r tb_private.reservations; target uuid; qid uuid; aid uuid;
 result jsonb; my_questions jsonb; my_answers jsonb; notes jsonb;
 matches jsonb; item jsonb; n integer; old_count integer;
begin
 -- Auth identity/permanent-account checks belong to server getUser. Membership
 -- has an auth.users FK, so deletion revokes it immediately. service_role is
 -- intentionally NOT granted SELECT on auth.users in hosted Supabase.
 if p_actor is null then raise exception 'AUTH_REQUIRED'; end if;
 -- One short transaction gate deliberately favours correctness over throughput
 -- in the small closed beta. Includes block/moderation races and rate counters.
 perform pg_advisory_xact_lock(748923,2);
 if p_action='delete_account_prepare' and exists(select 1 from tb_private.beta_members where user_id=p_actor) then
  update tb_private.beta_members set enabled=false where user_id=p_actor;
  delete from tb_private.reservations where user_id=p_actor;
  return jsonb_build_object('ok',true);
 end if;
 if not exists(select 1 from tb_private.beta_members where user_id=p_actor and enabled) then raise exception 'BETA_REQUIRED'; end if;
 select * into p from tb_private.profiles where id=p_actor;

 if p_action not in ('snapshot','candidates','help','discover','moderation') then
  select count(*) into n from tb_private.events where user_id=p_actor and created_at>now()-interval '1 hour';
  if n>=120 then raise exception 'RATE_LIMIT'; end if;
  insert into tb_private.events(user_id,action) values(p_actor,p_action);
  delete from tb_private.events where user_id=p_actor and created_at<now()-interval '7 days';
 end if;

 if p_action='onboard' then
  if p.id is not null then raise exception 'ALREADY_ONBOARDED'; end if;
  if p_data->>'adult_consent' is distinct from 'true' or p_data->>'matching_consent' is distinct from 'true' then raise exception 'CONSENT_REQUIRED'; end if;
  if not (p_data->'scores' ?& array['O','C','E','A','N']) then raise exception 'INVALID_PROFILE'; end if;
  for item in select value from jsonb_each(p_data->'scores') loop
   if jsonb_typeof(item)<>'number' or item::numeric not between 1 and 5 then raise exception 'INVALID_PROFILE'; end if;
  end loop;
  insert into tb_private.profiles(id,pseudonym,avatar,scores,variant,language,interests,experiences)
  values(p_actor,p_data->>'pseudonym',p_data->'avatar',p_data->'scores','short',p_data->>'language',
   array(select jsonb_array_elements_text(coalesce(p_data->'interests','[]'))),array(select jsonb_array_elements_text(coalesce(p_data->'experiences','[]'))));
  return jsonb_build_object('ok',true);
 end if;
 if p_action='snapshot' then
  if p.id is null then return jsonb_build_object('profile',null,'questions','[]'::jsonb,'answers','[]'::jsonb,'notifications','[]'::jsonb,'blocks','[]'::jsonb); end if;
  select coalesce(jsonb_agg(tb_private.question_json(qt) order by qt.created_at desc),'[]') into my_questions
   from tb_private.questions qt where tb_private.can_read(p_actor,qt.id)
   and (qt.author_id=p_actor or exists(select 1 from tb_private.answers ar where ar.question_id=qt.id and ar.author_id=p_actor));
  -- Each responder sees their own response only, never the other private replies.
  select coalesce(jsonb_agg(jsonb_build_object('id',ar.id,'question_id',ar.question_id,'author',tb_private.person(ar.author_id),'body',ar.body,'created_at',ar.created_at,'thanks',ar.thanks) order by ar.created_at),'[]') into my_answers
   from tb_private.answers ar join tb_private.questions qt on qt.id=ar.question_id
   join tb_private.beta_members am on am.user_id=ar.author_id and am.enabled
   where ar.status='visible' and tb_private.can_read(p_actor,qt.id) and not tb_private.blocked(p_actor,ar.author_id)
   and (qt.author_id=p_actor or ar.author_id=p_actor);
  select coalesce(jsonb_agg(to_jsonb(nn)-'user_id' order by nn.created_at desc),'[]') into notes
   from (select * from tb_private.notifications where user_id=p_actor and (question_id is null or tb_private.can_read(p_actor,question_id)) order by created_at desc limit 50) nn;
  return jsonb_build_object('profile',to_jsonb(p)-'consent_at'-'consent_version'-'created_at','questions',my_questions,'answers',my_answers,'notifications',notes,'moderator',(select moderator from tb_private.beta_members where user_id=p_actor),
   'blocks',(select coalesce(jsonb_agg(jsonb_build_object('id',b.blocked_id,'pseudonym',bp.pseudonym)),'[]') from tb_private.blocks b join tb_private.profiles bp on bp.id=b.blocked_id where b.user_id=p_actor));
 end if;
 if p.id is null then raise exception 'ONBOARDING_REQUIRED'; end if;

 if p_action='candidates' then
  if not p.available then return jsonb_build_object('reader',to_jsonb(p),'candidates','[]'::jsonb); end if;
  select coalesce(jsonb_agg(to_jsonb(c)),'[]') into result from (
   select qt.id, qt.author_id,op.scores,qt.topic,qt.language,qt.created_at,
    false as answered,false as skipped,false as blocked,true as available,
    3-qt.delivered_count-(select count(*) from tb_private.reservations rr where rr.question_id=qt.id and rr.expires_at>now()) as slots
   from tb_private.questions qt join tb_private.profiles op on op.id=qt.author_id
   join tb_private.beta_members bm on bm.user_id=qt.author_id and bm.enabled
   where qt.status='open' and op.available and qt.language=p.language and qt.author_id<>p_actor and not tb_private.blocked(p_actor,qt.author_id)
   and not exists(select 1 from tb_private.assignments x where x.question_id=qt.id and x.user_id=p_actor)
   and not exists(select 1 from tb_private.answers ar where ar.question_id=qt.id and ar.author_id=p_actor)
   order by qt.created_at asc limit 200
  ) c;
  return jsonb_build_object('reader',to_jsonb(p),'candidates',result);
 end if;
 if p_action='assign' then
  if not p.available then return '[]'; end if;
  select count(*) into n from tb_private.assignments where user_id=p_actor and created_at>now()-interval '24 hours';
  for item in select * from jsonb_array_elements(p_data->'matches') loop
   exit when n>=6;
   qid:=(item->>'id')::uuid;
   select * into q from tb_private.questions where id=qid for update;
   if q.status='open' and q.author_id<>p_actor and q.language=p.language and not tb_private.blocked(p_actor,q.author_id)
    and exists(select 1 from tb_private.beta_members where user_id=q.author_id and enabled)
    and exists(select 1 from tb_private.profiles where id=q.author_id and available) then
    insert into tb_private.assignments(question_id,user_id,reason) values(qid,p_actor,item->>'reason') on conflict do nothing;
    get diagnostics old_count=row_count; n:=n+old_count;
    if old_count>0 and p.notifications then insert into tb_private.notifications(user_id,question_id,kind) values(p_actor,qid,'question'); end if;
   end if;
  end loop;
  return jsonb_build_object('ok',true);
 end if;
 if p_action in ('help','discover') then
  select coalesce(jsonb_agg(tb_private.question_json(qt)||jsonb_build_object('reason',x.reason) order by qt.created_at desc),'[]') into result
  from tb_private.questions qt left join tb_private.assignments x on x.question_id=qt.id and x.user_id=p_actor
  where qt.status='open' and qt.author_id<>p_actor and qt.language=p.language and tb_private.can_read(p_actor,qt.id)
   and qt.delivered_count<3
   and not exists(select 1 from tb_private.answers ar where ar.question_id=qt.id and ar.author_id=p_actor)
   and not coalesce(x.skipped,false)
   and ((p_action='help' and p.available and x.user_id is not null) or (p_action='discover' and qt.discoverable));
  return coalesce((select jsonb_agg(value) from (select value from jsonb_array_elements(result) limit 12) limited),'[]');
 end if;
 if p_action='question' then
  select * into q from tb_private.questions where author_id=p_actor and body=p_data->>'body' and created_at>now()-interval '24 hours' order by created_at desc limit 1;
  if q.id is not null then return tb_private.question_json(q); end if;
  if (select count(*) from tb_private.questions where author_id=p_actor and created_at>now()-interval '24 hours')>=5 then raise exception 'RATE_LIMIT'; end if;
  insert into tb_private.questions(author_id,body,topic,language,discoverable) values(p_actor,p_data->>'body',p_data->>'topic',p.language,coalesce((p_data->>'discoverable')::boolean,false)) returning * into q;
  return tb_private.question_json(q);
 end if;
 if p_action in ('reserve','renew','release','skip','answer','close','delete_question','report') then
  qid:=(p_data->>'question_id')::uuid;
  select * into q from tb_private.questions where id=qid for update;
  if q.id is null or not tb_private.can_read(p_actor,qid) then raise exception 'NOT_FOUND'; end if;
 end if;
 if p_action in ('reserve','renew','answer') then
  if q.author_id=p_actor or q.status<>'open' or not p.available then raise exception 'NOT_AVAILABLE'; end if;
  if exists(select 1 from tb_private.assignments where question_id=qid and user_id=p_actor and skipped) then raise exception 'NOT_AVAILABLE'; end if;
  select * into a from tb_private.answers where question_id=qid and author_id=p_actor;
  if a.id is not null then
   if p_action='answer' then return jsonb_build_object('id',a.id,'duplicate',true); end if;
   raise exception 'ALREADY_ANSWERED';
  end if;
  delete from tb_private.reservations where question_id=qid and expires_at<=now();
  select * into r from tb_private.reservations where question_id=qid and user_id=p_actor;
  if p_action='reserve' and r.id is null then
   select q.delivered_count+(select count(*) from tb_private.reservations where question_id=qid) into n;
   if n>=3 then raise exception 'NO_SLOT'; end if;
   insert into tb_private.reservations(question_id,user_id) values(qid,p_actor) returning * into r;
  end if;
  if r.id is null or (p_action<>'reserve' and r.id is distinct from (p_data->>'reservation_id')::uuid) then raise exception 'RESERVATION_EXPIRED'; end if;
  if p_action='renew' then
   update tb_private.reservations set expires_at=least(now()+interval '20 minutes',created_at+interval '2 hours') where id=r.id returning * into r;
  elsif p_action='answer' then
   if (select count(*) from tb_private.answers where author_id=p_actor and created_at>now()-interval '24 hours')>=20 then raise exception 'RATE_LIMIT'; end if;
   insert into tb_private.answers(question_id,author_id,body) values(qid,p_actor,p_data->>'body') returning * into a;
   update tb_private.questions set delivered_count=delivered_count+1 where id=qid;
   delete from tb_private.reservations where id=r.id;
   if (select notifications from tb_private.profiles where id=q.author_id) then insert into tb_private.notifications(user_id,question_id,kind) values(q.author_id,qid,'answer'); end if;
   return jsonb_build_object('id',a.id);
  end if;
  return jsonb_build_object('id',r.id,'expires_at',r.expires_at);
 end if;
 if p_action in ('release','skip') then
  delete from tb_private.reservations where question_id=qid and user_id=p_actor;
  if p_action='skip' then insert into tb_private.assignments(question_id,user_id,reason,skipped) values(qid,p_actor,'topic',true) on conflict(question_id,user_id) do update set skipped=true; end if;
 elsif p_action in ('close','delete_question') then
  if q.author_id<>p_actor then raise exception 'FORBIDDEN'; end if;
  if p_action='close' then update tb_private.questions set status='closed' where id=qid;
  else delete from tb_private.questions where id=qid; end if;
 elsif p_action='thanks' then
  aid:=(p_data->>'answer_id')::uuid;
  select * into a from tb_private.answers where id=aid for update;
  select * into q from tb_private.questions where id=a.question_id;
  if q.author_id<>p_actor or a.status<>'visible' or not tb_private.can_read(p_actor,q.id) or tb_private.blocked(p_actor,a.author_id) then raise exception 'FORBIDDEN'; end if;
  if a.thanks is null then
   update tb_private.answers set thanks=coalesce(p_data->>'body','') where id=aid;
   if (select notifications from tb_private.profiles where id=a.author_id) then insert into tb_private.notifications(user_id,question_id,kind) values(a.author_id,q.id,'thanks'); end if;
  end if;
 elsif p_action='delete_answer' then
  update tb_private.answers set body='[Deleted by its author]',thanks=null,status='deleted' where id=(p_data->>'answer_id')::uuid and author_id=p_actor;
 elsif p_action='report' then
  aid:=(p_data->>'answer_id')::uuid;
  if aid is not null and not exists(select 1 from tb_private.answers where id=aid and question_id=qid and (author_id=p_actor or q.author_id=p_actor)) then raise exception 'FORBIDDEN'; end if;
  if not exists(select 1 from tb_private.reports where reporter_id=p_actor and question_id=qid and answer_id is not distinct from aid and status='open') then
   insert into tb_private.reports(reporter_id,question_id,answer_id,reason) values(p_actor,qid,aid,p_data->>'reason');
  end if;
 elsif p_action='block' then
  target:=(p_data->>'user_id')::uuid;
  -- Prevent using the API as an unrestricted profile directory.
  if not exists(select 1 from tb_private.questions qt where tb_private.can_read(p_actor,qt.id) and
   (qt.author_id=target or (qt.author_id=p_actor and exists(select 1 from tb_private.answers ar where ar.question_id=qt.id and ar.author_id=target)))) then raise exception 'FORBIDDEN'; end if;
  insert into tb_private.blocks(user_id,blocked_id) values(p_actor,target) on conflict do nothing;
  delete from tb_private.reservations rr using tb_private.questions qt where rr.question_id=qt.id and ((qt.author_id=p_actor and rr.user_id=target) or (qt.author_id=target and rr.user_id=p_actor));
 elsif p_action='unblock' then
  delete from tb_private.blocks where user_id=p_actor and blocked_id=(p_data->>'user_id')::uuid;
 elsif p_action='preferences' then
  update tb_private.profiles set pseudonym=p_data->>'pseudonym',avatar=p_data->'avatar',language=p_data->>'language',available=(p_data->>'available')::boolean,notifications=(p_data->>'notifications')::boolean,
   interests=array(select jsonb_array_elements_text(p_data->'interests')),experiences=array(select jsonb_array_elements_text(p_data->'experiences')) where id=p_actor;
  if p_data->>'available'='false' then delete from tb_private.reservations where user_id=p_actor; end if;
 elsif p_action='sync_full' then
  if not (p_data->'scores' ?& array['O','C','E','A','N']) then raise exception 'INVALID_PROFILE'; end if;
  update tb_private.profiles set scores=p_data->'scores',variant='full' where id=p_actor;
 elsif p_action='read' then
  update tb_private.notifications set read_at=now() where user_id=p_actor and read_at is null;
 elsif p_action='moderation' then
  if not exists(select 1 from tb_private.beta_members where user_id=p_actor and moderator and enabled) then raise exception 'FORBIDDEN'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id',rr.id,'question_id',rr.question_id,'answer_id',rr.answer_id,'reason',rr.reason,'created_at',rr.created_at,'body',coalesce(ar.body,qt.body),'author_id',coalesce(ar.author_id,qt.author_id)) order by rr.created_at),'[]') from tb_private.reports rr left join tb_private.questions qt on qt.id=rr.question_id left join tb_private.answers ar on ar.id=rr.answer_id where rr.status='open');
 elsif p_action='moderate' then
  if not exists(select 1 from tb_private.beta_members where user_id=p_actor and moderator and enabled) then raise exception 'FORBIDDEN'; end if;
  select question_id,answer_id into qid,aid from tb_private.reports where id=(p_data->>'report_id')::uuid;
  if p_data->>'decision'='hide' then
   if aid is null then update tb_private.questions set status='hidden' where id=qid;
   else update tb_private.answers set status='hidden' where id=aid; end if;
  elsif p_data->>'decision'='ban' then
   select coalesce(ar.author_id,qt.author_id) into target from tb_private.reports rr left join tb_private.questions qt on qt.id=rr.question_id left join tb_private.answers ar on ar.id=rr.answer_id where rr.id=(p_data->>'report_id')::uuid;
   update tb_private.beta_members set enabled=false where user_id=target;
   delete from tb_private.reservations where user_id=target;
  elsif p_data->>'decision'<>'dismiss' then raise exception 'INVALID_DECISION'; end if;
  update tb_private.reports set status='resolved' where id=(p_data->>'report_id')::uuid;
 elsif p_action='delete_account_prepare' then
  update tb_private.beta_members set enabled=false where user_id=p_actor;
  delete from tb_private.reservations where user_id=p_actor;
 else raise exception 'UNKNOWN_ACTION';
 end if;
 return jsonb_build_object('ok',true);
end
$$;
revoke all on function public.tb_v2(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.tb_v2(uuid,text,jsonb) to service_role;
comment on function public.tb_v2(uuid,text,jsonb) is 'Server-only V2 gateway. Actor MUST be verified with Supabase Auth getUser by Next.js. Never grant to authenticated or anon.';
commit;
