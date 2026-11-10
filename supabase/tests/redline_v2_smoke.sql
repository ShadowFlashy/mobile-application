-- =====================================================================
-- Redline 2.0 database smoke test (SPEC §14, owned by W8).
--
-- Checks the safety rules of the v2 migration against the real schema, triggers, grants and RLS:
--   * a pending car gets no ping; a verified car gets exactly one ping per spotter per 24 h
--   * paused cars get no ping; above 30 plate lookups a spot saves without a match
--   * a spotter cannot select private.spot_matches; spots.owner_car_id / vanity_plate stay null
--   * owners never read spot rows, only snapshots (car label, city, hour, photo, opted-in name)
--   * a 4th car is refused; the plate of a registered car cannot be changed; owners cannot self-verify
--   * the showcase only appears for verified, opted-in owners
--   * verification codes: format, expiry, attempts, plate_taken, already_verified
--   * complete_owner_verification is not executable by authenticated (service role only)
--   * the demo account cannot be deleted (a normal account can)
--   * the Co-Driver quota raises after 15 identifications; 30 spots/hour are enforced
--
-- How to run (the user does this; agents never touch the hosted database):
--   Supabase dashboard → SQL editor → paste this file → Run. Or:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/redline_v2_smoke.sql
-- Prerequisites, in this order: 20261110080000_identify_quota.sql, 20261110090000_redline_v2.sql,
-- seed.sql (and optionally seed_collections.sql, seed_demo.sql).
--
-- Expected result: the last row says ALL OK. Any failure stops the script with "SMOKE FAIL: …"
-- (or the database error), and nothing after it runs.
-- Everything happens inside one transaction that is ROLLED BACK: no test user, car, spot or ping
-- survives, and the live data is never changed. Users are impersonated with
-- `set local role authenticated` plus `request.jwt.claims`, exactly like PostgREST does.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 0. Test users (as the SQL editor's postgres role). The emails use the reserved .test domain.
--    a1 owner · a2 second claimant of the same plate · b1..b5 spotters · demo (existing or temporary)
-- ---------------------------------------------------------------------
insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated',
   'smoke-owner@redline.test', '{"username":"smoke_owner"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-0000000000a2', 'authenticated', 'authenticated',
   'smoke-claimant@redline.test', '{"username":"smoke_claimant"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-0000000000b1', 'authenticated', 'authenticated',
   'smoke-spotter1@redline.test', '{"username":"smoke_spotter1"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-0000000000b2', 'authenticated', 'authenticated',
   'smoke-spotter2@redline.test', '{"username":"smoke_spotter2"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-0000000000b3', 'authenticated', 'authenticated',
   'smoke-spotter3@redline.test', '{"username":"smoke_spotter3"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-0000000000b4', 'authenticated', 'authenticated',
   'smoke-spotter4@redline.test', '{"username":"smoke_spotter4"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-0000000000b5', 'authenticated', 'authenticated',
   'smoke-spotter5@redline.test', '{"username":"smoke_spotter5"}', now(), now());

-- The demo account: use the real one if it exists, otherwise a temporary one (rolled back).
insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at)
select '00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-0000000000d1', 'authenticated', 'authenticated',
       'demo@redline.test', '{"username":"smoke_demo"}', now(), now()
 where not exists (select 1 from auth.users u where lower(u.email) = 'demo@redline.test');
select set_config('smoke.demo', (select u.id::text from auth.users u where lower(u.email) = 'demo@redline.test' limit 1), true);

do $$
begin
  assert (select count(*) from public.profiles p
           where p.id in ('a0000000-0000-4000-8000-0000000000a1', 'b0000000-0000-4000-8000-0000000000b2')) = 2,
    'SMOKE FAIL: handle_new_user did not create profiles for the test users';
end $$;

-- ---------------------------------------------------------------------
-- 1. The owner registers a car: it starts PENDING and the plate hash is unreadable.
-- ---------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);

do $$
declare
  v_car uuid;
  v_refused boolean := false;
