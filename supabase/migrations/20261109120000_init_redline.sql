-- =====================================================================
-- Redline – initial database schema
-- Apply via the Supabase SQL editor or supabase db push.
--
-- Privacy by design (GDPR, see README → Privacy):
--   * Photos are pixelated on the device BEFORE upload (licence plates never reach the server).
--   * A licence plate typed by a spotter is only used to look up an owner registration
--     and is cleared before the row is written (plate_input is write-only).
--   * Owner plates are stored as an HMAC-SHA256 hash with a server-side secret ("pepper").
--   * A plate is only ever shown when its owner explicitly opts in (vanity plates).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Private schema: never exposed through the Data API
-- ---------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_secrets (
  name text primary key,
  value text not null
);
revoke all on table private.app_secrets from public, anon, authenticated;
alter table private.app_secrets enable row level security; -- defence in depth: no policies, so no client access

insert into private.app_secrets (name, value)
values ('plate_pepper', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (name) do nothing;

-- Normalises a licence plate ("1-abc-234" -> "1ABC234") and returns its keyed hash.
create or replace function private.hash_plate(p_plate text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_normalised text;
  v_pepper text;
begin
  v_normalised := upper(regexp_replace(coalesce(p_plate, ''), '[^A-Za-z0-9]', '', 'g'));
  if char_length(v_normalised) < 2 then
    return null;
  end if;
  select s.value into v_pepper from private.app_secrets s where s.name = 'plate_pepper';
  return encode(extensions.hmac(v_normalised, v_pepper, 'sha256'), 'hex');
end;
$$;

-- ---------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 24),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "Profiles: users read their own profile" on public.profiles;
create policy "Profiles: users read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Profiles: users update their own profile" on public.profiles;
create policy "Profiles: users update their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (username) on public.profiles to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
  v_suffix text := left(replace(new.id::text, '-', ''), 6);
begin
  v_username := coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1));
  v_username := left(v_username, 24);
  if char_length(v_username) < 3 or exists (select 1 from public.profiles p where p.username = v_username) then
    v_username := left(v_username, 17) || '_' || v_suffix;
  end if;
  insert into public.profiles (id, username) values (new.id, v_username);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------
-- Sticker catalogue (collectible car models)
-- ---------------------------------------------------------------------
create table if not exists public.car_models (
  id text primary key,
  sticker_number integer not null unique,
  make text not null,
  model text not null,
  category text not null check (category in ('icon', 'sports', 'supercar', 'hypercar', 'classic', 'jdm', 'muscle', 'electric')),
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary'))
);
alter table public.car_models enable row level security;

drop policy if exists "Car models: readable by everyone" on public.car_models;
create policy "Car models: readable by everyone" on public.car_models
  for select to anon, authenticated using (true);

revoke insert, update, delete on public.car_models from anon, authenticated;

-- ---------------------------------------------------------------------
-- Owner portal: cars registered by their owners
-- ---------------------------------------------------------------------
create table if not exists public.owner_cars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  make text not null check (char_length(make) between 1 and 40),
  model text not null check (char_length(model) between 1 and 60),
  nickname text check (char_length(nickname) <= 40),
  plate_input text,            -- write-only, cleared by trigger
  plate_hash text not null,    -- HMAC-SHA256 of the normalised plate
  plate_hint text not null,    -- last two characters so owners recognise their entry
  show_plate boolean not null default false,
  plate_display text,          -- only kept when the owner opts in (vanity plate)
  created_at timestamptz not null default now(),
  constraint owner_cars_plate_hash_key unique (plate_hash)
);
create index if not exists owner_cars_owner_id_idx on public.owner_cars (owner_id);
alter table public.owner_cars enable row level security;

drop policy if exists "Owner cars: owners read their cars" on public.owner_cars;
create policy "Owner cars: owners read their cars" on public.owner_cars
  for select to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "Owner cars: owners register cars" on public.owner_cars;
create policy "Owner cars: owners register cars" on public.owner_cars
  for insert to authenticated with check ((select auth.uid()) = owner_id);

drop policy if exists "Owner cars: owners update their cars" on public.owner_cars;
create policy "Owner cars: owners update their cars" on public.owner_cars
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owner cars: owners delete their cars" on public.owner_cars;
create policy "Owner cars: owners delete their cars" on public.owner_cars
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- Column privileges: the plate hash can never be read or written by a client.
revoke select, insert, update on public.owner_cars from anon, authenticated;
grant select (id, owner_id, make, model, nickname, plate_hint, show_plate, plate_display, created_at)
  on public.owner_cars to authenticated;
