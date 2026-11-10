import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../src/components/brand/FormError';
import { GarageCarRow } from '../../../src/components/garage/GarageCarRow';
import { NoteRow } from '../../../src/components/garage/NoteRow';
import { SightingDayHeading } from '../../../src/components/garage/SightingDayHeading';
import { SightingRow } from '../../../src/components/garage/SightingRow';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Skeleton } from '../../../src/components/primitives/Skeleton';
import { Stack } from '../../../src/components/primitives/Stack';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { MAX_OWNER_CARS, statsForCar, useOwnerCars, useOwnerCarStats } from '../../../src/hooks/useOwnerCars';
import { useMarkAllSightingsRead, useSightings, useUnreadPingCount } from '../../../src/hooks/usePings';
import { getErrorMessage } from '../../../src/services/serviceError';
import { useToastStore } from '../../../src/state/useToastStore';
import { formatDate } from '../../../src/utils/formatDate';
import { groupSightingsByDay } from '../../../src/utils/sightings';

/** Garage tab: my cars as hairline rows, "Add a car" and the sightings feed as a timing tower. */
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
    <Screen
      title={t('garage.title')}
      meta={unreadCount > 0 ? t('garage.unread', { count: unreadCount }) : undefined}
      testID="owners-screen"
      refreshing={feed.isRefetching}
      onRefresh={refresh}
    >
      <Stack gap="lg">
        {loadError !== undefined && (
          <Stack gap="sm">
            <FormError message={loadError} testID="owners-error" />
            <StyledButton label={t('common.try_again')} icon="refresh" variant="secondary" onPress={refresh} />
          </Stack>
        )}

        <Stack gap="md">
          <Section
            title={t('garage.my_cars')}
            meta={ownerCars.isSuccess ? t('garage.car_count', { count: cars.length, max: MAX_OWNER_CARS }) : undefined}
            testID="garage-cars"
          >
            {ownerCars.isLoading && <Skeleton preset="row" />}
            {ownerCars.isSuccess && cars.length === 0 && (
              <EmptyState
                icon="car"
                title={t('garage.no_cars_title')}
                description={t('garage.no_cars_description')}
                testID="garage-empty"
              />
            )}
            {cars.map((car) => (
              <GarageCarRow
                key={car.id}
                car={car}
                stats={statsForCar(stats.data, car.id)}
                onPress={() => router.push(routes.garageCar(car.id))}
              />
            ))}
            {!canAdd && <NoteRow text={t('garage.max_cars')} divider={false} testID="garage-max-cars" />}
          </Section>
          {canAdd && (
            <StyledButton
              label={t('garage.add_car')}
              onPress={() => router.push(routes.garageNew)}
              testID="add-car-button"
            />
          )}
        </Stack>

        <Section
          title={t('sightings.title')}
          action={
            unreadCount > 0 ? (
              <StyledButton
                label={t('sightings.mark_all_read')}
                variant="text"
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
              icon="bell"
              title={t('sightings.empty_title')}
              description={t('sightings.empty_description')}
              testID="no-pings"
            />
          )}
          {groups.map((group) => (
            <Stack key={group.dayKey}>
              <SightingDayHeading label={dayLabel(group.kind, group.dayStart)} />
              {group.sightings.map((sighting) => (
                <SightingRow
                  key={sighting.id}
                  sighting={sighting}
                  onPress={() => router.push(routes.sighting(sighting.id))}
                />
              ))}
            </Stack>
          ))}
        </Section>
        {feed.hasNextPage && (
          <StyledButton
            label={t('sightings.load_more')}
            variant="secondary"
            onPress={() => void feed.fetchNextPage()}
            isLoading={feed.isFetchingNextPage}
            testID="load-more-sightings"
          />
        )}
      </Stack>
    </Screen>
  );
}
