import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import type { Resources } from '../i18n/resources';
import { IgnitionButton } from './brand/IgnitionButton';
import type { IconName } from './primitives/Icon';
import { Nav } from './primitives/Nav';
import { NavItem } from './primitives/NavItem';

/** Key of a tab label in the translation files (tabs.*). */
type TabLabelKey = keyof Resources['tabs'];

interface TabConfig {
  label: TabLabelKey;
  icon: IconName;
  activeIcon: IconName;
  /** The centre tab is the raised Ignition button. */
  ignition?: boolean;
}

/** Tab per route name, in tab-bar order; routes without an entry get no tab. */
export const TABS: Partial<Record<string, TabConfig>> = {
  index: { label: 'album', icon: 'albums-outline', activeIcon: 'albums' },
  progress: { label: 'pit_wall', icon: 'speedometer-outline', activeIcon: 'speedometer' },
  spot: { label: 'spot', icon: 'camera-outline', activeIcon: 'camera', ignition: true },
  owners: { label: 'garage', icon: 'car-sport-outline', activeIcon: 'car-sport' },
  profile: { label: 'me', icon: 'person-circle-outline', activeIcon: 'person-circle' },
};

interface BottomTabBarExtraProps {
  /** Counter per route name, e.g. unread sightings on the Garage tab. */
  badges?: Record<string, number>;
}

/**
 * The 5-tab bar in the thumb zone: Album, Pit Wall, the raised SPOT Ignition button, Garage and Me.
 */
export function BottomTabBar({ state, navigation, badges }: BottomTabBarProps & BottomTabBarExtraProps) {
  const { t } = useTranslation();
  const insets = useContext(SafeAreaInsetsContext);
  return (
    <Nav bottomInset={insets?.bottom ?? 0} testID="bottom-tab-bar">
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (tab === undefined) return null;
        const isActive = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isActive && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        const label = t(`tabs.${tab.label}`);
        if (tab.ignition === true) {
          return (
            <IgnitionButton
              key={route.key}
              label={label}
              onPress={onPress}
              active={isActive}
              testID={`tab-${route.name}`}
            />
          );
        }
        return (
          <NavItem
            key={route.key}
            label={label}
            icon={isActive ? tab.activeIcon : tab.icon}
            active={isActive}
            badgeCount={badges?.[route.name] ?? 0}
            onPress={onPress}
            testID={`tab-${route.name}`}
          />
        );
      })}
    </Nav>
  );
}
