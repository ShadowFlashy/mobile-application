-- =====================================================================
-- Redline 2.0 hardening (fix pass after review). Apply right AFTER 20261110090000_redline_v2.sql
-- and its seeds; it does not depend on the frontend version. Idempotent: safe to run twice.
--
--  H.1 The shared demo account (password in the README) cannot be taken over or emptied:
--      no password / email / phone change, its cars cannot be deleted, their nickname and
--      shout-out stay as seeded, and spots older than a day (the curated demo album) cannot be
--      deleted. Spots a visitor made today can still be deleted, so the whole CRUD flow stays testable.
--  H.2 Pending (unverified) owners read no sighting and no photo, also not the v1 pings that the
--      v2 backfill kept (SPEC §12.1 b: "Pending claims receive nothing"). Non-destructive: the rows
--      stay, they are just invisible until the car is verified.
--  H.3 A sighting's photo_path must be the spot's own server-forced path; v1 rows whose client-chosen
--      path pointed elsewhere are cleared, so the owner storage policy cannot reach other objects.
--  H.4 An owner's sighting only carries a city from the bundled gazetteer (src/constants/places.ts).
--      Anything else (a typed place, or a street address sent straight to the API) stays in the
--      spotter's own spot but becomes null in the owner's snapshot, so it never reaches an owner.
--
-- To change the demo password on purpose (SQL editor):
--   alter table auth.users disable trigger demo_account_guard;
--   ... change it in the dashboard ...
--   alter table auth.users enable trigger demo_account_guard;
-- =====================================================================

-- ---------------------------------------------------------------------
-- H.1 Demo account guard
-- ---------------------------------------------------------------------
create or replace function private.guard_demo_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(old.email, '')) = 'demo@redline.test'
     and (new.encrypted_password is distinct from old.encrypted_password
          or new.email is distinct from old.email
          or new.phone is distinct from old.phone
          or new.email_change is distinct from old.email_change
          or new.phone_change is distinct from old.phone_change) then
    raise exception 'The shared demo account cannot change its password, email or phone' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_demo_auth_user() from public, anon, authenticated;

drop trigger if exists demo_account_guard on auth.users;
create trigger demo_account_guard
  before update on auth.users
  for each row execute function private.guard_demo_auth_user();

create or replace function private.guard_demo_owner_car()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_demo_user(auth.uid()) then
    if tg_op = 'DELETE' then
      raise exception 'The shared demo account cannot delete its cars' using errcode = 'P0001';
    end if;
    if new.nickname is distinct from old.nickname or new.shoutout is distinct from old.shoutout then
      raise exception 'The shared demo account cannot change the nickname or shout-out' using errcode = 'P0001';
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
revoke all on function private.guard_demo_owner_car() from public, anon, authenticated;

drop trigger if exists owner_cars_demo_guard on public.owner_cars;
create trigger owner_cars_demo_guard
  before update or delete on public.owner_cars
  for each row execute function private.guard_demo_owner_car();

create or replace function private.guard_demo_spot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_demo_user(auth.uid()) and old.created_at < now() - interval '1 day' then
    raise exception 'The shared demo account cannot delete its older spots' using errcode = 'P0001';
  end if;
  return old;
end;
$$;
revoke all on function private.guard_demo_spot() from public, anon, authenticated;

drop trigger if exists spots_demo_guard on public.spots;
create trigger spots_demo_guard
  before delete on public.spots
  for each row execute function private.guard_demo_spot();

