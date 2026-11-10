-- Redline 2.0 demo data: the shared demo account owns a VERIFIED car with plate DEMO-123,
-- so the whole owner flow (ping, sighting, showcase) can be tested with one account.
insert into public.owner_cars (owner_id, make, model, nickname, plate_input, visibility, car_model_id)
select u.id, 'Porsche', '911 GT3', 'Demo GT3', 'DEMO-123', 'vanity', 'porsche-911-gt3'
  from auth.users u
 where lower(u.email) = 'demo@redline.test'
   and not exists (select 1 from public.owner_cars c
                    where c.owner_id = u.id and c.plate_hash = private.hash_plate('DEMO123'));

update public.owner_cars c
   set verified_at = coalesce(c.verified_at, now())
  from auth.users u
 where c.owner_id = u.id and lower(u.email) = 'demo@redline.test'
   and c.plate_hash = private.hash_plate('DEMO123');
