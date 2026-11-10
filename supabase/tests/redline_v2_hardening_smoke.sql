-- =====================================================================
-- Redline 2.0 hardening smoke test (checks 20261110110000_redline_v2_hardening.sql).
--
--   * the demo account cannot change its password, delete its cars or change nickname / shout-out
--   * the demo account cannot delete spots older than a day, but can delete today's spots
--   * a pending (unverified) owner reads no sighting
--   * an owner's sighting drops a city outside the gazetteer and keeps a gazetteer city
--
-- How to run (the user does this; agents never touch the hosted database): SQL editor → paste → Run.
-- Prerequisites: the redline_v2 migration, the hardening migration and seed.sql.
-- Everything runs in one transaction that is ROLLED BACK. The last row says ALL OK.
-- =====================================================================

begin;

insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-0000000000e1', 'authenticated', 'authenticated',
   'smoke-hardening-owner@redline.test', '{"username":"smoke_hard_owner"}', now(), now());

insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at)
select '00000000-0000-0000-0000-000000000000', 'd0000000-0000-4000-8000-0000000000d2', 'authenticated', 'authenticated',
       'demo@redline.test', '{"username":"smoke_hard_demo"}', now(), now()
 where not exists (select 1 from auth.users u where lower(u.email) = 'demo@redline.test');
select set_config('smoke.demo', (select u.id::text from auth.users u where lower(u.email) = 'demo@redline.test' limit 1), true);

-- 1. The demo password cannot be changed (GoTrue updates auth.users as its own role; same trigger).
do $$
declare
  v_refused boolean := false;
begin
  begin
    update auth.users set encrypted_password = 'x' where id = current_setting('smoke.demo')::uuid;
  exception when others then
    v_refused := sqlerrm ilike '%demo account cannot%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: the demo password could be changed';
  -- Signing in still works (only last_sign_in_at changes).
  update auth.users set last_sign_in_at = now() where id = current_setting('smoke.demo')::uuid;
end $$;

-- 2. Demo cars and spots, as the demo user.
set local role authenticated;
select set_config('request.jwt.claims',
                  json_build_object('sub', current_setting('smoke.demo'), 'role', 'authenticated',
                                    'email', 'demo@redline.test')::text, true);

do $$
declare
  v_car uuid;
  v_old uuid := gen_random_uuid();
  v_new uuid := gen_random_uuid();
  v_refused boolean;
begin
  select c.id into v_car from public.owner_cars c where c.owner_id = auth.uid() limit 1;
  if v_car is null then
    insert into public.owner_cars (make, model, nickname, plate_input)
    values ('Porsche', '911 GT3', 'Smoke GT3', 'ZZ HARD 1') returning id into v_car;
  end if;

  v_refused := false;
  begin
    delete from public.owner_cars where id = v_car;
  exception when others then
    v_refused := sqlerrm ilike '%demo account cannot%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: the demo car could be deleted';

  v_refused := false;
  begin
    update public.owner_cars set shoutout = 'rude words' where id = v_car;
  exception when others then
    v_refused := sqlerrm ilike '%demo account cannot%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: the demo shout-out could be changed';

  update public.owner_cars set pings_paused = pings_paused where id = v_car; -- other fields stay editable

  insert into public.spots (id, make, model, photo_path, city) values (v_old, 'Ferrari', '308 GTSi', 'x.jpg', 'Leuven');
  insert into public.spots (id, make, model, photo_path, city) values (v_new, 'Ferrari', '308 GTSi', 'x.jpg', 'Leuven');
  perform set_config('smoke.demo_old_spot', v_old::text, true);
  perform set_config('smoke.demo_new_spot', v_new::text, true);
end $$;

reset role;
update public.spots set created_at = now() - interval '2 days' where id = current_setting('smoke.demo_old_spot')::uuid;
set local role authenticated;

do $$
declare
  v_refused boolean := false;
begin
  begin
    delete from public.spots where id = current_setting('smoke.demo_old_spot')::uuid;
  exception when others then
    v_refused := sqlerrm ilike '%demo account cannot%';
    if not v_refused then raise; end if;
  end;
  assert v_refused, 'SMOKE FAIL: an older demo spot could be deleted';

  delete from public.spots where id = current_setting('smoke.demo_new_spot')::uuid;
  assert not exists (select 1 from public.spots s where s.id = current_setting('smoke.demo_new_spot')::uuid),
    'SMOKE FAIL: a demo spot of today must stay deletable';
end $$;

-- 3. Owner snapshots keep only gazetteer cities; 4. pending owners read nothing.
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-4000-8000-0000000000e1","role":"authenticated"}', true);

do $$
declare
  v_spot uuid := gen_random_uuid();
  v_car uuid;
begin
  insert into public.spots (id, make, model, photo_path, city) values (v_spot, 'Ferrari', '308 GTSi', 'x.jpg', 'Xstraat 12');
  assert (select s.city from public.spots s where s.id = v_spot) = 'Xstraat 12',
    'SMOKE FAIL: the spotter keeps their own typed place';
  insert into public.owner_cars (make, model, plate_input) values ('Mazda', 'MX-5', 'ZZ HARD 2') returning id into v_car;
  perform set_config('smoke.pending_car', v_car::text, true);
  perform set_config('smoke.pending_spot', v_spot::text, true);
end $$;

reset role;
insert into public.spot_notifications (owner_id, owner_car_id, spot_id, car_label, city)
values ('a0000000-0000-4000-8000-0000000000e1', current_setting('smoke.pending_car')::uuid,
        current_setting('smoke.pending_spot')::uuid, 'Pending MX-5', 'Xstraat 12'),
       ('a0000000-0000-4000-8000-0000000000e1', current_setting('smoke.pending_car')::uuid,
        current_setting('smoke.pending_spot')::uuid, 'Pending MX-5', 'Antwerpen');
do $$
begin
  assert (select count(*) from public.spot_notifications n
           where n.owner_car_id = current_setting('smoke.pending_car')::uuid and n.city is null) = 1,
    'SMOKE FAIL: a city outside the gazetteer must not reach the owner';
  assert exists (select 1 from public.spot_notifications n
                  where n.owner_car_id = current_setting('smoke.pending_car')::uuid and n.city = 'Antwerpen'),
    'SMOKE FAIL: a gazetteer city must reach the owner';
end $$;
set local role authenticated;

do $$
begin
  assert not exists (select 1 from public.spot_notifications n
                      where n.owner_car_id = current_setting('smoke.pending_car')::uuid),
    'SMOKE FAIL: a pending owner must not read sightings';
  raise notice 'Redline 2.0 hardening smoke test: ALL OK';
end $$;

reset role;
rollback;

select 'ALL OK' as redline_v2_hardening_smoke;