begin
  -- verified_at is not even in the insert grant, so it is simply not offered here.
  insert into public.owner_cars (make, model, nickname, plate_input)
  values ('Ferrari', '308 GTSi', 'Magnum', 'zz-smoke-1')
  returning id into v_car;
  perform set_config('smoke.car', v_car::text, true);

  assert (select c.verified_at from public.owner_cars c where c.id = v_car) is null,
    'SMOKE FAIL: a new car must start as pending verification';
  assert (select c.plate_hint from public.owner_cars c where c.id = v_car) = 'E1',
    'SMOKE FAIL: plate_hint must be the last two normalised characters';
  assert (select c.visibility from public.owner_cars c where c.id = v_car) = 'hidden',
    'SMOKE FAIL: visibility must default to hidden';
  assert not has_column_privilege('public.owner_cars', 'plate_hash', 'select'),
    'SMOKE FAIL: clients must not be able to read owner_cars.plate_hash';
  assert not has_column_privilege('public.owner_cars', 'verify_code_hash', 'select'),
    'SMOKE FAIL: clients must not be able to read owner_cars.verify_code_hash';

  -- An owner cannot verify their own car.
  begin
    update public.owner_cars set verified_at = now() where id = v_car;
  exception when insufficient_privilege then
    v_refused := true;
  end;
  assert v_refused, 'SMOKE FAIL: an owner could set verified_at on their own car';
end $$;

-- ---------------------------------------------------------------------
-- 2. A pending car gets no ping (and no match).
-- ---------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b1","role":"authenticated"}', true);

do $$
declare
  v_spot uuid := gen_random_uuid();
begin
  insert into public.spots (id, make, model, photo_path, plate_input, city)
  values (v_spot, 'Ferrari', '308 GTSi', 'someone-else/forged.jpg', 'ZZ SMOKE 1', 'Antwerpen');
  perform set_config('smoke.spot_pending', v_spot::text, true);
end $$;

reset role;

do $$
declare
  v_car uuid := current_setting('smoke.car')::uuid;
  v_spot uuid := current_setting('smoke.spot_pending')::uuid;
begin
  assert (select count(*) from public.spot_notifications n where n.owner_car_id = v_car) = 0,
    'SMOKE FAIL: a pending car got a ping';
  assert (select count(*) from private.spot_matches m where m.owner_car_id = v_car) = 0,
    'SMOKE FAIL: a pending car was matched';
  assert (select s.plate_input from public.spots s where s.id = v_spot) is null,
    'SMOKE FAIL: spots.plate_input must be cleared by the trigger';
  assert (select s.photo_path from public.spots s where s.id = v_spot)
         = 'b0000000-0000-4000-8000-0000000000b1/' || v_spot::text || '.jpg',
    'SMOKE FAIL: the photo path must be forced into the spotter''s own folder';
end $$;

-- ---------------------------------------------------------------------
-- 3. The developer verifies the car (the documented beta statement), then spotters collect it.
--    Spotter b1 collects it twice (second one deduped), spotter b2 once and shares their name.
-- ---------------------------------------------------------------------
update public.owner_cars set verified_at = now() where id = current_setting('smoke.car')::uuid;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b1","role":"authenticated"}', true);

do $$
declare
  v_first uuid := gen_random_uuid();
  v_second uuid := gen_random_uuid();
begin
  insert into public.spots (id, make, model, photo_path, plate_input, city, spotted_at, notes)
  values (v_first, 'Ferrari', '308 GTSi', 'x.jpg', 'zz-smoke-1', 'Antwerpen', now() - interval '25 minutes',
          'private note: parked near my house');
  insert into public.spots (id, make, model, photo_path, plate_input, city)
  values (v_second, 'Ferrari', '308 GTSi', 'x.jpg', 'ZZSMOKE1', 'Antwerpen');
  perform set_config('smoke.spot_b1_first', v_first::text, true);
  perform set_config('smoke.spot_b1_second', v_second::text, true);
end $$;

select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);

do $$
declare
  v_spot uuid := gen_random_uuid();
begin
  insert into public.spots (id, make, model, photo_path, plate_input, city, share_name_with_owner)
  values (v_spot, 'Ferrari', '308 GTSi', 'x.jpg', 'ZZ-SMOKE-1', 'Leuven', true);
  perform set_config('smoke.spot_b2', v_spot::text, true);
end $$;

reset role;

do $$
declare
  v_car uuid := current_setting('smoke.car')::uuid;
  v_first uuid := current_setting('smoke.spot_b1_first')::uuid;
  v_b1_key text := private.keyed_hash('spotter:b0000000-0000-4000-8000-0000000000b1:' || current_setting('smoke.car'));
  v_ping public.spot_notifications%rowtype;