grant insert (make, model, nickname, plate_input, show_plate) on public.owner_cars to authenticated;
grant update (nickname, plate_input, show_plate) on public.owner_cars to authenticated;

create or replace function private.owner_cars_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_normalised text;
begin
  if tg_op = 'INSERT' then
    new.owner_id := auth.uid();
  else
    new.owner_id := old.owner_id;
  end if;

  if new.plate_input is not null then
    v_normalised := upper(regexp_replace(new.plate_input, '[^A-Za-z0-9]', '', 'g'));
    if char_length(v_normalised) < 2 or char_length(v_normalised) > 12 then
      raise exception 'A licence plate needs 2 to 12 letters or digits' using errcode = '22023';
    end if;
    new.plate_hash := private.hash_plate(v_normalised);
    new.plate_hint := right(v_normalised, 2);
    new.plate_display := case when new.show_plate then left(upper(trim(new.plate_input)), 14) else null end;
  elsif tg_op = 'INSERT' then
    raise exception 'A licence plate is required to register a car' using errcode = '22023';
  else
    new.plate_hash := old.plate_hash;
    new.plate_hint := old.plate_hint;
    if not new.show_plate then
      new.plate_display := null;
    elsif old.plate_display is null then
      raise exception 'Re-enter your licence plate to show it on spots' using errcode = '22023';
    else
      new.plate_display := old.plate_display;
    end if;
  end if;

  new.plate_input := null;
  return new;
end;
$$;

drop trigger if exists owner_cars_before_write on public.owner_cars;
create trigger owner_cars_before_write
  before insert or update on public.owner_cars
  for each row execute function private.owner_cars_before_write();

-- ---------------------------------------------------------------------
-- Spots (a photo of a car in the user's sticker book)
-- ---------------------------------------------------------------------
create table if not exists public.spots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  car_model_id text references public.car_models (id) on delete set null,
  make text not null check (char_length(make) between 1 and 40),
  model text not null check (char_length(model) between 1 and 60),
  photo_path text not null,
  location_label text check (char_length(location_label) <= 80),
  notes text check (char_length(notes) <= 500),
  spotted_at timestamptz not null default now(),
  plate_input text,            -- write-only, cleared by trigger
  owner_car_id uuid references public.owner_cars (id) on delete set null,
  vanity_plate text,           -- only filled when the owner opted in
  created_at timestamptz not null default now()
);
create index if not exists spots_user_id_spotted_at_idx on public.spots (user_id, spotted_at desc);
create index if not exists spots_owner_car_id_idx on public.spots (owner_car_id);
alter table public.spots enable row level security;

drop policy if exists "Spots: spotters read their own spots" on public.spots;
create policy "Spots: spotters read their own spots" on public.spots
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Spots: owners read spots of their registered cars" on public.spots;
create policy "Spots: owners read spots of their registered cars" on public.spots
  for select to authenticated
  using (owner_car_id in (select c.id from public.owner_cars c where c.owner_id = (select auth.uid())));

drop policy if exists "Spots: spotters add spots" on public.spots;
create policy "Spots: spotters add spots" on public.spots
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Spots: spotters edit their spots" on public.spots;
create policy "Spots: spotters edit their spots" on public.spots
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Spots: spotters delete their spots" on public.spots;
create policy "Spots: spotters delete their spots" on public.spots
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke insert, update on public.spots from anon, authenticated;
grant insert (car_model_id, make, model, photo_path, location_label, notes, spotted_at, plate_input)
  on public.spots to authenticated;
grant update (car_model_id, make, model, location_label, notes) on public.spots to authenticated;

create or replace function private.spots_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
  v_car_id uuid;
  v_display text;
begin
  new.user_id := auth.uid();
  new.owner_car_id := null;
  new.vanity_plate := null;

  if new.plate_input is not null then
    v_hash := private.hash_plate(new.plate_input);
    if v_hash is not null then
      select c.id, c.plate_display into v_car_id, v_display
      from public.owner_cars c
      where c.plate_hash = v_hash;
      new.owner_car_id := v_car_id;
      new.vanity_plate := v_display;
    end if;
  end if;

  new.plate_input := null;
  return new;
end;
$$;

drop trigger if exists spots_before_insert on public.spots;
create trigger spots_before_insert
  before insert on public.spots
  for each row execute function private.spots_before_insert();

