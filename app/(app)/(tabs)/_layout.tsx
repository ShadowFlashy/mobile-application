import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { useUnreadPingCount } from '../../../src/hooks/usePings';
import { useTheme } from '../../../src/theme';

/** The four main sections, with the custom tab bar in the thumb zone (course ch. 3). */
export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const unreadCount = useUnreadPingCount();

  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
      tabBar={(props) => <BottomTabBar {...props} badges={{ owners: unreadCount }} />}
    >
      <Tabs.Screen name="index" options={{ title: t('shell.tab_sticker_book') }} />
      <Tabs.Screen name="spot" options={{ title: t('shell.tab_spot') }} />
      <Tabs.Screen name="owners" options={{ title: t('shell.tab_owners') }} />
      <Tabs.Screen name="profile" options={{ title: t('shell.tab_profile') }} />
    </Tabs>
  );
}