begin
  assert (select count(*) from public.spot_notifications n where n.owner_car_id = v_car) = 2,
    'SMOKE FAIL: expected exactly 2 pings (b1 once, b2 once)';
  assert (select count(*) from public.spot_notifications n where n.owner_car_id = v_car and n.spotter_key = v_b1_key) = 1,
    'SMOKE FAIL: a verified car must get exactly one ping per spotter per 24 h';
  assert (select count(*) from private.spot_matches m where m.owner_car_id = v_car) = 3,
    'SMOKE FAIL: every spot of the verified plate must be matched privately (deduped or not)';

  select n.* into v_ping from public.spot_notifications n where n.spot_id = v_first;
  assert found, 'SMOKE FAIL: the first spot of b1 must create the ping';
  assert v_ping.owner_id = 'a0000000-0000-4000-8000-0000000000a1', 'SMOKE FAIL: the ping must go to the owner';
  assert v_ping.car_label = 'Magnum', 'SMOKE FAIL: the snapshot car label must be the nickname';
  assert v_ping.city = 'Antwerpen', 'SMOKE FAIL: the snapshot must carry the city label';
  assert v_ping.spotted_hour = date_trunc('hour', (select s.spotted_at from public.spots s where s.id = v_first)),
    'SMOKE FAIL: the snapshot must hold the hour window only';
  assert v_ping.spotter_name is null, 'SMOKE FAIL: a spotter who did not opt in must stay anonymous';
  assert v_ping.photo_path = 'b0000000-0000-4000-8000-0000000000b1/' || v_first::text || '.jpg',
    'SMOKE FAIL: the snapshot must point at the blurred photo';

  assert (select n.spotter_name from public.spot_notifications n where n.spot_id = current_setting('smoke.spot_b2')::uuid)
         = (select p.username from public.profiles p where p.id = 'b0000000-0000-4000-8000-0000000000b2'),
    'SMOKE FAIL: an opted-in spotter''s username must be in the snapshot';

  assert not exists (select 1 from public.spots s
                      where s.user_id::text like 'b0000000-%'
                        and (s.owner_car_id is not null or s.vanity_plate is not null or s.plate_input is not null)),
    'SMOKE FAIL: spots.owner_car_id, vanity_plate and plate_input must stay null';

  if has_column_privilege('authenticated', 'public.spot_notifications', 'spotter_key', 'select') then
    raise notice 'KNOWN ISSUE (not a failure): authenticated can still select spot_notifications.spotter_key '
                 '(v1 table-level grant). Apply 20261110100000_hide_spotter_key.sql once the v2 app is live.';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 4. What spotters and owners can read.
-- ---------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b1","role":"authenticated"}', true);

do $$
declare
  v_refused boolean := false;
  v_export jsonb;
begin
  begin
    perform 1 from private.spot_matches;
  exception when insufficient_privilege then
    v_refused := true;
  end;
  assert v_refused, 'SMOKE FAIL: a spotter could select private.spot_matches';

  v_refused := false;
  begin
    perform 1 from private.plate_lookups;
  exception when insufficient_privilege then
    v_refused := true;
  end;
  assert v_refused, 'SMOKE FAIL: a spotter could select private.plate_lookups';

  v_refused := false;
  begin
    insert into public.spots (id, make, model, photo_path, owner_car_id)
    values (gen_random_uuid(), 'Ferrari', '308 GTSi', 'x.jpg', current_setting('smoke.car')::uuid);
  exception when insufficient_privilege then
    v_refused := true;
  end;
  assert v_refused, 'SMOKE FAIL: a spotter could write spots.owner_car_id';

  assert (select count(*) from public.spots s where s.owner_car_id is not null or s.vanity_plate is not null) = 0,
    'SMOKE FAIL: a spotter can see an owner match on their own spots (plate oracle)';
  assert (select count(*) from public.owner_cars) = 0, 'SMOKE FAIL: a spotter can see someone else''s cars';
  assert (select count(*) from public.spot_notifications) = 0, 'SMOKE FAIL: a spotter can see someone else''s pings';
  assert (select count(*) from public.get_spot_showcase(current_setting('smoke.spot_b1_first')::uuid)) = 0,
    'SMOKE FAIL: a Hidden owner must not show a showcase';

  v_export := public.export_my_data();
  assert jsonb_array_length(v_export -> 'spots') = 3, 'SMOKE FAIL: export_my_data must return the spotter''s 3 spots';
  assert not exists (select 1 from jsonb_array_elements(v_export -> 'spots') e
                      where e ? 'plate_input' or e ? 'owner_car_id' or e ? 'vanity_plate'),
    'SMOKE FAIL: export_my_data must not contain plate or owner columns';
