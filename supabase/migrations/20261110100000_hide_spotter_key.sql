-- =====================================================================
-- Redline 2.0 follow-up (I10): owners can no longer read spot_notifications.spotter_key or spot_id.
--
-- v1 granted SELECT on the whole table to `authenticated`, so an owner could read `spotter_key`
-- (the per-car HMAC pseudonym of a spotter) and `spot_id`. v2 reads only the snapshot columns
-- (src/services/ownerService.ts SIGHTING_COLUMNS), so the table grant becomes a column grant.
-- Realtime postgres_changes checks the same column privileges, so INSERT payloads stop carrying
-- spotter_key too.
--
-- Apply AFTER the v2 frontend is deployed: the v1 client still selects spot_id (a join on spots)
-- and would lose its ping list. Idempotent: safe to run twice.
-- =====================================================================

revoke select on public.spot_notifications from anon, authenticated;
grant select (id, owner_id, owner_car_id, created_at, read_at, car_label, city, spotted_hour, photo_path, spotter_name)
  on public.spot_notifications to authenticated;
-- Marking a sighting read stays the only client write.
grant update (read_at) on public.spot_notifications to authenticated;

do $$
begin
  assert not has_column_privilege('authenticated', 'public.spot_notifications', 'spotter_key', 'select'),
    'spotter_key must not be readable by authenticated';
  assert not has_column_privilege('authenticated', 'public.spot_notifications', 'spot_id', 'select'),
    'spot_id must not be readable by authenticated';
  assert has_column_privilege('authenticated', 'public.spot_notifications', 'photo_path', 'select'),
    'the snapshot columns must stay readable';
end $$;

notify pgrst, 'reload schema';
