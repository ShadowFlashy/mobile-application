-- =====================================================================
-- Redline 2.0 – Co-Driver, collector album and a safe owner portal.
-- Runs after 20261109120000_init_redline.sql and 20261110080000_identify_quota.sql.
-- Idempotent (safe to run twice) and additive: no v1 column is dropped, v1 clients keep working
-- (they simply stop seeing owner matches, which v2 hides on purpose).
-- =====================================================================

-- ---------------------------------------------------------------------
-- A.1 Helpers (private schema, never exposed through the Data API)
-- ---------------------------------------------------------------------
create or replace function private.keyed_hash(p_value text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_pepper text;
begin
  select s.value into v_pepper from private.app_secrets s where s.name = 'plate_pepper';
  return encode(extensions.hmac(coalesce(p_value, ''), v_pepper, 'sha256'), 'hex');
end;
$$;
revoke all on function private.keyed_hash(text) from public, anon, authenticated;

create or replace function private.is_demo_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from auth.users u where u.id = p_user_id and lower(u.email) = 'demo@redline.test');
$$;
revoke all on function private.is_demo_user(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- A.2 Catalogue: body style, country of origin, season
-- ---------------------------------------------------------------------
alter table public.car_models add column if not exists body_style text not null default 'other';
alter table public.car_models add column if not exists country text not null default 'XX';
alter table public.car_models add column if not exists season smallint not null default 1;

alter table public.car_models drop constraint if exists car_models_body_style_check;
alter table public.car_models add constraint car_models_body_style_check
  check (body_style in ('hatchback', 'sedan', 'wagon', 'coupe', 'convertible', 'suv', 'pickup', 'van', 'supercar', 'other'));
alter table public.car_models drop constraint if exists car_models_country_check;
alter table public.car_models add constraint car_models_country_check check (country ~ '^[A-Z]{2}$');

-- ---------------------------------------------------------------------
-- A.3 Spots: Co-Driver + collector columns
-- ---------------------------------------------------------------------
alter table public.spots add column if not exists city text;
alter table public.spots add column if not exists paint text not null default 'other';
alter table public.spots add column if not exists body_style text not null default 'other';
alter table public.spots add column if not exists plates_hidden smallint not null default 0;
alter table public.spots add column if not exists identified_by text not null default 'manual';
alter table public.spots add column if not exists ai_confidence real;
alter table public.spots add column if not exists ai_model_id text references public.car_models (id) on delete set null;
alter table public.spots add column if not exists generation text;
alter table public.spots add column if not exists year_from smallint;
alter table public.spots add column if not exists year_to smallint;
alter table public.spots add column if not exists photo_hash text;
alter table public.spots add column if not exists share_name_with_owner boolean not null default false;

alter table public.spots drop constraint if exists spots_city_check;
alter table public.spots add constraint spots_city_check check (city is null or char_length(city) between 1 and 60);
alter table public.spots drop constraint if exists spots_paint_check;
alter table public.spots add constraint spots_paint_check check (paint in
  ('black', 'white', 'silver', 'grey', 'red', 'blue', 'green', 'yellow', 'orange', 'brown', 'beige', 'purple', 'gold', 'other'));
alter table public.spots drop constraint if exists spots_body_style_check;
alter table public.spots add constraint spots_body_style_check
  check (body_style in ('hatchback', 'sedan', 'wagon', 'coupe', 'convertible', 'suv', 'pickup', 'van', 'supercar', 'other'));
alter table public.spots drop constraint if exists spots_plates_hidden_check;
alter table public.spots add constraint spots_plates_hidden_check check (plates_hidden between 0 and 20);
alter table public.spots drop constraint if exists spots_identified_by_check;
alter table public.spots add constraint spots_identified_by_check check (identified_by in ('manual', 'ai', 'ai_edited'));
alter table public.spots drop constraint if exists spots_ai_confidence_check;
alter table public.spots add constraint spots_ai_confidence_check check (ai_confidence is null or (ai_confidence >= 0 and ai_confidence <= 1));
alter table public.spots drop constraint if exists spots_generation_check;
alter table public.spots add constraint spots_generation_check check (generation is null or char_length(generation) <= 30);
alter table public.spots drop constraint if exists spots_years_check;
alter table public.spots add constraint spots_years_check check (
  (year_from is null or year_from between 1885 and 2100) and (year_to is null or year_to between 1885 and 2100));
alter table public.spots drop constraint if exists spots_photo_hash_check;
alter table public.spots add constraint spots_photo_hash_check check (photo_hash is null or photo_hash ~ '^[0-9a-f]{16}$');

create index if not exists spots_user_created_idx on public.spots (user_id, created_at desc);

-- Column privileges (select stays table-level, rows are still limited by RLS to the spotter).
revoke insert, update on public.spots from anon, authenticated;
grant insert (id, car_model_id, make, model, photo_path, location_label, notes, spotted_at, plate_input,
              city, paint, body_style, plates_hidden, identified_by, ai_confidence, ai_model_id,
              generation, year_from, year_to, photo_hash, share_name_with_owner)
  on public.spots to authenticated;
grant update (car_model_id, make, model, location_label, notes, city, paint, body_style,
              identified_by, generation, year_from, year_to, share_name_with_owner)
  on public.spots to authenticated;

-- ---------------------------------------------------------------------
-- A.4 Private plate matches (replace spots.owner_car_id / spots.vanity_plate for v2)
-- ---------------------------------------------------------------------
create table if not exists private.spot_matches (
  spot_id uuid primary key,
  owner_car_id uuid not null references public.owner_cars (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists spot_matches_owner_car_idx on private.spot_matches (owner_car_id);
alter table private.spot_matches enable row level security;
revoke all on private.spot_matches from public, anon, authenticated;

-- Move v1 matches out of the spotter-readable row (v1 leaked them: a plate-registration oracle),
-- and drop the copied vanity plates (they survived car and account deletion).
insert into private.spot_matches (spot_id, owner_car_id)
select s.id, s.owner_car_id from public.spots s where s.owner_car_id is not null
on conflict (spot_id) do nothing;
update public.spots set owner_car_id = null, vanity_plate = null
where owner_car_id is not null or vanity_plate is not null;

create or replace function private.spots_after_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from private.spot_matches m where m.spot_id = old.id;
  return null;
end;
$$;
drop trigger if exists spots_after_delete on public.spots;
create trigger spots_after_delete
  after delete on public.spots
  for each row execute function private.spots_after_delete();

-- ---------------------------------------------------------------------
-- A.5 Owner cars: verification, visibility, safety limits
-- ---------------------------------------------------------------------
alter table public.owner_cars add column if not exists verified_at timestamptz;
alter table public.owner_cars add column if not exists verify_code_hash text;
alter table public.owner_cars add column if not exists verify_expires_at timestamptz;
alter table public.owner_cars add column if not exists verify_attempts smallint not null default 0;
alter table public.owner_cars add column if not exists verify_attempts_day date;
alter table public.owner_cars add column if not exists visibility text not null default 'hidden';
alter table public.owner_cars add column if not exists shoutout text;
alter table public.owner_cars add column if not exists pings_paused boolean not null default false;
alter table public.owner_cars add column if not exists car_model_id text references public.car_models (id) on delete set null;

alter table public.owner_cars drop constraint if exists owner_cars_visibility_check;
alter table public.owner_cars add constraint owner_cars_visibility_check check (visibility in ('hidden', 'badge', 'vanity'));
alter table public.owner_cars drop constraint if exists owner_cars_shoutout_check;
alter table public.owner_cars add constraint owner_cars_shoutout_check check (shoutout is null or char_length(shoutout) <= 80);

-- v1 "show my plate" becomes the vanity visibility.
update public.owner_cars set visibility = 'vanity' where show_plate and visibility = 'hidden';

-- "First claim wins" is gone: several pending claims may exist, only ONE verified owner per plate.
alter table public.owner_cars drop constraint if exists owner_cars_plate_hash_key;
create unique index if not exists owner_cars_owner_plate_key on public.owner_cars (owner_id, plate_hash);
create unique index if not exists owner_cars_verified_plate_key on public.owner_cars (plate_hash) where verified_at is not null;

create or replace function private.owner_cars_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_normalised text;
  v_hash text;
begin
  if tg_op = 'INSERT' then
    -- API calls always carry a user; seed scripts in the SQL editor may pass owner_id explicitly.
    new.owner_id := coalesce(auth.uid(), new.owner_id);
    if new.owner_id is null then
      raise exception 'not_authenticated' using errcode = '28000';
    end if;
    if (select count(*) from public.owner_cars c where c.owner_id = new.owner_id) >= 3 then
      raise exception 'You can register at most 3 cars' using errcode = 'P0001';
    end if;
    new.verified_at := null;
    new.verify_code_hash := null;
    new.verify_expires_at := null;
    new.verify_attempts := 0;
    new.verify_attempts_day := null;
    if new.show_plate and new.visibility = 'hidden' then
      new.visibility := 'vanity'; -- v1 client
    end if;
  else
    new.owner_id := old.owner_id;
    if new.show_plate is distinct from old.show_plate and new.visibility is not distinct from old.visibility then
      new.visibility := case when new.show_plate then 'vanity' else 'hidden' end; -- v1 client
    end if;
  end if;
  new.show_plate := (new.visibility = 'vanity');

  if new.plate_input is not null then
    v_normalised := upper(regexp_replace(new.plate_input, '[^A-Za-z0-9]', '', 'g'));
    if char_length(v_normalised) < 2 or char_length(v_normalised) > 12 then
      raise exception 'A licence plate needs 2 to 12 letters or digits' using errcode = '22023';
    end if;
    v_hash := private.hash_plate(v_normalised);
    if tg_op = 'UPDATE' and v_hash is distinct from old.plate_hash then
      raise exception 'The licence plate of a registered car cannot be changed' using errcode = '22023';
    end if;
    new.plate_hash := v_hash;
    new.plate_hint := right(v_normalised, 2);
    new.plate_display := case
      when new.visibility = 'vanity'
        then nullif(left(regexp_replace(upper(trim(new.plate_input)), '[^A-Z0-9 -]', '', 'g'), 14), '')
      else null
    end;
  elsif tg_op = 'INSERT' then
    raise exception 'A licence plate is required to register a car' using errcode = '22023';
  else
    new.plate_hash := old.plate_hash;
    new.plate_hint := old.plate_hint;
    if new.visibility <> 'vanity' then
      new.plate_display := null;
    elsif old.plate_display is not null then
      new.plate_display := old.plate_display;
    elsif old.visibility = 'vanity' then
      new.visibility := 'badge'; -- inconsistent old row: fall back instead of failing a system update
      new.show_plate := false;
      new.plate_display := null;
    else
      raise exception 'Re-enter your licence plate to show it on spots' using errcode = '22023';
    end if;
  end if;

  new.plate_input := null;
  return new;
end;
$$;
-- (trigger owner_cars_before_write from v1 keeps pointing at this function)

-- v2 reads the owner showcase live (get_spot_showcase), it is never copied into spot rows.
drop trigger if exists owner_cars_after_update on public.owner_cars;

revoke select, insert, update on public.owner_cars from anon, authenticated;
grant select (id, owner_id, make, model, nickname, plate_hint, show_plate, plate_display, visibility, shoutout,
              pings_paused, verified_at, verify_expires_at, car_model_id, created_at, updated_at)
  on public.owner_cars to authenticated;
grant insert (make, model, nickname, plate_input, show_plate, visibility, shoutout, car_model_id)
  on public.owner_cars to authenticated;
grant update (nickname, plate_input, show_plate, visibility, shoutout, pings_paused, car_model_id)
  on public.owner_cars to authenticated;
grant delete on public.owner_cars to authenticated;

-- ---------------------------------------------------------------------
-- A.6 Pings become privacy-safe snapshots
-- ---------------------------------------------------------------------
alter table public.spot_notifications add column if not exists car_label text not null default '';
alter table public.spot_notifications add column if not exists city text;
alter table public.spot_notifications add column if not exists spotted_hour timestamptz;
alter table public.spot_notifications add column if not exists photo_path text;
alter table public.spot_notifications add column if not exists spotter_name text;
alter table public.spot_notifications add column if not exists spotter_key text;
create index if not exists spot_notifications_dedupe_idx on public.spot_notifications (owner_car_id, spotter_key, created_at desc);
create index if not exists spot_notifications_photo_idx on public.spot_notifications (photo_path);
create index if not exists spot_notifications_unread_idx on public.spot_notifications (owner_id) where read_at is null;

-- Backfill v1 pings (no city: v1 free text could contain a street).
update public.spot_notifications n
   set car_label = coalesce(nullif(c.nickname, ''), c.make || ' ' || c.model),
       spotted_hour = date_trunc('hour', s.spotted_at),
       photo_path = s.photo_path
  from public.owner_cars c, public.spots s
 where c.id = n.owner_car_id and s.id = n.spot_id and n.car_label = '';

-- ---------------------------------------------------------------------
-- A.7 Rate-limit bookkeeping (counts only)
-- ---------------------------------------------------------------------
create table if not exists private.plate_lookups (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists plate_lookups_user_time_idx on private.plate_lookups (user_id, created_at desc);
alter table private.plate_lookups enable row level security;
revoke all on private.plate_lookups from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- A.8 Spot triggers v2
-- ---------------------------------------------------------------------
create or replace function private.spots_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
  v_car_id uuid;
  v_lookups integer;
begin
  new.user_id := auth.uid();
  if new.user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  -- Never trust the client's path: the photo always lives in the spotter's own folder.
  new.photo_path := new.user_id::text || '/' || new.id::text || '.jpg';
  new.owner_car_id := null; -- v2 keeps matches in private.spot_matches
  new.vanity_plate := null;
  if new.spotted_at is null or new.spotted_at > now() + interval '10 minutes' then
    new.spotted_at := now();
  end if;
  if new.identified_by = 'manual' then
    new.ai_confidence := null;
    new.ai_model_id := null;
  end if;

  if (select count(*) from public.spots s
      where s.user_id = new.user_id and s.created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Too many spots in one hour' using errcode = 'P0001';
  end if;

  if new.plate_input is not null then
    select count(*) into v_lookups from private.plate_lookups l
     where l.user_id = new.user_id and l.created_at > now() - interval '24 hours';
    -- Above the limit the spot still saves, it just is not matched (no oracle, no spam).
    if v_lookups < 30 then
      insert into private.plate_lookups (user_id) values (new.user_id);
      v_hash := private.hash_plate(new.plate_input);
      if v_hash is not null then
        select c.id into v_car_id from public.owner_cars c
         where c.plate_hash = v_hash and c.verified_at is not null;
        if v_car_id is not null then
          insert into private.spot_matches (spot_id, owner_car_id) values (new.id, v_car_id)
          on conflict (spot_id) do nothing;
        end if;
      end if;
    end if;
  end if;

  new.plate_input := null;
  return new;
end;
$$;

create or replace function private.spots_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_car public.owner_cars%rowtype;
  v_key text;
begin
  select c.* into v_car
    from private.spot_matches m
    join public.owner_cars c on c.id = m.owner_car_id
   where m.spot_id = new.id;
  if not found or v_car.verified_at is null or v_car.pings_paused then
    return null;
  end if;

  -- Per-car pseudonym of the spotter: dedupe (1 ping per spotter per car per 24 h), P1 blocking.
  v_key := private.keyed_hash('spotter:' || new.user_id::text || ':' || v_car.id::text);
  if exists (select 1 from public.spot_notifications n
             where n.owner_car_id = v_car.id and n.spotter_key = v_key
               and n.created_at > now() - interval '24 hours') then
    return null;
  end if;

  insert into public.spot_notifications
    (owner_id, owner_car_id, spot_id, car_label, city, spotted_hour, photo_path, spotter_name, spotter_key)
  values (
    v_car.owner_id, v_car.id, new.id,
    coalesce(nullif(v_car.nickname, ''), v_car.make || ' ' || v_car.model),
    new.city,
    date_trunc('hour', new.spotted_at),
    new.photo_path,
    case when new.share_name_with_owner
      then (select p.username from public.profiles p where p.id = new.user_id) end,
    v_key
  );
  return null;
end;
$$;
-- (triggers spots_before_insert / spots_after_insert from v1 keep pointing at these functions)

-- Owners no longer read spot rows (v1 leaked notes, user id, exact time and place).
drop policy if exists "Spots: owners read spots of their registered cars" on public.spots;

-- ---------------------------------------------------------------------
-- A.9 Owner verification (code on the dashboard + plate, compared here, never by the AI)
-- ---------------------------------------------------------------------
create or replace function public.start_owner_verification(p_car_id uuid)
returns table (code text, expires_at timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_alphabet constant text := 'ACDEFGHJKMNPQRTUVWXY34679'; -- 25 symbols, no look-alikes (0/O, 1/I/L, 2/Z, 5/S, 8/B)
  v_bytes bytea := extensions.gen_random_bytes(6);
  v_code text := '';
  v_expires timestamptz := now() + interval '30 minutes';
  i integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  perform 1 from public.owner_cars c
   where c.id = p_car_id and c.owner_id = auth.uid() and c.verified_at is null;
  if not found then
    raise exception 'car_not_found' using errcode = 'P0002';
  end if;
  for i in 0..5 loop
    v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % 25) + 1, 1);
  end loop;
  update public.owner_cars c
     set verify_code_hash = encode(extensions.digest(v_code, 'sha256'), 'hex'),
         verify_expires_at = v_expires
   where c.id = p_car_id;
  code := 'RL-' || v_code;
  expires_at := v_expires;
  return next;
end;
$$;
revoke all on function public.start_owner_verification(uuid) from public, anon;
grant execute on function public.start_owner_verification(uuid) to authenticated;

-- Called ONLY by the identify-car Edge Function (service role) with what the AI read in the photo.
create or replace function public.complete_owner_verification(
  p_user_id uuid, p_car_id uuid, p_plate_text text, p_code_text text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_car public.owner_cars%rowtype;
  v_code text := upper(regexp_replace(coalesce(p_code_text, ''), '[^A-Za-z0-9]', '', 'g'));
  v_attempts integer;
begin
  select c.* into v_car from public.owner_cars c
   where c.id = p_car_id and c.owner_id = p_user_id
   for update;
  if not found then
    return 'not_found';
  end if;
  if v_car.verified_at is not null then
    return 'already_verified';
  end if;

  v_attempts := case when v_car.verify_attempts_day is distinct from current_date then 0 else v_car.verify_attempts end;
  if v_attempts >= 5 then
    return 'too_many_attempts';
  end if;
  update public.owner_cars c
     set verify_attempts = v_attempts + 1, verify_attempts_day = current_date
   where c.id = p_car_id;

  if v_car.verify_code_hash is null or v_car.verify_expires_at is null or v_car.verify_expires_at < now() then
    return 'expired';
  end if;
  if char_length(v_code) = 8 and left(v_code, 2) = 'RL' then
    v_code := substr(v_code, 3);
  end if;
  if char_length(v_code) <> 6 then
    return 'code_unreadable';
  end if;
  if encode(extensions.digest(v_code, 'sha256'), 'hex') <> v_car.verify_code_hash then
    return 'code_mismatch';
  end if;
  if private.hash_plate(p_plate_text) is distinct from v_car.plate_hash then
    return 'plate_mismatch';
  end if;
  if exists (select 1 from public.owner_cars c where c.plate_hash = v_car.plate_hash and c.verified_at is not null) then
    return 'plate_taken';
  end if;

  update public.owner_cars c
     set verified_at = now(), verify_code_hash = null, verify_expires_at = null
   where c.id = p_car_id;
  return 'verified';
end;
$$;
revoke all on function public.complete_owner_verification(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.complete_owner_verification(uuid, uuid, text, text) to service_role;

-- ---------------------------------------------------------------------
-- A.10 Read models for the app
-- ---------------------------------------------------------------------
-- Owner showcase on a spotter's OWN spot, only when the verified owner opted in (badge / vanity).
create or replace function public.get_spot_showcase(p_spot_id uuid)
returns table (visibility text, shoutout text, vanity_plate text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.visibility,
         case when c.visibility in ('badge', 'vanity') then c.shoutout end,
         case when c.visibility = 'vanity' then c.plate_display end
    from public.spots s
    join private.spot_matches m on m.spot_id = s.id
    join public.owner_cars c on c.id = m.owner_car_id
   where s.id = p_spot_id
     and s.user_id = (select auth.uid())
     and c.verified_at is not null
     and c.visibility <> 'hidden';
$$;
revoke all on function public.get_spot_showcase(uuid) from public, anon;
grant execute on function public.get_spot_showcase(uuid) to authenticated;

-- Server-side counters (v1 counted the newest 50 pings on the client).
create or replace function public.get_owner_car_stats()
returns table (owner_car_id uuid, sightings integer, unread integer, last_city text, last_seen timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.id,
         count(n.id)::integer,
         (count(n.id) filter (where n.read_at is null))::integer,
         (array_agg(n.city order by n.created_at desc) filter (where n.city is not null))[1],
         max(n.spotted_hour)
    from public.owner_cars c
    left join public.spot_notifications n on n.owner_car_id = c.id
   where c.owner_id = (select auth.uid())
   group by c.id;
$$;
revoke all on function public.get_owner_car_stats() from public, anon;
grant execute on function public.get_owner_car_stats() to authenticated;

-- GDPR portability (UI in P1).
create or replace function public.export_my_data()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'exported_at', now(),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = (select auth.uid())),
    'spots', coalesce((
      select jsonb_agg((to_jsonb(s) - 'plate_input' - 'owner_car_id' - 'vanity_plate') order by s.spotted_at)
        from public.spots s where s.user_id = (select auth.uid())), '[]'::jsonb),
    'owner_cars', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'make', c.make, 'model', c.model, 'nickname', c.nickname,
                                          'plate_hint', c.plate_hint, 'visibility', c.visibility,
                                          'verified_at', c.verified_at, 'created_at', c.created_at))
        from public.owner_cars c where c.owner_id = (select auth.uid())), '[]'::jsonb),
    'sightings', coalesce((
      select jsonb_agg(jsonb_build_object('car_label', n.car_label, 'city', n.city,
                                          'spotted_hour', n.spotted_hour, 'created_at', n.created_at))
        from public.spot_notifications n where n.owner_id = (select auth.uid())), '[]'::jsonb)
  );
$$;
revoke all on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

-- ---------------------------------------------------------------------
-- A.11 Co-Driver quota status for the Trust Center (read-only; consume_identify_quota is NOT changed here)
-- ---------------------------------------------------------------------
create or replace function public.identify_quota_status()
returns table (remaining integer, daily_limit integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_limit constant integer := 15; -- must equal daily_limit in 20261110080000_identify_quota.sql
  v_used integer := 0;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if to_regclass('private.identify_usage') is not null then
    select count(*) into v_used from private.identify_usage u
     where u.user_id = v_user and u.created_at > now() - interval '24 hours';
  end if;
  remaining := greatest(v_limit - v_used, 0);
  daily_limit := v_limit;
  return next;
end;
$$;
revoke all on function public.identify_quota_status() from public, anon;
grant execute on function public.identify_quota_status() to authenticated;

-- ---------------------------------------------------------------------
-- A.12 Demo account guard + erasure
-- ---------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if private.is_demo_user(auth.uid()) then
    raise exception 'The shared demo account cannot be deleted' using errcode = 'P0001';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------------------
-- A.13 Storage: owners read ONLY the blurred photo of their own sightings
-- ---------------------------------------------------------------------
drop policy if exists "Spot photos: owners read photos of their car" on storage.objects;
drop policy if exists "Spot photos: owners read photos of their sightings" on storage.objects;
create policy "Spot photos: owners read photos of their sightings" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'spot-photos'
    and exists (
      select 1 from public.spot_notifications n
       where n.photo_path = objects.name and n.owner_id = (select auth.uid())
    )
  );

grant all on all tables in schema public to service_role;
notify pgrst, 'reload schema';

-- =====================================================================
-- Appendix E (activated): themed collections and production years
-- Same rules as above: idempotent and additive. Catalogue rows and memberships are seeded by
-- supabase/seed_collections.sql (run after seed.sql), so the 48 Season 1 rows stay untouched.
-- =====================================================================

-- ---------------------------------------------------------------------
-- E.1 Production years of a catalogue model (null = unknown / still in production for year_to)
-- ---------------------------------------------------------------------
alter table public.car_models add column if not exists year_from smallint, add column if not exists year_to smallint;

alter table public.car_models drop constraint if exists car_models_years_check;
alter table public.car_models add constraint car_models_years_check check (
  (year_from is null or year_from between 1885 and 2100)
  and (year_to is null or year_to between 1885 and 2100)
  and (year_from is null or year_to is null or year_to >= year_from));

-- ---------------------------------------------------------------------
-- E.2 Curated cross-category collections ("Japanese JDM Legends", "American Muscle & Classics", …)
-- Titles and descriptions are translated in the app (i18n namespace `collections`), never stored here.
-- ---------------------------------------------------------------------
create table if not exists public.collections (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  number smallint not null unique check (number > 0),
  sort smallint not null default 0
);

create table if not exists public.collection_models (
  collection_id text not null references public.collections (id) on delete cascade,
  car_model_id text not null references public.car_models (id) on delete cascade,
  primary key (collection_id, car_model_id)
);
create index if not exists collection_models_car_model_idx on public.collection_models (car_model_id);

-- Read-only reference data, like the catalogue: everyone may read it, no client may write it.
alter table public.collections enable row level security;
alter table public.collection_models enable row level security;

drop policy if exists "Collections: readable by everyone" on public.collections;
create policy "Collections: readable by everyone" on public.collections
  for select to anon, authenticated using (true);
drop policy if exists "Collection models: readable by everyone" on public.collection_models;
create policy "Collection models: readable by everyone" on public.collection_models
  for select to anon, authenticated using (true);

revoke insert, update, delete, truncate on public.collections from anon, authenticated;
revoke insert, update, delete, truncate on public.collection_models from anon, authenticated;
grant select on public.collections to anon, authenticated;
grant select on public.collection_models to anon, authenticated;

grant all on public.collections to service_role;
grant all on public.collection_models to service_role;
notify pgrst, 'reload schema';
