import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type en from '../i18n/locales/en.json';
import type { IconName } from './primitives/Icon';
import { Nav } from './primitives/Nav';
import { NavItem } from './primitives/NavItem';

/** Key of a tab label in the translation files (tabs.*). */
type TabLabelKey = keyof (typeof en)['tabs'];

interface TabConfig {
  label: TabLabelKey;
  icon: IconName;
  activeIcon: IconName;
}

/** Tab per route name; routes without an entry get no tab. */
const TABS: Partial<Record<string, TabConfig>> = {
  index: { label: 'stickers', icon: 'albums-outline', activeIcon: 'albums' },
  spot: { label: 'spot', icon: 'camera-outline', activeIcon: 'camera' },
  owners: { label: 'owners', icon: 'key-outline', activeIcon: 'key' },
  profile: { label: 'profile', icon: 'person-circle-outline', activeIcon: 'person-circle' },
};

interface BottomTabBarExtraProps {
  /** Counter per route name, e.g. unread pings on the owners tab. */
  badges?: Record<string, number>;
}

/** The app's tab bar, built from the base Nav / NavItem components and placed in the thumb zone. */
export function BottomTabBar({ state, navigation, badges }: BottomTabBarProps & BottomTabBarExtraProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Nav bottomInset={insets.bottom} testID="bottom-tab-bar">
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (tab === undefined) return null;
        const isActive = state.index === index;
        return (
          <NavItem
            key={route.key}
            label={t(`tabs.${tab.label}`)}
            icon={isActive ? tab.activeIcon : tab.icon}
            active={isActive}
            badgeCount={badges?.[route.name] ?? 0}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isActive && !event.defaultPrevented) navigation.navigate(route.name, route.params);
            }}
            testID={`tab-${route.name}`}
          />
        );
      })}
    </Nav>
  );
}
