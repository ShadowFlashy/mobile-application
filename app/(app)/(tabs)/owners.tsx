import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GarageCarCard } from '../../../src/components/garage/GarageCarCard';
import { SightingCard } from '../../../src/components/garage/SightingCard';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Section } from '../../../src/components/primitives/Section';
import { Screen } from '../../../src/components/primitives/Screen';
import { Skeleton } from '../../../src/components/primitives/Skeleton';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { MAX_OWNER_CARS, statsForCar, useOwnerCars, useOwnerCarStats } from '../../../src/hooks/useOwnerCars';
import { useMarkAllSightingsRead, useSightings, useUnreadPingCount } from '../../../src/hooks/usePings';
import { getErrorMessage } from '../../../src/services/serviceError';
import { useToastStore } from '../../../src/state/useToastStore';
import { formatDate } from '../../../src/utils/formatDate';
import { groupSightingsByDay } from '../../../src/utils/sightings';

/** Garage tab: my cars (status, counters), "Add my car" and the sightings feed. */
export default function GarageScreen() {
  const { t, i18n } = useTranslation();
  const showToast = useToastStore((state) => state.show);
  const ownerCars = useOwnerCars();
  const stats = useOwnerCarStats();
  const feed = useSightings();
  const unreadCount = useUnreadPingCount();
  const markAllRead = useMarkAllSightingsRead();

  const cars = ownerCars.data ?? [];
  const groups = groupSightingsByDay(feed.sightings);
  const canAdd = cars.length < MAX_OWNER_CARS;

  let loadError: string | undefined;
  if (ownerCars.isError) loadError = getErrorMessage(ownerCars.error, 'load_owner_cars');
  else if (feed.isError) loadError = getErrorMessage(feed.error, 'load_sightings');

  const refresh = () => {
    void ownerCars.refetch();
    void stats.refetch();
    void feed.refetch();
  };

  const onMarkAllRead = () =>
    markAllRead.mutate(undefined, {
      onError: (error) => showToast(getErrorMessage(error, 'update_pings'), 'error'),
    });

  const dayLabel = (kind: 'today' | 'yesterday' | 'earlier', dayStart: string) =>
    kind === 'earlier' ? formatDate(dayStart, i18n.language) : t(`sightings.${kind}`);

  return (
    <Screen testID="owners-screen" refreshing={feed.isRefetching} onRefresh={refresh}>
      <Stack gap="lg">
        <ScreenHeader eyebrow={t('garage.eyebrow')} title={t('garage.title')} subtitle={t('garage.subtitle')} />

        {loadError !== undefined && (
          <Stack gap="sm">
            <Text tone="danger" testID="owners-error">
              {loadError}
            </Text>
            <StyledButton label={t('common.try_again')} icon="refresh" variant="secondary" onPress={refresh} />
          </Stack>
        )}

        <Section title={t('garage.my_cars')} testID="garage-cars">
          {ownerCars.isLoading && <Skeleton preset="card" />}
          {ownerCars.isSuccess && cars.length === 0 && (
            <EmptyState
              icon="car-sport-outline"
              title={t('garage.no_cars_title')}
              description={t('garage.no_cars_description')}
              testID="garage-empty"
            />
          )}
          {cars.map((car) => (
            <GarageCarCard
              key={car.id}
              car={car}
              stats={statsForCar(stats.data, car.id)}
              onPress={() => router.push(routes.garageCar(car.id))}
            />
          ))}
          {canAdd ? (
            <StyledButton
              label={t('garage.add_car')}
              icon="add-circle-outline"
              variant={cars.length === 0 ? 'primary' : 'secondary'}
              onPress={() => router.push(routes.garageNew)}
              testID="add-car-button"
            />
          ) : (
            <Text variant="bodySm" tone="muted" testID="garage-max-cars">
              {t('garage.max_cars')}
            </Text>
          )}
        </Section>

        <Section
          title={unreadCount > 0 ? t('sightings.heading_unread', { count: unreadCount }) : t('sightings.title')}
          action={
            unreadCount > 0 ? (
              <StyledButton
                label={t('sightings.mark_all_read')}
                variant="ghost"
                onPress={onMarkAllRead}
                isLoading={markAllRead.isPending}
                testID="mark-read-button"
              />
            ) : undefined
          }
          testID="garage-sightings"
        >
          {feed.isLoading && <Skeleton preset="row" />}
          {feed.isSuccess && feed.sightings.length === 0 && (
            <EmptyState
              icon="notifications-outline"
              title={t('sightings.empty_title')}
              description={t('sightings.empty_description')}
              testID="no-pings"
            />
          )}
          {groups.map((group) => (
            <Stack key={group.dayKey} gap="sm">
              <Text variant="label" tone="subtle" heading>
                {dayLabel(group.kind, group.dayStart)}
              </Text>
              {group.sightings.map((sighting) => (
                <SightingCard
                  key={sighting.id}
                  sighting={sighting}
                  onPress={() => router.push(routes.sighting(sighting.id))}
                />
              ))}
            </Stack>
          ))}
          {feed.hasNextPage && (
            <StyledButton
              label={t('sightings.load_more')}
              variant="secondary"
              onPress={() => void feed.fetchNextPage()}
              isLoading={feed.isFetchingNextPage}
              testID="load-more-sightings"
            />
          )}
        </Section>
      </Stack>
    </Screen>
  );
}