end $$;

select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);

do $$
declare
  v_stats record;
begin
  assert (select count(*) from public.spots s
           where s.id = current_setting('smoke.spot_b1_first')::uuid) = 0,
    'SMOKE FAIL: an owner can read the spotter''s spot row (notes, user id, exact time)';
  assert (select count(*) from public.spot_notifications) = 2, 'SMOKE FAIL: the owner must see their 2 sightings';

  select * into v_stats from public.get_owner_car_stats() s where s.owner_car_id = current_setting('smoke.car')::uuid;
  assert v_stats.sightings = 2 and v_stats.unread = 2, 'SMOKE FAIL: get_owner_car_stats must count 2 sightings, 2 unread';
  assert v_stats.last_city is not null, 'SMOKE FAIL: get_owner_car_stats must report the last city';

  -- By sighting id (owners cannot read spot_id once 20261110100000_hide_spotter_key.sql is applied).
  update public.spot_notifications set read_at = now()
   where id = (select n.id from public.spot_notifications n order by n.created_at limit 1);
  select * into v_stats from public.get_owner_car_stats() s where s.owner_car_id = current_setting('smoke.car')::uuid;
  assert v_stats.unread = 1, 'SMOKE FAIL: marking a sighting read must lower the unread count';
end $$;

-- ---------------------------------------------------------------------
-- 5. Showcase: Badge, then Vanity (which needs the plate re-entered).
-- ---------------------------------------------------------------------
do $$
declare
  v_car uuid := current_setting('smoke.car')::uuid;
  v_refused boolean := false;
begin
  update public.owner_cars set visibility = 'badge', shoutout = 'Say hi at Spa' where id = v_car;

  begin
    update public.owner_cars set visibility = 'vanity' where id = v_car;
  exception when others then
    v_refused := sqlerrm ilike '%re-enter your licence plate%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: Vanity plate without re-entering the plate must be refused';

  update public.owner_cars set visibility = 'vanity', plate_input = 'ZZ-SMOKE-1' where id = v_car;
  assert (select c.plate_display from public.owner_cars c where c.id = v_car) = 'ZZ-SMOKE-1',
    'SMOKE FAIL: the vanity plate must be stored as typed';
end $$;

select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b1","role":"authenticated"}', true);

do $$
declare
  v_showcase record;
begin
  select * into v_showcase from public.get_spot_showcase(current_setting('smoke.spot_b1_first')::uuid);
  assert found and v_showcase.visibility = 'vanity' and v_showcase.shoutout = 'Say hi at Spa'
         and v_showcase.vanity_plate = 'ZZ-SMOKE-1',
    'SMOKE FAIL: an opted-in verified owner must show badge, shout-out and vanity plate on the spot';
  assert (select count(*) from public.get_spot_showcase(current_setting('smoke.spot_pending')::uuid)) = 0,
    'SMOKE FAIL: a spot taken while the car was pending must not show a showcase';
end $$;

-- ---------------------------------------------------------------------
-- 6. Paused pings, and the 30 plate lookups/day limit.
-- ---------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);
update public.owner_cars set pings_paused = true where id = current_setting('smoke.car')::uuid;

select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b3","role":"authenticated"}', true);
do $$
declare
  v_spot uuid := gen_random_uuid();
begin
  insert into public.spots (id, make, model, photo_path, plate_input, city)
  values (v_spot, 'Ferrari', '308 GTSi', 'x.jpg', 'ZZSMOKE1', 'Gent');
  perform set_config('smoke.spot_paused', v_spot::text, true);
end $$;

select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);
update public.owner_cars set pings_paused = false where id = current_setting('smoke.car')::uuid;

