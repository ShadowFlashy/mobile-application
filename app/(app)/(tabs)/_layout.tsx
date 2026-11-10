import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { useUnreadPingCount } from '../../../src/hooks/usePings';
import { useNavigatorTheme } from '../../../src/theme';

/**
 * The five main sections: Album, Pit Wall, the raised SPOT Ignition button, Garage (with the unread
 * sightings badge) and Me. The tab bar lives in the thumb zone; its styling comes from tokens.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  const { tabs } = useNavigatorTheme();
  const unreadCount = useUnreadPingCount();

  return (
    <Tabs screenOptions={tabs} tabBar={(props) => <BottomTabBar {...props} badges={{ owners: unreadCount }} />}>
      <Tabs.Screen name="index" options={{ title: t('shell.tab_album') }} />
      <Tabs.Screen name="progress" options={{ title: t('shell.tab_pit_wall') }} />
      <Tabs.Screen name="spot" options={{ title: t('shell.tab_spot') }} />
      <Tabs.Screen name="owners" options={{ title: t('shell.tab_garage') }} />
      <Tabs.Screen name="profile" options={{ title: t('shell.tab_me') }} />
    </Tabs>
  );
}