-- The photo of an existing demo spot cannot be removed through the storage API either
-- (the photo of a spot that was just deleted can, so the app's clean-up still works).
drop policy if exists "Spot photos: the demo keeps photos of its spots" on storage.objects;
create policy "Spot photos: the demo keeps photos of its spots" on storage.objects
  as restrictive
  for delete to authenticated
  using (
    bucket_id <> 'spot-photos'
    or lower(coalesce((select auth.jwt()) ->> 'email', '')) <> 'demo@redline.test'
    or not exists (select 1 from public.spots s where s.photo_path = objects.name)
  );

-- ---------------------------------------------------------------------
-- H.2 Pending owners read nothing (this also hides the v1 pings the v2 backfill kept)
-- ---------------------------------------------------------------------
drop policy if exists "Pings: only verified cars" on public.spot_notifications;
create policy "Pings: only verified cars" on public.spot_notifications
  as restrictive
  for select to authenticated
  using (
    exists (
      select 1 from public.owner_cars c
       where c.id = spot_notifications.owner_car_id and c.verified_at is not null
    )
  );

-- ---------------------------------------------------------------------
-- H.3 Sighting photo paths are always the spot's own server-forced path
-- ---------------------------------------------------------------------
update public.spot_notifications n
   set photo_path = null
  from public.spots s
 where s.id = n.spot_id
   and n.photo_path is not null
   and n.photo_path is distinct from (s.user_id::text || '/' || s.id::text || '.jpg');

-- ---------------------------------------------------------------------
-- H.4 Owner snapshots only carry gazetteer cities
-- ---------------------------------------------------------------------
create table if not exists private.places (
  label text primary key
);
alter table private.places enable row level security;
revoke all on private.places from public, anon, authenticated;

-- Every English and Dutch name in src/constants/places.ts (kept in sync by cypress/unit/trust/placesSql.cy.ts).
insert into private.places (label) values
  ('''s-Gravenbrakel'),
  ('''s-Hertogenbosch'),
  ('Aachen'),
  ('Aalst'),
  ('Aalter'),
  ('Aarlen'),
  ('Aarschot'),
  ('Aat'),
  ('Aken'),
  ('Amsterdam'),
  ('Andenne'),
  ('Ans'),
  ('Antwerp'),
  ('Antwerpen'),
  ('Arlon'),
  ('Arnhem'),
  ('Asse'),
  ('Assen'),
  ('Ath'),
  ('Balen'),
  ('Bastenaken'),
  ('Bastogne'),
  ('Bergen'),
  ('Bergen op Zoom'),
  ('Beringen'),
  ('Beveren'),
  ('Bilzen'),
  ('Binche'),
  ('Blankenberge'),
  ('Bornem'),
  ('Boussu'),
  ('Braine-l''Alleud'),
  ('Braine-le-Comte'),
  ('Brasschaat'),
  ('Brecht'),
  ('Breda'),
  ('Bruges'),
  ('Brugge'),
  ('Brussel'),
  ('Brussels'),
  ('Calais'),
  ('Charleroi'),
  ('Charleville-Mézières'),
  ('Châtelet'),
  ('Chaudfontaine'),
  ('Ciney'),
  ('Colfontaine'),
  ('Cologne'),
  ('Comines-Warneton'),
  ('Courcelles'),
  ('Deinze'),
  ('Den Haag'),
  ('Denderleeuw'),
  ('Dendermonde'),
  ('Diest'),
  ('Dilbeek'),
  ('Dilsen-Stokkem'),
  ('Dinant'),
  ('Doornik'),
  ('Dordrecht'),
  ('Duinkerke'),
  ('Dunkirk'),
  ('Düsseldorf'),
  ('Edegem'),
  ('Eeklo'),
  ('Eigenbrakel'),
  ('Eindhoven'),
  ('Erpe-Mere'),
  ('Eupen'),
  ('Evergem'),
  ('Flémalle'),
  ('Fleurus'),
  ('Frameries'),
  ('Geel'),
  ('Gembloux'),
  ('Genk'),
  ('Gent'),
  ('Geraardsbergen'),
  ('Ghent'),
  ('Goes'),
  ('Goodwood'),
  ('Grâce-Hollogne'),
  ('Grimbergen'),
  ('Haarlem'),
  ('Halle'),
  ('Hamme'),
  ('Harelbeke'),
  ('Hasselt'),
  ('Heerlen'),
  ('Heist-op-den-Berg'),
  ('Helmond'),
  ('Herent'),
  ('Herentals'),
  ('Herstal'),
  ('Heusden-Zolder'),
  ('Hoei'),
  ('Hoogstraten'),
  ('Houthalen-Helchteren'),
  ('Hulst'),
  ('Huy'),
  ('Ieper'),
  ('Ingolstadt'),
  ('Izegem'),
  ('Kapellen'),
  ('Keulen'),
  ('Knokke-Heist'),
  ('Koksijde'),
  ('Komen-Waasten'),
  ('Kontich'),
  ('Kortenberg'),
  ('Kortrijk'),
  ('La Louvière'),
  ('Lanaken'),
  ('Le Mans'),
  ('Leiden'),
  ('Leuven'),
  ('Liège'),
  ('Lier'),
  ('Lille'),
  ('Lochristi'),
  ('Lokeren'),
  ('Lommel'),
  ('Londen'),
  ('London'),
  ('Luik'),
  ('Luxembourg'),
  ('Luxemburg'),
  ('Maaseik'),
  ('Maasmechelen'),
  ('Maastricht'),
  ('Maldegem'),
  ('Manage'),
  ('Maranello'),
  ('Marche-en-Famenne'),
  ('Maubeuge'),
  ('Mechelen'),
  ('Menen'),
  ('Merelbeke'),
  ('Mettet'),
  ('Middelburg'),
  ('Middelkerke'),
  ('Milaan'),
  ('Milan'),
  ('Modena'),
  ('Moeskroen'),
  ('Mol'),
  ('Molsheim'),
  ('Monaco'),
  ('Mons'),
  ('Monza'),
  ('Mortsel'),
  ('Mouscron'),
  ('München'),
  ('Munich'),
  ('Namen'),
  ('Namur'),
  ('Nijmegen'),
  ('Nijvel'),
  ('Ninove'),
  ('Nivelles'),
  ('Nürburg'),
  ('Oostende'),
  ('Oostkamp'),
  ('Ostend'),
  ('Ottignies-Louvain-la-Neuve'),
  ('Oudenaarde'),
  ('Oupeye'),
  ('Overijse'),
  ('Parijs'),
  ('Paris'),
  ('Pelt'),
  ('Poperinge'),
  ('Puurs-Sint-Amands'),
  ('Reims'),
  ('Rijsel'),
  ('Rixensart'),
  ('Roermond'),
  ('Roeselare'),
  ('Ronse'),
  ('Roosendaal'),
  ('Rotterdam'),
  ('Roubaix'),
  ('Saint-Ghislain'),
  ('Saint-Nicolas'),
  ('Sambreville'),
  ('Sant''Agata Bolognese'),
  ('Schoten'),
  ('Seraing'),
  ('Silverstone'),
  ('Sint-Gillis-Waas'),
  ('Sint-Katelijne-Waver'),
  ('Sint-Niklaas'),
  ('Sint-Pieters-Leeuw'),
  ('Sint-Truiden'),
  ('Sittard'),
  ('Soignies'),
  ('Spa'),
  ('Stavelot'),
  ('Stuttgart'),
  ('Temse'),
  ('Terneuzen'),
  ('Tervuren'),
  ('The Hague'),
  ('Tielt'),
  ('Tienen'),
  ('Tilburg'),
  ('Tongeren'),
  ('Torhout'),
  ('Tourcoing'),
  ('Tournai'),
  ('Tubeke'),
  ('Tubize'),
  ('Turnhout'),
  ('Utrecht'),
  ('Valenciennes'),
  ('Venlo'),
  ('Verviers'),
  ('Vilvoorde'),
  ('Visé'),
  ('Vlissingen'),
  ('Waregem'),
  ('Waterloo'),
  ('Waver'),
  ('Wavre'),
  ('Weert'),
  ('Westerlo'),
  ('Wetteren'),
  ('Wevelgem'),
  ('Wezet'),
  ('Willebroek'),
  ('Woking'),
  ('Wolfsburg'),
  ('Ypres'),
  ('Zandvoort'),
  ('Zaventem'),
  ('Zedelgem'),
  ('Zele'),
  ('Zemst'),
  ('Zinnik'),
  ('Zonhoven'),
  ('Zottegem'),
  ('Zwevegem'),
  ('Zwijndrecht')
on conflict (label) do nothing;

create or replace function private.sighting_city_from_gazetteer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.city is not null and not exists (select 1 from private.places p where p.label = new.city) then
    new.city := null;
  end if;
  return new;
end;
$$;
revoke all on function private.sighting_city_from_gazetteer() from public, anon, authenticated;

drop trigger if exists sighting_city_from_gazetteer on public.spot_notifications;
create trigger sighting_city_from_gazetteer
  before insert or update of city on public.spot_notifications
  for each row execute function private.sighting_city_from_gazetteer();

-- Existing snapshots get the same rule.
update public.spot_notifications n
   set city = null
 where n.city is not null and not exists (select 1 from private.places p where p.label = n.city);

-- Self-check
do $$
begin
  assert exists (select 1 from pg_trigger where tgname = 'demo_account_guard' and tgrelid = 'auth.users'::regclass),
    'demo_account_guard must exist';
  assert exists (select 1 from pg_trigger where tgname = 'owner_cars_demo_guard'), 'owner_cars_demo_guard must exist';
  assert exists (select 1 from pg_trigger where tgname = 'spots_demo_guard'), 'spots_demo_guard must exist';
  assert exists (select 1 from pg_trigger where tgname = 'sighting_city_from_gazetteer'),
    'sighting_city_from_gazetteer must exist';
  assert exists (select 1 from private.places where label = 'Antwerpen'), 'the gazetteer must be seeded';
  assert exists (select 1 from private.places where label = '''s-Hertogenbosch'), 'apostrophes must survive';
end $$;

notify pgrst, 'reload schema';