-- ---------------------------------------------------------------------
-- Pings: an owner is notified every time their registered car is spotted
-- ---------------------------------------------------------------------
create table if not exists public.spot_notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  owner_car_id uuid not null references public.owner_cars (id) on delete cascade,
  spot_id uuid not null references public.spots (id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists spot_notifications_owner_idx on public.spot_notifications (owner_id, created_at desc);
alter table public.spot_notifications enable row level security;

drop policy if exists "Pings: owners read their pings" on public.spot_notifications;
create policy "Pings: owners read their pings" on public.spot_notifications
  for select to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "Pings: owners mark pings as read" on public.spot_notifications;
create policy "Pings: owners mark pings as read" on public.spot_notifications
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

revoke insert, update on public.spot_notifications from anon, authenticated;
grant update (read_at) on public.spot_notifications to authenticated;

create or replace function private.spots_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.owner_car_id is not null then
    insert into public.spot_notifications (owner_id, owner_car_id, spot_id)
    select c.owner_id, c.id, new.id
    from public.owner_cars c
    where c.id = new.owner_car_id;
  end if;
  return null;
end;
$$;

drop trigger if exists spots_after_insert on public.spots;
create trigger spots_after_insert
  after insert on public.spots
  for each row execute function private.spots_after_insert();

-- Keep the vanity plate on existing spots in sync with the owner's choice.
create or replace function private.owner_cars_after_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.plate_display is distinct from old.plate_display then
    update public.spots s set vanity_plate = new.plate_display where s.owner_car_id = new.id;
  end if;
  return null;
end;
$$;

drop trigger if exists owner_cars_after_update on public.owner_cars;
create trigger owner_cars_after_update
  after update on public.owner_cars
  for each row execute function private.owner_cars_after_update();

-- Realtime: owners get a live ping in the app
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'spot_notifications'
  ) then
    alter publication supabase_realtime add table public.spot_notifications;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- updated_at bookkeeping (prepares the data model for offline sync, course ch. 22)
-- ---------------------------------------------------------------------
alter table public.spots add column if not exists updated_at timestamptz not null default now();
alter table public.owner_cars add column if not exists updated_at timestamptz not null default now();

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists spots_set_updated_at on public.spots;
create trigger spots_set_updated_at
  before update on public.spots
  for each row execute function private.set_updated_at();

drop trigger if exists owner_cars_set_updated_at on public.owner_cars;
create trigger owner_cars_set_updated_at
  before update on public.owner_cars
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- Right to erasure (GDPR): a user deletes their account and all their data.
-- The app removes the user's photos from storage first, then calls this function;
-- profiles, spots, owner cars and pings are removed through ON DELETE CASCADE.
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
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------------------
-- Explicit Data API privileges ("automatically expose new tables" is disabled).
-- Column lists make sure clients can never write the hashed / trigger-managed columns.
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.car_models to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (username) on public.profiles to authenticated;

grant select (id, owner_id, make, model, nickname, plate_hint, show_plate, plate_display, created_at, updated_at)
  on public.owner_cars to authenticated;
grant insert (make, model, nickname, plate_input, show_plate) on public.owner_cars to authenticated;
grant update (nickname, plate_input, show_plate) on public.owner_cars to authenticated;
grant delete on public.owner_cars to authenticated;

grant select on public.spots to authenticated;
grant insert (id, car_model_id, make, model, photo_path, location_label, notes, spotted_at, plate_input)
  on public.spots to authenticated;
grant update (car_model_id, make, model, location_label, notes) on public.spots to authenticated;
grant delete on public.spots to authenticated;

grant select on public.spot_notifications to authenticated;
grant update (read_at) on public.spot_notifications to authenticated;

grant all on all tables in schema public to service_role;

-- ---------------------------------------------------------------------
-- Storage: private bucket, every user writes only in their own folder
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('spot-photos', 'spot-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Spot photos: upload into own folder" on storage.objects;
create policy "Spot photos: upload into own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'spot-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Spot photos: read own photos" on storage.objects;
create policy "Spot photos: read own photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'spot-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Spot photos: owners read photos of their car" on storage.objects;
create policy "Spot photos: owners read photos of their car" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'spot-photos'
    and exists (
      select 1
      from public.spots s
      join public.owner_cars c on c.id = s.owner_car_id
      where s.photo_path = objects.name and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Spot photos: delete own photos" on storage.objects;
create policy "Spot photos: delete own photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'spot-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