reset role;
-- Spotter b4 already used 30 plate lookups today.
insert into private.plate_lookups (user_id)
select 'b0000000-0000-4000-8000-0000000000b4' from generate_series(1, 30);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b4","role":"authenticated"}', true);
do $$
declare
  v_spot uuid := gen_random_uuid();
begin
  insert into public.spots (id, make, model, photo_path, plate_input, city)
  values (v_spot, 'Ferrari', '308 GTSi', 'x.jpg', 'ZZSMOKE1', 'Brugge');
  perform set_config('smoke.spot_over_limit', v_spot::text, true);
end $$;

reset role;

do $$
begin
  assert (select count(*) from public.spot_notifications n
           where n.spot_id = current_setting('smoke.spot_paused')::uuid) = 0,
    'SMOKE FAIL: a car with paused pings got a ping';
  assert exists (select 1 from public.spots s where s.id = current_setting('smoke.spot_over_limit')::uuid),
    'SMOKE FAIL: above the lookup limit the spot must still save';
  assert not exists (select 1 from private.spot_matches m where m.spot_id = current_setting('smoke.spot_over_limit')::uuid),
    'SMOKE FAIL: above 30 plate lookups/day a spot must not be matched';
  assert (select count(*) from private.plate_lookups l where l.user_id = 'b0000000-0000-4000-8000-0000000000b4') = 30,
    'SMOKE FAIL: a lookup above the limit must not be recorded or performed';
end $$;

-- ---------------------------------------------------------------------
-- 7. Car limits: the plate of a registered car is locked, and a 4th car is refused.
-- ---------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);

do $$
declare
  v_car2 uuid;
  v_car3 uuid;
  v_refused boolean := false;
begin
  begin
    update public.owner_cars set plate_input = 'ZZSMOKE9' where id = current_setting('smoke.car')::uuid;
  exception when others then
    v_refused := sqlerrm ilike '%cannot be changed%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: the plate of a verified car could be changed';

  insert into public.owner_cars (make, model, plate_input) values ('BMW', 'M3 E30', 'ZZSMOKE2') returning id into v_car2;
  insert into public.owner_cars (make, model, plate_input) values ('Audi', 'Sport quattro', 'ZZSMOKE3') returning id into v_car3;
  perform set_config('smoke.car2', v_car2::text, true);
  perform set_config('smoke.car3', v_car3::text, true);

  v_refused := false;
  begin
    insert into public.owner_cars (make, model, plate_input) values ('Lancia', 'Delta Integrale', 'ZZSMOKE4');
  exception when others then
    v_refused := sqlerrm ilike '%at most 3 cars%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: a 4th car was accepted';
end $$;

-- ---------------------------------------------------------------------
-- 8. Verification RPCs.
-- ---------------------------------------------------------------------
do $$
declare
  v_row record;
  v_refused boolean := false;
begin
  -- complete_owner_verification is service-role only.
  assert not has_function_privilege('authenticated', 'public.complete_owner_verification(uuid, uuid, text, text)', 'execute'),
    'SMOKE FAIL: authenticated has EXECUTE on complete_owner_verification';
  assert not has_function_privilege('anon', 'public.complete_owner_verification(uuid, uuid, text, text)', 'execute'),
    'SMOKE FAIL: anon has EXECUTE on complete_owner_verification';
  begin
    perform public.complete_owner_verification(
      'a0000000-0000-4000-8000-0000000000a1', current_setting('smoke.car2')::uuid, 'ZZSMOKE2', 'RL-ACDEFG');
  exception when insufficient_privilege then
    v_refused := true;
  end;
  assert v_refused, 'SMOKE FAIL: an owner could call complete_owner_verification and verify themselves';

  -- A verified car cannot start a new verification.
  v_refused := false;
  begin
    perform * from public.start_owner_verification(current_setting('smoke.car')::uuid);
  exception when others then
    v_refused := sqlerrm ilike '%car_not_found%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: a verified car could start a new verification';

  -- One-time code for car 2 (pending).
  select * into v_row from public.start_owner_verification(current_setting('smoke.car2')::uuid);
  assert v_row.code ~ '^RL-[ACDEFGHJKMNPQRTUVWXY34679]{6}$', 'SMOKE FAIL: the code must look like RL-XXXXXX';
  assert v_row.expires_at between now() + interval '29 minutes' and now() + interval '31 minutes',
    'SMOKE FAIL: the code must be valid for 30 minutes';
  perform set_config('smoke.code2', v_row.code, true);

  -- Code for car 3, used for the attempt limit.
  select * into v_row from public.start_owner_verification(current_setting('smoke.car3')::uuid);
  perform set_config('smoke.code3', v_row.code, true);
