import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import type { Resources } from '../i18n/resources';
import type { AIconName } from './primitives/Icon';
import { Nav } from './primitives/Nav';
import { NavItem } from './primitives/NavItem';

/** Key of a tab label in the translation files (tabs.*). */
type TabLabelKey = keyof Resources['tabs'];

interface TabConfig {
  label: TabLabelKey;
  icon: AIconName;
  /** The Spot tab is the red key: the one primary action of the bar. */
  key?: boolean;
}

/** Tab per route name, in tab-bar order; routes without an entry get no tab. */
export const TABS: Partial<Record<string, TabConfig>> = {
  index: { label: 'album', icon: 'album' },
  progress: { label: 'stats', icon: 'stats' },
  spot: { label: 'spot', icon: 'camera', key: true },
  owners: { label: 'garage', icon: 'garage' },
  profile: { label: 'profile', icon: 'profile' },
};

interface BottomTabBarExtraProps {
  /** Counter per route name, e.g. unread sightings on the Garage tab. */
  badges?: Record<string, number>;
}

/**
 * A's tab bar in the thumb zone: Album · Stats · Spot · Garage · Profile. Spot is the red key with
 * the camera; the active tab is the text colour, the others text-2; a hairline on top.
 */
export function BottomTabBar({ state, navigation, badges }: BottomTabBarProps & BottomTabBarExtraProps) {
  const { t } = useTranslation();
  const insets = useContext(SafeAreaInsetsContext);
  return (
    <Nav bottomInset={insets?.bottom ?? 0} accessibilityLabel={t('a11y.main_tabs')} testID="bottom-tab-bar">
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (tab === undefined) return null;
        const isActive = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isActive && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <NavItem
            key={route.key}
            label={t(`tabs.${tab.label}`)}
            icon={tab.icon}
            variant={tab.key === true ? 'key' : 'tab'}
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
