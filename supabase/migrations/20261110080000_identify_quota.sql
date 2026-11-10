-- Redline: daily limit for AI car identification (Edge Function identify-car): 15 photos per user per
-- day, so the free provider allowance (~60-80 photos a day in total) is shared fairly.
-- The function calls public.consume_identify_quota() with the caller's own session, so it needs no
-- service-role key. Usage rows live in the private schema, which the API never exposes.

create table if not exists private.identify_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table private.identify_usage enable row level security;

create index if not exists identify_usage_user_time_idx on private.identify_usage (user_id, created_at desc);

-- Counts the caller's identifications in the last 24 hours, records this one and returns how many are
-- left. Raises 'quota_exceeded' when the limit is reached and 'not_authenticated' without a session.
create or replace function public.consume_identify_quota()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  daily_limit constant integer := 15;
  used integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select count(*) into used
  from private.identify_usage
  where user_id = auth.uid() and created_at > now() - interval '24 hours';

  if used >= daily_limit then
    raise exception 'quota_exceeded' using errcode = 'P0001';
  end if;

  insert into private.identify_usage (user_id) values (auth.uid());

  -- Keep the table small: forget calls older than two days.
  delete from private.identify_usage where created_at < now() - interval '2 days';

  return daily_limit - used - 1;
end;
$$;

revoke all on function public.consume_identify_quota() from public, anon;
grant execute on function public.consume_identify_quota() to authenticated;