end $$;

-- The second claimant registers the SAME plate as the verified car: allowed (no "plate taken" oracle).
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-0000000000a2","role":"authenticated"}', true);

do $$
declare
  v_claim uuid;
  v_row record;
  v_refused boolean := false;
begin
  insert into public.owner_cars (make, model, plate_input) values ('Ferrari', '308 GTSi', 'ZZ SMOKE 1')
  returning id into v_claim;
  perform set_config('smoke.claim', v_claim::text, true);
  assert (select c.verified_at from public.owner_cars c where c.id = v_claim) is null,
    'SMOKE FAIL: a second claim must stay pending';

  -- Someone else's car cannot be put into verification.
  begin
    perform * from public.start_owner_verification(current_setting('smoke.car2')::uuid);
  exception when others then
    v_refused := sqlerrm ilike '%car_not_found%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: a user could start the verification of someone else''s car';

  select * into v_row from public.start_owner_verification(v_claim);
  perform set_config('smoke.claim_code', v_row.code, true);
end $$;

-- What the P1 verify-owner Edge Function does, with the service role.
reset role;
set local role service_role;

do $$
declare
  v_owner constant uuid := 'a0000000-0000-4000-8000-0000000000a1';
  v_car2 uuid := current_setting('smoke.car2')::uuid;
  v_car3 uuid := current_setting('smoke.car3')::uuid;
  v_code2 text := current_setting('smoke.code2');
  v_wrong text := case when current_setting('smoke.code2') = 'RL-AAAAAA' then 'RL-CCCCCC' else 'RL-AAAAAA' end;
  i integer;
begin
  assert public.complete_owner_verification(v_owner, gen_random_uuid(), 'ZZSMOKE2', v_code2) = 'not_found',
    'SMOKE FAIL: an unknown car must be not_found';
  assert public.complete_owner_verification('a0000000-0000-4000-8000-0000000000a2', v_car2, 'ZZSMOKE2', v_code2) = 'not_found',
    'SMOKE FAIL: someone else''s car must be not_found';
  assert public.complete_owner_verification(v_owner, v_car2, 'ZZSMOKE2', v_wrong) = 'code_mismatch',
    'SMOKE FAIL: a wrong code must be code_mismatch';
  assert public.complete_owner_verification(v_owner, v_car2, 'ZZSMOKE2', 'RL-12') = 'code_unreadable',
    'SMOKE FAIL: a short code must be code_unreadable';
  assert public.complete_owner_verification(v_owner, v_car2, 'ZZOTHER2', v_code2) = 'plate_mismatch',
    'SMOKE FAIL: the right code with another plate must be plate_mismatch';
  assert public.complete_owner_verification(v_owner, v_car2, 'zz smoke 2', lower(replace(v_code2, '-', ' '))) = 'verified',
    'SMOKE FAIL: the right code (any spelling) with the right plate must verify';
  assert (select c.verified_at from public.owner_cars c where c.id = v_car2) is not null,
    'SMOKE FAIL: verification must set verified_at';
  assert (select c.verify_code_hash from public.owner_cars c where c.id = v_car2) is null,
    'SMOKE FAIL: verification must clear the code hash';
  assert public.complete_owner_verification(v_owner, v_car2, 'ZZSMOKE2', v_code2) = 'already_verified',
    'SMOKE FAIL: a second verification must be already_verified';

  -- At most 5 attempts per car per day.
  for i in 1..5 loop
    assert public.complete_owner_verification(v_owner, v_car3, 'ZZSMOKE3', v_wrong) = 'code_mismatch',
      'SMOKE FAIL: attempts 1-5 with a wrong code must be code_mismatch';
  end loop;
  assert public.complete_owner_verification(v_owner, v_car3, 'ZZSMOKE3', current_setting('smoke.code3')) = 'too_many_attempts',
    'SMOKE FAIL: the 6th attempt of the day must be too_many_attempts';

  -- One verified owner per plate: the second claimant passes code and plate, and still gets plate_taken.
  assert public.complete_owner_verification('a0000000-0000-4000-8000-0000000000a2', current_setting('smoke.claim')::uuid,
                                            'ZZSMOKE1', current_setting('smoke.claim_code')) = 'plate_taken',
    'SMOKE FAIL: a second owner of a verified plate must get plate_taken';
end $$;

reset role;

-- An expired code.
update public.owner_cars set verify_expires_at = now() - interval '1 minute'
 where id = current_setting('smoke.claim')::uuid;
set local role service_role;
do $$
begin
  assert public.complete_owner_verification('a0000000-0000-4000-8000-0000000000a2', current_setting('smoke.claim')::uuid,
                                            'ZZSMOKE1', current_setting('smoke.claim_code')) = 'expired',
    'SMOKE FAIL: an expired code must be expired';
end $$;
reset role;

-- ---------------------------------------------------------------------
-- 9. Deleting a spot removes its private match and its ping.
-- ---------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b1","role":"authenticated"}', true);
delete from public.spots where id = current_setting('smoke.spot_b1_first')::uuid;
reset role;

do $$
begin
  assert not exists (select 1 from private.spot_matches m where m.spot_id = current_setting('smoke.spot_b1_first')::uuid),
    'SMOKE FAIL: deleting a spot must delete its private match';
  assert not exists (select 1 from public.spot_notifications n where n.spot_id = current_setting('smoke.spot_b1_first')::uuid),
    'SMOKE FAIL: deleting a spot must delete its ping';
end $$;

-- ---------------------------------------------------------------------
-- 10. Rate limits: the Co-Driver quota (15/day) and 30 spots per hour.
-- ---------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);

do $$
declare
  v_left integer;
  v_refused boolean := false;
  i integer;
begin
  assert (select q.remaining from public.identify_quota_status() q) = 15, 'SMOKE FAIL: a new user must have 15 scans';
  for i in 1..15 loop
    v_left := public.consume_identify_quota();
  end loop;
  assert v_left = 0, 'SMOKE FAIL: after 15 identifications 0 must be left';
  assert (select q.remaining from public.identify_quota_status() q) = 0, 'SMOKE FAIL: identify_quota_status must show 0';
  begin
    perform public.consume_identify_quota();
  exception when others then
    v_refused := sqlerrm ilike '%quota_exceeded%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: the 16th identification of the day must raise quota_exceeded';
end $$;

select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b5","role":"authenticated"}', true);

do $$
declare
  v_refused boolean := false;
  i integer;
begin
  for i in 1..30 loop
    insert into public.spots (id, make, model, photo_path) values (gen_random_uuid(), 'Fiat', '500', 'x.jpg');
  end loop;
  begin
    insert into public.spots (id, make, model, photo_path) values (gen_random_uuid(), 'Fiat', '500', 'x.jpg');
  exception when others then
    v_refused := sqlerrm ilike '%too many spots%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: the 31st spot in one hour must be refused';
end $$;

-- ---------------------------------------------------------------------
-- 11. Erasure: the shared demo account cannot be deleted; a normal account can.
-- ---------------------------------------------------------------------
select set_config('request.jwt.claims',
                  json_build_object('sub', current_setting('smoke.demo'), 'role', 'authenticated')::text, true);

do $$
declare
  v_refused boolean := false;
begin
  begin
    perform public.delete_my_account();
  exception when others then
    v_refused := sqlerrm ilike '%demo account cannot%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: the demo account could be deleted';
end $$;

select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-0000000000b5","role":"authenticated"}', true);
select public.delete_my_account();
reset role;

do $$
begin
  assert exists (select 1 from auth.users u where u.id = current_setting('smoke.demo')::uuid),
    'SMOKE FAIL: the demo user must still exist';
  assert not exists (select 1 from auth.users u where u.id = 'b0000000-0000-4000-8000-0000000000b5'),
    'SMOKE FAIL: delete_my_account must delete a normal account';
  assert not exists (select 1 from public.spots s where s.user_id = 'b0000000-0000-4000-8000-0000000000b5'),
    'SMOKE FAIL: deleting an account must delete its spots';
  raise notice 'Redline 2.0 smoke test: ALL OK';
end $$;

-- Nothing of the above is kept.
rollback;

-- Only reached when every assertion above passed (any error stops the script before this line).
select 'ALL OK' as redline_v2_smoke;
